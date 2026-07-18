"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useMeetingSocket } from "@/hooks/use-meeting-socket";
import { useWebRtc } from "@/hooks/use-webrtc";
import {
  useConsultationContext,
  useEndConsultation,
  useLeaveMeeting,
  type IceServerConfig,
  type MeetingChatMessage,
} from "@/services/meeting-api-hooks";
import { ConsultationVideoGrid } from "./ConsultationVideoGrid";
import { ConsultationControls } from "./ConsultationControls";
import { ConsultationChat } from "./ConsultationChat";
import { ConsultationSidePanel } from "./ConsultationSidePanel";
import "@/styles/consultation.css";

interface ConsultationRoomProps {
  appointmentId: string;
  role: "doctor" | "patient";
  autoStart?: boolean;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function appendMessage(prev: MeetingChatMessage[], message: MeetingChatMessage) {
  if (prev.some((m) => m.id === message.id)) return prev;
  return [...prev, message];
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const message = (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function ConsultationRoom({ appointmentId, role, autoStart = false }: ConsultationRoomProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const contextQuery = useConsultationContext(appointmentId);
  const leaveMeeting = useLeaveMeeting();
  const endConsultation = useEndConsultation();

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"patient" | "prescription" | "notes" | "labs">("patient");
  const [messages, setMessages] = useState<MeetingChatMessage[]>([]);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const remoteUserIdRef = useRef<string | null>(null);
  const isInitiatorRef = useRef(role === "doctor");
  const endingRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<ReturnType<typeof useMeetingSocket> | null>(null);
  const webrtcRef = useRef<ReturnType<typeof useWebRtc> | null>(null);
  const handleLeaveRef = useRef<() => Promise<void>>(async () => {});

  const iceServers = useMemo(
    () => (contextQuery.data?.iceServers ?? []) as IceServerConfig[],
    [contextQuery.data?.iceServers],
  );

  const initiateOffer = useCallback(async (peerUserId: string) => {
    const webrtc = webrtcRef.current;
    const socket = socketRef.current;
    if (!webrtc || !socket || !peerUserId) return;
    remoteUserIdRef.current = peerUserId;
    try {
      const offer = await webrtc.createOffer((candidate) => {
        socket.sendIceCandidate(appointmentId, candidate, peerUserId);
      });
      socket.sendOffer(appointmentId, offer, peerUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start video call");
    }
  }, [appointmentId]);

  const webrtc = useWebRtc(iceServers, {
    onNetworkQuality: (_q, metrics) => {
      socketRef.current?.reportNetworkQuality(appointmentId, metrics);
    },
    onConnectionStateChange: (state) => {
      socketRef.current?.reportConnectionState(appointmentId, state);
      if (state === "disconnected" || state === "failed") {
        setError("Connection lost — attempting to reconnect...");
      } else if (state === "connected") {
        setError(null);
      }
    },
  });
  webrtcRef.current = webrtc;

  const socket = useMeetingSocket({
    onRoomPeers: async (payload) => {
      if (payload.appointmentId !== appointmentId) return;
      if (!isInitiatorRef.current) return;
      for (const peerId of payload.peers) {
        if (peerId !== user?.id) {
          await initiateOffer(peerId);
        }
      }
    },
    onUserJoined: async (payload) => {
      if (payload.userId === user?.id) return;
      if (isInitiatorRef.current) {
        await initiateOffer(payload.userId);
      }
    },
    onOffer: async (payload) => {
      remoteUserIdRef.current = payload.fromUserId;
      try {
        const answer = await webrtc.createAnswer(payload.sdp, (candidate) => {
          socketRef.current?.sendIceCandidate(appointmentId, candidate, payload.fromUserId);
        });
        socketRef.current?.sendAnswer(appointmentId, answer, payload.fromUserId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to answer video call");
      }
    },
    onAnswer: async (payload) => {
      try {
        await webrtc.handleRemoteAnswer(payload.sdp);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete video handshake");
      }
    },
    onIceCandidate: async (payload) => {
      await webrtc.addRemoteIceCandidate(payload.candidate);
    },
    onChatMessage: (payload) => {
      setMessages((prev) => appendMessage(prev, payload.message));
    },
    onTyping: (payload) => {
      if (payload.userId !== user?.id) {
        setTypingUserId(payload.userId);
        setTimeout(() => setTypingUserId(null), 2000);
      }
    },
    onAppointmentStatus: (payload) => {
      if (payload.action === "consultation_ended") {
        if (endedRef.current) return;
        endedRef.current = true;
        void (async () => {
          try {
            await handleLeaveRef.current();
          } catch {
            webrtcRef.current?.cleanup();
          }
          router.push(role === "doctor" ? "/doctor/appointments" : "/patient/consultations");
        })();
      }
    },
    onUserLeft: (payload) => {
      if (payload.appointmentId !== appointmentId || payload.userId === user?.id) return;
      if (role === "patient" && joined) {
        setError("Your doctor has left the consultation. Please wait or return to your appointments.");
      }
    },
  });
  socketRef.current = socket;

  const handleJoin = useCallback(async () => {
    try {
      setError(null);
      const consultationType = String(contextQuery.data?.appointment?.consultationType ?? "");
      const isChatConsultation = consultationType === "CHAT";
      if (!isChatConsultation) {
        await webrtc.startLocalMedia(cameraOn, micOn);
      }
      let joinResult: { data?: { peers?: string[] } } | undefined;
      if (role === "doctor" && autoStart) {
        joinResult = await socket.startConsultation(appointmentId);
      } else {
        joinResult = await socket.joinRoom(appointmentId);
      }
      setJoined(true);
      if (isChatConsultation) setChatOpen(true);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      if (!isChatConsultation) {
        webrtc.startStatsMonitor((metrics) => socket.reportNetworkQuality(appointmentId, metrics));
      }

      const peers = joinResult?.data?.peers ?? [];
      if (!isChatConsultation && isInitiatorRef.current) {
        for (const peerId of peers) {
          if (peerId !== user?.id) {
            await initiateOffer(peerId);
          }
        }
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to join consultation"));
    }
  }, [appointmentId, autoStart, cameraOn, contextQuery.data?.appointment, initiateOffer, micOn, role, socket, user?.id, webrtc]);

  const handleLeave = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await socket.leaveRoom(appointmentId);
    } catch {
      // Socket may already be disconnected after ending the consultation.
    }
    try {
      await leaveMeeting.mutateAsync(appointmentId);
    } catch {
      // Leave is best-effort once the consultation has already ended.
    }
    webrtc.cleanup();
    setJoined(false);
  }, [appointmentId, leaveMeeting, socket, webrtc]);
  handleLeaveRef.current = handleLeave;

  const handleEnd = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    endedRef.current = true;
    setError(null);
    try {
      await socket.endConsultation(appointmentId);
      await endConsultation.mutateAsync(appointmentId).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end consultation");
      endingRef.current = false;
      return;
    }
    try {
      await handleLeave();
    } catch {
      webrtc.cleanup();
      setJoined(false);
    }
    router.push("/doctor/appointments");
  }, [appointmentId, endConsultation, handleLeave, router, socket, webrtc]);

  useEffect(() => {
    if (contextQuery.data && !joined && socket.connected) {
      const history = (contextQuery.data.appointment as { meeting?: { chats?: MeetingChatMessage[] } })?.meeting?.chats;
      if (history?.length) setMessages(history);
    }
  }, [contextQuery.data, joined, socket.connected]);

  useEffect(() => {
    const onBeforeUnload = () => {
      void socket.leaveRoom(appointmentId);
      webrtc.cleanup();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [appointmentId, socket, webrtc]);

  const appointment = contextQuery.data?.appointment as Record<string, unknown> | undefined;
  const patient = contextQuery.data?.patient as Record<string, unknown> | undefined;
  const isChatConsultation = appointment?.consultationType === "CHAT";

  if (contextQuery.isLoading) {
    return <div className="consultation-loading">Loading consultation...</div>;
  }

  if (contextQuery.isError) {
    return (
      <div className="consultation-error">
        {apiErrorMessage(contextQuery.error, "Unable to load consultation. You may not have access.")}
      </div>
    );
  }

  return (
    <div className="consultation-room">
      <header className="consultation-header">
        <div>
          <h1>Telemedicine Consultation</h1>
          <p className="consultation-sub">
            {role === "doctor" ? "Doctor session" : "Patient session"} ·{" "}
            <span className={`conn-badge conn-${webrtc.networkQuality.toLowerCase()}`}>
              {webrtc.connectionState === "connected" ? webrtc.networkQuality : webrtc.connectionState}
            </span>
          </p>
        </div>
        <div className="consultation-timer">{joined ? formatElapsed(elapsed) : "00:00"}</div>
      </header>

      {error && <div className="consultation-banner error">{error}</div>}
      {webrtc.mediaError && <div className="consultation-banner error">{webrtc.mediaError}</div>}

      <div className="consultation-body">
        <div className="consultation-main">
          {!isChatConsultation && (
            <ConsultationVideoGrid localStream={webrtc.localStream} remoteStream={webrtc.remoteStream} />
          )}
          {!joined ? (
            <div className="consultation-join-overlay">
              <button type="button" className="consultation-join-btn" onClick={() => void handleJoin()} disabled={!socket.connected}>
                {role === "doctor"
                  ? isChatConsultation
                    ? "Start & Open Chat"
                    : "Start & Join Consultation"
                  : isChatConsultation
                    ? "Join Chat"
                    : "Join Consultation"}
              </button>
              {!socket.connected && <p>Connecting to signaling server...</p>}
            </div>
          ) : (
            <ConsultationControls
              micOn={micOn}
              cameraOn={cameraOn}
              onToggleMic={() => {
                const next = !micOn;
                setMicOn(next);
                webrtc.toggleAudio(next);
                socket.toggleMic(appointmentId, next);
              }}
              onToggleCamera={() => {
                const next = !cameraOn;
                setCameraOn(next);
                webrtc.toggleVideo(next);
                socket.toggleCamera(appointmentId, next);
              }}
              onSwitchCamera={() => void webrtc.switchCamera()}
              onSwitchMic={() => void webrtc.switchMicrophone()}
              onScreenShare={() => void webrtc.startScreenShare()}
              onChatToggle={() => setChatOpen((v) => !v)}
              onLeave={() => void handleLeave()}
              onEnd={role === "doctor" ? () => void handleEnd() : undefined}
              role={role}
              chatOnly={isChatConsultation}
            />
          )}
        </div>

        {role === "doctor" && (
          <ConsultationSidePanel
            tab={panelTab}
            onTabChange={setPanelTab}
            appointmentId={appointmentId}
            patient={patient}
            appointment={appointment}
          />
        )}

        <ConsultationChat
          open={chatOpen || role === "patient" || isChatConsultation}
          messages={messages}
          currentUserId={user?.id ?? ""}
          typingUserId={typingUserId}
          onSend={async (content, replyToId) => {
            const message = await socket.sendChat(appointmentId, content, replyToId);
            setMessages((prev) => appendMessage(prev, message));
          }}
          onTyping={() => socket.sendTyping(appointmentId)}
        />
      </div>
    </div>
  );
}
