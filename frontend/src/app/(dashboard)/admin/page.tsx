import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin Panel — DrInsight" };

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      role="admin"
      title="Dashboard Overview"
      subtitle="Welcome back, Sana — here's what's happening today"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["👥", "12,847", "Total Users", "+124 this week"],
          ["👨‍⚕️", "203", "Verified Doctors", "+3 pending"],
          ["📅", "48", "Today's Appointments", "7 pending"],
          ["📰", "1,024", "Published Articles", "5 in review"],
        ].map(([icon, num, label, tag]) => (
          <Card key={label as string}>
            <CardContent className="p-5">
              <div className="mb-2 text-2xl">{icon}</div>
              <div className="font-display text-2xl font-bold text-gray-900">{num}</div>
              <div className="text-[.78rem] text-gray-500">{label}</div>
              <div className="mt-1 text-[.68rem] font-semibold text-green">{tag}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card id="users">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent User Registrations</CardTitle>
          <Button size="sm" variant="secondary">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[.7rem] uppercase tracking-wide text-gray-400">
                  <th className="pb-2">User</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Joined</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["John Smith", "Patient", "Jun 17, 2026", "Active"],
                  ["Dr. Ahmed Hassan", "Doctor", "Jun 16, 2026", "Pending Review"],
                  ["Maria Garcia", "Patient", "Jun 16, 2026", "Active"],
                  ["Dr. Emily Chen", "Doctor", "Jun 15, 2026", "Active"],
                ].map(([name, role, joined, status]) => (
                  <tr key={name as string} className="border-b border-gray-100 hover:bg-blue-light/20">
                    <td className="py-3 font-semibold text-gray-900">{name}</td>
                    <td className="py-3 text-gray-600">{role}</td>
                    <td className="py-3 text-gray-500">{joined}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[.68rem] font-bold ${
                          status === "Pending Review"
                            ? "bg-[#fffbeb] text-amber"
                            : "bg-[#ecfdf5] text-green"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="doctors">
          <CardHeader>
            <CardTitle>Doctor Verification Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Dr. Ahmed Hassan", "Orthopedics · Pakistan", "Verify"],
              ["Dr. Fatima Noor", "Dermatology · UK", "Verify"],
            ].map(([name, spec, action]) => (
              <div key={name as string} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <div className="font-semibold text-gray-900">{name}</div>
                  <div className="text-[.75rem] text-gray-500">{spec}</div>
                </div>
                <Button size="sm">{action}</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="content">
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Article Review", "5 articles awaiting medical peer review", "Review"],
              ["Comments", "4 comments flagged for moderation", "Moderate"],
              ["Contact Inquiries", "12 unread contact form submissions", "View"],
            ].map(([title, desc, action]) => (
              <div key={title as string} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <div className="font-semibold text-gray-900">{title}</div>
                  <div className="text-[.75rem] text-gray-500">{desc}</div>
                </div>
                <Button size="sm" variant="secondary">
                  {action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card id="analytics">
        <CardHeader>
          <CardTitle>Platform Analytics — Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-end gap-2">
            {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-blue to-blue-mid"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[.62rem] text-gray-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {[
              ["48.2K", "Page Views"],
              ["1,240", "Consultations"],
              ["$18.4K", "Revenue"],
            ].map(([num, label]) => (
              <div key={label as string}>
                <div className="font-display text-xl font-bold text-gray-900">{num}</div>
                <div className="text-[.72rem] text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
