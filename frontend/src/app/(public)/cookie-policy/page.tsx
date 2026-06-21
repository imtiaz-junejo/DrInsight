import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const metadata = { title: "Cookie Policy — DrInsight" };

export default function CookiePolicyPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Cookie Policy" }]} />
      <div className="mx-auto max-w-[800px] px-6 py-12">
        <h1 className="font-display mb-2 text-3xl font-bold text-gray-900">Cookie Policy</h1>
        <p className="mb-8 text-[.85rem] text-gray-500">Last updated: June 1, 2026</p>

        <div className="space-y-8 text-[.9rem] leading-relaxed text-gray-700">
          <section>
            <h2 className="font-display mb-3 text-xl font-bold text-gray-900">What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us provide a
              better experience by remembering your preferences and understanding how you use DrInsight.
            </p>
          </section>
          <section>
            <h2 className="font-display mb-3 text-xl font-bold text-gray-900">Cookies We Use</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Essential cookies:</strong> Required for site functionality, authentication, and security.
                Cannot be disabled.
              </li>
              <li>
                <strong>Analytics cookies:</strong> Help us understand traffic patterns and improve our content.
                Optional — you can opt out.
              </li>
              <li>
                <strong>Preference cookies:</strong> Remember your language, newsletter settings, and dashboard
                preferences.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="font-display mb-3 text-xl font-bold text-gray-900">Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Note that disabling essential cookies may affect
              site functionality. For GDPR-compliant opt-out of analytics cookies, contact{" "}
              <Link href="mailto:privacy@drinsight.com" className="font-semibold text-blue">
                privacy@drinsight.com
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
