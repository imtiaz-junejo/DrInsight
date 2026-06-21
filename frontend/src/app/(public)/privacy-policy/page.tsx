import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly (name, email, health questions, consultation details) and automatically collected data (device type, IP address, usage analytics). Health information is treated as Protected Health Information (PHI) under HIPAA.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to provide medical content, process consultations, respond to Ask the Doctor submissions, improve our services, and send optional health newsletters. We never sell your personal or medical data to third parties.",
  },
  {
    title: "Data Security",
    content:
      "All data is encrypted in transit (256-bit SSL) and at rest. Access is restricted to authorised personnel. We conduct regular security audits and maintain HIPAA and GDPR compliance.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. EU residents have additional rights under GDPR including data portability and the right to object to processing. Contact privacy@drinsight.com to exercise your rights.",
  },
  {
    title: "Cookies",
    content:
      "We use essential cookies for site functionality and optional analytics cookies. See our Cookie Policy for full details and opt-out instructions.",
  },
];

export const metadata = { title: "Privacy Policy — DrInsight" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />
      <div className="mx-auto max-w-[800px] px-6 py-12">
        <h1 className="font-display mb-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mb-8 text-[.85rem] text-gray-500">Last updated: June 1, 2026</p>
        <p className="mb-8 text-[.95rem] leading-relaxed text-gray-700">
          DrInsight (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
          platform at drinsight.com.
        </p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="font-display mb-3 text-xl font-bold text-gray-900">{s.title}</h2>
            <p className="text-[.9rem] leading-relaxed text-gray-700">{s.content}</p>
          </section>
        ))}
        <p className="text-[.88rem] text-gray-600">
          Questions? Contact us at{" "}
          <Link href="mailto:privacy@drinsight.com" className="font-semibold text-blue">
            privacy@drinsight.com
          </Link>
        </p>
      </div>
    </>
  );
}
