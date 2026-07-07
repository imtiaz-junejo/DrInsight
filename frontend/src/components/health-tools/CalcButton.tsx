import { cn } from "@/lib/utils";

type CalcButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function CalcButton({ children, loading, className, disabled, type = "submit", ...props }: CalcButtonProps) {
  return (
    <button
      type={type}
      className={cn("calc-btn", loading && "calc-btn--loading", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="calc-btn-spinner" aria-hidden />}
      <span className={cn(loading && "calc-btn-text--hidden")}>{children}</span>
    </button>
  );
}
