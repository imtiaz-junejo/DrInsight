export type BmiResult = { value: number; category: string; barPct: number; barColor: string };
export type BmrResult = { bmr: number; tdee: number };
export type BodyFatResult = { value: number; category: string; barPct: number; barColor: string };
export type IdealWeightResult = { devine: number; lo: number; hi: number };
export type CalorieResult = { tdee: number; protein: number; carbs: number; fat: number };
export type WaterResult = { litres: number; cups: number };
export type HrZone = { name: string; pct: string; lo: number; hi: number; col: string };
export type HrResult = { max: number; zones: HrZone[] };
export type BpResult = { sys: number; dia: number; category: string; cls: string; advice: string };
export type PregnancyMethod = "lmp" | "conception" | "ivf";

export type PregnancyInput = {
  method: PregnancyMethod;
  lmp?: string;
  cycle?: number;
  conception?: string;
  ivfDate?: string;
  ivfDay?: 3 | 5;
};

export type PregnancyMilestone = { week: number; date: string; label: string };

export type PregnancyResult = {
  edd: string;
  weeksText: string;
  trimester: string;
  babySize: string;
  t1End: string;
  t2End: string;
  eddShort: string;
  milestones: PregnancyMilestone[];
};
export type OvulationResult = {
  ovDate: string;
  window: string;
  nextPeriod: string;
  irregular?: boolean;
};
export type PeriodTrackerCycle = { label: string; date: string };
export type PeriodTrackerResult = {
  nextPeriod: string;
  periodEnd: string;
  ovulationDay: string;
  fertileWindow: string;
  upcomingCycles: PeriodTrackerCycle[];
};
export type RiskResult = { badge: string; cls: string; advice: string };
export type SmokingResult = { packYears: number; risk: string };
export type KidneyResult = { egfr: number; stage: string };

const dateOpts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
const shortOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
const shortYearOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

export function calcBMI(w: number, h: number): BmiResult | null {
  if (!w || !h) return null;
  const bmi = +(w / (h / 100) ** 2).toFixed(1);
  let category: string, barColor: string, barPct: number;
  if (bmi < 18.5) {
    category = "Underweight";
    barColor = "#f59e0b";
    barPct = 20;
  } else if (bmi < 25) {
    category = "Normal Weight ✅";
    barColor = "#059669";
    barPct = 45;
  } else if (bmi < 30) {
    category = "Overweight";
    barColor = "#f59e0b";
    barPct = 65;
  } else if (bmi < 35) {
    category = "Obese Class I";
    barColor = "#ef4444";
    barPct = 78;
  } else {
    category = "Obese Class II+";
    barColor = "#dc2626";
    barPct = 92;
  }
  return { value: bmi, category, barPct, barColor };
}

export function calcBMR(w: number, h: number, a: number, sex: string, act: number): BmrResult | null {
  if (!w || !h || !a || !sex) return null;
  let bmr = sex === "Male" ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
  const tdee = Math.round(bmr * act);
  bmr = Math.round(bmr);
  return { bmr, tdee };
}

export function calcBodyFat(sex: string, h: number, waist: number, neck: number, hip: number): BodyFatResult | null {
  if (!sex || !h || !waist || !neck) return null;
  let bf: number;
  if (sex === "male") {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
  } else {
    if (!hip) return null;
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(h)) - 450;
  }
  bf = +bf.toFixed(1);
  let category: string, barColor: string;
  if (sex === "male") {
    if (bf < 6) {
      category = "Essential Fat";
      barColor = "#f59e0b";
    } else if (bf < 14) {
      category = "Athletic";
      barColor = "#059669";
    } else if (bf < 18) {
      category = "Fitness";
      barColor = "#059669";
    } else if (bf < 25) {
      category = "Average";
      barColor = "#f59e0b";
    } else {
      category = "Obese";
      barColor = "#ef4444";
    }
  } else if (bf < 14) {
    category = "Essential Fat";
    barColor = "#f59e0b";
  } else if (bf < 21) {
    category = "Athletic";
    barColor = "#059669";
  } else if (bf < 25) {
    category = "Fitness";
    barColor = "#059669";
  } else if (bf < 32) {
    category = "Average";
    barColor = "#f59e0b";
  } else {
    category = "Obese";
    barColor = "#ef4444";
  }
  return { value: bf, category, barPct: Math.min(bf * 2, 100), barColor };
}

