"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import "@/styles/health-tools-page.css";
import { CategorySection, CATEGORY_TAB } from "@/components/health-tools/CategorySection";
import { CalculatorCard } from "@/components/health-tools/CalculatorCard";
import { CalcButton } from "@/components/health-tools/CalcButton";
import { formNum, formStr } from "@/components/health-tools/form-fields";
import {
  BmiInlineResult,
  BmrInlineResult,
  BodyFatInlineResult,
  BpInlineResult,
  CalorieInlineResult,
  HrInlineResult,
  IdealWeightInlineResult,
  KidneyInlineResult,
  riskBadgeProps,
  SmokingInlineResult,
  WaterInlineResult,
} from "@/components/health-tools/InlineToolResults";
import { RelatedTags, ResultBox, RiskResultBox, ToolDisclaimer } from "@/components/health-tools/tool-shared";
import { WomensHealthTools } from "@/components/health-tools/WomensHealthTools";
import { HEALTH_TOOL_COUNT } from "@/config/health-tools";
import { useTrackHealthTool } from "@/hooks/use-track-health-tool";
import {
  calcBMI,
  calcBMR,
  calcBodyFat,
  calcBP,
  calcCalories,
  calcDiabetes,
  calcHR,
  calcIdealWeight,
  calcKidney,
  calcPHQ9,
  calcSmoking,
  calcWater,
  checkSymptom,
  type BmiResult,
  type BmrResult,
  type BodyFatResult,
  type BpResult,
  type CalorieResult,
  type HrResult,
  type IdealWeightResult,
  type KidneyResult,
  type RiskResult,
  type SmokingResult,
  type WaterResult,
} from "./calculators";

const HERO_PILLS = ["✅ Medically Reviewed", "🆓 100% Free", "🔒 Private & Secure", "📱 Mobile Friendly"];

const TOOL_TABS = [
  "All Tools",
  "Body & Weight",
  "Nutrition",
  "Heart & Blood",
  "Women's Health",
  "Risk Assessment",
  "Mental Health",
] as const;

const PHQ_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you're a failure",
  "Trouble concentrating on things",
  "Moving/speaking slowly — or being fidgety/restless",
  "Thoughts that you would be better off dead or of hurting yourself",
];

