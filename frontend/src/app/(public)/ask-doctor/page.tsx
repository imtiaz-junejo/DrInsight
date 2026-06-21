"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const sampleQuestions = [
  {
    cat: "Cardiology",
    q: "Is occasional chest tightness after exercise always a sign of heart disease?",
    a: "Not always — but persistent or worsening chest discomfort warrants evaluation. Dr. Mitchell explains when to seek urgent care.",
    doctor: "Dr. Sarah Mitchell",
    answered: "2 days ago",
  },
  {
    cat: "Endocrinology",
    q: "My fasting glucose is 108 mg/dL — am I pre-diabetic?",
    a: "A fasting glucose of 100–125 mg/dL falls in the pre-diabetes range. Lifestyle changes can significantly reduce progression risk.",
    doctor: "Dr. Priya Sharma",
    answered: "4 days ago",
  },
  {
    cat: "Neurology",
    q: "How can I tell if my headaches are migraines?",
    a: "Migraines often involve throbbing pain, nausea, and light sensitivity. Keeping a headache diary helps your neurologist diagnose accurately.",
    doctor: "Dr. James Okafor",
    answered: "1 week ago",
  },
];

export default function AskDoctorPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Breadcrumb items={[{ label: "Ask the Doctor" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-14 text-white">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">Ask the Doctor</div>
            <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold leading-tight">
              Get Expert Medical Answers — Free
            </h1>
            <p className="mt-4 text-[.95rem] opacity-90">
              Submit your health question to our panel of board-certified specialists and receive a medically reviewed
              answer within 24–48 hours.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                "👨‍⚕️ Answers from board-certified specialists",
                "🔒 Anonymous submissions available",
                "⚡ Typical response within 24–48 hours",
                "📚 Browse 5,000+ previously answered questions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[.88rem] opacity-90">
                  ✅ {item}
                </div>
              ))}
            </div>
          </div>
          <Card className="border-white/20 bg-white/10 text-gray-900 backdrop-blur-md">
            <CardContent className="p-6">
              {!submitted ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <h3 className="font-display text-[1.2rem] font-bold text-white">Ask Your Question</h3>
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-white/90">
                      Your Name (optional)
                    </label>
                    <Input placeholder="Leave blank to submit anonymously" className="bg-white" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-white/90">Medical Category</label>
                    <select className="h-11 w-full rounded-lg border-[1.5px] border-gray-200 bg-white px-3.5 text-sm focus:border-blue focus:outline-none">
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Dermatology</option>
                      <option>Mental Health</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-white/90">Your Question</label>
                    <textarea
                      required
                      className="min-h-[100px] w-full resize-y rounded-lg border-[1.5px] border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue focus:outline-none"
                      placeholder="Describe your symptoms or health concern in detail..."
                    />
                  </div>
                  <Button type="submit" size="full">
                    Submit Question ✉️
                  </Button>
                  <div className="rounded border-l-4 border-amber bg-[#fffbeb] p-3 text-[.78rem] text-[#92400e]">
                    ⚠️ This service is for informational purposes only and does not replace professional medical
                    advice, diagnosis, or treatment.
                  </div>
                </form>
              ) : (
                <div className="py-4 text-center text-white">
                  <div className="mb-3 text-4xl">✅</div>
                  <h3 className="font-display mb-2 text-xl font-bold">Question Submitted!</h3>
                  <p className="mb-4 text-[.88rem] opacity-90">
                    A specialist will review your question and respond within 24–48 hours.
                  </p>
                  <Button variant="white" onClick={() => setSubmitted(false)}>
                    Ask Another Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1 text-[.72rem] font-bold uppercase tracking-widest text-blue">Previously Answered</div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Browse Recent Q&A</h2>
          </div>
          <Input placeholder="Search questions..." className="max-w-xs" />
        </div>

        <div className="space-y-5">
          {sampleQuestions.map((item) => (
            <Card key={item.q} className="transition hover:shadow-[var(--shadow-md)]">
              <CardContent className="p-6">
                <div className="mb-2 text-[.72rem] font-bold uppercase tracking-wide text-blue">{item.cat}</div>
                <h3 className="font-display mb-3 text-[1.05rem] font-semibold text-gray-900">{item.q}</h3>
                <p className="mb-4 rounded-lg border-l-[3px] border-blue bg-blue-light p-4 text-[.88rem] leading-relaxed text-gray-700">
                  {item.a}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[.78rem] text-gray-500">
                  <span>
                    Answered by <strong className="text-gray-800">{item.doctor}</strong>
                  </span>
                  <span>{item.answered}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="secondary">
            <Link href="/book-consultation">Need personalised advice? Book a Consultation →</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
