"use client";

import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  KvGrid,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

// TODO: connect OTP settings API when backend exists
export function OtpTemplatesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <AdminPanel
        title="🔢 OTP Verification Settings"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("OTP settings saved")}>
            Save Changes
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="OTP Length">
            <select defaultValue="6">
              <option value="4">4 digits</option>
              <option value="6">6 digits</option>
              <option value="8">8 digits</option>
            </select>
          </FormItem>
          <FormItem label="OTP Expiry (minutes)">
            <input type="number" defaultValue={10} />
          </FormItem>
          <FormItem label="Max Attempts Before Lockout">
            <input type="number" defaultValue={5} />
          </FormItem>
          <FormItem label="Resend Cooldown (seconds)">
            <input type="number" defaultValue={60} />
          </FormItem>
          <FormItem label="Email OTP Message Template" full>
            <textarea defaultValue="Your MedAuthority verification code is: {{otp_code}}. This code expires in 10 minutes. If you did not request this, please ignore this email." />
          </FormItem>
          <FormItem label="SMS OTP Message Template" full>
            <textarea defaultValue="MedAuthority code: {{otp_code}} (valid 10 mins). Do not share this code with anyone." />
          </FormItem>
        </FormGrid>
      </AdminPanel>
      <AdminPanel title="📊 OTP Delivery Stats (Last 24h)" bodyClassName="panel-bd">
        <KvGrid
          items={[
            { value: "—", label: "OTPs Sent (Email)" },
            { value: "—", label: "OTPs Sent (SMS)" },
            { value: "—", label: "Successful Verification Rate" },
          ]}
        />
      </AdminPanel>
    </>
  );
}
