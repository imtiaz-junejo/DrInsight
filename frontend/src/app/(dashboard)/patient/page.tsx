import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Patient Dashboard — DrInsight" };

export default function PatientDashboardPage() {
  return (
    <DashboardShell
      role="patient"
      title="Welcome back, John"
      subtitle="Here's an overview of your health activity on DrInsight"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["📅", "2", "Upcoming Consultations"],
          ["💬", "3", "Pending Questions"],
          ["🔖", "12", "Saved Articles"],
          ["📊", "5", "Health Tool Results"],
        ].map(([icon, num, label]) => (
          <Card key={label as string}>
            <CardContent className="p-5">
              <div className="mb-2 text-2xl">{icon}</div>
              <div className="font-display text-2xl font-bold text-gray-900">{num}</div>
              <div className="text-[.78rem] text-gray-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card id="consultations">
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              doctor: "Dr. Sarah Mitchell",
              spec: "Cardiology",
              time: "Today, 2:00 PM",
              type: "📹 Video",
              status: "Confirmed",
            },
            {
              doctor: "Dr. Priya Sharma",
              spec: "Endocrinology",
              time: "Jun 20, 10:30 AM",
              type: "📞 Phone",
              status: "Confirmed",
            },
          ].map((c) => (
            <div key={c.doctor} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{c.doctor}</div>
                  <div className="text-[.82rem] text-blue">{c.spec}</div>
                  <div className="mt-1 text-[.78rem] text-gray-500">
                    {c.time} · {c.type}
                  </div>
                </div>
                <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[.72rem] font-bold text-green">
                  {c.status}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm">Join Session</Button>
                <Button size="sm" variant="ghost">
                  Reschedule
                </Button>
              </div>
            </div>
          ))}
          <Button asChild variant="secondary">
            <Link href="/book-consultation">Book New Consultation →</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="health">
          <CardHeader>
            <CardTitle>Recent Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["22.4", "BMI", "Normal"],
                ["118/76", "BP", "Normal"],
                ["98", "Glucose", "Normal"],
              ].map(([val, label, status]) => (
                <div key={label as string} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                  <div className="font-display text-lg font-bold text-gray-900">{val}</div>
                  <div className="text-[.72rem] text-gray-500">{label}</div>
                  <span className="mt-1 inline-block rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[.62rem] font-bold text-green">
                    {status}
                  </span>
                </div>
              ))}
            </div>
            <Button asChild variant="secondary" className="mt-4" size="sm">
              <Link href="/health-tools">Use Health Tools →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="questions">
          <CardHeader>
            <CardTitle>Recent Doctor Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-l-[3px] border-blue bg-blue-light p-4">
              <p className="mb-1 text-[.78rem] italic text-gray-600">
                &ldquo;Is occasional chest tightness after exercise normal?&rdquo;
              </p>
              <p className="text-[.82rem] text-gray-700">
                Answered by Dr. Sarah Mitchell · 2 days ago
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/ask-doctor">Ask a New Question →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card id="saved">
        <CardHeader>
          <CardTitle>Saved Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["❤️", "10 Early Warning Signs of Heart Disease", "Cardiology"],
            ["🩸", "Managing Type 2 Diabetes: A Complete Guide", "Endocrinology"],
          ].map(([emoji, title, cat]) => (
            <Link
              key={title as string}
              href="/blog/heart-disease-warning-signs"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-blue hover:bg-blue-light/30"
            >
              <span className="text-2xl">{emoji}</span>
              <div>
                <div className="text-[.85rem] font-semibold text-gray-900">{title}</div>
                <div className="text-[.72rem] text-blue">{cat}</div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
