import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-gray-900 px-6 pb-0 pt-16 text-[.85rem] text-[#94a3b8]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr] lg:gap-12">
        <div>
          <Logo textClassName="text-white" />
          <p className="mb-5 mt-3.5 leading-[1.7]">
            Your trusted platform for evidence-based medical information, expert doctor
            consultations, and health tools — reviewed and approved by licensed physicians.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-[#334155] bg-[#1e293b] px-2.5 py-1 text-[.72rem] text-[#64748b]">
            🛡️ HIPAA Compliant
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-[#334155] bg-[#1e293b] px-2.5 py-1 text-[.72rem] text-[#64748b]">
            🇪🇺 GDPR Compliant
          </div>
          <div className="mt-4 flex gap-2.5">
            {["𝕏", "f", "in", "▶", "📸"].map((icon) => (
              <a
                key={icon}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e293b] text-[.9rem] transition hover:bg-blue hover:text-white"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 border-b border-[#1e293b] pb-2 text-[.9rem] font-bold text-white">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {[
              ["/", "Home"],
              ["/about", "About Us"],
              ["/health-tools", "Health Tools"],
              ["/ask-doctor", "Ask the Doctor"],
              ["/blog", "Blog"],
              ["/book-consultation", "Book Consultation"],
              ["/contact", "Contact Us"],
              ["/privacy-policy", "Privacy Policy"],
              ["/terms-conditions", "Terms & Conditions"],
              ["/disclaimer", "Disclaimer"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-[.83rem] transition hover:text-[#93c5fd]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 border-b border-[#1e293b] pb-2 text-[.9rem] font-bold text-white">
            Medical Categories
          </h4>
          <ul className="space-y-2">
            {[
              "Clinical Specialties",
              "Surgical Specialties",
              "Diagnostic Specialties",
              "Preventive Health",
              "Mental Health",
              "Women's Health",
              "Men's Health",
              "Pediatrics",
              "Nutrition",
            ].map((label) => (
              <li key={label}>
                <Link href="/blog" className="text-[.83rem] transition hover:text-[#93c5fd]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 border-b border-[#1e293b] pb-2 text-[.9rem] font-bold text-white">
            Contact Information
          </h4>
          <div className="mb-2.5 flex items-start gap-2.5 text-[.82rem]">
            <span className="text-blue-mid">📞</span>
            +1 (800) MED-HELP (633-4357)
          </div>
          <div className="mb-2.5 flex items-start gap-2.5 text-[.82rem]">
            <span className="text-blue-mid">✉️</span>
            contact@drinsight.com
          </div>
          <div className="mb-2.5 flex items-start gap-2.5 text-[.82rem]">
            <span className="text-blue-mid">📍</span>
            123 Medical Plaza, Suite 400
            <br />
            New York, NY 10001, USA
          </div>
          <div className="mb-2.5 flex items-start gap-2.5 text-[.82rem]">
            <span className="text-blue-mid">🕐</span>
            Mon–Fri: 8AM–8PM | Sat: 9AM–5PM
          </div>
          <div className="flex items-start gap-2.5 text-[.82rem] text-[#25d366]">
            📱 WhatsApp: +1 (800) 633-4357
          </div>
        </div>

        <div>
          <h4 className="mb-4 border-b border-[#1e293b] pb-2 text-[.9rem] font-bold text-white">
            Expert Health Insights
          </h4>
          <p className="mb-3.5 text-[.82rem]">
            Get weekly medical tips and health news from our specialists.
          </p>
          <input
            type="email"
            placeholder="Your email address"
            className="mb-2.5 w-full rounded-lg border border-[#334155] bg-[#1e293b] px-3.5 py-2.5 text-[.85rem] text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-blue"
          />
          <button className="w-full rounded-lg bg-blue py-2.5 text-[.85rem] font-semibold text-white transition hover:bg-blue-mid">
            Subscribe Free →
          </button>
          <p className="mt-2 text-[.72rem] text-[#475569]">
            🔒 GDPR compliant. Unsubscribe anytime.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1240px] flex-col items-start justify-between gap-3 border-t border-[#1e293b] py-6 md:flex-row md:items-center">
        <div>
          <p className="text-[.78rem]">© 2026 DrInsight. All rights reserved.</p>
          <p className="mt-1 text-[.75rem] text-[#475569]">
            ⚕️ The content on DrInsight is for informational purposes only and is not a
            substitute for professional medical advice, diagnosis, or treatment. Always consult
            a qualified healthcare provider for medical decisions.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {[
            ["/privacy-policy", "Privacy Policy"],
            ["/terms-conditions", "Terms of Service"],
            ["/disclaimer", "Medical Disclaimer"],
            ["/cookie-policy", "Cookie Policy"],
            ["/sitemap", "Sitemap"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="text-[.78rem] text-[#64748b] transition hover:text-[#93c5fd]">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
