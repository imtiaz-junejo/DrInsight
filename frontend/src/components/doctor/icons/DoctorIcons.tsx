"use client";

import type { Icon, IconWeight } from "@solar-icons/react/lib/types";
import {
  AddCircle,
  Bell,
  Bolt,
  Book,
  Calendar,
  CalendarAdd,
  CalendarDate,
  CalendarMark,
  ChatRound,
  ChatRoundCheck,
  ChatRoundDots,
  ClipboardAdd,
  ClipboardList,
  ClockCircle,
  CloseCircle,
  Copy,
  DangerTriangle,
  Diskette,
  DocumentText,
  Download,
  Eye,
  Gallery,
  Global,
  History,
  Letter,
  LockPassword,
  Logout,
  Magnifier,
  Pen,
  PenNewSquare,
  Phone,
  Pill,
  Printer,
  RecordCircle,
  RefreshCircle,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  StopCircle,
  TestTube,
  TrashBinTrash,
  UserCircle,
  UserCrossRounded,
  UserRounded,
  UsersGroupRounded,
  VerifiedCheck,
  Videocamera,
  Wallet,
  Widget,
  Link as LinkIcon,
  InfoCircle,
  HeartPulse,
  Bookmark,
  Key,
  Tag,
  Hashtag,
  Home,
  GraphUp,
  Upload,
  QuestionCircle,
  Inbox,
  Palette,
  HamburgerMenu,
  Mailbox,
  Microphone,
  Dollar,
  Hospital,
  Chart,
} from "@solar-icons/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DoctorIconComponent = Icon;

export const DOCTOR_ICON_WEIGHT: IconWeight = "Bold";

export type DoctorIconSize = "sidebar" | "header" | "stat" | "button" | "sm";

export type DoctorColorTone =
  | "blue"
  | "purple"
  | "profile"
  | "cyan"
  | "red"
  | "indigo"
  | "teal"
  | "orange"
  | "gold"
  | "amber"
  | "gray"
  | "green"
  | "warning"
  | "error"
  | "success";

export const DOCTOR_COLORS: Record<DoctorColorTone, string> = {
  blue: "#1D4ED8",
  purple: "#5B21B6",
  profile: "#6D28D9",
  cyan: "#0E7490",
  red: "#DC2626",
  indigo: "#3730A3",
  teal: "#115E59",
  orange: "#C2410C",
  gold: "#B45309",
  amber: "#D97706",
  gray: "#1E293B",
  green: "#047857",
  warning: "#C2410C",
  error: "#B91C1C",
  success: "#047857",
};

/** High-contrast icon colors for the admin dark sidebar */
export const ADMIN_SIDEBAR_COLORS: Record<DoctorColorTone, string> = {
  blue: "#60A5FA",
  purple: "#A78BFA",
  profile: "#C4B5FD",
  cyan: "#67E8F9",
  red: "#F87171",
  indigo: "#A5B4FC",
  teal: "#5EEAD4",
  orange: "#FB923C",
  gold: "#FCD34D",
  amber: "#FBBF24",
  gray: "#CBD5E1",
  green: "#4ADE80",
  warning: "#FB923C",
  error: "#F87171",
  success: "#4ADE80",
};

export const ADMIN_SIDEBAR_BG: Record<DoctorColorTone, string> = {
  blue: "rgba(96, 165, 250, 0.16)",
  purple: "rgba(167, 139, 250, 0.16)",
  profile: "rgba(196, 181, 253, 0.16)",
  cyan: "rgba(103, 232, 249, 0.14)",
  red: "rgba(248, 113, 113, 0.16)",
  indigo: "rgba(165, 180, 252, 0.16)",
  teal: "rgba(94, 234, 212, 0.14)",
  orange: "rgba(251, 146, 60, 0.16)",
  gold: "rgba(252, 211, 77, 0.16)",
  amber: "rgba(251, 191, 36, 0.16)",
  gray: "rgba(203, 213, 225, 0.12)",
  green: "rgba(74, 222, 128, 0.14)",
  warning: "rgba(251, 146, 60, 0.16)",
  error: "rgba(248, 113, 113, 0.16)",
  success: "rgba(74, 222, 128, 0.14)",
};

