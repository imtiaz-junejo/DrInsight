import Link from "next/link";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <div className={cn("border-b border-gray-200 bg-white px-6 py-2.5 text-[.78rem] text-gray-400", className)}>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-1.5">
        <Link href="/" className="transition hover:text-blue">
          🏠 Home
        </Link>
        {items.map((item, i) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="text-gray-300">›</span>
            {item.href ? (
              <Link href={item.href} className="transition hover:text-blue">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-blue">{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
