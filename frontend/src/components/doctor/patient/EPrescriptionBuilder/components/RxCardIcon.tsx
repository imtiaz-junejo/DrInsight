import type { DoctorIconComponent } from "@/components/doctor/icons/DoctorIcons";
import { DoctorIcon } from "@/components/doctor/icons/DoctorIcons";

export function RxCardIcon({ icon }: { icon: DoctorIconComponent }) {
  return (
    <div className="ic">
      <DoctorIcon icon={icon} size="button" />
    </div>
  );
}
