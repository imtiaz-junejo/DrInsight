"use client";

import { io, Socket } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { MeetingChatMessage } from "@/services/meeting-api-hooks";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

export type NetworkQualityLabel = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DISCONNECTED";

export interface ConsultationSocketEvents {
  onUserJoined?: (payload: { userId: string; appointmentId: string }) => void;
  onUserLeft?: (payload: { userId: string; appointmentId: string }) => void;
  onRoomPeers?: (payload: { appointmentId: string; peers: string[] }) => void;
  onOffer?: (payload: { appointmentId: string; sdp: RTCSessionDescriptionInit; fromUserId: string }) => void;
  onAnswer?: (payload: { appointmentId: string; sdp: RTCSessionDescriptionInit; fromUserId: string }) => void;
  onIceCandidate?: (payload: { appointmentId: string; candidate: RTCIceCandidateInit; fromUserId: string }) => void;
  onChatMessage?: (payload: { message: MeetingChatMessage; fromUserId: string }) => void;
  onTyping?: (payload: { userId: string; appointmentId: string }) => void;
  onAppointmentStatus?: (payload: Record<string, unknown>) => void;
  onToggleCamera?: (payload: { userId: string; enabled?: boolean }) => void;
  onToggleMic?: (payload: { userId: string; enabled?: boolean }) => void;
  onNetworkQuality?: (payload: { userId: string; metrics?: Record<string, number> }) => void;
  onConnectionState?: (payload: { userId: string; state?: string }) => void;
}

function emitWithAck<T>(socket: Socket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(15_000).emit(event, payload, (err: Error | null, response: T & { success?: boolean; error?: string }) => {
      if (err) reject(err);
      else if (response && typeof response === "object" && "success" in response && response.success === false) {
        reject(new Error(response.error || "Request failed"));
      } else resolve(response);
    });
  });
}

export function useMeetingSocket(events: ConsultationSocketEvents = {}) {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);
  const [connected, setConnected] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  eventsRef.current = events;

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${WS_URL}/consultation`, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("user-joined", (p) => eventsRef.current.onUserJoined?.(p));
    socket.on("user-left", (p) => eventsRef.current.onUserLeft?.(p));
    socket.on("room-peers", (p) => eventsRef.current.onRoomPeers?.(p));
    socket.on("offer", (p) => eventsRef.current.onOffer?.(p));
    socket.on("answer", (p) => eventsRef.current.onAnswer?.(p));
    socket.on("ice-candidate", (p) => eventsRef.current.onIceCandidate?.(p));
    socket.on("chat-message", (p) => eventsRef.current.onChatMessage?.(p));
    socket.on("typing", (p) => eventsRef.current.onTyping?.(p));
    socket.on("appointment-status", (p) => eventsRef.current.onAppointmentStatus?.(p));
    socket.on("toggle-camera", (p) => eventsRef.current.onToggleCamera?.(p));
    socket.on("toggle-mic", (p) => eventsRef.current.onToggleMic?.(p));
    socket.on("network-quality", (p) => eventsRef.current.onNetworkQuality?.(p));
    socket.on("connection-state", (p) => eventsRef.current.onConnectionState?.(p));

    const heartbeat = setInterval(() => {
      if (socket.connected) socket.emit("heartbeat");
    }, 25_000);

    socketRef.current = socket;

    return () => {
      clearInterval(heartbeat);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const startConsultation = useCallback(async (appointmentId: string) => {
    const socket = socketRef.current;
    if (!socket) throw new Error("Socket not connected");
    return emitWithAck<{ success: boolean; data?: { peers?: string[] } }>(socket, "start-consultation", { appointmentId });
  }, []);

  const joinRoom = useCallback(async (appointmentId: string) => {
    const socket = socketRef.current;
    if (!socket) throw new Error("Socket not connected");
    return emitWithAck<{ success: boolean; data?: { peers?: string[] } }>(socket, "join-room", { appointmentId });
  }, []);

  const leaveRoom = useCallback(async (appointmentId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    return emitWithAck(socket, "leave-room", { appointmentId });
  }, []);

  const endConsultation = useCallback(async (appointmentId: string) => {
    const socket = socketRef.current;
    if (!socket) throw new Error("Socket not connected");
    return emitWithAck(socket, "end-consultation", { appointmentId });
  }, []);

  const sendOffer = useCallback((appointmentId: string, sdp: RTCSessionDescriptionInit, targetUserId?: string) => {
    socketRef.current?.emit("offer", { appointmentId, sdp, targetUserId });
  }, []);

  const sendAnswer = useCallback((appointmentId: string, sdp: RTCSessionDescriptionInit, targetUserId?: string) => {
    socketRef.current?.emit("answer", { appointmentId, sdp, targetUserId });
  }, []);

  const sendIceCandidate = useCallback(
    (appointmentId: string, candidate: RTCIceCandidateInit, targetUserId?: string) => {
      socketRef.current?.emit("ice-candidate", { appointmentId, candidate, targetUserId });
    },
    [],
  );

  const sendChat = useCallback(async (appointmentId: string, content: string, replyToId?: string) => {
    const socket = socketRef.current;
    if (!socket) throw new Error("Socket not connected");
    const response = await emitWithAck<{ success: boolean; data: MeetingChatMessage }>(socket, "chat-message", {
      appointmentId,
      content,
      replyToId,
    });
    return response.data;
  }, []);

  const sendTyping = useCallback((appointmentId: string) => {
    socketRef.current?.emit("typing", { appointmentId });
  }, []);

  const toggleCamera = useCallback((appointmentId: string, enabled: boolean) => {
    socketRef.current?.emit("toggle-camera", { appointmentId, enabled });
  }, []);

  const toggleMic = useCallback((appointmentId: string, enabled: boolean) => {
    socketRef.current?.emit("toggle-mic", { appointmentId, enabled });
  }, []);

  const reportNetworkQuality = useCallback((appointmentId: string, metrics: Record<string, number>) => {
    socketRef.current?.emit("network-quality", { appointmentId, metrics });
  }, []);

  const reportConnectionState = useCallback((appointmentId: string, state: string) => {
    socketRef.current?.emit("connection-state", { appointmentId, state });
  }, []);

  return {
    connected,
    startConsultation,
    joinRoom,
    leaveRoom,
    endConsultation,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendChat,
    sendTyping,
    toggleCamera,
    toggleMic,
    reportNetworkQuality,
    reportConnectionState,
  };
}
