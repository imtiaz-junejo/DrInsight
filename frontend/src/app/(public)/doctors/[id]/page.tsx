"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { doctorFullName, formatCurrency, getInitials, gradientForId, specialtyEmoji } from "@/lib/data-mappers";
import { useDoctor } from "@/services/api-hooks";

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: doctor, isLoading, isError } = useDoctor(params.id);

  if (isLoading) {
    return <div className="px-6 py-20 text-center text-gray-500">Loading doctor profile...</div>;
  }

  if (isError || !doctor) {
    return <div className="px-6 py-20 text-center text-red">Doctor not found.</div>;
  }

  const initials = getInitials(doctor.user?.firstName, doctor.user?.lastName);
  const bg = gradientForId(doctor.id);
  const emoji = specialtyEmoji(doctor.specialty);

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-[800px]">
        <div className="mb-6 text-[.85rem] text-gray-500">
          <Link href="/">Home</Link> › <Link href="/doctors">Doctors</Link> › {doctorFullName(doctor.user)}
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:flex-row">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ background: bg }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-gray-900">{doctorFullName(doctor.user)}</h1>
            <p className="mt-1 text-gray-600">
              {emoji} {doctor.specialty}
              {doctor.subSpecialty ? ` · ${doctor.subSpecialty}` : ""}
            </p>
            <p className="mt-2 text-[.9rem] text-gray-500">
              ⭐ {doctor.rating.toFixed(1)} ({doctor.reviewCount} reviews) · {doctor.experienceYears}+ years experience
            </p>
            {doctor.hospital && <p className="mt-1 text-[.85rem] text-gray-500">🏥 {doctor.hospital}</p>}
            {doctor.bio && <p className="mt-4 text-[.9rem] leading-relaxed text-gray-700">{doctor.bio}</p>}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {doctor.languages.map((lang) => (
                  <span key={lang} className="rounded-full bg-blue-light px-3 py-1 text-[.78rem] font-medium text-blue">
                    {lang}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/book-consultation?doctorId=${doctor.id}`}
                className="inline-flex rounded-lg bg-blue px-5 py-2.5 text-[.88rem] font-semibold text-white"
              >
                Book Consultation — {formatCurrency(doctor.consultationFee)}
              </Link>
              <Link
                href="/doctors"
                className="inline-flex rounded-lg border border-gray-200 px-5 py-2.5 text-[.88rem] font-semibold text-gray-700"
              >
                ← Back to Doctors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
