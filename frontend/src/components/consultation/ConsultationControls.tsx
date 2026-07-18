"use client";

interface ConsultationControlsProps {
  micOn: boolean;
  cameraOn: boolean;
  role: "doctor" | "patient";
  chatOnly?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
  onSwitchMic: () => void;
  onScreenShare: () => void;
  onChatToggle: () => void;
  onLeave: () => void;
  onEnd?: () => void;
}

export function ConsultationControls({
  micOn,
  cameraOn,
  role,
  chatOnly = false,
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  onSwitchMic,
  onScreenShare,
  onChatToggle,
  onLeave,
  onEnd,
}: ConsultationControlsProps) {
  return (
    <div className="consultation-controls">
      {!chatOnly && (
        <>
          <button type="button" className={`ctrl-btn ${micOn ? "" : "off"}`} onClick={onToggleMic} title="Toggle microphone">
            {micOn ? "🎤" : "🔇"}
          </button>
          <button type="button" className={`ctrl-btn ${cameraOn ? "" : "off"}`} onClick={onToggleCamera} title="Toggle camera">
            {cameraOn ? "📹" : "📷"}
          </button>
          <button type="button" className="ctrl-btn" onClick={onSwitchCamera} title="Switch camera">
            🔄
          </button>
          <button type="button" className="ctrl-btn" onClick={onSwitchMic} title="Switch microphone">
            🎙️
          </button>
          {role === "doctor" && (
            <button type="button" className="ctrl-btn" onClick={onScreenShare} title="Share screen">
              🖥️
            </button>
          )}
        </>
      )}
      <button type="button" className="ctrl-btn" onClick={onChatToggle} title="Chat">
        💬
      </button>
      <button type="button" className="ctrl-btn leave" onClick={onLeave}>
        Leave
      </button>
      {role === "doctor" && onEnd && (
        <button type="button" className="ctrl-btn end" onClick={onEnd}>
          End Consultation
        </button>
      )}
    </div>
  );
}
