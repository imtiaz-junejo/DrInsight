"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/services/api-hooks";
import { useAuthStore } from "@/store/auth.store";

export default function DoctorDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const appointmentsQuery = useAppointments();
  const appointments = appointmentsQuery.data?.data ?? [];
  const today = appointments.filter((appointment) => {
    const date = new Date(appointment.scheduledAt);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  });

  return (
    <DashboardShell
      role="doctor"
      title={`Dr. ${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
      subtitle="Doctor dashboard overview"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">📅</div>
            <div className="font-display text-2xl font-bold text-gray-900">{today.length}</div>
            <div className="text-[.78rem] text-gray-500">Today's Appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">👥</div>
            <div className="font-display text-2xl font-bold text-gray-900">{appointments.length}</div>
            <div className="text-[.78rem] text-gray-500">Total Consultations</div>
          </CardContent>
        </Card>
      </div>

      <Card id="consultations">
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointmentsQuery.isLoading && <p className="text-[.85rem] text-gray-500">Loading schedule...</p>}
          {appointmentsQuery.isError && <p className="text-[.85rem] text-red">Unable to load schedule.</p>}
          {!appointmentsQuery.isLoading && today.length === 0 && (
            <p className="text-[.85rem] text-gray-500">No appointments scheduled today.</p>
          )}
          {today.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-4">
              <div className="w-14 rounded-lg bg-blue-light py-1.5 text-center text-[.75rem] font-bold text-blue">
                {new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900">
                  {s.patient?.user?.firstName} {s.patient?.user?.lastName}
                </div>
                <div className="text-[.78rem] text-gray-600">{s.status}</div>
              </div>
              <span className="text-[.75rem] text-gray-500">{s.consultationType}</span>
              <span className="rounded-full bg-blue-light px-2.5 py-0.5 text-[.68rem] font-bold text-blue">
                {s.status}
              </span>
              <Button size="sm">{s.status === "IN_PROGRESS" ? "Start Session" : "View Details"}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button asChild variant="secondary" size="sm">
        <Link href="/blog">Write New Article →</Link>
      </Button>
    </DashboardShell>
  );
}
