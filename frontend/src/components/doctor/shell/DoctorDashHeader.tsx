"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { doctorDisplayName, getInitials, todayFormatted } from "@/lib/doctor-utils";

export function DoctorDashHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const showToast = useDoctorUiStore((s) => s.showToast);

  const initials = getInitials(user?.firstName, user?.lastName);
  const displayName = doctorDisplayName(user?.firstName, user?.lastName);

  const handleSignOut = () => {
    showToast("Signing out...");
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="dash-header">
      <div className="dash-header-inner">
        <div className="dash-welcome">
          <div className="dash-welcome-sub">Physician Dashboard</div>
          <h1>Good morning, {displayName} 👨‍⚕️</h1>
          <p>
            {todayFormatted()} &nbsp;·&nbsp; Last login: 2 days ago
          </p>
        </div>
        <div className="dash-header-right">
          <div className="dash-avatar">
            {initials}
            <div className="dash-online-dot" />
          </div>
          <div>
            <div className="dash-role-badge">🩺 Physician Account</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button type="button" className="dash-btn solid" onClick={() => showToast("Opening video call...")}>
                📹 Start Consultation
              </button>
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
