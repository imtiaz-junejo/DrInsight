"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments, useNotifications } from "@/services/api-hooks";
import { useAuthStore } from "@/store/auth.store";

export default function PatientDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const appointmentsQuery = useAppointments();
  const notificationsQuery = useNotifications();
  const appointments = appointmentsQuery.data?.data ?? [];
  const upcoming = appointments.filter((item) => ["CONFIRMED", "PENDING", "IN_PROGRESS"].includes(item.status));
  const unreadNotifications = (notificationsQuery.data?.data ?? []).filter((item) => !item.readAt);

  return (
    <DashboardShell
      role="patient"
      title={`Welcome back, ${user?.firstName || "Patient"}`}
      subtitle="Here's an overview of your health activity on DrInsight"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">📅</div>
            <div className="font-display text-2xl font-bold text-gray-900">{upcoming.length}</div>
            <div className="text-[.78rem] text-gray-500">Upcoming Consultations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">🔔</div>
            <div className="font-display text-2xl font-bold text-gray-900">{unreadNotifications.length}</div>
            <div className="text-[.78rem] text-gray-500">Unread Notifications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">💬</div>
            <div className="font-display text-2xl font-bold text-gray-900">{appointments.length}</div>
            <div className="text-[.78rem] text-gray-500">Care Relationships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-2xl">🛡️</div>
            <div className="font-display text-2xl font-bold text-gray-900">{user?.status || "ACTIVE"}</div>
            <div className="text-[.78rem] text-gray-500">Account Status</div>
          </CardContent>
        </Card>
      </div>

      <Card id="consultations">
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointmentsQuery.isLoading && <p className="text-[.85rem] text-gray-500">Loading appointments...</p>}
          {appointmentsQuery.isError && <p className="text-[.85rem] text-red">Unable to load appointments.</p>}
          {!appointmentsQuery.isLoading && upcoming.length === 0 && (
            <p className="text-[.85rem] text-gray-500">No upcoming consultations yet.</p>
          )}
          {upcoming.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    Dr. {c.doctor?.user?.firstName} {c.doctor?.user?.lastName}
                  </div>
                  <div className="text-[.82rem] text-blue">{c.doctor?.specialty}</div>
                  <div className="mt-1 text-[.78rem] text-gray-500">
                    {new Date(c.scheduledAt).toLocaleString()} · {c.consultationType}
                  </div>
                </div>
                <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[.72rem] font-bold text-green">
                  {c.status}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm">
                  <Link href={c.meetingRoomId ? `/patient?room=${c.meetingRoomId}` : "/patient"}>Join Session</Link>
                </Button>
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
        <Card id="questions">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(notificationsQuery.data?.data ?? []).slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-lg border-l-[3px] border-blue bg-blue-light p-4">
                <p className="mb-1 text-[.78rem] font-semibold text-gray-700">{notification.title}</p>
                <p className="text-[.82rem] text-gray-700">{notification.body}</p>
              </div>
            ))}
            {!notificationsQuery.isLoading && (notificationsQuery.data?.data ?? []).length === 0 && (
              <p className="text-[.85rem] text-gray-500">No notifications yet.</p>
            )}
            <Button asChild variant="secondary" size="sm">
              <Link href="/ask-doctor">Ask a New Question →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