export function calcIdealWeight(h: number, sex: string): IdealWeightResult | null {
  if (!h || !sex) return null;
  const hIn = h / 2.54 - 60;
  const base = sex === "male" ? 48.0 : 45.5;
  const add = sex === "male" ? 2.7 : 2.2;
  const devine = +(base + add * hIn).toFixed(1);
  return { devine, lo: +(devine * 0.9).toFixed(1), hi: +(devine * 1.1).toFixed(1) };
}

export function calcCalories(w: number, h: number, a: number, sex: string, goal: number): CalorieResult | null {
  if (!w || !h || !a) return null;
  const bmr = sex === "Male" ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
  const tdee = Math.round(bmr * 1.55) + goal;
  const protein = Math.round(w * 2);
  const fat = Math.round((tdee * 0.25) / 9);
  const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);
  return { tdee, protein, carbs, fat };
}

export function calcWater(w: number, a: number, act: number, climate: number): WaterResult | null {
  if (!w) return null;
  let base = w * 0.033;
  if (a > 55) base *= 1.1;
  base += act + climate;
  base = +base.toFixed(1);
  return { litres: base, cups: Math.round(base / 0.25) };
}

export function calcHR(age: number, rest: number): HrResult | null {
  if (!age) return null;
  const max = 220 - age;
  const zones: HrZone[] = [
    { name: "Zone 1 – Warm-up", pct: "50–60%", lo: Math.round(rest + (max - rest) * 0.5), hi: Math.round(rest + (max - rest) * 0.6), col: "#3b82f6" },
    { name: "Zone 2 – Fat Burn", pct: "60–70%", lo: Math.round(rest + (max - rest) * 0.6), hi: Math.round(rest + (max - rest) * 0.7), col: "#10b981" },
    { name: "Zone 3 – Aerobic", pct: "70–80%", lo: Math.round(rest + (max - rest) * 0.7), hi: Math.round(rest + (max - rest) * 0.8), col: "#f59e0b" },
    { name: "Zone 4 – Anaerobic", pct: "80–90%", lo: Math.round(rest + (max - rest) * 0.8), hi: Math.round(rest + (max - rest) * 0.9), col: "#ef4444" },
    { name: "Zone 5 – Max Effort", pct: "90–100%", lo: Math.round(rest + (max - rest) * 0.9), hi: max, col: "#dc2626" },
  ];
  return { max, zones };
}

export function calcBP(sys: number, dia: number): BpResult | null {
  if (!sys || !dia) return null;
  let category: string, cls: string, advice: string;
  if (sys < 120 && dia < 80) {
    category = "Normal ✅";
    cls = "bp-normal";
    advice = "Excellent! Maintain a healthy lifestyle to keep your blood pressure in this range.";
  } else if (sys < 130 && dia < 80) {
    category = "Elevated";
    cls = "bp-elevated";
    advice = "Your blood pressure is slightly elevated. Consider reducing sodium, exercising regularly, and limiting alcohol.";
  } else if (sys < 140 || dia < 90) {
    category = "High Blood Pressure Stage 1";
    cls = "bp-high1";
    advice = "Lifestyle changes are strongly recommended. Your doctor may also consider medication. Monitor regularly.";
  } else {
    category = "High Blood Pressure Stage 2";
    cls = "bp-high2";
    advice = "Please consult your doctor promptly. Medication and significant lifestyle changes are typically required.";
  }
  if (sys > 180 || dia > 120) {
    category = "Hypertensive Crisis 🚨";
    cls = "bp-high2";
    advice = "SEEK IMMEDIATE MEDICAL ATTENTION. This is a medical emergency.";
  }
  return { sys, dia, category, cls, advice };
}

const PREG_BABY_SIZE: [number, string][] = [
  [4, "poppy seed"],
  [6, "lentil"],
  [8, "raspberry"],
  [10, "strawberry"],
  [12, "lime"],
  [14, "lemon"],
  [16, "avocado"],
  [18, "bell pepper"],
  [20, "banana"],
  [22, "papaya"],
  [24, "corn on the cob"],
  [26, "lettuce head"],
  [28, "eggplant"],
  [30, "cabbage"],
  [32, "jicama"],
  [34, "cantaloupe"],
  [36, "romaine lettuce"],
  [38, "pumpkin"],
  [40, "small watermelon"],
];

