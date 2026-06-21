export type VideoProviderType = "WEBRTC" | "AGORA" | "TWILIO" | "DAILY";

export interface VideoCallConfig {
  provider: VideoProviderType;
  token: string;
  roomId: string;
  config?: Record<string, unknown>;
}

export interface VideoCallProvider {
  initialize(config: VideoCallConfig): Promise<void>;
  join(roomId: string): Promise<void>;
  leave(): Promise<void>;
  toggleAudio(enabled: boolean): void;
  toggleVideo(enabled: boolean): void;
  destroy(): void;
}

class WebRtcProvider implements VideoCallProvider {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;

  async initialize(config: VideoCallConfig) {
    const iceServers = (config.config?.iceServers as RTCIceServer[]) || [
      { urls: "stun:stun.l.google.com:19302" },
    ];
    this.peerConnection = new RTCPeerConnection({ iceServers });
  }

  async join(roomId: string) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection?.addTrack(track, this.localStream!);
    });
  }

  async leave() {
    this.localStream?.getTracks().forEach((t) => t.stop());
    await this.peerConnection?.close();
    this.peerConnection = null;
    this.localStream = null;
  }

  toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = enabled));
  }

  toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = enabled));
  }

  destroy() {
    this.leave();
  }
}

class AgoraProvider implements VideoCallProvider {
  async initialize(_config: VideoCallConfig) {
    // Agora SDK integration point — swap provider without changing UI
  }
  async join(_roomId: string) {}
  async leave() {}
  toggleAudio(_enabled: boolean) {}
  toggleVideo(_enabled: boolean) {}
  destroy() {}
}

class TwilioProvider implements VideoCallProvider {
  async initialize(_config: VideoCallConfig) {}
  async join(_roomId: string) {}
  async leave() {}
  toggleAudio(_enabled: boolean) {}
  toggleVideo(_enabled: boolean) {}
  destroy() {}
}

class DailyProvider implements VideoCallProvider {
  async initialize(_config: VideoCallConfig) {}
  async join(_roomId: string) {}
  async leave() {}
  toggleAudio(_enabled: boolean) {}
  toggleVideo(_enabled: boolean) {}
  destroy() {}
}

export function createVideoProvider(type: VideoProviderType): VideoCallProvider {
  switch (type) {
    case "AGORA":
      return new AgoraProvider();
    case "TWILIO":
      return new TwilioProvider();
    case "DAILY":
      return new DailyProvider();
    default:
      return new WebRtcProvider();
  }
}

export async function fetchVideoToken(roomId: string, role: "host" | "guest" = "guest"): Promise<VideoCallConfig> {
  const { api } = await import("@/lib/api");
  const { data } = await api.post("/video/token", { roomId, role });
  return data;
}
