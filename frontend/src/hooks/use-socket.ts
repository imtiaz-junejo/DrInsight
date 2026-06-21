"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${WS_URL}/realtime`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  return { socket: socketRef.current, connected };
}
