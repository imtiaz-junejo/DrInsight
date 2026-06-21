import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const sitemapSections = [
  {
    title: "Main Pages",
    links: [
      ["/", "Home"],
      ["/about", "About Us"],
      ["/contact", "Contact Us"],
      ["/faq", "FAQ"],
      ["/sitemap", "Sitemap"],
    ],
  },
  {
    title: "Medical Services",
    links: [
      ["/doctors", "Our Doctors"],
      ["/book-consultation", "Book Consultation"],
      ["/ask-doctor", "Ask the Doctor"],
      ["/health-tools", "Health Tools"],
      ["/blog", "Medical Blog"],
    ],
  },
  {
    title: "Account",
    links: [
      ["/login", "Login"],
      ["/register", "Create Account"],
      ["/forgot-password", "Forgot Password"],
      ["/patient", "Patient Dashboard"],
      ["/doctor", "Doctor Dashboard"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy-policy", "Privacy Policy"],
      ["/terms-conditions", "Terms & Conditions"],
      ["/disclaimer", "Medical Disclaimer"],
      ["/cookie-policy", "Cookie Policy"],
    ],
  },
];

export const metadata = { title: "Sitemap — DrInsight" };

export default function SitemapPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Sitemap" }]} />
      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <h1 className="font-display mb-2 text-3xl font-bold text-gray-900">Sitemap</h1>
        <p className="mb-10 text-[.9rem] text-gray-600">
          Browse all pages on the DrInsight medical platform.
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sitemapSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 border-b border-gray-200 pb-2 text-[.9rem] font-bold text-blue">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-[.85rem] text-gray-700 transition hover:text-blue">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
