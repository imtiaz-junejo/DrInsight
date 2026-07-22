import { cn } from "@/lib/utils";
import type { NewsletterMessageTone } from "@/hooks/use-newsletter-form";

type NewsletterSubscribeMessageProps = {
  message: string;
  tone: NewsletterMessageTone | null;
  className?: string;
  onDark?: boolean;
};

export function NewsletterSubscribeMessage({
  message,
  tone,
  className,
  onDark = false,
}: NewsletterSubscribeMessageProps) {
  if (!message || !tone) return null;

  const toneClass =
    tone === "error"
      ? onDark
        ? "text-red-300"
        : "text-red-600"
      : onDark
        ? "text-[#86efac]"
        : "text-[#059669]";

  return (
    <p className={cn(toneClass, className)} role={tone === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}
