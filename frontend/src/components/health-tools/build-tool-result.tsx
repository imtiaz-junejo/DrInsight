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
import type { HealthToolModalData, ResultSection, StatusVariant } from "./types";

const DISCLAIMER: ResultSection = {
  title: "Medical Disclaimer",
  variant: "disclaimer",
  content: (
    <p>
      This calculator provides educational information only and should not replace professional medical advice,
      diagnosis, or treatment. Always consult a qualified healthcare provider for personalised guidance.
    </p>
  ),
};

function lifestyleTips(items: { icon: string; label: string; text: string }[]): ResultSection {
  return {
    title: "Lifestyle Tips",
    variant: "tips",
    content: (
      <ul className="ht-tips-list">
        {items.map((item) => (
          <li key={item.label}>
            <span className="ht-tip-icon" aria-hidden>
              {item.icon}
            </span>
            <div>
              <strong>{item.label}</strong>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    ),
  };
}

function bmiStatus(category: string): StatusVariant {
  if (category.includes("Normal")) return "good";
  if (category.includes("Underweight") || category.includes("Overweight")) return "moderate";
  return "danger";
}

function riskClsToVariant(cls: string): StatusVariant {
  if (cls.includes("low") || cls.includes("normal")) return "good";
  if (cls.includes("mod") || cls.includes("elevated") || cls.includes("high1")) return "moderate";
  if (cls.includes("high2") || cls.includes("high")) return "danger";
  return "info";
}

function cleanBadge(badge: string) {
  return badge.replace(/[🟢🟡🔴✅🚨]/g, "").trim();
}

export function buildBmiModal(result: BmiResult): HealthToolModalData {
  const sections: ResultSection[] = [
    {
      title: "Interpretation",
      content: (
        <p>
          Your BMI of <strong>{result.value}</strong> places you in the <strong>{result.category}</strong> category.
          BMI is a screening measure of body fat based on height and weight — it does not directly measure body
          composition or health.
        </p>
      ),
    },
    {
      title: "Recommendations",
      content: (
        <ul className="ht-bullet-list">
          <li>Maintain a balanced diet rich in whole grains, lean protein, fruits, and vegetables.</li>
          <li>Aim for at least 150 minutes of moderate aerobic activity per week.</li>
          <li>Track your weight trends over time rather than focusing on a single reading.</li>
          <li>Discuss your results with your doctor, especially if your BMI is outside the normal range.</li>
        </ul>
      ),
    },
    lifestyleTips([
      { icon: "🥗", label: "Diet", text: "Focus on nutrient-dense foods and appropriate portion sizes." },
      { icon: "🏃", label: "Exercise", text: "Combine cardio and strength training for optimal body composition." },
      { icon: "💧", label: "Hydration", text: "Drink adequate water throughout the day to support metabolism." },
      { icon: "😴", label: "Sleep", text: "Aim for 7–9 hours of quality sleep to support weight management." },
      { icon: "📊", label: "Monitoring", text: "Recalculate monthly and pair with waist circumference measurements." },
    ]),
    DISCLAIMER,
  ];

  if (!result.category.includes("Normal")) {
    sections.splice(1, 0, {
      title: "Warnings",
      variant: "warning",
      content: (
        <p>
          BMI outside the healthy range may be associated with increased health risks. This tool cannot account for
          muscle mass, age, or ethnicity. Seek medical advice for a comprehensive assessment.
        </p>
      ),
    });
  }

  return {
    toolId: "bmi",
    icon: "⚖️",
    iconClass: "blue",
    title: "BMI Calculator",
    primaryLabel: "Result",
    primaryValue: String(result.value),
    status: { text: cleanBadge(result.category), variant: bmiStatus(result.category) },
    sections,
  };
}

export function buildBmrModal(result: BmrResult): HealthToolModalData {
  return {
    toolId: "bmr",
    icon: "🔥",
    iconClass: "teal",
    title: "BMR & TDEE Calculator",
    primaryLabel: "Daily Energy (TDEE)",
    primaryValue: `${result.tdee} kcal`,
    status: { text: "Calculated", variant: "info" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <>
            <p>
              Your Basal Metabolic Rate (BMR) is <strong>{result.bmr} kcal/day</strong> — the energy your body needs
              at complete rest. Your Total Daily Energy Expenditure (TDEE) is{" "}
              <strong>{result.tdee} kcal/day</strong> including your activity level.
            </p>
          </>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>To maintain weight, consume approximately your TDEE in calories daily.</li>
            <li>For weight loss, a moderate deficit of 300–500 kcal/day is generally safe.</li>
            <li>Recalculate when your weight or activity level changes significantly.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Distribute calories across balanced macronutrients." },
        { icon: "🏃", label: "Exercise", text: "Increase activity level to raise your TDEE sustainably." },
        { icon: "💧", label: "Hydration", text: "Stay hydrated — dehydration can affect metabolic readings." },
        { icon: "😴", label: "Sleep", text: "Poor sleep can reduce metabolic efficiency." },
        { icon: "📊", label: "Monitoring", text: "Track intake and weight weekly for best accuracy." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildBodyFatModal(result: BodyFatResult): HealthToolModalData {
  const variant: StatusVariant =
    result.category.includes("Athletic") || result.category.includes("Fitness")
      ? "good"
      : result.category.includes("Average")
        ? "moderate"
        : "warning";

  return {
    toolId: "bodyfat",
    icon: "📏",
    iconClass: "green",
    title: "Body Fat Calculator",
    primaryLabel: "Body Fat",
    primaryValue: `${result.value}%`,
    status: { text: result.category, variant },
    sections: [
      {
        title: "Interpretation",
        content: (
          <p>
            Your estimated body fat percentage is <strong>{result.value}%</strong>, classified as{" "}
            <strong>{result.category}</strong> using the US Navy circumference method.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>DEXA scan or hydrostatic weighing provide the most accurate body fat measurements.</li>
            <li>Combine resistance training with adequate protein to improve body composition.</li>
            <li>Track trends over 8–12 weeks rather than single measurements.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Prioritise protein and limit ultra-processed foods." },
        { icon: "🏃", label: "Exercise", text: "Include both strength training and cardio." },
        { icon: "💧", label: "Hydration", text: "Proper hydration supports accurate measurements." },
        { icon: "😴", label: "Sleep", text: "Sleep deprivation can increase body fat retention." },
        { icon: "📊", label: "Monitoring", text: "Remeasure monthly under consistent conditions." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildIdealWeightModal(result: IdealWeightResult): HealthToolModalData {
  return {
    toolId: "idealweight",
    icon: "🎯",
    iconClass: "purple",
    title: "Ideal Weight Calculator",
    primaryLabel: "Ideal Weight",
    primaryValue: `${result.devine} kg`,
    status: { text: "Healthy Range", variant: "good" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <p>
            Based on the Devine formula, your ideal weight is approximately <strong>{result.devine} kg</strong>.
            A healthy range is estimated at <strong>{result.lo} – {result.hi} kg</strong>.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Ideal weight varies by frame size, muscle mass, and individual health factors.</li>
            <li>Use this as a guide alongside BMI and body composition metrics.</li>
            <li>Set realistic, gradual weight goals with your healthcare provider.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Focus on sustainable eating patterns, not crash diets." },
        { icon: "🏃", label: "Exercise", text: "Build lean muscle to support a healthy weight." },
        { icon: "💧", label: "Hydration", text: "Adequate water intake supports metabolic health." },
        { icon: "😴", label: "Sleep", text: "Quality sleep helps regulate appetite hormones." },
        { icon: "📊", label: "Monitoring", text: "Weigh yourself weekly at the same time of day." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildCalorieModal(result: CalorieResult): HealthToolModalData {
  return {
    toolId: "calories",
    icon: "🍽️",
    iconClass: "amber",
    title: "Calorie Calculator",
    primaryLabel: "Daily Target",
    primaryValue: `${result.tdee} kcal`,
    status: { text: "Personalised", variant: "info" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <p>
            Your estimated daily calorie target is <strong>{result.tdee} kcal</strong>. Suggested macronutrients:
            Protein <strong>{result.protein}g</strong>, Carbs <strong>{result.carbs}g</strong>, Fat{" "}
            <strong>{result.fat}g</strong>.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Adjust portions based on hunger, energy levels, and progress.</li>
            <li>Consult a registered dietitian for a personalised meal plan.</li>
            <li>Prioritise whole foods over processed options.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Eat protein with every meal to support satiety." },
        { icon: "🏃", label: "Exercise", text: "Factor in workout calories for accurate tracking." },
        { icon: "💧", label: "Hydration", text: "Sometimes thirst is mistaken for hunger." },
        { icon: "😴", label: "Sleep", text: "Sleep affects hunger hormones ghrelin and leptin." },
        { icon: "📊", label: "Monitoring", text: "Log meals for 2 weeks to identify patterns." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildWaterModal(result: WaterResult): HealthToolModalData {
  return {
    toolId: "water",
    icon: "💧",
    iconClass: "teal",
    title: "Water Intake Calculator",
    primaryLabel: "Daily Intake",
    primaryValue: `${result.litres} L`,
    status: { text: "Hydration Target", variant: "good" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <p>
            Your recommended daily water intake is approximately <strong>{result.litres} litres</strong> (
            {result.cups} cups of 250 ml each), adjusted for your weight, age, activity, and climate.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Increase intake during exercise, hot weather, or illness.</li>
            <li>Monitor urine colour — pale yellow indicates good hydration.</li>
            <li>Spread intake throughout the day rather than drinking large amounts at once.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Water-rich foods like fruits and vegetables count toward hydration." },
        { icon: "🏃", label: "Exercise", text: "Add 500–750 ml per hour of intense exercise." },
        { icon: "💧", label: "Hydration", text: "Keep a reusable bottle visible as a reminder." },
        { icon: "😴", label: "Sleep", text: "Limit fluids 1–2 hours before bed to avoid disruption." },
        { icon: "📊", label: "Monitoring", text: "Track intake with a water tracking app." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildHrModal(result: HrResult): HealthToolModalData {
  return {
    toolId: "heartrate",
    icon: "💓",
    iconClass: "pink",
    title: "Heart Rate Zone Calculator",
    primaryLabel: "Max Heart Rate",
    primaryValue: `${result.max} bpm`,
    status: { text: "Zones Calculated", variant: "info" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <>
            <p>
              Your estimated maximum heart rate is <strong>{result.max} bpm</strong>. Training zones based on heart
              rate reserve:
            </p>
            <ul className="ht-zone-list">
              {result.zones.map((z) => (
                <li key={z.name} style={{ borderLeftColor: z.col }}>
                  <span>{z.name}</span>
                  <strong>
                    {z.lo}–{z.hi} bpm
                  </strong>
                </li>
              ))}
            </ul>
          </>
        ),
      },
      {
        title: "Warnings",
        variant: "warning",
        content: (
          <p>
            Stop exercising immediately if you experience chest pain, dizziness, or unusual shortness of breath.
            Consult your doctor before starting a new exercise programme.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Spend most training time in Zones 2–3 for cardiovascular health.</li>
            <li>Use a heart rate monitor for accuracy during workouts.</li>
            <li>Warm up and cool down in Zone 1 for 5–10 minutes.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Support heart health with omega-3s and low sodium." },
        { icon: "🏃", label: "Exercise", text: "Gradually increase intensity over weeks." },
        { icon: "💧", label: "Hydration", text: "Dehydration elevates heart rate artificially." },
        { icon: "😴", label: "Sleep", text: "Resting heart rate improves with consistent sleep." },
        { icon: "📊", label: "Monitoring", text: "Track resting HR each morning for fitness trends." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildBpModal(result: BpResult): HealthToolModalData {
  const isCrisis = result.category.includes("Crisis");
  return {
    toolId: "bloodpressure",
    icon: "🩺",
    iconClass: "blue",
    title: "Blood Pressure Analysis",
    primaryLabel: "Reading",
    primaryValue: `${result.sys}/${result.dia} mmHg`,
    status: { text: cleanBadge(result.category), variant: isCrisis ? "danger" : riskClsToVariant(result.cls) },
    sections: [
      {
        title: "Interpretation",
        content: <p>{result.advice}</p>,
      },
      ...(isCrisis
        ? [
            {
              title: "Warnings",
              variant: "warning" as const,
              content: (
                <p>
                  <strong>Seek immediate medical attention.</strong> Blood pressure above 180/120 mmHg is a hypertensive
                  crisis and requires emergency care.
                </p>
              ),
            },
          ]
        : []),
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Measure at the same time daily, seated and rested for 5 minutes.</li>
            <li>Reduce sodium intake and limit alcohol consumption.</li>
            <li>Maintain regular physical activity as advised by your doctor.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Follow the DASH diet — rich in potassium, low in sodium." },
        { icon: "🏃", label: "Exercise", text: "30 minutes of moderate activity most days of the week." },
        { icon: "💧", label: "Hydration", text: "Stay hydrated but avoid excessive caffeine." },
        { icon: "😴", label: "Sleep", text: "Aim for 7–8 hours — poor sleep raises blood pressure." },
        { icon: "📊", label: "Monitoring", text: "Keep a blood pressure log to share with your doctor." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildPregnancyModal(result: PregnancyResult): HealthToolModalData {
  return {
    toolId: "pregnancy",
    icon: "🤰",
    iconClass: "pink",
    title: "Pregnancy Due Date Calculator",
    primaryLabel: "Estimated Due Date (EDD)",
    primaryValue: result.edd,
    status: { text: result.weeksText, variant: "info" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <>
            <p>
              Your estimated due date is <strong>{result.edd}</strong>. {result.weeksText}.
            </p>
            <p>{result.trimester}</p>
            <p>{result.babySize}</p>
            <ul className="ht-trimester-list">
              <li className="ht-trimester--t1">1st Trimester: Weeks 1–13 (ends {result.t1End})</li>
              <li className="ht-trimester--t2">2nd Trimester: Weeks 14–27 (ends {result.t2End})</li>
              <li className="ht-trimester--t3">3rd Trimester: Weeks 28–40 (due {result.eddShort})</li>
            </ul>
            <div className="ht-milestone-list">
              {result.milestones.map((m) => (
                <div key={m.week} className="ht-milestone-row">
                  <span className="ht-milestone-icon" aria-hidden>
                    🗓️
                  </span>
                  <span className="ht-milestone-text">
                    <span className="ht-milestone-week">Week {m.week}</span>{" "}
                    <span className="ht-milestone-date">({m.date})</span> — {m.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        title: "Warnings",
        variant: "warning",
        content: (
          <p>
            EDD is an estimate — only about 5% of babies are born on their due date. Ultrasound dating is the most
            accurate method.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Schedule your first prenatal visit within the first 8–10 weeks.</li>
            <li>Begin prenatal vitamins with folic acid if not already taking them.</li>
            <li>Avoid alcohol, smoking, and unpasteurised foods.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Eat a balanced diet with extra iron and calcium." },
        { icon: "🏃", label: "Exercise", text: "Continue moderate activity unless advised otherwise." },
        { icon: "💧", label: "Hydration", text: "Increase water intake during pregnancy." },
        { icon: "😴", label: "Sleep", text: "Rest when tired — your body is working hard." },
        { icon: "📊", label: "Monitoring", text: "Attend all scheduled prenatal appointments." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildOvulationModal(result: OvulationResult): HealthToolModalData {
  return {
    toolId: "ovulation",
    icon: "🌸",
    iconClass: "purple",
    title: "Pregnancy Planner (Ovulation Calculator)",
    primaryLabel: "Your Fertility Insights",
    primaryValue: result.ovDate,
    status: { text: "Fertile Window", variant: "info" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <>
            <p>{result.window}</p>
            <p>{result.nextPeriod}</p>
            {result.irregular && (
              <div className="ht-milestone-row">
                <span className="ht-milestone-icon" aria-hidden>
                  ⚠️
                </span>
                <span className="ht-milestone-text">
                  Irregular cycles make prediction less reliable — track a few cycles or confirm with an ovulation test.
                </span>
              </div>
            )}
          </>
        ),
      },
      {
        title: "Warnings",
        variant: "warning",
        content: (
          <p>
            Fertile window usually spans 5 days before ovulation and 1 day after. Irregular cycles or medical conditions
            may affect accuracy.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Track basal body temperature and cervical mucus for improved accuracy.</li>
            <li>Maintain a healthy BMI — extremes can affect ovulation.</li>
            <li>Consider ovulation predictor kits for more precise timing.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Folic acid and healthy fats support reproductive health." },
        { icon: "🏃", label: "Exercise", text: "Moderate exercise supports hormonal balance." },
        { icon: "💧", label: "Hydration", text: "Stay well-hydrated throughout your cycle." },
        { icon: "😴", label: "Sleep", text: "Aim for consistent sleep to regulate hormones." },
        { icon: "📊", label: "Monitoring", text: "Use a cycle tracking app for pattern recognition." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildPeriodTrackerModal(result: PeriodTrackerResult): HealthToolModalData {
  return {
    toolId: "period-tracker",
    icon: "🩸",
    iconClass: "pink",
    title: "Menstrual Period Tracker",
    primaryLabel: "Cycle Overview",
    primaryValue: result.nextPeriod,
    status: { text: "Next Period", variant: "info" },
    sections: [
      {
        title: "Interpretation",
        content: (
          <>
            <p>{result.periodEnd}</p>
            <p>{result.ovulationDay}</p>
            <p>{result.fertileWindow}</p>
            <div className="ht-milestone-list">
              <p className="ht-upcoming-label">Upcoming Cycles</p>
              {result.upcomingCycles.map((cycle) => (
                <div key={cycle.label} className="ht-milestone-row">
                  <span className="ht-milestone-icon" aria-hidden>
                    🩸
                  </span>
                  <span className="ht-milestone-text">
                    <span className="ht-milestone-week">{cycle.label}</span> —{" "}
                    <span className="ht-milestone-date">{cycle.date}</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        title: "Warnings",
        variant: "warning",
        content: (
          <p>
            Results are estimates based on a regular cycle. Actual dates may vary due to stress, hormones or health
            conditions.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Track your cycle for at least 3 months to identify patterns.</li>
            <li>Note symptoms like cramps, mood changes, and flow intensity.</li>
            <li>Consult your gynaecologist if cycles are consistently irregular.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Iron-rich foods can help during menstruation." },
        { icon: "🏃", label: "Exercise", text: "Light activity may ease PMS symptoms." },
        { icon: "💧", label: "Hydration", text: "Stay hydrated to reduce bloating." },
        { icon: "😴", label: "Sleep", text: "Prioritise rest during your period." },
        { icon: "📊", label: "Monitoring", text: "Use a period tracking app for long-term insights." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildRiskModal(
  toolId: string,
  icon: string,
  iconClass: HealthToolModalData["iconClass"],
  title: string,
  primaryLabel: string,
  primaryValue: string,
  result: RiskResult,
  interpretation: string,
  extraWarnings?: string,
): HealthToolModalData {
  const sections: ResultSection[] = [
    {
      title: "Interpretation",
      content: <p>{interpretation}</p>,
    },
    {
      title: "Recommendations",
      content: <p>{result.advice}</p>,
    },
    lifestyleTips([
      { icon: "🥗", label: "Diet", text: "Eat a balanced, whole-food diet low in processed sugars." },
      { icon: "🏃", label: "Exercise", text: "Aim for 30 minutes of activity on most days." },
      { icon: "💧", label: "Hydration", text: "Limit sugary drinks; choose water as your primary beverage." },
      { icon: "😴", label: "Sleep", text: "Prioritise 7–9 hours of restorative sleep." },
      { icon: "📊", label: "Monitoring", text: "Schedule regular check-ups with your healthcare provider." },
    ]),
    DISCLAIMER,
  ];

  if (extraWarnings || result.cls.includes("high")) {
    sections.splice(1, 0, {
      title: "Warnings",
      variant: "warning",
      content: <p>{extraWarnings ?? "Your score suggests elevated risk. Please consult a healthcare professional for proper evaluation."}</p>,
    });
  }

  return {
    toolId,
    icon,
    iconClass,
    title,
    primaryLabel,
    primaryValue,
    status: { text: cleanBadge(result.badge), variant: riskClsToVariant(result.cls) },
    sections,
  };
}

export function buildDiabetesModal(result: RiskResult, score: number): HealthToolModalData {
  return buildRiskModal(
    "diabetes",
    "🩸",
    "amber",
    "Diabetes Risk Assessment",
    "Risk Score",
    `${score} points`,
    result,
    `Your diabetes risk screening score is ${score}. This is based on the ADA validated risk questionnaire and is a screening tool only.`,
    "Only a blood glucose test (HbA1c or fasting glucose) can diagnose diabetes. Please see your doctor for testing.",
  );
}

export function buildSmokingModal(result: SmokingResult): HealthToolModalData {
  const variant: StatusVariant =
    result.packYears < 10 ? "moderate" : result.packYears < 20 ? "warning" : "danger";

  return {
    toolId: "smoking",
    icon: "🚭",
    iconClass: "green",
    title: "Smoking Risk Calculator",
    primaryLabel: "Pack Years",
    primaryValue: `${result.packYears}`,
    status: {
      text: variant === "moderate" ? "Moderate Risk" : variant === "warning" ? "Elevated Risk" : "High Risk",
      variant,
    },
    sections: [
      {
        title: "Interpretation",
        content: <p>{result.risk}</p>,
      },
      {
        title: "Warnings",
        variant: "warning",
        content: (
          <p>
            No level of smoking is safe. Smoking is a leading cause of lung cancer, COPD, heart disease, and
            stroke. Quitting at any age provides immediate and long-term health benefits.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Speak to your doctor about cessation support — nicotine replacement, medications, or counselling.</li>
            <li>Call a quitline for free support: many countries offer 24/7 helplines.</li>
            <li>Annual low-dose CT screening may be recommended for long-term smokers.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Healthy eating supports recovery after quitting." },
        { icon: "🏃", label: "Exercise", text: "Physical activity reduces cravings and withdrawal symptoms." },
        { icon: "💧", label: "Hydration", text: "Drink water when cravings strike." },
        { icon: "😴", label: "Sleep", text: "Rest well — fatigue increases urge to smoke." },
        { icon: "📊", label: "Monitoring", text: "Track smoke-free days to celebrate milestones." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildKidneyModal(result: KidneyResult): HealthToolModalData {
  const variant: StatusVariant =
    result.egfr >= 90 ? "good" : result.egfr >= 60 ? "moderate" : result.egfr >= 30 ? "warning" : "danger";

  return {
    toolId: "kidney",
    icon: "🫘",
    iconClass: "blue",
    title: "eGFR / Kidney Function",
    primaryLabel: "eGFR",
    primaryValue: `${result.egfr} mL/min`,
    status: { text: result.stage, variant },
    sections: [
      {
        title: "Interpretation",
        content: (
          <p>
            Your estimated glomerular filtration rate (eGFR) is <strong>{result.egfr} mL/min/1.73m²</strong>,
            corresponding to <strong>{result.stage}</strong>.
          </p>
        ),
      },
      {
        title: "Warnings",
        variant: "warning",
        content: (
          <p>
            eGFR requires a laboratory creatinine result. CKD staging requires clinical evaluation by a
            nephrologist — do not self-diagnose based on this estimate alone.
          </p>
        ),
      },
      {
        title: "Recommendations",
        content: (
          <ul className="ht-bullet-list">
            <li>Control blood pressure and blood sugar to protect kidney function.</li>
            <li>Limit NSAIDs (ibuprofen, naproxen) unless prescribed.</li>
            <li>Follow a kidney-friendly diet if advised by your doctor.</li>
          </ul>
        ),
      },
      lifestyleTips([
        { icon: "🥗", label: "Diet", text: "Reduce sodium and monitor protein intake if CKD is present." },
        { icon: "🏃", label: "Exercise", text: "Regular moderate activity supports cardiovascular and kidney health." },
        { icon: "💧", label: "Hydration", text: "Stay hydrated unless fluid restriction is prescribed." },
        { icon: "😴", label: "Sleep", text: "Adequate sleep supports overall metabolic health." },
        { icon: "📊", label: "Monitoring", text: "Repeat eGFR and creatinine tests as directed by your doctor." },
      ]),
      DISCLAIMER,
    ],
  };
}

export function buildPhqModal(result: RiskResult, score: number): HealthToolModalData {
  return buildRiskModal(
    "mentalhealth",
    "🧠",
    "purple",
    "PHQ-9 Depression Screening",
    "PHQ-9 Score",
    `${score} / 27`,
    result,
    `Your PHQ-9 score is ${score} out of 27. This screening tool measures depression severity over the past 2 weeks.`,
    score >= 9
      ? "If you are having thoughts of self-harm, please call a crisis line immediately: 988 Suicide & Crisis Lifeline (call or text 988)."
      : undefined,
  );
}

export function buildSymptomModal(result: RiskResult): HealthToolModalData {
  return buildRiskModal(
    "symptom",
    "🔎",
    "teal",
    "Symptom Checker",
    "Assessment",
    cleanBadge(result.badge),
    result,
    result.advice,
    result.cls.includes("high")
      ? "If symptoms are severe, sudden, or worsening, seek emergency medical care immediately."
      : undefined,
  );
}