const SIZE_MAP: Record<DoctorIconSize, number> = {
  sidebar: 20,
  header: 20,
  stat: 24,
  button: 18,
  sm: 16,
};

export const LayoutDashboard = Widget;
export const Users = UsersGroupRounded;
export const Video = Videocamera;
export const CalendarPlus = CalendarAdd;
export const CalendarClock = CalendarDate;
export const CalendarCheck2 = CalendarMark;
export const ClipboardPlus = ClipboardAdd;
export const BadgeCheck = VerifiedCheck;
export const CircleX = CloseCircle;
export const Clock3 = ClockCircle;
export const MessageSquareMore = ChatRoundDots;
export const MessageCircleCheck = ChatRoundCheck;
export const MessageCircleX = UserCrossRounded;
export const FilePenLine = PenNewSquare;
export const FlaskConical = TestTube;
export const BookOpenText = Book;
export const CircleUserRound = UserCircle;
export const Settings2 = Settings;
export const Circle = RecordCircle;
export const CircleOff = StopCircle;
export const LogOut = Logout;
export const Search = Magnifier;
export const AlertTriangle = DangerTriangle;
export const Lock = LockPassword;
export const Mail = Letter;
export const Shield = ShieldCheck;
export const Trash2 = TrashBinTrash;
export const Globe = Global;
export const MessageSquare = ChatRound;
export const MessageCircle = ChatRound;
export const Mic = Microphone;
export const Pencil = Pen;
export const FileText = DocumentText;
export const RotateCw = RefreshCircle;
export const Save = Diskette;
export const Image = Gallery;
export const X = CloseCircle;
export const UserRound = UserRounded;
export const Plus = AddCircle;
export const Link = LinkIcon;
export const Info = InfoCircle;
export const Zap = Bolt;

const ICON_TONE_MAP = new Map<Icon, DoctorColorTone>([
  [Widget, "blue"],
  [UsersGroupRounded, "purple"],
  [Videocamera, "cyan"],
  [Pill, "red"],
  [CalendarAdd, "indigo"],
  [CalendarDate, "indigo"],
  [CalendarMark, "indigo"],
  [Calendar, "indigo"],
  [ClipboardAdd, "indigo"],
  [VerifiedCheck, "success"],
  [CloseCircle, "error"],
  [ClockCircle, "blue"],
  [History, "indigo"],
  [ChatRoundDots, "cyan"],
  [ChatRoundCheck, "success"],
  [UserCrossRounded, "error"],
  [PenNewSquare, "orange"],
  [TestTube, "teal"],
  [Book, "orange"],
  [Wallet, "gold"],
  [Star, "amber"],
  [UserCircle, "profile"],
  [Settings, "gray"],
  [RecordCircle, "success"],
  [StopCircle, "gray"],
  [Logout, "error"],
  [Stethoscope, "blue"],
  [Magnifier, "gray"],
  [DangerTriangle, "warning"],
  [Bell, "gray"],
  [LockPassword, "gray"],
  [Letter, "gray"],
  [ShieldCheck, "gray"],
  [TrashBinTrash, "error"],
  [Global, "gray"],
  [Phone, "cyan"],
  [ChatRound, "cyan"],
  [Microphone, "orange"],
  [Pen, "orange"],
  [ClipboardList, "indigo"],
  [DocumentText, "orange"],
  [Copy, "gray"],
  [Download, "gray"],
  [Eye, "gray"],
  [Printer, "gray"],
  [AddCircle, "blue"],
  [LinkIcon, "blue"],
  [InfoCircle, "blue"],
  [Bolt, "warning"],
  [Diskette, "blue"],
  [RefreshCircle, "blue"],
  [Gallery, "orange"],
  [UserRounded, "purple"],
  [HeartPulse, "red"],
  [Bookmark, "orange"],
  [Key, "amber"],
  [Tag, "indigo"],
  [Hashtag, "indigo"],
  [Home, "blue"],
  [GraphUp, "teal"],
  [Upload, "cyan"],
  [QuestionCircle, "blue"],
  [Inbox, "cyan"],
  [Palette, "purple"],
  [HamburgerMenu, "gray"],
  [Mailbox, "cyan"],
  [Dollar, "gold"],
  [Hospital, "indigo"],
  [Chart, "teal"],
]);

