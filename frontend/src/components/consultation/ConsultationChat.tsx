"use client";

import { useEffect, useRef, useState } from "react";
import type { MeetingChatMessage } from "@/services/meeting-api-hooks";

interface ConsultationChatProps {
  open: boolean;
  messages: MeetingChatMessage[];
  currentUserId: string;
  typingUserId: string | null;
  onSend: (content: string, replyToId?: string) => Promise<void>;
  onTyping: () => void;
}

export function ConsultationChat({
  open,
  messages,
  currentUserId,
  typingUserId,
  onSend,
  onTyping,
}: ConsultationChatProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<MeetingChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUserId]);

  if (!open) return null;

  return (
    <aside className="consultation-chat">
      <h3>Chat</h3>
      <div className="chat-messages">
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`chat-msg ${isMine ? "mine" : "theirs"}`}
              onDoubleClick={() => setReplyTo(m)}
            >
              {m.replyTo && (
                <div className="chat-reply-preview">
                  <span className="chat-reply-author">
                    {m.replyTo.senderId === currentUserId ? "You" : "Them"}
                  </span>
                  <span className="chat-reply-text">{m.replyTo.content}</span>
                </div>
              )}
              <p>{m.content}</p>
              <div className="chat-msg-footer">
                <time>{new Date(m.createdAt).toLocaleTimeString()}</time>
                <button
                  type="button"
                  className="chat-reply-btn"
                  onClick={() => setReplyTo(m)}
                  title="Reply"
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
        {typingUserId && typingUserId !== currentUserId && (
          <div className="chat-typing">Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="chat-reply-bar">
          <div>
            <strong>Replying to {replyTo.senderId === currentUserId ? "yourself" : "them"}</strong>
            <p>{replyTo.content}</p>
          </div>
          <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
            ×
          </button>
        </div>
      )}

      <form
        className="chat-input-row"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.trim() || sending) return;
          setSending(true);
          try {
            await onSend(draft.trim(), replyTo?.id);
            setDraft("");
            setReplyTo(null);
          } finally {
            setSending(false);
          }
        }}
      >
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onTyping();
          }}
          placeholder={replyTo ? "Type your reply..." : "Type a message..."}
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
}
