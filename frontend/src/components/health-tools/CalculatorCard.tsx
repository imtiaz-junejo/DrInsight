import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconTone = "blue" | "teal" | "green" | "amber" | "pink" | "purple";

type CalculatorCardProps = {
  id: string;
  icon: string;
  iconClass: IconTone;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  tall?: boolean;
};

export function CalculatorCard({
  id,
  icon,
  iconClass,
  title,
  description,
  children,
  className,
}: CalculatorCardProps) {
  return (
    <article className={cn("tool-panel", className)} id={id}>
      <div className="tool-header">
        <div className={cn("tool-ico", iconClass)} aria-hidden>
          {icon}
        </div>
        <div className="tool-header-text">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="tool-body">{children}</div>
    </article>
  );
}