export const DOCTOR_NAV_META: Record<string, { icon: Icon; tone: DoctorColorTone }> = {
  dashboard: { icon: Widget, tone: "blue" },
  patients: { icon: UsersGroupRounded, tone: "purple" },
  appointments: { icon: Videocamera, tone: "cyan" },
  prescriptions: { icon: Pill, tone: "red" },
  health: { icon: HeartPulse, tone: "red" },
  "phys-requests": { icon: CalendarAdd, tone: "indigo" },
  "phys-upcoming": { icon: CalendarDate, tone: "indigo" },
  "phys-today": { icon: CalendarMark, tone: "indigo" },
  "phys-manual": { icon: ClipboardAdd, tone: "indigo" },
  "phys-completed": { icon: VerifiedCheck, tone: "success" },
  "phys-cancelled": { icon: CloseCircle, tone: "error" },
  "clinic-schedule": { icon: ClockCircle, tone: "blue" },
  "oc-requests": { icon: Videocamera, tone: "cyan" },
  "oc-upcoming": { icon: CalendarDate, tone: "cyan" },
  "oc-today": { icon: CalendarMark, tone: "cyan" },
  "oc-ongoing": { icon: Videocamera, tone: "cyan" },
  "oc-completed": { icon: VerifiedCheck, tone: "success" },
  "oc-cancelled": { icon: CloseCircle, tone: "error" },
  "oc-history": { icon: History, tone: "cyan" },
  "oc-availability": { icon: ClockCircle, tone: "blue" },
  "qa-new": { icon: ChatRoundDots, tone: "cyan" },
  "qa-drafts": { icon: ChatRoundDots, tone: "cyan" },
  "qa-answered": { icon: ChatRoundCheck, tone: "success" },
  "qa-rejected": { icon: UserCrossRounded, tone: "error" },
  "submit-article": { icon: PenNewSquare, tone: "orange" },
  "submit-publication": { icon: TestTube, tone: "teal" },
  articles: { icon: Book, tone: "orange" },
  earnings: { icon: Wallet, tone: "gold" },
  reviews: { icon: Star, tone: "amber" },
  profile: { icon: UserCircle, tone: "profile" },
  settings: { icon: Settings, tone: "gray" },
};

/** @deprecated Use DOCTOR_NAV_META */
export const DOCTOR_NAV_ICONS: Record<string, Icon> = Object.fromEntries(
  Object.entries(DOCTOR_NAV_META).map(([id, meta]) => [id, meta.icon]),
);

export const PATIENT_NAV_META: Record<string, { icon: Icon; tone: DoctorColorTone }> = {
  dashboard: { icon: Widget, tone: "blue" },
  health: { icon: HeartPulse, tone: "red" },
  "oc-pending": { icon: ClockCircle, tone: "amber" },
  "oc-upcoming": { icon: CalendarDate, tone: "cyan" },
  "oc-ongoing": { icon: Videocamera, tone: "green" },
  "oc-completed": { icon: VerifiedCheck, tone: "success" },
  "oc-cancelled": { icon: CloseCircle, tone: "error" },
  "oc-history": { icon: History, tone: "indigo" },
  "phys-upcoming": { icon: CalendarDate, tone: "indigo" },
  "phys-pending": { icon: ClockCircle, tone: "amber" },
  "phys-confirmed": { icon: VerifiedCheck, tone: "success" },
  "phys-completed": { icon: CalendarMark, tone: "success" },
  "phys-cancelled": { icon: CloseCircle, tone: "error" },
  "qa-ask": { icon: PenNewSquare, tone: "orange" },
  "qa-pending": { icon: ClockCircle, tone: "amber" },
  "qa-answered": { icon: ChatRoundCheck, tone: "success" },
  "qa-rejected": { icon: UserCrossRounded, tone: "error" },
  articles: { icon: Bookmark, tone: "orange" },
  profile: { icon: UserCircle, tone: "profile" },
  settings: { icon: Settings, tone: "gray" },
};

