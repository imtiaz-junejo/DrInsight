import { buildConsultationWindow, isWithinConsultationWindow } from './utils/consultation-window.util';

describe('consultation window', () => {
  const scheduledAt = new Date('2026-07-12T10:00:00Z');
  const window = buildConsultationWindow(scheduledAt, 30);

  it('allows join within grace window before start', () => {
    const now = new Date('2026-07-12T09:55:00Z');
    expect(isWithinConsultationWindow(window, now)).toBe(true);
  });

  it('allows join during appointment', () => {
    const now = new Date('2026-07-12T10:15:00Z');
    expect(isWithinConsultationWindow(window, now)).toBe(true);
  });

  it('rejects join after grace window ends', () => {
    const now = new Date('2026-07-12T11:00:00Z');
    expect(isWithinConsultationWindow(window, now)).toBe(false);
  });
});
