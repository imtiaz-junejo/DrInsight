import type {
  BmiResult,
  BmrResult,
  BodyFatResult,
  BpResult,
  CalorieResult,
  HrResult,
  IdealWeightResult,
  KidneyResult,
  OvulationResult,
  PeriodTrackerResult,
  PregnancyResult,
  RiskResult,
  SmokingResult,
  WaterResult,
} from "@/app/(public)/health-tools/calculators";

export function BmiInlineResult({ result }: { result: BmiResult }) {
  return (
    <>
      <div className="result-value">{result.value}</div>
      <div className="result-sub">Category: {result.category}</div>
      <div className="result-bar">
        <div className="result-fill" style={{ width: `${result.barPct}%`, background: result.barColor }} />
      </div>
    </>
  );
}

export function BmrInlineResult({ result }: { result: BmrResult }) {
  return (
    <>
      <div className="result-value">{result.bmr} kcal/day</div>
      <div className="result-sub">Total Daily Energy Expenditure (TDEE): {result.tdee} kcal/day</div>
    </>
  );
}

export function BodyFatInlineResult({ result }: { result: BodyFatResult }) {
  return (
    <>
      <div className="result-value">{result.value}%</div>
      <div className="result-sub">Category: {result.category}</div>
      <div className="result-bar">
        <div className="result-fill" style={{ width: `${result.barPct}%`, background: result.barColor }} />
      </div>
    </>
  );
}

export function IdealWeightInlineResult({ result }: { result: IdealWeightResult }) {
  return (
    <>
      <div className="result-value">{result.devine} kg</div>
      <div className="result-sub">
        Healthy range: {result.lo} – {result.hi} kg (Devine formula)
      </div>
    </>
  );
}

export function CalorieInlineResult({ result }: { result: CalorieResult }) {
  return (
    <>
      <div className="result-value">{result.tdee} kcal</div>
      <div className="result-sub">
        Protein: {result.protein}g &nbsp;|&nbsp; Carbs: {result.carbs}g &nbsp;|&nbsp; Fat: {result.fat}g
      </div>
    </>
  );
}

export function WaterInlineResult({ result }: { result: WaterResult }) {
  return (
    <>
      <div className="result-value">{result.litres} litres</div>
      <div className="result-sub">Approx. {result.cups} cups (250 ml each)</div>
    </>
  );
}

export function HrInlineResult({ result }: { result: HrResult }) {
  return (
    <>
      <div className="result-value">{result.max} bpm</div>
      <div className="hr-zones">
        {result.zones.map((z) => (
          <div
            key={z.name}
            className="hr-zone-row"
            style={{ background: `${z.col}18`, borderLeft: `3px solid ${z.col}` }}
          >
            <span style={{ color: z.col, fontWeight: 600 }}>{z.name}</span>
            <span style={{ color: "var(--gray-600)" }}>
              {z.lo}–{z.hi} bpm
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function BpInlineResult({ result }: { result: BpResult }) {
  return (
    <>
      <div className="result-value">
        {result.sys} / {result.dia} mmHg
      </div>
      <span className={`bpcat ${result.cls}`}>{result.category}</span>
      <div className="result-sub" style={{ marginTop: 8 }}>
        {result.advice}
      </div>
    </>
  );
}

export function PregnancyInlineResult({ result }: { result: PregnancyResult }) {
  return (
    <>
      <div className="result-value">{result.edd}</div>
      <div className="result-sub">{result.weeksText}</div>
      <div className="result-sub">{result.trimester}</div>
      <div className="result-sub" style={{ marginBottom: 10 }}>
        {result.babySize}
      </div>
      <div className="preg-trimesters">
        <div className="preg-t1">🟢 1st Trimester: Weeks 1–13 (ends {result.t1End})</div>
        <div className="preg-t2">🟡 2nd Trimester: Weeks 14–27 (ends {result.t2End})</div>
        <div className="preg-t3">🔴 3rd Trimester: Weeks 28–40 (due {result.eddShort})</div>
      </div>
      <div style={{ marginTop: 12 }}>
        {result.milestones.map((m) => (
          <div key={m.week} className="preg-ms-row">
            <span className="ms-ico">🗓️</span>
            <span className="ms-text">
              <span className="ms-week">Week {m.week}</span> <span className="ms-date">({m.date})</span> — {m.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function OvulationInlineResult({ result }: { result: OvulationResult }) {
  return (
    <>
      <div className="result-value">{result.ovDate}</div>
      <div className="result-sub">{result.window}</div>
      <div className="result-sub" style={{ marginTop: 4 }}>
        {result.nextPeriod}
      </div>
      {result.irregular ? (
        <div className="preg-ms-row" style={{ marginTop: 10 }}>
          <span className="ms-ico">⚠️</span>
          <span className="ms-text">
            Irregular cycles make prediction less reliable — track a few cycles or confirm with an ovulation test.
          </span>
        </div>
      ) : null}
    </>
  );
}

export function PeriodTrackerInlineResult({ result }: { result: PeriodTrackerResult }) {
  return (
    <>
      <div className="result-value">{result.nextPeriod}</div>
      <div className="result-sub">{result.periodEnd}</div>
      <div className="result-sub" style={{ marginTop: 4 }}>
        {result.ovulationDay}
      </div>
      <div className="result-sub">{result.fertileWindow}</div>
      <div style={{ marginTop: 12 }}>
        <div className="result-label" style={{ marginBottom: 6 }}>
          Upcoming Cycles
        </div>
        {result.upcomingCycles.map((cycle) => (
          <div key={cycle.label} className="preg-ms-row">
            <span className="ms-ico">🩸</span>
            <span className="ms-text">
              <span className="ms-week">{cycle.label}</span> — <span className="ms-date">{cycle.date}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function SmokingInlineResult({ result }: { result: SmokingResult }) {
  return (
    <>
      <div className="result-value">{result.packYears} pack years</div>
      <div className="result-sub">{result.risk}</div>
    </>
  );
}

export function KidneyInlineResult({ result }: { result: KidneyResult }) {
  return (
    <>
      <div className="result-value">{result.egfr} mL/min/1.73m²</div>
      <div className="result-sub">CKD Stage: {result.stage}</div>
    </>
  );
}

export function riskBadgeProps(result: RiskResult) {
  return { badge: result.badge, badgeClass: result.cls, advice: result.advice };
}
