import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Doctor Dashboard — DrInsight" };

export default function DoctorDashboardPage() {
  return (
    <DashboardShell
      role="doctor"
      title="Dr. Sarah Mitchell"
      subtitle="Cardiologist · Dashboard overview for June 17, 2026"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["📅", "4", "Today's Appointments"],
          ["💬", "7", "Pending Q&A"],
          ["👥", "142", "Active Patients"],
          ["⭐", "4.9", "Average Rating"],
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
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { time: "2:00 PM", patient: "Robert K.", reason: "Follow-up — hypertension", type: "Video", live: true },
            { time: "3:30 PM", patient: "Lisa P.", reason: "Diabetes management review", type: "Phone", live: false },
            { time: "5:00 PM", patient: "Angela M.", reason: "Chest pain evaluation", type: "Video", live: false },
          ].map((s) => (
            <div key={s.time} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-4">
              <div className="w-14 rounded-lg bg-blue-light py-1.5 text-center text-[.75rem] font-bold text-blue">
                {s.time}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900">{s.patient}</div>
                <div className="text-[.78rem] text-gray-600">{s.reason}</div>
              </div>
              <span className="text-[.75rem] text-gray-500">{s.type}</span>
              {s.live ? (
                <span className="rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-[.68rem] font-bold text-red">
                  🟢 Live Soon
                </span>
              ) : (
                <span className="rounded-full bg-blue-light px-2.5 py-0.5 text-[.68rem] font-bold text-blue">
                  Upcoming
                </span>
              )}
              <Button size="sm">{s.live ? "Start Session" : "View Details"}</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="questions">
          <CardHeader>
            <CardTitle>Q&A Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Patient asks about intermittent chest tightness during exercise...",
              "Follow-up on statin side effects and muscle pain...",
            ].map((q, i) => (
              <div key={i} className="rounded-lg border-l-[3px] border-blue-mid bg-gray-50 p-4">
                <p className="mb-2 text-[.82rem] italic text-gray-700">&ldquo;{q}&rdquo;</p>
                <Button size="sm">Reply</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="patients">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[.82rem]">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-[.7rem] uppercase tracking-wide text-gray-400">
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Robert K.", "Active", "View"],
                    ["Lisa P.", "Follow-up", "View"],
                    ["James T.", "Critical", "View"],
                  ].map(([name, status, action]) => (
                    <tr key={name as string} className="border-b border-gray-100">
                      <td className="py-3 font-semibold text-gray-900">{name}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[.68rem] font-bold ${
                            status === "Critical"
                              ? "bg-[#fef2f2] text-red"
                              : status === "Follow-up"
                                ? "bg-[#fffbeb] text-amber"
                                : "bg-[#ecfdf5] text-green"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="font-semibold text-blue">{action}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="articles">
        <CardHeader>
          <CardTitle>My Published Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["❤️", "10 Early Warning Signs of Heart Disease", "Live · 14.2k views"],
            ["🫀", "High Blood Pressure: The Silent Killer", "Live · 9.8k views"],
            ["❤️", "The Silent Heart Attack: Warning Signs", "In Review"],
          ].map(([emoji, title, meta]) => (
            <div key={title as string} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1">
                <div className="text-[.85rem] font-semibold text-gray-900">{title}</div>
                <div className="text-[.72rem] text-gray-500">{meta}</div>
              </div>
              <Button size="sm" variant="ghost">
                Edit
              </Button>
            </div>
          ))}
          <Button asChild variant="secondary" size="sm">
            <Link href="/blog">Write New Article →</Link>
          </Button>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
