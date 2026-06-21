import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Contact Us — DrInsight",
  description: "Get in touch with the DrInsight medical team.",
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Contact Us" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-[700px]">
          <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">Get In Touch</div>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold">We&apos;re Here to Help</h1>
          <p className="mt-3 text-[.95rem] opacity-90">
            Have a question, feedback, or need support? Our team responds within 24 hours on business days.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-12 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardContent className="p-8">
            <h2 className="font-display mb-6 text-xl font-bold text-gray-900">Send Us a Message</h2>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">First Name</label>
                  <Input required placeholder="John" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Last Name</label>
                  <Input required placeholder="Smith" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Email Address</label>
                <Input required type="email" placeholder="john@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Subject</label>
                <select className="h-11 w-full rounded-lg border-[1.5px] border-gray-200 px-3.5 text-sm focus:border-blue focus:outline-none">
                  <option>General Inquiry</option>
                  <option>Book a Consultation</option>
                  <option>Technical Support</option>
                  <option>Partnership / Media</option>
                  <option>Feedback</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Message</label>
                <textarea
                  required
                  className="min-h-[140px] w-full rounded-lg border-[1.5px] border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue focus:outline-none focus:ring-[3px] focus:ring-blue/10"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" size="full">
                Send Message →
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {[
            ["📞", "Phone", "+1 (800) MED-HELP (633-4357)", "Mon–Fri 8AM–8PM, Sat 9AM–5PM"],
            ["✉️", "Email", "contact@drinsight.com", "We respond within 24 hours"],
            ["📍", "Address", "123 Medical Plaza, Suite 400\nNew York, NY 10001, USA", ""],
            ["📱", "WhatsApp", "+1 (800) 633-4357", "Quick support via WhatsApp"],
          ].map(([icon, title, value, sub]) => (
            <Card key={title as string}>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-light text-xl">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="whitespace-pre-line text-[.88rem] text-gray-700">{value}</p>
                  {sub && <p className="mt-1 text-[.78rem] text-gray-400">{sub}</p>}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="rounded-[20px] bg-red/10 border border-[#fecaca] p-5">
            <strong className="text-red">🚨 Medical Emergency?</strong>
            <p className="mt-1 text-[.85rem] text-gray-700">
              Call 911 immediately. DrInsight is not an emergency service.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link href="/ask-doctor">Non-emergency help →</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
