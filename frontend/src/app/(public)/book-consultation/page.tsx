"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useConfirmDevPayment,
  useCreateBookingDraft,
  useCreatePaymentIntent,
  useDoctors,
} from "@/services/api-hooks";

const steps = ["Choose Doctor", "Select Time", "Your Details", "Confirm"];
const consultTypes = [
  ["video", "📹", "Video Consultation", "Face-to-face via secure video call"],
  ["phone", "📞", "Phone Consultation", "Speak directly with your doctor"],
  ["chat", "💬", "Chat Consultation", "Text-based consultation with a specialist"],
];

export default function BookConsultationPage() {
  const [step, setStep] = useState(0);
  const [consultType, setConsultType] = useState("video");
  const [doctorId, setDoctorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const doctorsQuery = useDoctors({ limit: 24 });
  const createDraft = useCreateBookingDraft();
  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmDevPayment();
  const selectedDoctor = doctorsQuery.data?.data.find((doctor) => doctor.id === doctorId);

  useEffect(() => {
    const doctorIdFromUrl = new URLSearchParams(window.location.search).get("doctorId");
    if (doctorIdFromUrl) setDoctorId(doctorIdFromUrl);
  }, []);

  const submitDraft = async () => {
    if (!doctorId || !scheduledAt) return;
    const draft = await createDraft.mutateAsync({
      doctorId,
      scheduledAt,
      consultationType:
        consultType === "video" ? "VIDEO" : consultType === "phone" ? "AUDIO" : "CHAT",
      reason,
      durationMinutes: 30,
    });
    const intent = await createIntent.mutateAsync(draft.id);
    setPaymentIntentId(intent.providerIntentId);
    setStep(3);
  };

  const confirmBooking = async () => {
    if (!paymentIntentId) return;
    await confirmPayment.mutateAsync(paymentIntentId);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Breadcrumb items={[{ label: "Book Consultation" }]} />
        <div className="mx-auto max-w-[560px] px-6 py-20 text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="font-display mb-3 text-2xl font-bold text-gray-900">Consultation Booked!</h1>
          <p className="mb-8 text-gray-600">
            Your appointment has been confirmed. You&apos;ll receive a confirmation email with joining instructions.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/patient">View in Dashboard</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Book Consultation" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-[700px]">
          <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">
            Virtual & In-Person Consultations
          </div>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold">Book a Doctor Consultation</h1>
          <p className="mt-3 text-[.95rem] opacity-90">
            Schedule a video, phone, or chat consultation with a board-certified specialist. Same-day appointments
            available.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[900px] px-6 py-12">
        <div className="mb-10 flex items-center justify-between gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  i <= step ? "bg-blue text-white" : "bg-gray-100 text-gray-400",
                )}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="hidden text-[.75rem] font-medium text-gray-600 sm:inline">{s}</span>
              {i < steps.length - 1 && (
                <div className={cn("h-0.5 flex-1", i < step ? "bg-blue" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step]}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-[.88rem] text-gray-600">Select a doctor:</p>
                {doctorsQuery.isLoading && <p className="text-[.85rem] text-gray-500">Loading doctors...</p>}
                {doctorsQuery.isError && <p className="text-[.85rem] text-red">Unable to load doctors.</p>}
                <select
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  className="h-11 w-full rounded-lg border-[1.5px] border-gray-200 px-3 text-sm focus:border-blue focus:outline-none"
                >
                  <option value="">Choose a doctor...</option>
                  {(doctorsQuery.data?.data ?? []).map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName} — {doctor.specialty} (${Number(doctor.consultationFee || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
                <p className="text-[.88rem] text-gray-600">Select your preferred consultation type:</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {consultTypes.map(([key, icon, title, desc]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setConsultType(key)}
                      className={cn(
                        "rounded-xl border-[1.5px] p-5 text-left transition",
                        consultType === key ? "border-blue bg-blue-light" : "border-gray-200 hover:border-blue-mid",
                      )}
                    >
                      <div className="mb-2 text-2xl">{icon}</div>
                      <div className="text-[.85rem] font-bold text-gray-900">{title}</div>
                      <div className="text-[.75rem] text-gray-500">{desc}</div>
                    </button>
                  ))}
                </div>
                <Button onClick={() => doctorId && setStep(1)} disabled={!doctorId}>Continue →</Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-[.88rem] text-gray-600">Choose an available time slot:</p>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                />
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    ← Back
                  </Button>
                  <Button onClick={() => scheduledAt && setStep(2)} disabled={!scheduledAt}>Continue →</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(3);
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Full Name</label>
                    <Input required placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Email</label>
                    <Input required type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Reason for Visit</label>
                  <textarea
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="min-h-[100px] w-full rounded-lg border-[1.5px] border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue focus:outline-none focus:ring-[3px] focus:ring-blue/10"
                    placeholder="Briefly describe your symptoms or health concern..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button type="submit">Review & Create Payment →</Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-light p-5 text-[.88rem]">
                  <h4 className="mb-3 font-bold text-gray-900">Booking Summary</h4>
                  <div className="space-y-1 text-gray-700">
                    <p>
                      👨‍⚕️ Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName} — {selectedDoctor?.specialty}
                    </p>
                    <p>📅 {scheduledAt ? new Date(scheduledAt).toLocaleString() : "Time pending"} (30 min)</p>
                    <p>
                      {consultType === "video" && "📹 Video Consultation"}
                      {consultType === "phone" && "📞 Phone Consultation"}
                      {consultType === "chat" && "💬 Chat Consultation"}
                    </p>
                    <p className="font-bold text-blue">Fee: ${Number(selectedDoctor?.consultationFee || 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    ← Back
                  </Button>
                  {!paymentIntentId ? (
                    <Button
                      onClick={submitDraft}
                      disabled={createDraft.isPending || createIntent.isPending}
                    >
                      {createDraft.isPending || createIntent.isPending ? "Creating payment..." : "Create Payment Intent →"}
                    </Button>
                  ) : (
                    <Button onClick={confirmBooking} disabled={confirmPayment.isPending}>
                      {confirmPayment.isPending ? "Confirming..." : "Confirm Paid Booking →"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
