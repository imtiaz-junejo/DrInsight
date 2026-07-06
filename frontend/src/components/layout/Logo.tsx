import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/assets/logo/header-logo-display.png"
        alt="DrInsight"
        className="block h-[70px] p-3 w-auto max-h-[70px] max-w-full shrink-0 object-contain"
      />
    </div>
  );
}
