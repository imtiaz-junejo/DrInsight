"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IceServerConfig } from "@/services/meeting-api-hooks";
import type { NetworkQualityLabel } from "@/hooks/use-meeting-socket";

export interface WebRtcCallbacks {
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  onNetworkQuality?: (quality: NetworkQualityLabel, metrics: Record<string, number>) => void;
}

function classifyQuality(metrics: { packetLoss: number; roundTripMs: number }): NetworkQualityLabel {
  if (metrics.packetLoss >= 10 || metrics.roundTripMs >= 600) return "POOR";
  if (metrics.packetLoss >= 5 || metrics.roundTripMs >= 350) return "FAIR";
  if (metrics.packetLoss >= 2 || metrics.roundTripMs >= 200) return "GOOD";
  return "EXCELLENT";
}

const MEDIA_CONSTRAINTS: { video: MediaTrackConstraints; audio: MediaTrackConstraints } = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export function useWebRtc(iceServers: IceServerConfig[], callbacks: WebRtcCallbacks = {}) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const iceCallbackRef = useRef<((candidate: RTCIceCandidateInit) => void) | null>(null);
  const callbacksRef = useRef(callbacks);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const [networkQuality, setNetworkQuality] = useState<NetworkQualityLabel>("GOOD");

  callbacksRef.current = callbacks;

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const queue = pendingCandidatesRef.current.splice(0);
    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Candidate may be stale after renegotiation — safe to ignore
      }
    }
  }, []);

  const ensureRemoteStream = useCallback(() => {
    if (!remoteStreamRef.current) {
      remoteStreamRef.current = new MediaStream();
      setRemoteStream(remoteStreamRef.current);
    }
    return remoteStreamRef.current;
  }, []);

  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingCandidatesRef.current = [];
  }, []);

  const cleanup = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    closePeerConnection();
  }, [closePeerConnection]);

  useEffect(() => cleanup, [cleanup]);

  const getOrCreatePeerConnection = useCallback(
    (onIceCandidate: (candidate: RTCIceCandidateInit) => void) => {
      iceCallbackRef.current = onIceCandidate;

      if (pcRef.current && pcRef.current.connectionState !== "closed") {
        return pcRef.current;
      }

      const pc = new RTCPeerConnection({ iceServers });

      pc.ontrack = (event) => {
        const stream = ensureRemoteStream();
        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track);
        }
        callbacksRef.current.onRemoteStream?.(stream);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          (iceCallbackRef.current ?? onIceCandidate)(event.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
        callbacksRef.current.onConnectionStateChange?.(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        callbacksRef.current.onIceConnectionStateChange?.(pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          void pc.restartIce();
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [ensureRemoteStream, iceServers],
  );

  const attachLocalTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    const senders = pc.getSenders();
    for (const track of stream.getTracks()) {
      const existing = senders.find((s) => s.track?.kind === track.kind);
      if (existing) {
        void existing.replaceTrack(track);
      } else {
        pc.addTrack(track, stream);
      }
    }
  }, []);

  const startLocalMedia = useCallback(async (video = true, audio = true) => {
    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? MEDIA_CONSTRAINTS.video : false,
        audio: audio ? MEDIA_CONSTRAINTS.audio : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = pcRef.current;
      if (pc) attachLocalTracks(pc, stream);

      return stream;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Media permission denied";
      setMediaError(message);
      throw err;
    }
  }, [attachLocalTracks]);

  const createOffer = useCallback(
    async (onIceCandidate: (c: RTCIceCandidateInit) => void) => {
      closePeerConnection();
      const pc = getOrCreatePeerConnection(onIceCandidate);
      const stream = localStreamRef.current ?? (await startLocalMedia());
      attachLocalTracks(pc, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      return offer;
    },
    [attachLocalTracks, closePeerConnection, getOrCreatePeerConnection, startLocalMedia],
  );

  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit, onIceCandidate: (c: RTCIceCandidateInit) => void) => {
      closePeerConnection();
      const pc = getOrCreatePeerConnection(onIceCandidate);
      const stream = localStreamRef.current ?? (await startLocalMedia());
      attachLocalTracks(pc, stream);
      await pc.setRemoteDescription(offer);
      await flushPendingCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    },
    [attachLocalTracks, closePeerConnection, flushPendingCandidates, getOrCreatePeerConnection, startLocalMedia],
  );

  const handleRemoteAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(answer);
      await flushPendingCandidates(pc);
    },
    [flushPendingCandidates],
  );

  const addRemoteIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc || !candidate.candidate) return;
    if (!pc.remoteDescription) {
      pendingCandidatesRef.current.push(candidate);
      return;
    }
    try {
      await pc.addIceCandidate(candidate);
    } catch {
      pendingCandidatesRef.current.push(candidate);
    }
  }, []);

  const toggleAudio = useCallback((enabled: boolean) => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
    const pc = pcRef.current;
    if (pc) {
      pc.getSenders()
        .filter((s) => s.track?.kind === "audio")
        .forEach((s) => {
          if (s.track) s.track.enabled = enabled;
        });
    }
  }, []);

  const toggleVideo = useCallback((enabled: boolean) => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = enabled;
    });
    const pc = pcRef.current;
    if (pc) {
      pc.getSenders()
        .filter((s) => s.track?.kind === "video")
        .forEach((s) => {
          if (s.track) s.track.enabled = enabled;
        });
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((d) => d.kind === "videoinput");
    if (cameras.length < 2) return;
    const currentId = videoTrack.getSettings().deviceId;
    const next = cameras.find((c) => c.deviceId !== currentId) ?? cameras[0];
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: next.deviceId } },
      audio: MEDIA_CONSTRAINTS.audio,
    });
    const newVideoTrack = newStream.getVideoTracks()[0];
    const pc = pcRef.current;
    const sender = pc?.getSenders().find((s) => s.track?.kind === "video");
    if (sender && newVideoTrack) await sender.replaceTrack(newVideoTrack);
    videoTrack.stop();
    localStreamRef.current?.removeTrack(videoTrack);
    localStreamRef.current?.addTrack(newVideoTrack);
    setLocalStream(new MediaStream(localStreamRef.current?.getTracks() ?? [newVideoTrack]));
  }, []);

  const switchMicrophone = useCallback(async () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((d) => d.kind === "audioinput");
    if (mics.length < 2) return;
    const currentId = audioTrack.getSettings().deviceId;
    const next = mics.find((m) => m.deviceId !== currentId) ?? mics[0];
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: next.deviceId }, ...MEDIA_CONSTRAINTS.audio },
      video: false,
    });
    const newAudioTrack = newStream.getAudioTracks()[0];
    const pc = pcRef.current;
    const sender = pc?.getSenders().find((s) => s.track?.kind === "audio");
    if (sender && newAudioTrack) await sender.replaceTrack(newAudioTrack);
    audioTrack.stop();
    localStreamRef.current?.removeTrack(audioTrack);
    localStreamRef.current?.addTrack(newAudioTrack);
  }, []);

  const startScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = screen;
    const screenTrack = screen.getVideoTracks()[0];
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (sender) await sender.replaceTrack(screenTrack);
    screenTrack.onended = () => {
      void switchCamera();
    };
  }, [switchCamera]);

  const startStatsMonitor = useCallback((onReport: (metrics: Record<string, number>) => void) => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    statsIntervalRef.current = setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      const stats = await pc.getStats();
      let packetsLost = 0;
      let packetsReceived = 0;
      let roundTripMs = 0;
      let bitrateKbps = 0;
      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.kind === "video") {
          packetsLost += report.packetsLost ?? 0;
          packetsReceived += report.packetsReceived ?? 0;
          bitrateKbps = report.bytesReceived ? (report.bytesReceived * 8) / 1000 : 0;
        }
        if (report.type === "candidate-pair" && report.state === "succeeded") {
          roundTripMs = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
        }
      });
      const packetLoss = packetsReceived > 0 ? (packetsLost / (packetsLost + packetsReceived)) * 100 : 0;
      const metrics = { packetLoss, roundTripMs, bitrateKbps };
      const quality = classifyQuality({ packetLoss, roundTripMs });
      setNetworkQuality(quality);
      callbacksRef.current.onNetworkQuality?.(quality, metrics);
      onReport(metrics);
    }, 3000);
  }, []);

  return {
    localStream,
    remoteStream,
    mediaError,
    connectionState,
    networkQuality,
    startLocalMedia,
    createOffer,
    createAnswer,
    handleRemoteAnswer,
    addRemoteIceCandidate,
    toggleAudio,
    toggleVideo,
    switchCamera,
    switchMicrophone,
    startScreenShare,
    startStatsMonitor,
    cleanup,
  };
}
