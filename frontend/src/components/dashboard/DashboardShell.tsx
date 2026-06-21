"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/patient", label: "Overview", icon: "📊" },
  { href: "/patient#consultations", label: "Consultations", icon: "📅" },
  { href: "/patient#health", label: "Health Records", icon: "🩺" },
  { href: "/patient#questions", label: "My Questions", icon: "💬" },
  { href: "/patient#saved", label: "Saved Articles", icon: "🔖" },
];

export function DashboardShell({
  role,
  title,
  subtitle,
  children,
}: {
  role: "patient" | "doctor" | "admin";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const roleNav =
    role === "doctor"
      ? [
          { href: "/doctor", label: "Overview", icon: "📊" },
          { href: "/doctor#patients", label: "My Patients", icon: "👥" },
          { href: "/doctor#consultations", label: "Consultations", icon: "📅" },
          { href: "/doctor#questions", label: "Q&A Inbox", icon: "💬" },
          { href: "/doctor#articles", label: "My Articles", icon: "✍️" },
        ]
      : role === "admin"
        ? [
            { href: "/admin", label: "Overview", icon: "📊" },
            { href: "/admin#users", label: "Users", icon: "👥" },
            { href: "/admin#doctors", label: "Doctors", icon: "👨‍⚕️" },
            { href: "/admin#content", label: "Content", icon: "📰" },
            { href: "/admin#analytics", label: "Analytics", icon: "📈" },
          ]
        : navItems;

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-dark to-blue px-6 py-8 text-white">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-1 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">
            {role === "patient" && "Patient Dashboard"}
            {role === "doctor" && "Doctor Dashboard"}
            {role === "admin" && "Admin Panel"}
          </div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-[.88rem] opacity-90">{subtitle}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-6 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
          <nav className="space-y-1">
            {roleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[.85rem] font-medium transition",
                  pathname === item.href.split("#")[0]
                    ? "bg-blue-light font-semibold text-blue"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue",
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Link href="/" className="text-[.78rem] text-gray-500 transition hover:text-blue">
              ← Back to Site
            </Link>
          </div>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
