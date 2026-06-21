import { cn } from "@/lib/utils";

interface Feature {
  icon: string;
  text: string;
}

interface AuthLeftPanelProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  features?: Feature[];
  pills?: string[];
  children?: React.ReactNode;
  className?: string;
}

export function AuthLeftPanel({
  eyebrow,
  title,
  description,
  features,
  pills,
  children,
  className,
}: AuthLeftPanelProps) {
  return (
    <div
      className={cn(
        "relative hidden flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-dark via-blue to-teal p-14 text-white lg:flex",
        className,
      )}
    >
      <div className="hero-pattern absolute inset-0 opacity-[.04]" />
      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/[.06]" />
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/[.06]" />
      <div className="relative z-10">
        <div className="mb-4 text-[.72rem] font-bold uppercase tracking-[.12em] text-[#93c5fd]">{eyebrow}</div>
        <h1 className="font-display mb-4 text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-tight">{title}</h1>
        <p className="mb-8 max-w-[400px] text-[.9rem] leading-relaxed opacity-90">{description}</p>
        {features && (
          <div className="mb-8 flex flex-col gap-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/20 bg-white/15 text-base backdrop-blur-sm">
                  {f.icon}
                </div>
                <span className="text-[.88rem] opacity-90">{f.text}</span>
              </div>
            ))}
          </div>
        )}
        {children}
        {pills && (
          <div className="flex flex-wrap gap-2.5">
            {pills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/20 bg-white/12 px-3.5 py-1 text-[.72rem] font-semibold backdrop-blur-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
