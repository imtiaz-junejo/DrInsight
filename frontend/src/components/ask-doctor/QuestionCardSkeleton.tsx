export function QuestionCardSkeleton() {
  return (
    <div className="qa-card qa-card--skeleton" aria-hidden>
      <div className="qa-meta">
        <span className="qa-skeleton qa-skeleton-badge" />
        <span className="qa-skeleton qa-skeleton-time" />
        <span className="qa-skeleton qa-skeleton-verified" />
      </div>
      <div className="qa-skeleton qa-skeleton-question" />
      <div className="qa-answer qa-answer--skeleton">
        <div className="qa-answer-header">
          <span className="qa-skeleton qa-skeleton-avatar" />
          <div className="qa-skeleton-lines">
            <span className="qa-skeleton qa-skeleton-name" />
            <span className="qa-skeleton qa-skeleton-spec" />
          </div>
        </div>
        <span className="qa-skeleton qa-skeleton-line" />
        <span className="qa-skeleton qa-skeleton-line" />
        <span className="qa-skeleton qa-skeleton-line qa-skeleton-line--short" />
      </div>
      <div className="qa-footer">
        <span className="qa-skeleton qa-skeleton-helpful" />
        <div className="qa-tags">
          <span className="qa-skeleton qa-skeleton-tag" />
          <span className="qa-skeleton qa-skeleton-tag" />
        </div>
      </div>
    </div>
  );
}

export function QuestionFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <QuestionCardSkeleton key={i} />
      ))}
    </>
  );
}
