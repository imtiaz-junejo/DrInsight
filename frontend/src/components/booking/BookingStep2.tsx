"use client";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarDay {
  day: number;
  past: boolean;
  unavailable: boolean;
  today: boolean;
  selected: boolean;
}

export interface BookingStep2Props {
  calMonth: number;
  calYear: number;
  selDate: string;
  selTime: string;
  calendarDays: Array<CalendarDay | null>;
  availableTimes: string[];
  authVerifying: boolean;
  onChangeMonth: (dir: number) => void;
  onPickDate: (day: number) => void;
  onPickTime: (time: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BookingStep2({
  calMonth,
  calYear,
  selDate,
  selTime,
  calendarDays,
  availableTimes,
  authVerifying,
  onChangeMonth,
  onPickDate,
  onPickTime,
  onBack,
  onContinue,
}: BookingStep2Props) {
  return (
    <div id="step2">
      <div className="form-panel">
        <div className="panel-title">
          <i className="ti ti-calendar" aria-hidden="true" /> Select Date & Time
        </div>
        <div className="panel-sub">Choose your preferred appointment date and time slot</div>
        <div className="cal-wrap">
          <div>
            <div className="cal-box">
              <div className="cal-head">
                <button type="button" onClick={() => onChangeMonth(-1)} aria-label="Previous month">
                  ‹
                </button>
                <span>
                  {MONTHS[calMonth]} {calYear}
                </span>
                <button type="button" onClick={() => onChangeMonth(1)} aria-label="Next month">
                  ›
                </button>
              </div>
              <div className="cal-grid">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="cal-day-name">
                    {d}
                  </div>
                ))}
                {calendarDays.map((item, i) =>
                  item === null ? (
                    <div key={`empty-${i}`} className="cal-day empty" />
                  ) : (
                    <button
                      key={item.day}
                      type="button"
                      className={`cal-day${item.past || item.unavailable ? " past" : ""}${item.today ? " today" : ""}${item.selected ? " sel" : ""}`}
                      onClick={() => !item.past && !item.unavailable && onPickDate(item.day)}
                      disabled={item.past || item.unavailable}
                    >
                      {item.day}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="time-label">Available Times</div>
            <div className="cal-box">
              <div className="time-grid">
                {!selDate ? (
                  <p style={{ gridColumn: "1 / -1", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                    Select a date to see available times.
                  </p>
                ) : availableTimes.length === 0 ? (
                  <p style={{ gridColumn: "1 / -1", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                    No available times for this day.
                  </p>
                ) : (
                  availableTimes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`time-slot${selTime === t ? " sel" : ""}`}
                      onClick={() => onPickTime(t)}
                    >
                      {t}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="nav-btns">
        <button type="button" className="btn-back" onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> Back
        </button>
        <button
          type="button"
          className="btn-next"
          onClick={onContinue}
          disabled={!selDate || !selTime || authVerifying}
        >
          {authVerifying ? (
            "Verifying account..."
          ) : (
            <>
              Continue to Patient Info <i className="ti ti-arrow-right" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
