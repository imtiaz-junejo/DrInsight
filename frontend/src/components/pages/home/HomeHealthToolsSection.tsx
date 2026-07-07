import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HOME_HEALTH_TOOLS } from "./health-tools-data";

const toolCardShadow =
  "shadow-[0_8px_24px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)]";
const toolCardHoverShadow =
  "hover:shadow-[0_14px_32px_rgba(15,23,42,0.1),0_4px_12px_rgba(15,23,42,0.06)]";

export function HomeHealthToolsSection() {
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-13 text-center">
          <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">
            Free Health Tools
          </div>
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight text-gray-900">
            Calculate Your Health Metrics Instantly
          </h2>
          <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
            Use our evidence-based health calculators to monitor and understand your health. All
            tools are medically reviewed.
          </p>
        </div>

        <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4")}>
          {HOME_HEALTH_TOOLS.map(({ icon, title, description, hash }) => (
            <Link
              key={title}
              href={`/health-tools${hash}`}
              aria-label={`Open ${title}`}
              className={cn(
                "group flex h-full min-h-[220px] flex-col items-center rounded-[18px]",
                "border-[1.5px] border-gray-300 bg-gray-200 px-5 py-6 text-center",
                toolCardShadow,
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1.5 hover:border-blue",
                toolCardHoverShadow,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
              )}
            >
              <div
                className={cn(
                  "mb-4 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px]",
                  "bg-blue-light text-[1.65rem] leading-none transition-all duration-300 ease-out",
                  "group-hover:bg-blue",
                )}
                aria-hidden
              >
                <span className="transition-transform duration-300 ease-out group-hover:scale-105">
                  {icon}
                </span>
              </div>

              <h3
                className={cn(
                  "mb-2.5 text-[.9rem] font-semibold leading-snug text-gray-800",
                  "transition-colors duration-300 ease-out group-hover:text-blue",
                )}
              >
                {title}
              </h3>

              <p className="flex-1 text-justify text-[.78rem] leading-relaxed text-gray-600">
                {description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Button asChild className="inline-flex w-auto">
            <Link href="/health-tools">Explore All {HOME_HEALTH_TOOLS.length} Health Tools →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