export const ADMIN_NAV_META: Record<string, { icon: Icon; tone: DoctorColorTone }> = {
  dashboard: { icon: Widget, tone: "blue" },
  "audit-log": { icon: ShieldCheck, tone: "blue" },
  users: { icon: UsersGroupRounded, tone: "purple" },
  doctors: { icon: Stethoscope, tone: "blue" },
  "doctor-seo": { icon: UserCircle, tone: "profile" },
  patients: { icon: UserRounded, tone: "purple" },
  roles: { icon: Key, tone: "amber" },
  "qa-pending": { icon: ClockCircle, tone: "amber" },
  "qa-approved": { icon: VerifiedCheck, tone: "success" },
  "qa-rejected": { icon: UserCrossRounded, tone: "error" },
  "qa-answered": { icon: ChatRoundCheck, tone: "success" },
  "qa-reports": { icon: Chart, tone: "teal" },
  "oc-pending": { icon: ClockCircle, tone: "amber" },
  "oc-approved": { icon: VerifiedCheck, tone: "success" },
  "oc-upcoming": { icon: CalendarDate, tone: "cyan" },
  "oc-ongoing": { icon: Videocamera, tone: "green" },
  "oc-completed": { icon: VerifiedCheck, tone: "success" },
  "oc-cancelled": { icon: CloseCircle, tone: "error" },
  "oc-reports": { icon: Chart, tone: "teal" },
  prescriptions: { icon: Pill, tone: "red" },
  "phys-pending": { icon: ClockCircle, tone: "amber" },
  "phys-approved": { icon: VerifiedCheck, tone: "success" },
  "phys-rejected": { icon: UserCrossRounded, tone: "error" },
  "phys-upcoming": { icon: CalendarDate, tone: "indigo" },
  "phys-completed": { icon: CalendarMark, tone: "success" },
  "phys-cancelled": { icon: CloseCircle, tone: "error" },
  "blog-posts": { icon: DocumentText, tone: "orange" },
  categories: { icon: Tag, tone: "indigo" },
  tags: { icon: Hashtag, tone: "indigo" },
  comments: { icon: ChatRound, tone: "cyan" },
  authors: { icon: Pen, tone: "orange" },
  "review-queue": { icon: TestTube, tone: "teal" },
  "publication-review": { icon: Upload, tone: "cyan" },
  "review-process": { icon: ClipboardList, tone: "indigo" },
  "editorial-policy": { icon: DocumentText, tone: "gray" },
  "author-guidelines": { icon: Book, tone: "orange" },
  "email-templates": { icon: Letter, tone: "gray" },
  "otp-templates": { icon: LockPassword, tone: "gray" },
  notifications: { icon: Bell, tone: "gray" },
  "homepage-sections": { icon: Home, tone: "blue" },
  "health-tools-menu": { icon: TestTube, tone: "teal" },
  "health-tools": { icon: TestTube, tone: "teal" },
  whr: { icon: Letter, tone: "cyan" },
  faqs: { icon: QuestionCircle, tone: "blue" },
  "contact-inquiries": { icon: Inbox, tone: "cyan" },
  "seo-settings": { icon: Magnifier, tone: "gray" },
  "about-partners": { icon: UsersGroupRounded, tone: "purple" },
  "about-founder": { icon: Stethoscope, tone: "blue" },
  "traffic-analytics": { icon: GraphUp, tone: "teal" },
  "consultation-analytics": { icon: Stethoscope, tone: "blue" },
  "revenue-analytics": { icon: Wallet, tone: "gold" },
  "branding-media": { icon: Palette, tone: "purple" },
  "menu-mgmt": { icon: HamburgerMenu, tone: "gray" },
  "contact-details": { icon: Phone, tone: "cyan" },
  "newsletter-mgmt": { icon: Mailbox, tone: "cyan" },
  advertisements: { icon: Dollar, tone: "gold" },
  "settings-mgmt": { icon: Settings, tone: "gray" },
  "backup-security": { icon: ShieldCheck, tone: "blue" },
};

function resolveColor(icon: Icon, tone?: DoctorColorTone, color?: string) {
  if (color) return color;
  const resolvedTone = tone ?? ICON_TONE_MAP.get(icon);
  return resolvedTone ? DOCTOR_COLORS[resolvedTone] : undefined;
}

type DoctorIconProps = {
  icon: Icon;
  size?: DoctorIconSize | number;
  className?: string;
  color?: string;
  tone?: DoctorColorTone;
  label?: string;
  weight?: IconWeight;
};

