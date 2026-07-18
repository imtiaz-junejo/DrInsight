"use client";

import { useEffect, useRef } from "react";

interface ConsultationVideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

function VideoTile({
  stream,
  label,
  mirrored,
  playAudio,
}: {
  stream: MediaStream | null;
  label: string;
  mirrored?: boolean;
  playAudio?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    void el.play().catch(() => {
      // Autoplay may require user gesture — stream still attaches
    });
  }, [stream]);

  return (
    <div className="video-tile">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={!playAudio}
        className={mirrored ? "mirrored" : ""}
      />
      {!stream && <div className="video-placeholder">Waiting for {label}...</div>}
      <span className="video-label">{label}</span>
    </div>
  );
}

export function ConsultationVideoGrid({ localStream, remoteStream }: ConsultationVideoGridProps) {
  return (
    <div className="video-grid">
      <VideoTile stream={remoteStream} label="Remote" playAudio />
      <VideoTile stream={localStream} label="You" mirrored />
    </div>
  );
}
