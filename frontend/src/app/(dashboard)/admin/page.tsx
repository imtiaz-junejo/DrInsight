"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments, useBlogPosts, useDoctors } from "@/services/api-hooks";
import { useAuthStore } from "@/store/auth.store";

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const appointmentsQuery = useAppointments();
  const doctorsQuery = useDoctors({ limit: 1 });
  const blogQuery = useBlogPosts({ limit: 1 });
  const appointmentsTotal = appointmentsQuery.data?.meta.total ?? 0;
  const doctorsTotal = doctorsQuery.data?.meta.total ?? 0;
  const articlesTotal = blogQuery.data?.meta.total ?? 0;

  return (
    <DashboardShell
      role="admin"
      title="Dashboard Overview"
      subtitle={`Welcome back, ${user?.firstName || "Admin"} — live platform overview`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">👨‍⚕️</div>
            <div className="font-display text-2xl font-bold text-gray-900">{doctorsTotal}</div>
            <div className="text-[.78rem] text-gray-500">Verified Doctors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">📅</div>
            <div className="font-display text-2xl font-bold text-gray-900">{appointmentsTotal}</div>
            <div className="text-[.78rem] text-gray-500">Appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">📰</div>
            <div className="font-display text-2xl font-bold text-gray-900">{articlesTotal}</div>
            <div className="text-[.78rem] text-gray-500">Published Articles</div>
          </CardContent>
        </Card>
      </div>

      <Card id="users">
        <CardHeader>
          <CardTitle>Appointment Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[.7rem] uppercase tracking-wide text-gray-400">
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Doctor</th>
                  <th className="pb-2">Scheduled</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(appointmentsQuery.data?.data ?? []).map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-blue-light/20">
                    <td className="py-3 font-semibold text-gray-900">
                      {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                    </td>
                    <td className="py-3 text-gray-600">
                      Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                    </td>
                    <td className="py-3 text-gray-500">{new Date(appointment.scheduledAt).toLocaleString()}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[.68rem] font-bold text-green">
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      <Card id="analytics">
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-center sm:grid-cols-3">
            <div>
              <div className="font-display text-xl font-bold text-gray-900">{appointmentsTotal}</div>
              <div className="text-[.72rem] text-gray-500">Consultations</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-gray-900">{doctorsTotal}</div>
              <div className="text-[.72rem] text-gray-500">Doctors</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-gray-900">{articlesTotal}</div>
              <div className="text-[.72rem] text-gray-500">Articles</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
