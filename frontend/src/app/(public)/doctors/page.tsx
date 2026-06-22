"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDoctors, useDoctorSpecialties } from "@/services/api-hooks";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [sort, setSort] = useState("rating");
  const doctorsQuery = useDoctors({
    search,
    specialty: specialty === "all" ? undefined : specialty,
    limit: 24,
  });
  const specialtiesQuery = useDoctorSpecialties();
  const doctors = doctorsQuery.data?.data ?? [];
  const total = doctorsQuery.data?.meta.total ?? 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Our Doctors" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">
            👨‍⚕️ MEET THE EXPERTS
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,2.8rem)] font-bold">
            Our Medical <span className="text-[#93c5fd]">Team</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[600px] text-[.95rem] opacity-90">
            Every article, consultation, and answer on DrInsight comes from a verified, board-certified physician.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {[
              ["200+", "Verified Doctors"],
              ["12", "Specialties"],
              ["8", "Countries"],
              ["4.8★", "Avg. Rating"],
            ].map(([num, label]) => (
              <div key={label as string}>
                <div className="font-display text-2xl font-bold">{num}</div>
                <div className="text-[.75rem] opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-[70px] z-50 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-[1240px] space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, specialty, or condition..."
              className="max-w-md flex-1"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-lg border-[1.5px] border-gray-200 px-3 text-sm focus:border-blue focus:outline-none"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="reviews">Sort: Most Reviewed</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
            <span className="text-[.82rem] text-gray-500">
              Showing <strong>{doctors.length}</strong> of <strong>{total}</strong> doctors
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSpecialty("all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[.75rem] font-semibold transition",
                specialty === "all"
                  ? "border-blue bg-blue text-white"
                  : "border-gray-200 text-gray-600 hover:border-blue hover:text-blue",
              )}
            >
              All Specialties
            </button>
            {(specialtiesQuery.data ?? []).map((f) => (
              <button
                key={f.name}
                onClick={() => setSpecialty(f.name)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[.75rem] font-semibold transition",
                  specialty === f.name
                    ? "border-blue bg-blue text-white"
                    : "border-gray-200 text-gray-600 hover:border-blue hover:text-blue",
                )}
              >
                {f.name} ({f.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {doctorsQuery.isLoading && (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              Loading doctors...
            </div>
          )}
          {doctorsQuery.isError && (
            <div className="col-span-full rounded-xl border border-[#fecaca] bg-[#fef2f2] p-8 text-center text-red">
              Unable to load doctors. Please try again.
            </div>
          )}
          {!doctorsQuery.isLoading && !doctorsQuery.isError && doctors.length === 0 && (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              No doctors match your search.
            </div>
          )}
          {doctors.map((doc) => {
            const fullName = `Dr. ${doc.user?.firstName ?? ""} ${doc.user?.lastName ?? ""}`.trim();
            const initials = `${doc.user?.firstName?.[0] ?? "D"}${doc.user?.lastName?.[0] ?? "R"}`;

            return (
            <Card key={doc.id} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
              <CardContent className="p-0">
                <div className="border-b border-gray-100 p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#1a56a0,#0891b2)" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[1.05rem] font-bold text-gray-900">{fullName}</h3>
                      <p className="text-[.82rem] font-semibold text-blue">{doc.specialty}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[.75rem] text-gray-500">
                        <span className="text-amber">★ {doc.rating}</span>
                        <span>({doc.reviewCount} reviews)</span>
                        <span>· {doc.experienceYears} yrs</span>
                      </div>
                    </div>
                    {doc.user?.isOnline && (
                      <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[.68rem] font-bold text-green">
                        🟢 Online
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 p-5 text-[.78rem] text-gray-600">
                  <div>🏥 {doc.hospital || "DrInsight Virtual Clinic"}</div>
                  <div>🗣️ {doc.languages?.join(", ") || "English"}</div>
                  <div>💳 Fee: ${Number(doc.consultationFee || 0).toFixed(2)}</div>
                </div>
                <div className="flex gap-2 border-t border-gray-100 p-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/book-consultation?doctorId=${doc.id}`}>Book Now</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link href="/ask-doctor">Ask Question</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      </div>
    </>
  );
}
