import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ResultActions } from "./ResultActions";

export function ToolDisclaimer({ children }: { children: ReactNode }) {
  return <div className="disclaimer">{children}</div>;
}

export function RelatedTags({ tags }: { tags: string[] }) {
  return (
    <div className="related-tags">
      {tags.map((tag) => (
        <span key={tag} className="related-tag">
          {tag}
        </span>
      ))}
    </div>
  );
}

type ResultBoxProps = {
  show: boolean;
  title: string;
  children: ReactNode;
  className?: string;
  toolTitle?: string;
};

export function ResultBox({ show, title, children, className, toolTitle }: ResultBoxProps) {
  if (!show) return null;

  return (
    <div className={cn("result-box show", className)} role="region" aria-live="polite" aria-label={title}>
      <div className="result-label">{title}</div>
      {children}
      <ResultActions toolTitle={toolTitle ?? title} />
    </div>
  );
}

type RiskResultBoxProps = {
  show: boolean;
  badge: string;
  badgeClass: string;
  advice: string;
  toolTitle?: string;
};

export function RiskResultBox({ show, badge, badgeClass, advice, toolTitle }: RiskResultBoxProps) {
  if (!show) return null;

  return (
    <div className="risk-result show" role="region" aria-live="polite">
      <div className={cn("risk-badge", badgeClass)}>{badge}</div>
      <div className="risk-advice">{advice}</div>
      <ResultActions toolTitle={toolTitle} />
    </div>
  );
}