function babySizeForWeek(week: number): string {
  let label = PREG_BABY_SIZE[0][1];
  for (const [wk, name] of PREG_BABY_SIZE) {
    if (week >= wk) label = name;
  }
  return label;
}

function pregMilestoneSchedule(lmp: Date): PregnancyMilestone[] {
  const mk = (w: number) => {
    const d = new Date(lmp);
    d.setDate(d.getDate() + w * 7);
    return d;
  };
  const fmt = (d: Date) => d.toLocaleDateString("en-US", shortOpts);
  return [
    [8, "First prenatal visit & dating check"],
    [11, "First-trimester screening / NT scan (11–13 wks)"],
    [16, "Genetic screening / quad screen (15–20 wks)"],
    [20, "Anatomy ultrasound (18–22 wks)"],
    [26, "Glucose screening for gestational diabetes (24–28 wks)"],
    [28, "Tdap vaccine; Rh factor follow-up if Rh-negative"],
    [32, "Growth check-up; visits become more frequent"],
    [36, "Group B strep test (35–37 wks)"],
    [39, "Weekly checkups; full term begins at 39 weeks"],
  ].map(([week, label]) => ({
    week: week as number,
    date: fmt(mk(week as number)),
    label: label as string,
  }));
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function resolvePregnancyDates(input: PregnancyInput): { lmp: Date; edd: Date } | null {
  let lmp: Date;
  let edd: Date;

  if (input.method === "lmp") {
    if (!input.lmp) return null;
    lmp = new Date(input.lmp);
    const cycle = Math.min(45, Math.max(21, input.cycle ?? 28));
    const cycleAdjustDays = cycle - 28;
    edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280 + cycleAdjustDays);
  } else if (input.method === "conception") {
    if (!input.conception) return null;
    const conception = new Date(input.conception);
    edd = new Date(conception);
    edd.setDate(edd.getDate() + 266);
    lmp = new Date(conception);
    lmp.setDate(lmp.getDate() - 14);
  } else {
    if (!input.ivfDate) return null;
    const transferDay = input.ivfDay ?? 5;
    const transfer = new Date(input.ivfDate);
    const daysToAdd = transferDay === 3 ? 263 : 261;
    edd = new Date(transfer);
    edd.setDate(edd.getDate() + daysToAdd);
    lmp = new Date(transfer);
    lmp.setDate(lmp.getDate() - (14 + transferDay));
  }

  return { lmp, edd };
}

export type PregnancyWhrPrediction = {
  cycleKey: string;
  edd: string;
  reminderDate?: string;
  schedule: Array<{ week: number; date: string; title: string }>;
};

export function pregnancyWhrPrediction(input: PregnancyInput): PregnancyWhrPrediction | null {
  const dates = resolvePregnancyDates(input);
  if (!dates) return null;

  const { lmp, edd } = dates;
  const today = new Date();
  const week = Math.floor(Math.floor((today.getTime() - lmp.getTime()) / 86400000) / 7);
  const schedule = pregMilestoneSchedule(lmp)
    .filter((m) => m.week >= Math.max(week, 4))
    .map((m) => {
      const d = new Date(lmp);
      d.setDate(d.getDate() + m.week * 7);
      return { week: m.week, date: toIsoDate(d), title: m.label };
    });

  return {
    cycleKey: toIsoDate(edd),
    edd: toIsoDate(edd),
    reminderDate: schedule[0]?.date,
    schedule,
  };
}

export function ovulationWhrPrediction(lmpVal: string, cycle: number) {
  if (!lmpVal) return null;
  const c = Math.min(35, Math.max(21, cycle || 28));
  const lmp = new Date(lmpVal);
  const ov = new Date(lmp);
  ov.setDate(ov.getDate() + c - 14);
  const rem = new Date(ov);
  rem.setDate(rem.getDate() - 1);
  return {
    cycleKey: toIsoDate(ov),
    ovDate: toIsoDate(ov),
    reminderDate: toIsoDate(rem),
  };
}

