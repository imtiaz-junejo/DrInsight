import Link from "next/link";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 text-8xl">🏥</div>
        <h1 className="font-display mb-3 text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900">404</h1>
        <h2 className="font-display mb-4 text-xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mb-8 max-w-[440px] text-[.95rem] text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let us help you find what you
          need.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["/blog", "📰 Blog"],
            ["/health-tools", "🔬 Health Tools"],
            ["/ask-doctor", "💬 Ask Doctor"],
            ["/book-consultation", "📅 Book Consult"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-gray-200 px-4 py-3 text-[.82rem] font-medium text-gray-700 transition hover:border-blue hover:bg-blue-light hover:text-blue"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
