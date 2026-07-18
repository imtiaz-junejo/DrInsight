import { ConsultationWindow } from '../types/meeting.types';

const DEFAULT_GRACE_BEFORE_MINUTES = 10;
const DEFAULT_GRACE_AFTER_MINUTES = 15;

export function buildConsultationWindow(
  scheduledAt: Date,
  durationMinutes: number,
  graceBefore = DEFAULT_GRACE_BEFORE_MINUTES,
  graceAfter = DEFAULT_GRACE_AFTER_MINUTES,
): ConsultationWindow {
  const startsAt = new Date(scheduledAt.getTime() - graceBefore * 60_000);
  const endsAt = new Date(scheduledAt.getTime() + durationMinutes * 60_000 + graceAfter * 60_000);
  return {
    startsAt,
    endsAt,
    graceMinutesBefore: graceBefore,
    graceMinutesAfter: graceAfter,
  };
}

export function isWithinConsultationWindow(window: ConsultationWindow, now = new Date()): boolean {
  return now >= window.startsAt && now <= window.endsAt;
}