export function periodWhrPrediction(lmpVal: string, cycle: number) {
  if (!lmpVal) return null;
  const c = Math.min(35, Math.max(21, cycle || 28));
  const next = new Date(lmpVal);
  next.setDate(next.getDate() + c);
  const rem = new Date(next);
  rem.setDate(rem.getDate() - 1);
  return {
    cycleKey: toIsoDate(next),
    nextPeriod: toIsoDate(next),
    reminderDate: toIsoDate(rem),
  };
}

export function calcPregnancy(input: PregnancyInput): PregnancyResult | null {
  const today = new Date();
  const dates = resolvePregnancyDates(input);
  if (!dates) return null;
  const { lmp, edd } = dates;
  const diffDays = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  const inRange = weeks >= 0 && weeks <= 42;

  const t1End = new Date(lmp);
  t1End.setDate(t1End.getDate() + 91);
  const t2End = new Date(lmp);
  t2End.setDate(t2End.getDate() + 189);

  let trimester = "--";
  if (inRange) {
    trimester = weeks < 13 ? "1st Trimester" : weeks < 27 ? "2nd Trimester" : "3rd Trimester";
  }

  return {
    edd: edd.toLocaleDateString("en-US", dateOpts),
    weeksText: inRange
      ? `Gestational age: ${weeks} weeks ${days} days`
      : "Outside typical 0–42 week range for the date entered",
    trimester: `Trimester: ${trimester}`,
    babySize: inRange ? `Baby's size this week: about a ${babySizeForWeek(weeks)}` : "Baby's size: --",
    t1End: t1End.toLocaleDateString("en-US", shortOpts),
    t2End: t2End.toLocaleDateString("en-US", shortOpts),
    eddShort: edd.toLocaleDateString("en-US", shortOpts),
    milestones: pregMilestoneSchedule(lmp),
  };
}

export function calcPlanner(
  lmpVal: string,
  cycle: number,
  _periodLen: number,
  irregular: boolean,
): OvulationResult | null {
  if (!lmpVal) return null;
  const c = Math.min(35, Math.max(21, cycle || 28));
  const lmp = new Date(lmpVal);
  const ovDay = new Date(lmp);
  ovDay.setDate(ovDay.getDate() + c - 14);
  const winStart = new Date(ovDay);
  winStart.setDate(winStart.getDate() - 5);
  const winEnd = new Date(ovDay);
  winEnd.setDate(winEnd.getDate() + 1);
  const nextPeriod = new Date(lmp);
  nextPeriod.setDate(nextPeriod.getDate() + c);
  return {
    ovDate: ovDay.toLocaleDateString("en-US", shortYearOpts),
    window: `Fertile window: ${winStart.toLocaleDateString("en-US", shortOpts)} to ${winEnd.toLocaleDateString("en-US", shortOpts)}`,
    nextPeriod: `Next period expected: ${nextPeriod.toLocaleDateString("en-US", shortYearOpts)}`,
    irregular,
  };
}

export function calcOvulation(lmpVal: string, cycle: number, luteal: number): OvulationResult | null {
  if (!lmpVal) return null;
  const lmp = new Date(lmpVal);
  const ovDay = new Date(lmp);
  ovDay.setDate(ovDay.getDate() + cycle - luteal);
  const winStart = new Date(ovDay);
  winStart.setDate(winStart.getDate() - 5);
  const winEnd = new Date(ovDay);
  winEnd.setDate(winEnd.getDate() + 1);
  const nextPeriod = new Date(lmp);
  nextPeriod.setDate(nextPeriod.getDate() + cycle);
  return {
    ovDate: ovDay.toLocaleDateString("en-US", shortYearOpts),
    window: `Fertile window: ${winStart.toLocaleDateString("en-US", shortOpts)} to ${winEnd.toLocaleDateString("en-US", shortOpts)}`,
    nextPeriod: nextPeriod.toLocaleDateString("en-US", shortYearOpts),
  };
}

