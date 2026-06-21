"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { doctors } from "@/lib/doctors-data";
import { cn } from "@/lib/utils";

const specialtyFilters = [
  { key: "all", label: "All Specialties" },
  { key: "cardiology", label: "❤️ Cardiology" },
  { key: "neurology", label: "🧠 Neurology" },
  { key: "endocrinology", label: "🦋 Endocrinology" },
  { key: "psychiatry", label: "🧠 Psychiatry" },
  { key: "pediatrics", label: "🧒 Pediatrics" },
  { key: "orthopedics", label: "🦴 Orthopedics" },
  { key: "internal medicine", label: "🩺 Internal Medicine" },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [sort, setSort] = useState("rating");

  const filtered = useMemo(() => {
    let list = doctors.filter((d) => {
      const matchSpec = specialty === "all" || d.specialtyKey === specialty;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q);
      return matchSpec && matchSearch;
    });

    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.experience - a.experience;
      if (sort === "reviews") return b.reviews - a.reviews;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [search, specialty, sort]);

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
              Showing <strong>{filtered.length}</strong> of <strong>{doctors.length}</strong> doctors
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {specialtyFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSpecialty(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[.75rem] font-semibold transition",
                  specialty === f.key
                    ? "border-blue bg-blue text-white"
                    : "border-gray-200 text-gray-600 hover:border-blue hover:text-blue",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
              <CardContent className="p-0">
                <div className="border-b border-gray-100 p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ background: doc.gradient }}
                    >
                      {doc.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[1.05rem] font-bold text-gray-900">{doc.name}</h3>
                      <p className="text-[.82rem] font-semibold text-blue">{doc.specialty}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[.75rem] text-gray-500">
                        <span className="text-amber">★ {doc.rating}</span>
                        <span>({doc.reviews} reviews)</span>
                        <span>· {doc.experience} yrs</span>
                      </div>
                    </div>
                    {doc.online && (
                      <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[.68rem] font-bold text-green">
                        🟢 Online
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 p-5 text-[.78rem] text-gray-600">
                  <div>🌍 {doc.country}</div>
                  <div>🗣️ {doc.languages.join(", ")}</div>
                  <div>📅 Next: {doc.nextAvailable}</div>
                </div>
                <div className="flex gap-2 border-t border-gray-100 p-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/book-consultation">Book Now</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link href="/ask-doctor">Ask Question</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
