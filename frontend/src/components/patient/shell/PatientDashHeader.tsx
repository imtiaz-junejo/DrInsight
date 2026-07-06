"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

import { usePatientUiStore } from "@/store/patient-ui.store";

import { getInitials, patientDisplayName, todayFormatted } from "@/lib/patient-utils";



export function PatientDashHeader() {

  const router = useRouter();

  const user = useAuthStore((s) => s.user);

  const clearAuth = useAuthStore((s) => s.clearAuth);

  const showToast = usePatientUiStore((s) => s.showToast);

  const mobileSidebarOpen = usePatientUiStore((s) => s.mobileSidebarOpen);

  const setMobileSidebarOpen = usePatientUiStore((s) => s.setMobileSidebarOpen);



  const initials = getInitials(user?.firstName, user?.lastName);

  const displayName = patientDisplayName(user?.firstName, user?.lastName);



  const handleSignOut = () => {

    showToast("Signing out...");

    clearAuth();

    router.replace("/login");

  };



  return (

    <div className="dash-header">

      <div className="dash-header-inner">

        <div className="flex items-start gap-3">

          <button

            type="button"

            className="dash-sidebar-toggle"

            aria-label="Open navigation menu"

            aria-expanded={mobileSidebarOpen}

            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}

          >

            ☰

          </button>

          <div className="dash-welcome">

            <div className="dash-welcome-sub">Patient Dashboard</div>

            <h1>Welcome back, {displayName} 👋</h1>

            <p>

              {todayFormatted()} &nbsp;·&nbsp; Last login: 2 days ago

            </p>

          </div>

        </div>

        <div className="dash-header-right">

          <div className="dash-avatar">

            {initials}

            <div className="dash-online-dot" />

          </div>

          <div>

            <div className="dash-role-badge">🏥 Patient Account</div>

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>

              <Link href="/book-consultation">

                <button type="button" className="dash-btn solid" onClick={() => showToast("Opening booking...")}>

                  📅 Book Consultation

                </button>

              </Link>

              <button type="button" className="dash-btn" onClick={handleSignOut}>

                ← Sign Out

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