export function calcPeriodTracker(lmpVal: string, cycle: number, periodLen: number): PeriodTrackerResult | null {
  if (!lmpVal) return null;
  const c = Math.min(35, Math.max(21, cycle || 28));
  const p = Math.min(7, Math.max(1, periodLen || 5));
  const lmp = new Date(lmpVal);
  const nextPeriod = new Date(lmp);
  nextPeriod.setDate(nextPeriod.getDate() + c);
  const periodEnd = new Date(nextPeriod);
  periodEnd.setDate(periodEnd.getDate() + p - 1);
  const ovDay = new Date(lmp);
  ovDay.setDate(ovDay.getDate() + c - 14);
  const winStart = new Date(ovDay);
  winStart.setDate(winStart.getDate() - 5);
  const winEnd = new Date(ovDay);
  winEnd.setDate(winEnd.getDate() + 1);

  const cyc2 = new Date(nextPeriod);
  cyc2.setDate(cyc2.getDate() + c);
  const cyc3 = new Date(cyc2);
  cyc3.setDate(cyc3.getDate() + c);

  return {
    nextPeriod: nextPeriod.toLocaleDateString("en-US", shortYearOpts),
    periodEnd: `Expected to last through: ${periodEnd.toLocaleDateString("en-US", shortOpts)}`,
    ovulationDay: `Ovulation day: ${ovDay.toLocaleDateString("en-US", shortOpts)}`,
    fertileWindow: `Fertile window: ${winStart.toLocaleDateString("en-US", shortOpts)} to ${winEnd.toLocaleDateString("en-US", shortOpts)}`,
    upcomingCycles: [
      { label: "Cycle 2", date: cyc2.toLocaleDateString("en-US", shortOpts) },
      { label: "Cycle 3", date: cyc3.toLocaleDateString("en-US", shortOpts) },
    ],
  };
}

export function calcDiabetes(scores: number[]): RiskResult {
  const score = scores.reduce((a, b) => a + b, 0);
  if (score <= 2) {
    return {
      badge: "🟢 Low Risk",
      cls: "risk-low",
      advice:
        "Your current risk appears low. Maintain a healthy lifestyle with regular exercise, balanced diet, and regular health check-ups.",
    };
  }
  if (score <= 4) {
    return {
      badge: "🟡 Moderate Risk",
      cls: "risk-mod",
      advice:
        "You have some risk factors for Type 2 diabetes. Lifestyle changes — weight management, diet, and exercise — can significantly reduce your risk. Speak to your doctor about a fasting glucose test.",
    };
  }
  return {
    badge: "🔴 High Risk",
    cls: "risk-high",
    advice:
      "You have several risk factors for Type 2 diabetes. Please see your doctor for a blood glucose test (HbA1c or fasting glucose) as soon as possible. Early detection and lifestyle changes can prevent or delay diabetes.",
  };
}

export function calcSmoking(cpd: number, yrs: number): SmokingResult | null {
  if (!cpd || !yrs) return null;
  const packYears = +(cpd / 20 * yrs).toFixed(1);
  let risk: string;
  if (packYears < 10) {
    risk = "Moderate risk level. All smoking carries health risks. Consider quitting now for the greatest benefit.";
  } else if (packYears < 20) {
    risk =
      "Significant risk. Eligible for annual low-dose CT lung cancer screening. Speak to your doctor immediately about cessation support.";
  } else {
    risk =
      "High risk for lung cancer, COPD, and cardiovascular disease. Annual CT screening strongly recommended. Quitting now still significantly improves your outlook.";
  }
  return { packYears, risk };
}

export function calcKidney(cr: number, age: number, sex: string, race: string): KidneyResult | null {
  if (!cr || !age) return null;
  const k = sex === "female" ? 0.7 : 0.9;
  const a = sex === "female" ? -0.329 : -0.411;
  const raceF = race === "black" ? 1.159 : 1.0;
  const sexF = sex === "female" ? 1.018 : 1.0;
  const ratio = cr / k;
  let egfr = 141 * Math.pow(Math.min(ratio, 1), a) * Math.pow(Math.max(ratio, 1), -1.209) * Math.pow(0.993, age) * sexF * raceF;
  egfr = Math.round(egfr);
  let stage: string;
  if (egfr >= 90) stage = "G1 — Normal kidney function";
  else if (egfr >= 60) stage = "G2 — Mildly decreased (monitor regularly)";
  else if (egfr >= 45) stage = "G3a — Mild to moderately decreased";
  else if (egfr >= 30) stage = "G3b — Moderate to severely decreased";
  else if (egfr >= 15) stage = "G4 — Severely decreased — see nephrologist";
  else stage = "G5 — Kidney failure — urgent nephrology referral";
  return { egfr, stage };
}

