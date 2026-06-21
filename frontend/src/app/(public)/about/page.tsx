import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us — DrInsight",
  description: "Learn about DrInsight's mission to deliver evidence-based medical information and expert care.",
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "About Us" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">Our Story</div>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight">
            Dedicated to Evidence-Based Medicine & Patient Trust
          </h1>
          <p className="mx-auto mt-4 max-w-[600px] text-[.95rem] opacity-90">
            DrInsight was founded with a single mission — to make trusted, doctor-verified medical information
            accessible to everyone, everywhere, at any time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["🏥 Founded 2018", "👨‍⚕️ 200+ Doctors", "🌍 50+ Countries", "🛡️ HIPAA Compliant"].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-[.78rem] font-semibold backdrop-blur-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 text-center">
            <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-blue">Purpose & Direction</div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Our Mission & Vision</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-blue/20 bg-blue-light/30">
              <CardContent className="p-8">
                <div className="mb-4 text-3xl">🎯</div>
                <h3 className="font-display mb-3 text-xl font-bold text-gray-900">Our Mission</h3>
                <p className="text-[.9rem] leading-relaxed text-gray-600">
                  To democratize access to accurate, evidence-based medical information by connecting patients with
                  board-certified specialists — breaking down barriers of cost, geography, and language.
                </p>
              </CardContent>
            </Card>
            <Card className="border-teal/20 bg-teal/5">
              <CardContent className="p-8">
                <div className="mb-4 text-3xl">🔭</div>
                <h3 className="font-display mb-3 text-xl font-bold text-gray-900">Our Vision</h3>
                <p className="text-[.9rem] leading-relaxed text-gray-600">
                  To become the world&apos;s most trusted digital health platform — where patients find clarity,
                  doctors share expertise, and communities grow healthier together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="relative mx-auto mb-6 inline-block md:mx-0">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue to-teal text-6xl">
                👨‍⚕️
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-green px-3 py-1 text-[.72rem] font-bold text-white">
                ✓ Verified MD
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900">Dr. Javed Kumbhar</h3>
            <p className="font-semibold text-blue">Founder & Medical Director</p>
            <p className="text-[.82rem] text-gray-500">DrInsight — Est. 2018</p>
          </div>
          <div className="space-y-3">
            {[
              "🎓 MBBS, MD — Internal Medicine",
              "🏥 20+ Years Clinical Experience",
              "📋 Board Certified — AMA & USMLE",
              "🔬 Former Chief of Medicine, NYU",
              "📚 40+ Peer-Reviewed Publications",
              "🌍 WHO Advisory Panel Member",
            ].map((cred) => (
              <div key={cred} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[.85rem]">
                {cred}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 text-center">
            <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-blue">By the Numbers</div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Our Impact</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["500K+", "Patients Served"],
              ["1,000+", "Medical Articles"],
              ["200+", "Specialist Doctors"],
              ["4.9★", "Average Rating"],
            ].map(([num, label]) => (
              <div
                key={label as string}
                className="rounded-[20px] border border-gray-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
              >
                <strong className="font-display block text-3xl font-bold text-blue">{num}</strong>
                <span className="text-[.82rem] text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 px-6 py-14 text-center text-white">
        <h2 className="font-display mb-3 text-2xl font-bold">Accreditations & Compliance</h2>
        <p className="mb-8 text-[.88rem] text-[#94a3b8]">Trusted by patients and physicians worldwide</p>
        <div className="mx-auto flex max-w-[800px] flex-wrap justify-center gap-4">
          {[
            ["🛡️", "HIPAA Compliant"],
            ["🇪🇺", "GDPR Compliant"],
            ["✓", "Medically Reviewed"],
            ["🔒", "256-bit SSL"],
          ].map(([icon, label]) => (
            <div key={label as string} className="rounded-xl border border-[#334155] bg-[#1e293b] px-6 py-5 min-w-[140px]">
              <div className="mb-2 text-2xl">{icon}</div>
              <strong className="text-[.82rem]">{label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-dark to-blue px-6 py-16 text-center text-white">
        <h2 className="font-display mb-3 text-2xl font-bold">Join the DrInsight Community</h2>
        <p className="mx-auto mb-8 max-w-[480px] text-[.9rem] opacity-90">
          Whether you&apos;re a patient seeking clarity or a physician sharing expertise — we welcome you.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="white" asChild>
            <Link href="/register">Create Free Account →</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
