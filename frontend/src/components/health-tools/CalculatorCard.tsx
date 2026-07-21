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
  tall,
}: CalculatorCardProps) {
  return (
    <article className={cn("calc-card bg-gray-100", tall && "calc-card--tall", className)} id={id}>
      <div className={cn("calc-card-icon", `calc-card-icon--${iconClass}`)} aria-hidden>
        {icon}
      </div>
      <h3 className="calc-card-title">{title}</h3>
      <p className="calc-card-desc">{description}</p>
      <div className="calc-card-body">{children}</div>
    </article>
  );
}