export default function HealthToolsPage() {
  const track = useTrackHealthTool();
  const [activeTab, setActiveTab] = useState<number>(CATEGORY_TAB.ALL);
  const [tabAnimKey, setTabAnimKey] = useState(0);
  const [bfSex, setBfSex] = useState("");
  const [phqScores, setPhqScores] = useState<number[]>(Array(9).fill(0));
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);
  const [bmrResult, setBmrResult] = useState<BmrResult | null>(null);
  const [bodyFatResult, setBodyFatResult] = useState<BodyFatResult | null>(null);
  const [idealWeightResult, setIdealWeightResult] = useState<IdealWeightResult | null>(null);
  const [calorieResult, setCalorieResult] = useState<CalorieResult | null>(null);
  const [waterResult, setWaterResult] = useState<WaterResult | null>(null);
  const [hrResult, setHrResult] = useState<HrResult | null>(null);
  const [bpResult, setBpResult] = useState<BpResult | null>(null);
  const [diabetesResult, setDiabetesResult] = useState<RiskResult | null>(null);
  const [smokingResult, setSmokingResult] = useState<SmokingResult | null>(null);
  const [kidneyResult, setKidneyResult] = useState<KidneyResult | null>(null);
  const [phqResult, setPhqResult] = useState<RiskResult | null>(null);
  const [symptomResult, setSymptomResult] = useState<RiskResult | null>(null);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setTabAnimKey((k) => k + 1);
  }, []);

  const runCalc = useCallback(
    async (toolId: string, fn: () => void) => {
      setLoadingId(toolId);
      await new Promise((r) => setTimeout(r, 200));
      fn();
      track(toolId);
      setLoadingId(null);
    },
    [track],
  );

  return (
    <div className="health-tools-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">Free Medical Calculators</div>
          <h1>Your Personal Health Tools Hub</h1>
          <p>
            {HEALTH_TOOL_COUNT}+ evidence-based, medically reviewed health calculators — designed by our physicians to
            help you understand and monitor your health metrics.
          </p>
          <div className="hero-pills">
            {HERO_PILLS.map((pill) => (
              <div key={pill} className="hero-pill">
                {pill}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tools-main">
        <div className="section-header">
          <div className="eyebrow-blue">Browse by Category</div>
          <h2>All Health Tools & Calculators</h2>
          <p>
            Select a category below or scroll to explore all tools. Results are estimates — always consult your doctor
            for medical decisions.
          </p>
        </div>

        <div className="tools-nav" role="tablist" aria-label="Health calculator categories">
          {TOOL_TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === i}
              className={`tool-tab${activeTab === i ? " active" : ""}`}
              onClick={() => handleTabChange(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <CategorySection
          tabIndex={CATEGORY_TAB.BODY}
          activeTab={activeTab}
          animationKey={tabAnimKey}
          emoji="⚖️"
          title="Body & Weight Tools"
          subtitle="Calculate your key body composition metrics used by physicians worldwide"
        >
          <CalculatorCard
            id="bmi"
            icon="⚖️"
            iconClass="blue"
            title="BMI Calculator"
            description="Calculate your Body Mass Index to understand if your weight is in a healthy range for your height."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("bmi", () => setBmiResult(calcBMI(formNum("bmi-weight", f), formNum("bmi-height", f))));
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bmi-weight">Weight (kg)</label>
                  <input type="number" id="bmi-weight" name="bmi-weight" placeholder="70" min={20} max={300} />
                </div>
                <div className="form-group">
                  <label htmlFor="bmi-height">Height (cm)</label>
                  <input type="number" id="bmi-height" name="bmi-height" placeholder="170" min={100} max={250} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bmi-age">Age</label>
                  <input type="number" id="bmi-age" name="bmi-age" placeholder="30" min={2} max={100} />
                </div>
                <div className="form-group">
                  <label htmlFor="bmi-sex">Sex</label>
                  <select id="bmi-sex" name="bmi-sex" defaultValue="">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "bmi"}>Calculate BMI</CalcButton>
            </form>
            <ResultBox show={Boolean(bmiResult)} title="Your BMI" toolTitle="BMI Calculator">
              {bmiResult ? <BmiInlineResult result={bmiResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ BMI is a screening tool only, not a diagnostic measure. Consult your doctor for a full assessment.
            </ToolDisclaimer>
            <RelatedTags tags={["Healthy Weight Guide", "Obesity & Health Risks", "Weight Loss Tips"]} />
          </CalculatorCard>

          <CalculatorCard
            id="bmr"
            icon="🔥"
            iconClass="teal"
            title="BMR Calculator"
            description="Find your Basal Metabolic Rate — the number of calories your body needs at complete rest to maintain basic functions."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("bmr", () =>
                  setBmrResult(
                    calcBMR(
                      formNum("bmr-weight", f),
                      formNum("bmr-height", f),
                      formNum("bmr-age", f),
                      formStr("bmr-sex", f),
                      formNum("bmr-act", f),
                    ),
                  ),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bmr-weight">Weight (kg)</label>
                  <input type="number" id="bmr-weight" name="bmr-weight" placeholder="70" min={20} max={300} />
                </div>
                <div className="form-group">
                  <label htmlFor="bmr-height">Height (cm)</label>
                  <input type="number" id="bmr-height" name="bmr-height" placeholder="170" min={100} max={250} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bmr-age">Age</label>
                  <input type="number" id="bmr-age" name="bmr-age" placeholder="30" min={15} max={100} />
                </div>
                <div className="form-group">
                  <label htmlFor="bmr-sex">Sex</label>
                  <select id="bmr-sex" name="bmr-sex" defaultValue="">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="bmr-act">Activity Level</label>
                  <select id="bmr-act" name="bmr-act" defaultValue="1.2">
                    <option value="1.2">Sedentary (little or no exercise)</option>
                    <option value="1.375">Light (1–3 days/week)</option>
                    <option value="1.55">Moderate (3–5 days/week)</option>
                    <option value="1.725">Active (6–7 days/week)</option>
                    <option value="1.9">Very Active (physical job + exercise)</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "bmr"}>Calculate BMR & TDEE</CalcButton>
            </form>
            <ResultBox show={Boolean(bmrResult)} title="Basal Metabolic Rate (BMR)" toolTitle="BMR Calculator">
              {bmrResult ? <BmrInlineResult result={bmrResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ These are estimates based on the Mifflin-St Jeor equation. Individual metabolism varies.
            </ToolDisclaimer>
            <RelatedTags tags={["Nutrition Planning", "Weight Management"]} />
          </CalculatorCard>

          <CalculatorCard
            id="bodyfat"
            icon="📏"
            iconClass="green"
            title="Body Fat Calculator"
            description="Estimate your body fat percentage using the US Navy method based on circumference measurements."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("bodyfat", () =>
                  setBodyFatResult(
                    calcBodyFat(
                      formStr("bf-sex", f),
                      formNum("bf-height", f),
                      formNum("bf-waist", f),
                      formNum("bf-neck", f),
                      formNum("bf-hip", f),
                    ),
                  ),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bf-sex">Sex</label>
                  <select id="bf-sex" name="bf-sex" value={bfSex} onChange={(e) => setBfSex(e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="bf-height">Height (cm)</label>
                  <input type="number" id="bf-height" name="bf-height" placeholder="170" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bf-waist">Waist (cm)</label>
                  <input type="number" id="bf-waist" name="bf-waist" placeholder="85" />
                </div>
                <div className="form-group">
                  <label htmlFor="bf-neck">Neck (cm)</label>
                  <input type="number" id="bf-neck" name="bf-neck" placeholder="38" />
                </div>
              </div>
              {bfSex === "female" && (
                <div className="form-row single">
                  <div className="form-group">
                    <label htmlFor="bf-hip">Hip (cm) — women only</label>
                    <input type="number" id="bf-hip" name="bf-hip" placeholder="95" />
                  </div>
                </div>
              )}
              <CalcButton loading={loadingId === "bodyfat"}>Calculate Body Fat %</CalcButton>
            </form>
            <ResultBox show={Boolean(bodyFatResult)} title="Estimated Body Fat" toolTitle="Body Fat Calculator">
              {bodyFatResult ? <BodyFatInlineResult result={bodyFatResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ This is an estimate. DEXA scan or hydrostatic weighing are the gold standards for body fat measurement.
            </ToolDisclaimer>
            <RelatedTags tags={["Healthy Body Composition", "Strength Training"]} />
          </CalculatorCard>

          <CalculatorCard
            id="idealweight"
            icon="🎯"
            iconClass="purple"
            title="Ideal Weight Calculator"
            description="Find your ideal body weight range using multiple clinical formulas (Hamwi, Devine, Robinson, Miller)."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("idealweight", () =>
                  setIdealWeightResult(calcIdealWeight(formNum("iw-height", f), formStr("iw-sex", f))),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="iw-height">Height (cm)</label>
                  <input type="number" id="iw-height" name="iw-height" placeholder="170" min={100} max={250} />
                </div>
                <div className="form-group">
                  <label htmlFor="iw-sex">Sex</label>
                  <select id="iw-sex" name="iw-sex" defaultValue="">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="iw-frame">Frame Size</label>
                  <select id="iw-frame" name="iw-frame" defaultValue="medium">
                    <option value="medium">Medium (average)</option>
                    <option value="small">Small</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "idealweight"}>Calculate Ideal Weight</CalcButton>
            </form>
            <ResultBox show={Boolean(idealWeightResult)} title="Ideal Weight Range" toolTitle="Ideal Weight Calculator">
              {idealWeightResult ? <IdealWeightInlineResult result={idealWeightResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ Ideal weight varies by individual. Frame size, muscle mass, and health conditions all play a role.
            </ToolDisclaimer>
            <RelatedTags tags={["Weight Goals", "BMI Chart"]} />
          </CalculatorCard>
        </CategorySection>

        <CategorySection
          tabIndex={CATEGORY_TAB.NUTRITION}
          activeTab={activeTab}
          animationKey={tabAnimKey}
          spaced
          emoji="🍎"
          title="Nutrition & Hydration"
          subtitle="Personalised daily targets for calories and water based on your body and lifestyle"
        >
          <CalculatorCard
            id="calories"
            icon="🍽️"
            iconClass="amber"
            title="Calorie Calculator"
            description="Calculate your daily calorie needs to maintain, lose, or gain weight based on your personal goals."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("calories", () =>
                  setCalorieResult(
                    calcCalories(
                      formNum("cal-weight", f),
                      formNum("cal-height", f),
                      formNum("cal-age", f),
                      formStr("cal-sex", f),
                      formNum("cal-goal", f),
                    ),
                  ),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cal-weight">Weight (kg)</label>
                  <input type="number" id="cal-weight" name="cal-weight" placeholder="70" />
                </div>
                <div className="form-group">
                  <label htmlFor="cal-height">Height (cm)</label>
                  <input type="number" id="cal-height" name="cal-height" placeholder="170" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cal-age">Age</label>
                  <input type="number" id="cal-age" name="cal-age" placeholder="30" />
                </div>
                <div className="form-group">
                  <label htmlFor="cal-sex">Sex</label>
                  <select id="cal-sex" name="cal-sex" defaultValue="Male">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="cal-goal">Goal</label>
                  <select id="cal-goal" name="cal-goal" defaultValue="0">
                    <option value="0">Maintain weight</option>
                    <option value="-500">Lose weight (−0.5 kg/week)</option>
                    <option value="-1000">Lose weight fast (−1 kg/week)</option>
                    <option value="500">Gain weight (+0.5 kg/week)</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "calories"}>Calculate Daily Calories</CalcButton>
            </form>
            <ResultBox show={Boolean(calorieResult)} title="Daily Calorie Target" toolTitle="Calorie Calculator">
              {calorieResult ? <CalorieInlineResult result={calorieResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ These are general estimates. Individual needs vary. Consult a registered dietitian for a personalised
              plan.
            </ToolDisclaimer>
            <RelatedTags tags={["Healthy Eating Guide", "Macronutrient Basics"]} />
          </CalculatorCard>

          <CalculatorCard
            id="water"
            icon="💧"
            iconClass="teal"
            title="Water Intake Calculator"
            description="Find your optimal daily water intake to stay hydrated based on your weight, climate, and activity level."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("water", () =>
                  setWaterResult(
                    calcWater(formNum("wa-weight", f), formNum("wa-age", f), formNum("wa-act", f), formNum("wa-climate", f)),
                  ),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="wa-weight">Weight (kg)</label>
                  <input type="number" id="wa-weight" name="wa-weight" placeholder="70" />
                </div>
                <div className="form-group">
                  <label htmlFor="wa-age">Age</label>
                  <input type="number" id="wa-age" name="wa-age" placeholder="30" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="wa-act">Activity Level</label>
                  <select id="wa-act" name="wa-act" defaultValue="0">
                    <option value="0">Sedentary</option>
                    <option value="0.35">Moderately Active</option>
                    <option value="0.7">Very Active</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="wa-climate">Climate</label>
                  <select id="wa-climate" name="wa-climate" defaultValue="0">
                    <option value="0">Temperate</option>
                    <option value="0.5">Hot / Humid</option>
                    <option value="0.25">Dry / High Altitude</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "water"}>Calculate Water Intake</CalcButton>
            </form>
            <ResultBox show={Boolean(waterResult)} title="Daily Water Intake" toolTitle="Water Intake Calculator">
              {waterResult ? <WaterInlineResult result={waterResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ Needs vary with health status, medications, and illness. Increase intake if exercising heavily or in hot
              weather.
            </ToolDisclaimer>
            <RelatedTags tags={["Dehydration Signs", "Hydration & Health"]} />
          </CalculatorCard>
        </CategorySection>

        <CategorySection
          tabIndex={CATEGORY_TAB.HEART}
          activeTab={activeTab}
          animationKey={tabAnimKey}
          spaced
          emoji="❤️"
          title="Heart & Blood Health"
          subtitle="Monitor your cardiovascular health metrics with these clinically validated tools"
        >
          <CalculatorCard
            id="heartrate"
            icon="💓"
            iconClass="pink"
            title="Heart Rate Zone Calculator"
            description="Calculate your maximum heart rate and target heart rate zones for safe and effective cardiovascular training."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("heartrate", () => setHrResult(calcHR(formNum("hr-age", f), formNum("hr-rest", f))));
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="hr-age">Age</label>
                  <input type="number" id="hr-age" name="hr-age" placeholder="35" min={15} max={100} />
                </div>
                <div className="form-group">
                  <label htmlFor="hr-rest">Resting HR (bpm)</label>
                  <input type="number" id="hr-rest" name="hr-rest" placeholder="70" min={40} max={120} />
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="hr-fit">Fitness Level</label>
                  <select id="hr-fit" name="hr-fit" defaultValue="intermediate">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced / Athlete</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "heartrate"}>Calculate Heart Rate Zones</CalcButton>
            </form>
            <ResultBox show={Boolean(hrResult)} title="Maximum Heart Rate" toolTitle="Heart Rate Zone Calculator">
              {hrResult ? <HrInlineResult result={hrResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ Stop exercising immediately if you experience chest pain, dizziness, or shortness of breath.
            </ToolDisclaimer>
            <RelatedTags tags={["Cardio Training", "Heart Health Guide"]} />
          </CalculatorCard>

          <CalculatorCard
            id="bloodpressure"
            icon="🩺"
            iconClass="blue"
            title="Blood Pressure Tracker"
            description="Enter your blood pressure reading to understand your category and receive personalised guidance."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("bloodpressure", () => setBpResult(calcBP(formNum("bp-sys", f), formNum("bp-dia", f))));
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bp-sys">Systolic (mmHg)</label>
                  <input type="number" id="bp-sys" name="bp-sys" placeholder="120" min={60} max={250} />
                </div>
                <div className="form-group">
                  <label htmlFor="bp-dia">Diastolic (mmHg)</label>
                  <input type="number" id="bp-dia" name="bp-dia" placeholder="80" min={40} max={150} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bp-age">Age</label>
                  <input type="number" id="bp-age" name="bp-age" placeholder="40" />
                </div>
                <div className="form-group">
                  <label htmlFor="bp-time">When measured?</label>
                  <select id="bp-time" name="bp-time" defaultValue="Morning (before meals)">
                    <option>Morning (before meals)</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "bloodpressure"}>Analyse Reading</CalcButton>
            </form>
            <ResultBox show={Boolean(bpResult)} title="Blood Pressure Category" toolTitle="Blood Pressure Tracker">
              {bpResult ? <BpInlineResult result={bpResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ A single reading is not diagnostic. Monitor regularly and consult your doctor if readings are consistently
              elevated.
            </ToolDisclaimer>
            <RelatedTags tags={["Hypertension Guide", "Heart-Healthy Diet"]} />
          </CalculatorCard>
        </CategorySection>

        <CategorySection
          tabIndex={CATEGORY_TAB.WOMENS}
          activeTab={activeTab}
          animationKey={tabAnimKey}
          spaced
          emoji="🤰"
          title="Women's Health"
          subtitle="Reproductive health calculators designed with obstetricians and gynaecologists"
        >
          <WomensHealthTools />
        </CategorySection>

        <CategorySection
          tabIndex={CATEGORY_TAB.RISK}
          activeTab={activeTab}
          animationKey={tabAnimKey}
          spaced
          emoji="🩸"
          title="Risk Assessment Tools"
          subtitle="Clinically validated screening tools to assess your risk for common conditions"
        >
          <CalculatorCard
            id="diabetes"
            icon="🩸"
            iconClass="amber"
            title="Diabetes Risk Assessment"
            description="Assess your risk of developing Type 2 diabetes using the validated ADA risk screening questionnaire."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("diabetes", () => {
                  const scores = [
                    formNum("db-age", f),
                    formNum("db-bmi", f),
                    formNum("db-fam", f),
                    formNum("db-act", f),
                    formNum("db-bp", f),
                    formNum("db-gest", f),
                  ];
                  setDiabetesResult(calcDiabetes(scores));
                });
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="db-age">Age</label>
                  <select id="db-age" name="db-age" defaultValue="0">
                    <option value="0">Under 40</option>
                    <option value="1">40–49</option>
                    <option value="2">50–59</option>
                    <option value="3">60+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="db-bmi">BMI</label>
                  <select id="db-bmi" name="db-bmi" defaultValue="0">
                    <option value="0">Under 25 (Normal)</option>
                    <option value="1">25–30 (Overweight)</option>
                    <option value="2">30–40 (Obese)</option>
                    <option value="3">Over 40</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="db-fam">Family History</label>
                  <select id="db-fam" name="db-fam" defaultValue="0">
                    <option value="0">No family history</option>
                    <option value="1">Parent or sibling</option>
                    <option value="2">Both parents</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="db-act">Physical Activity</label>
                  <select id="db-act" name="db-act" defaultValue="1">
                    <option value="1">Active (30+ min/day)</option>
                    <option value="0">Not very active</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="db-bp">High Blood Pressure?</label>
                  <select id="db-bp" name="db-bp" defaultValue="0">
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="db-gest">Gestational Diabetes?</label>
                  <select id="db-gest" name="db-gest" defaultValue="0">
                    <option value="0">No / N/A</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "diabetes"}>Assess My Risk</CalcButton>
            </form>
            {diabetesResult ? (
              <RiskResultBox show toolTitle="Diabetes Risk Assessment" {...riskBadgeProps(diabetesResult)} />
            ) : null}
            <ToolDisclaimer>
              ⚠️ This is a screening tool, not a diagnostic test. Only a blood glucose test (HbA1c or fasting glucose)
              can diagnose diabetes.
            </ToolDisclaimer>
            <RelatedTags tags={["Type 2 Diabetes Guide", "Blood Sugar Management"]} />
          </CalculatorCard>

          <CalculatorCard
            id="smoking"
            icon="🚭"
            iconClass="green"
            title="Smoking Risk Calculator"
            description="Understand your cumulative smoking exposure (pack years) and associated health risks including lung cancer and COPD."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("smoking", () =>
                  setSmokingResult(calcSmoking(formNum("sm-cpd", f), formNum("sm-yrs", f))),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sm-cpd">Cigarettes/day</label>
                  <input type="number" id="sm-cpd" name="sm-cpd" placeholder="20" min={1} max={100} />
                </div>
                <div className="form-group">
                  <label htmlFor="sm-yrs">Years smoked</label>
                  <input type="number" id="sm-yrs" name="sm-yrs" placeholder="10" min={1} max={70} />
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="sm-status">Current Status</label>
                  <select id="sm-status" name="sm-status" defaultValue="current">
                    <option value="current">Current smoker</option>
                    <option value="former">Former smoker</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "smoking"}>Calculate Smoking Risk</CalcButton>
            </form>
            <ResultBox show={Boolean(smokingResult)} title="Pack Years" toolTitle="Smoking Risk Calculator">
              {smokingResult ? <SmokingInlineResult result={smokingResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ No level of smoking is safe. Quitting at any age has immediate and long-term health benefits. Speak to
              your doctor about cessation support.
            </ToolDisclaimer>
            <RelatedTags tags={["Quitting Smoking Guide", "Lung Health", "COPD Risk"]} />
          </CalculatorCard>

          <CalculatorCard
            id="kidney"
            icon="🫘"
            iconClass="blue"
            title="eGFR / Kidney Function Calculator"
            description="Estimate your kidney function using the CKD-EPI equation based on your serum creatinine level."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("kidney", () =>
                  setKidneyResult(
                    calcKidney(formNum("kd-creat", f), formNum("kd-age", f), formStr("kd-sex", f), formStr("kd-race", f)),
                  ),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="kd-creat">Serum Creatinine (mg/dL)</label>
                  <input type="number" id="kd-creat" name="kd-creat" placeholder="1.0" step="0.1" min={0.1} max={20} />
                </div>
                <div className="form-group">
                  <label htmlFor="kd-age">Age</label>
                  <input type="number" id="kd-age" name="kd-age" placeholder="45" min={18} max={100} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="kd-sex">Sex</label>
                  <select id="kd-sex" name="kd-sex" defaultValue="male">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="kd-race">Race</label>
                  <select id="kd-race" name="kd-race" defaultValue="other">
                    <option value="other">Non-Black</option>
                    <option value="black">Black</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "kidney"}>Calculate eGFR</CalcButton>
            </form>
            <ResultBox show={Boolean(kidneyResult)} title="Estimated GFR (eGFR)" toolTitle="eGFR Calculator">
              {kidneyResult ? <KidneyInlineResult result={kidneyResult} /> : null}
            </ResultBox>
            <ToolDisclaimer>
              ⚠️ eGFR requires a lab creatinine result. This calculator is for educational purposes only — CKD staging
              requires clinical evaluation.
            </ToolDisclaimer>
            <RelatedTags tags={["Kidney Disease Guide", "CKD Stages"]} />
          </CalculatorCard>
        </CategorySection>

        <CategorySection
          tabIndex={CATEGORY_TAB.MENTAL}
          activeTab={activeTab}
          animationKey={tabAnimKey}
          spaced
          emoji="🧘"
          title="Mental Health Screening"
          subtitle="Validated screening tools used in clinical practice — not diagnostic, but an important first step"
        >
          <CalculatorCard
            id="mentalhealth"
            icon="🧠"
            iconClass="purple"
            title="PHQ-9 Depression Screening"
            description="The PHQ-9 is the gold-standard clinical screening tool for depression severity, used by doctors worldwide."
          >
            <p className="phq-intro">
              Over the <strong>last 2 weeks</strong>, how often have you been bothered by the following?{" "}
              <em>(0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day)</em>
            </p>
            <div className="phq-questions">
              {PHQ_QUESTIONS.map((q, i) => (
                <div key={q} className={`phq-row${i === 8 ? " critical" : ""}`}>
                  <span>{q}</span>
                  <select
                    className="phq-select"
                    value={phqScores[i]}
                    onChange={(e) => {
                      const next = [...phqScores];
                      next[i] = Number(e.target.value);
                      setPhqScores(next);
                    }}
                    aria-label={`Question ${i + 1} score`}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              ))}
            </div>
            <CalcButton
              type="button"
              loading={loadingId === "mentalhealth"}
              onClick={() => {
                void runCalc("mentalhealth", () => {
                  const score = phqScores.reduce((a, b) => a + b, 0);
                  setPhqResult(calcPHQ9(score));
                });
              }}
            >
              Calculate Score
            </CalcButton>
            {phqResult ? (
              <RiskResultBox show toolTitle="PHQ-9 Depression Screening" {...riskBadgeProps(phqResult)} />
            ) : null}
            <ToolDisclaimer>
              ⚠️ This is a screening tool only. If you are having thoughts of self-harm, please call a crisis line
              immediately: 988 Suicide & Crisis Lifeline (call/text 988).
            </ToolDisclaimer>
            <RelatedTags tags={["Mental Health Resources", "Find a Psychiatrist", "Therapy Options"]} />
          </CalculatorCard>

          <CalculatorCard
            id="symptom"
            icon="🔎"
            iconClass="teal"
            title="Symptom Checker"
            description="Enter your symptoms to get guidance on possible conditions and whether you need to seek urgent medical care."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void runCalc("symptom", () =>
                  setSymptomResult(checkSymptom(formStr("sy-symp", f), formStr("sy-dur", f))),
                );
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sy-age">Age</label>
                  <input type="number" id="sy-age" name="sy-age" placeholder="35" />
                </div>
                <div className="form-group">
                  <label htmlFor="sy-sex">Sex</label>
                  <select id="sy-sex" name="sy-sex" defaultValue="Male">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="sy-symp">Primary Symptom</label>
                  <select id="sy-symp" name="sy-symp" defaultValue="">
                    <option value="">Select your main symptom...</option>
                    <option value="chest">Chest pain or pressure</option>
                    <option value="head">Headache or migraine</option>
                    <option value="breath">Shortness of breath</option>
                    <option value="fever">Fever</option>
                    <option value="fatigue">Fatigue or weakness</option>
                    <option value="stomach">Stomach or abdominal pain</option>
                    <option value="joints">Joint or muscle pain</option>
                    <option value="skin">Skin rash or changes</option>
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="sy-dur">Duration</label>
                  <select id="sy-dur" name="sy-dur" defaultValue="new">
                    <option value="new">Sudden / Just started</option>
                    <option value="days">A few days</option>
                    <option value="weeks">1–4 weeks</option>
                    <option value="chronic">More than 1 month</option>
                  </select>
                </div>
              </div>
              <CalcButton loading={loadingId === "symptom"}>Check Symptoms</CalcButton>
            </form>
            {symptomResult ? (
              <RiskResultBox show toolTitle="Symptom Checker" {...riskBadgeProps(symptomResult)} />
            ) : null}
            <ToolDisclaimer>
              ⚠️ This tool does not provide a diagnosis. Always consult a qualified doctor for proper evaluation and
              treatment.
            </ToolDisclaimer>
            <RelatedTags tags={["Book a Consultation", "Emergency Signs"]} />
          </CalculatorCard>
        </CategorySection>

        <div className="tools-cta">
          <div className="eyebrow">Need Professional Advice?</div>
          <h2>Your Health Tools Are Just the First Step</h2>
          <p>
            These tools help you understand your metrics — but a board-certified doctor can give you personalised
            guidance, diagnosis, and treatment.
          </p>
          <div className="tools-cta-btns">
            <Link href="/book-consultation" className="tools-cta-primary">
              📅 Book a Consultation
            </Link>
            <Link href="/ask-doctor" className="tools-cta-secondary">
              💬 Ask a Doctor Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