export function calcPHQ9(total: number): RiskResult {
  if (total <= 4) {
    return {
      badge: `🟢 Minimal / None (Score: ${total})`,
      cls: "risk-low",
      advice:
        "Your score suggests minimal depressive symptoms. Continue healthy habits — sleep, exercise, social connection, and stress management all support mental wellbeing.",
    };
  }
  if (total <= 9) {
    return {
      badge: `🟡 Mild Depression (Score: ${total})`,
      cls: "risk-mod",
      advice:
        "You may be experiencing mild depression. Consider speaking with your GP or a counsellor. Lifestyle changes, therapy, and support can make a significant difference.",
    };
  }
  if (total <= 14) {
    return {
      badge: `🟠 Moderate Depression (Score: ${total})`,
      cls: "risk-mod",
      advice:
        "Your score indicates moderate depression. We strongly recommend speaking with a doctor or mental health professional. Treatment — therapy, medication, or both — is effective.",
    };
  }
  if (total <= 19) {
    return {
      badge: `🔴 Moderately Severe (Score: ${total})`,
      cls: "risk-high",
      advice:
        "Your score indicates moderately severe depression. Please seek professional help promptly. Contact your doctor or a mental health service today.",
    };
  }
  return {
    badge: `🔴 Severe Depression (Score: ${total})`,
    cls: "risk-high",
    advice:
      "Your score indicates severe depression. Please reach out for help now — call your doctor, a crisis line (988), or go to your nearest emergency department. You deserve support.",
  };
}

export function checkSymptom(sy: string, dur: string): RiskResult | null {
  if (!sy) return null;
  const urgent: Record<string, string> = {
    chest:
      "⚠️ URGENT — Chest pain can indicate a heart attack, pulmonary embolism, or other serious conditions. Seek immediate medical attention or call 911.",
    breath:
      "⚠️ URGENT — Sudden shortness of breath can be a medical emergency. Call 911 if severe or if accompanied by chest pain.",
  };
  const guide: Record<string, string> = {
    head:
      dur === "new"
        ? "A sudden severe headache (worst of your life) requires emergency care. Migraines and tension headaches are common — book a consultation if this is recurring."
        : "Recurring headaches lasting weeks should be evaluated. A neurologist can help identify triggers and treatment.",
    fever:
      dur === "new"
        ? "A fever over 38.5°C (101.3°F) should be monitored. If above 40°C or accompanied by stiff neck/rash, seek urgent care."
        : "A persistent fever for more than 5 days warrants a doctor visit to identify the underlying cause.",
    fatigue:
      dur === "weeks" || dur === "chronic"
        ? "Persistent fatigue lasting weeks may indicate anaemia, thyroid issues, sleep disorders, or other conditions. A blood panel can help identify the cause."
        : "Short-term fatigue is usually related to sleep, stress, or illness. If it persists beyond 2 weeks, see your doctor.",
    stomach:
      "Abdominal pain lasting more than a few days, or accompanied by fever, vomiting blood, or weight loss, requires medical evaluation.",
    joints:
      "Joint pain with swelling, redness, or warmth may indicate arthritis or an inflammatory condition. A rheumatologist can evaluate and treat this.",
    skin:
      "New skin rashes should be evaluated, especially if spreading, itchy, painful, or accompanied by other symptoms. A dermatologist can provide an accurate diagnosis.",
  };
  if (urgent[sy]) {
    return { badge: "🚨 Seek Immediate Care", cls: "risk-high", advice: urgent[sy] };
  }
  return {
    badge: dur === "new" ? "⚠️ Monitor Closely" : "📋 Book a Consultation",
    cls: dur === "new" ? "risk-mod" : "risk-low",
    advice: guide[sy] || "Please provide more detail about your symptoms. Booking a consultation with one of our specialists will provide a thorough evaluation.",
  };
}
