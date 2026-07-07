import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HOME_MAJOR_SPECIALTIES } from "./specialty-icons";

export function HomeSpecialtiesSection() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-13 text-center">
          <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Our Specialties</div>
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight text-gray-900">
            Expert Care Across All Medical Fields
          </h2>
          <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
            Browse our comprehensive range of medical specialties, each led by board-certified
            specialists with decades of experience.
          </p>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4",
            "md:grid-cols-3 lg:grid-cols-6",
          )}
        >
          {HOME_MAJOR_SPECIALTIES.map(({ name, icon }) => (
            <Link
              key={name}
              href="/our-doctors"
              aria-label={`Browse ${name} specialists`}
              className={cn(
                "group flex min-h-[132px] flex-col items-center justify-center rounded-xl",
                "border-[1.5px] border-gray-300 bg-gray-100 px-4 py-6 text-center",
                "shadow-[var(--shadow-sm)] transition-all duration-[.22s]",
                "hover:-translate-y-[3px] hover:border-blue hover:shadow-[var(--shadow-lg)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
              )}
            >
              <div
                className={cn(
                  "mb-3 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px]",
                  "bg-blue-light text-[1.65rem] leading-none transition-all duration-[.22s]",
                  "group-hover:bg-blue",
                )}
                aria-hidden
              >
                <span className="transition-transform duration-[.22s] group-hover:scale-105">{icon}</span>
              </div>
              <h3
                className={cn(
                  "text-[.88rem] font-semibold leading-snug text-gray-800",
                  "transition-colors duration-[.22s] group-hover:text-blue",
                )}
              >
                {name}
              </h3>
            </Link>
          ))}
        </div>

        <div className="mt-7 text-center">
          <Button asChild className="inline-flex w-auto">
            <Link href="/blog">View All Specialties →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
