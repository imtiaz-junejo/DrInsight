import { cn } from "@/lib/utils";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-gradient-to-br from-blue to-teal text-lg text-white">
        ✚
      </div>
      <span className={cn("font-display text-2xl font-bold text-blue-dark", textClassName)}>
        DrInsight
      </span>
    </div>
  );
}