export function DoctorIcon({
  icon: IconComponent,
  size = "sidebar",
  className,
  color,
  tone,
  label,
  weight = DOCTOR_ICON_WEIGHT,
}: DoctorIconProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const resolvedColor = resolveColor(IconComponent, tone, color);
  const ariaProps = label
    ? { "aria-label": label, role: "img" as const }
    : { "aria-hidden": true as const };

  return (
    <span
      className="dr-icon-shell"
      style={resolvedColor ? ({ "--dr-icon-color": resolvedColor } as CSSProperties) : undefined}
    >
      <IconComponent
        size={px}
        weight={weight}
        color={resolvedColor}
        className={cn("dr-icon", className)}
        {...ariaProps}
      />
    </span>
  );
}

export function DoctorNavIcon({ id }: { id: string; active?: boolean }) {
  const meta = DOCTOR_NAV_META[id] ?? DOCTOR_NAV_META.dashboard;
  return <DoctorIcon icon={meta.icon} size="sidebar" tone={meta.tone} />;
}

export function PatientNavIcon({ id }: { id: string }) {
  const meta = PATIENT_NAV_META[id] ?? PATIENT_NAV_META.dashboard;
  return <DoctorIcon icon={meta.icon} size="sidebar" tone={meta.tone} />;
}

export function AdminNavIcon({ id }: { id: string }) {
  const meta = ADMIN_NAV_META[id] ?? ADMIN_NAV_META.dashboard;
  const color = ADMIN_SIDEBAR_COLORS[meta.tone];
  const bg = ADMIN_SIDEBAR_BG[meta.tone];

  return (
    <span
      className="admin-sb-icon-badge"
      style={
        {
          "--admin-icon-bg": bg,
          "--dr-icon-color": color,
        } as CSSProperties
      }
    >
      <DoctorIcon icon={meta.icon} size="sidebar" color={color} />
    </span>
  );
}

type DoctorIconInlineProps = {
  icon: Icon;
  size?: DoctorIconSize | number;
  className?: string;
  iconClassName?: string;
  label?: string;
  tone?: DoctorColorTone;
  color?: string;
  children: ReactNode;
};

export function DoctorIconInline({
  icon,
  size = "button",
  className,
  iconClassName,
  label,
  tone,
  color,
  children,
}: DoctorIconInlineProps) {
  return (
    <span className={cn("dr-icon-inline", className)}>
      <DoctorIcon icon={icon} size={size} className={iconClassName} label={label} tone={tone} color={color} />
      {children}
    </span>
  );
}

export function PhysicianDashboardLabel({ className }: { className?: string }) {
  return (
    <DoctorIconInline icon={Stethoscope} size="header" tone="blue" className={className}>
      Physician Dashboard
    </DoctorIconInline>
  );
}

export function SearchFieldIcon() {
  return <DoctorIcon icon={Magnifier} size="sm" tone="gray" className="search-lucide" label="Search" />;
}

export {
  AddCircle,
  Bell,
  Bolt,
  Book,
  Bookmark,
  Calendar,
  CalendarAdd,
  CalendarDate,
  CalendarMark,
  Chart,
  ChatRound,
  ChatRoundCheck,
  ChatRoundDots,
  ClipboardAdd,
  ClipboardList,
  ClockCircle,
  CloseCircle,
  Copy,
  DangerTriangle,
  Diskette,
  DocumentText,
  Dollar,
  Download,
  Eye,
  Gallery,
  Global,
  GraphUp,
  HamburgerMenu,
  Hashtag,
  HeartPulse,
  History,
  Home,
  Hospital,
  Inbox,
  InfoCircle,
  Key,
  Letter,
  LinkIcon,
  LockPassword,
  Logout,
  Magnifier,
  Mailbox,
  Microphone,
  Palette,
  Pen,
  PenNewSquare,
  Phone,
  Pill,
  Printer,
  QuestionCircle,
  RecordCircle,
  RefreshCircle,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  StopCircle,
  Tag,
  TestTube,
  TrashBinTrash,
  Upload,
  UserCircle,
  UserCrossRounded,
  UserRounded,
  UsersGroupRounded,
  VerifiedCheck,
  Videocamera,
  Wallet,
  Widget,
};
