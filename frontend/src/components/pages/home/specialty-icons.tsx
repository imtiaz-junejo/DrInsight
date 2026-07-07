export const HOME_MAJOR_SPECIALTIES = [
  { name: "Cardiology", icon: "❤️" },
  { name: "Neurology", icon: "🧠" },
  { name: "Pulmonology", icon: "🫁" },
  { name: "Orthopedics", icon: "🦴" },
  { name: "Ophthalmology", icon: "👁️" },
  { name: "Family Medicine", icon: "👨‍⚕️" },
  { name: "OB/GYN", icon: "🤰" },
  { name: "Pediatrics", icon: "👶" },
  { name: "Oncology", icon: "🧬" },
  { name: "Endocrinology", icon: "🫀" },
  { name: "Infectious Disease", icon: "🦠" },
  { name: "Psychiatry", icon: "🧘" },
] as const;

export type HomeMajorSpecialty = (typeof HOME_MAJOR_SPECIALTIES)[number]["name"];

export function getHomeSpecialtyIcon(name: HomeMajorSpecialty): string {
  const specialty = HOME_MAJOR_SPECIALTIES.find((item) => item.name === name);
  return specialty?.icon ?? "🩺";
}
