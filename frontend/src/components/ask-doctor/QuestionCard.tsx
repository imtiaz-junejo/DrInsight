"use client";

import { useMemo, useState } from "react";
import {
  doctorFullName,
  formatAnsweredAgo,
  getInitials,
  gradientForId,
  specialtyEmoji,
} from "@/lib/data-mappers";
import { useMarkQuestionHelpful, type AskDoctorQuestion } from "@/services/api-hooks";

const ANSWER_PREVIEW_LENGTH = 320;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractTags(category: string, question: string): string[] {
  const tags = [category];
  const words = question
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 2);
  for (const word of words) {
    const tag = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 3);
}

type QuestionCardProps = {
  question: AskDoctorQuestion;
};

export function QuestionCard({ question: q }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(q.helpfulCount ?? 0);
  const markHelpful = useMarkQuestionHelpful();

  const specialty = q.answeredBy?.doctorProfile?.specialty ?? q.category;
  const credentials = q.answeredBy?.doctorProfile?.credentials;
  const doctorSpec = credentials ? `${specialty} · ${credentials}` : specialty;
  const answerText = useMemo(() => stripHtml(q.answer ?? ""), [q.answer]);
  const needsExpand = answerText.length > ANSWER_PREVIEW_LENGTH;
  const displayAnswer =
    expanded || !needsExpand ? answerText : `${answerText.slice(0, ANSWER_PREVIEW_LENGTH).trim()}…`;
  const tags = useMemo(() => extractTags(q.category, q.question), [q.category, q.question]);
  const answeredLabel = q.answeredAt ? formatAnsweredAgo(q.answeredAt) : formatAnsweredAgo(q.createdAt);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    markHelpful.mutate(q.id, {
      onSuccess: (data) => setHelpfulCount(data.helpfulCount),
      onError: () => setLiked(false),
    });
  };

  return (
    <article className="qa-card">
      <div className="qa-meta">
        <span className="qa-cat-badge">
          {specialtyEmoji(q.category)} {q.category}
        </span>
        <span className="qa-time">🕐 {answeredLabel}</span>
        {q.isAnonymous && <span className="qa-anon">🔒 Anonymous</span>}
        {q.status === "ANSWERED" && <span className="verified-ans">✓ Verified Answer</span>}
        {q.status === "PENDING" && <span className="qa-status-pending">⏳ Pending</span>}
      </div>

      <h3 className="qa-question">{q.question}</h3>

      {q.answer && (
        <div className="qa-answer">
          <div className="qa-answer-header">
            <div
              className="doc-avatar-sm"
              style={{ background: gradientForId(q.id) }}
              aria-hidden
            >
              {getInitials(q.answeredBy?.firstName, q.answeredBy?.lastName)}
            </div>
            <div>
              <div className="doc-name-sm">
                {q.answeredBy ? doctorFullName(q.answeredBy) : "DrInsight Medical Team"}
              </div>
              <div className="doc-spec-sm">{doctorSpec}</div>
            </div>
          </div>
          <div className="qa-answer-text">{displayAnswer}</div>
          {needsExpand && (
            <button type="button" className="qa-read-more" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      <div className="qa-footer">
        <div className="qa-helpful">
          Was this helpful?{" "}
          <button type="button" className={liked ? "liked" : ""} onClick={handleLike}>
            👍 Helpful ({helpfulCount})
          </button>
        </div>
        <div className="qa-tags">
          {tags.map((tag) => (
            <span key={tag} className="qa-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
