import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const metadata = { title: "Medical Disclaimer — DrInsight" };

export default function DisclaimerPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Medical Disclaimer" }]} />
      <div className="mx-auto max-w-[800px] px-6 py-12">
        <h1 className="font-display mb-2 text-3xl font-bold text-gray-900">Medical Disclaimer</h1>
        <p className="mb-8 text-[.85rem] text-gray-500">Last updated: June 1, 2026</p>

        <div className="mb-8 rounded-xl border-l-4 border-red bg-[#fef2f2] p-5 text-[.9rem] text-gray-800">
          <strong className="text-red">🚨 Emergency:</strong> If you are experiencing a medical emergency, call 911
          or your local emergency number immediately. Do not use DrInsight for emergency medical situations.
        </div>

        <div className="space-y-6 text-[.9rem] leading-relaxed text-gray-700">
          <p>
            The content on DrInsight — including articles, health tools, Ask the Doctor responses, and general
            platform information — is provided for educational and informational purposes only. It is not intended
            to be, and should not be used as, a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p>
            Always seek the advice of your physician or other qualified health provider with any questions you may
            have regarding a medical condition. Never disregard professional medical advice or delay in seeking it
            because of something you have read on DrInsight.
          </p>
          <p>
            DrInsight does not recommend or endorse any specific tests, physicians, products, procedures, opinions,
            or other information that may appear on the platform. Reliance on any information provided by DrInsight is
            solely at your own risk.
          </p>
          <p>
            While our content is written and reviewed by board-certified physicians, individual health circumstances
            vary. What applies to one patient may not apply to another. Personalised medical advice requires a direct
            consultation with a licensed healthcare provider.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/contact" className="font-semibold text-blue">
            Contact us with questions →
          </Link>
        </div>
      </div>
    </>
  );
}
