import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using DrInsight, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.",
  },
  {
    title: "Medical Disclaimer",
    content:
      "DrInsight provides educational health information only. Content on this platform is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.",
  },
  {
    title: "User Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. Misrepresentation of medical credentials by physician accounts will result in permanent suspension.",
  },
  {
    title: "Consultations & Payments",
    content:
      "Consultation fees are displayed before booking and are non-refundable within 24 hours of the appointment unless cancelled by the physician. DrInsight acts as a platform connecting patients with independent licensed physicians.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content on DrInsight — including articles, tools, and branding — is owned by DrInsight or its licensors. You may not reproduce, distribute, or create derivative works without written permission.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the fullest extent permitted by law, DrInsight shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
  },
];

export const metadata = { title: "Terms & Conditions — DrInsight" };

export default function TermsConditionsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Terms & Conditions" }]} />
      <div className="mx-auto max-w-[800px] px-6 py-12">
        <h1 className="font-display mb-2 text-3xl font-bold text-gray-900">Terms & Conditions</h1>
        <p className="mb-8 text-[.85rem] text-gray-500">Last updated: June 1, 2026</p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="font-display mb-3 text-xl font-bold text-gray-900">{s.title}</h2>
            <p className="text-[.9rem] leading-relaxed text-gray-700">{s.content}</p>
          </section>
        ))}
        <p className="text-[.88rem] text-gray-600">
          Contact{" "}
          <Link href="mailto:legal@drinsight.com" className="font-semibold text-blue">
            legal@drinsight.com
          </Link>{" "}
          for legal inquiries.
        </p>
      </div>
    </>
  );
}
