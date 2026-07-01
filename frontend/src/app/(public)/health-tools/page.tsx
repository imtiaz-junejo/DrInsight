"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/health-tools-page.css";
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
  calcOvulation,
  calcPHQ9,
  calcPregnancy,
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
  type OvulationResult,
  type PregnancyResult,
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
];

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

function RelatedTags({ tags }: { tags: string[] }) {
  return (
    <div className="related-tags">
      {tags.map((tag) => (
        <span key={tag} className="related-tag">
          {tag}
        </span>
      ))}
    </div>
  );
}

function Disclaimer({ text }: { text: string }) {
  return <div className="disclaimer">{text}</div>;
}

function ToolHeader({
  icon,
  iconClass,
  title,
  desc,
}: {
  icon: string;
  iconClass: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="tool-header">
      <div className={`tool-ico ${iconClass}`}>{icon}</div>
      <div className="tool-header-text">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}

export default function HealthToolsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [bfSex, setBfSex] = useState("");
  const [phqScores, setPhqScores] = useState<number[]>(Array(9).fill(0));

  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);
  const [bmrResult, setBmrResult] = useState<BmrResult | null>(null);
  const [bfResult, setBfResult] = useState<BodyFatResult | null>(null);
  const [iwResult, setIwResult] = useState<IdealWeightResult | null>(null);
  const [calResult, setCalResult] = useState<CalorieResult | null>(null);
  const [waterResult, setWaterResult] = useState<WaterResult | null>(null);
  const [hrResult, setHrResult] = useState<HrResult | null>(null);
  const [bpResult, setBpResult] = useState<BpResult | null>(null);
  const [pregResult, setPregResult] = useState<PregnancyResult | null>(null);
  const [ovResult, setOvResult] = useState<OvulationResult | null>(null);
  const [dbResult, setDbResult] = useState<RiskResult | null>(null);
  const [smResult, setSmResult] = useState<SmokingResult | null>(null);
  const [kdResult, setKdResult] = useState<KidneyResult | null>(null);
  const [phqResult, setPhqResult] = useState<RiskResult | null>(null);
  const [syResult, setSyResult] = useState<RiskResult | null>(null);

  function num(id: string, form: HTMLFormElement) {
    return Number((form.elements.namedItem(id) as HTMLInputElement).value);
  }

  function str(id: string, form: HTMLFormElement) {
    return (form.elements.namedItem(id) as HTMLInputElement | HTMLSelectElement).value;
  }

  return (
    <div className="health-tools-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          🏠 <Link href="/">Home</Link> › <span>Health Tools</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">Free Medical Calculators</div>
          <h1>Your Personal Health Tools Hub</h1>
          <p>
            15+ evidence-based, medically reviewed health calculators — designed by our physicians to help you
            understand and monitor your health metrics.
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
            Select a category below or scroll to explore all tools. Results are estimates — always consult your
            doctor for medical decisions.
          </p>
        </div>

        <div className="tools-nav">
          {TOOL_TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`tool-tab${activeTab === i ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* BODY & WEIGHT */}
        <div className="category-title">⚖️ Body & Weight Tools</div>
        <div className="category-subtitle">Calculate your key body composition metrics used by physicians worldwide</div>
        <div className="tools-grid">
          <div className="tool-panel" id="bmi">
            <ToolHeader
              icon="⚖️"
              iconClass="blue"
              title="BMI Calculator"
              desc="Calculate your Body Mass Index to understand if your weight is in a healthy range for your height."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setBmiResult(calcBMI(num("bmi-weight", f), num("bmi-height", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate BMI
                </button>
              </form>
              {bmiResult && (
                <div className="result-box">
                  <div className="result-label">Your BMI</div>
                  <div className="result-value">{bmiResult.value}</div>
                  <div className="result-sub">Category: {bmiResult.category}</div>
                  <div className="result-bar">
                    <div
                      className="result-fill"
                      style={{ width: `${bmiResult.barPct}%`, background: bmiResult.barColor }}
                    />
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ BMI is a screening tool only, not a diagnostic measure. Consult your doctor for a full assessment." />
              <RelatedTags tags={["Healthy Weight Guide", "Obesity & Health Risks", "Weight Loss Tips"]} />
            </div>
          </div>

          <div className="tool-panel" id="bmr">
            <ToolHeader
              icon="🔥"
              iconClass="teal"
              title="BMR Calculator"
              desc="Find your Basal Metabolic Rate — the number of calories your body needs at complete rest to maintain basic functions."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setBmrResult(calcBMR(num("bmr-weight", f), num("bmr-height", f), num("bmr-age", f), str("bmr-sex", f), num("bmr-act", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate BMR & TDEE
                </button>
              </form>
              {bmrResult && (
                <div className="result-box">
                  <div className="result-label">Basal Metabolic Rate (BMR)</div>
                  <div className="result-value">{bmrResult.bmr} kcal/day</div>
                  <div className="result-sub">Total Daily Energy Expenditure (TDEE): {bmrResult.tdee} kcal/day</div>
                </div>
              )}
              <Disclaimer text="⚠️ These are estimates based on the Mifflin-St Jeor equation. Individual metabolism varies." />
              <RelatedTags tags={["Nutrition Planning", "Weight Management"]} />
            </div>
          </div>

          <div className="tool-panel" id="bodyfat">
            <ToolHeader
              icon="📏"
              iconClass="green"
              title="Body Fat Calculator"
              desc="Estimate your body fat percentage using the US Navy method based on circumference measurements."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setBfResult(
                    calcBodyFat(str("bf-sex", f), num("bf-height", f), num("bf-waist", f), num("bf-neck", f), num("bf-hip", f)),
                  );
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bf-sex">Sex</label>
                    <select
                      id="bf-sex"
                      name="bf-sex"
                      value={bfSex}
                      onChange={(e) => setBfSex(e.target.value)}
                    >
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
                <button type="submit" className="calc-btn">
                  Calculate Body Fat %
                </button>
              </form>
              {bfResult && (
                <div className="result-box">
                  <div className="result-label">Estimated Body Fat</div>
                  <div className="result-value">{bfResult.value}%</div>
                  <div className="result-sub">Category: {bfResult.category}</div>
                  <div className="result-bar">
                    <div
                      className="result-fill"
                      style={{ width: `${bfResult.barPct}%`, background: bfResult.barColor }}
                    />
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ This is an estimate. DEXA scan or hydrostatic weighing are the gold standards for body fat measurement." />
              <RelatedTags tags={["Healthy Body Composition", "Strength Training"]} />
            </div>
          </div>

          <div className="tool-panel" id="idealweight">
            <ToolHeader
              icon="🎯"
              iconClass="purple"
              title="Ideal Weight Calculator"
              desc="Find your ideal body weight range using multiple clinical formulas (Hamwi, Devine, Robinson, Miller)."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setIwResult(calcIdealWeight(num("iw-height", f), str("iw-sex", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate Ideal Weight
                </button>
              </form>
              {iwResult && (
                <div className="result-box">
                  <div className="result-label">Ideal Weight Range</div>
                  <div className="result-value">{iwResult.devine} kg</div>
                  <div className="result-sub">
                    Healthy range: {iwResult.lo} – {iwResult.hi} kg (Devine formula)
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ Ideal weight varies by individual. Frame size, muscle mass, and health conditions all play a role." />
              <RelatedTags tags={["Weight Goals", "BMI Chart"]} />
            </div>
          </div>
        </div>

        {/* NUTRITION */}
        <div className="category-title spaced">🍎 Nutrition & Hydration</div>
        <div className="category-subtitle">Personalised daily targets for calories and water based on your body and lifestyle</div>
        <div className="tools-grid">
          <div className="tool-panel" id="calories">
            <ToolHeader
              icon="🍽️"
              iconClass="amber"
              title="Calorie Calculator"
              desc="Calculate your daily calorie needs to maintain, lose, or gain weight based on your personal goals."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setCalResult(
                    calcCalories(num("cal-weight", f), num("cal-height", f), num("cal-age", f), str("cal-sex", f), num("cal-goal", f)),
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
                <button type="submit" className="calc-btn">
                  Calculate Daily Calories
                </button>
              </form>
              {calResult && (
                <div className="result-box">
                  <div className="result-label">Daily Calorie Target</div>
                  <div className="result-value">{calResult.tdee} kcal</div>
                  <div className="result-sub">
                    Protein: {calResult.protein}g &nbsp;|&nbsp; Carbs: {calResult.carbs}g &nbsp;|&nbsp; Fat: {calResult.fat}g
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ These are general estimates. Individual needs vary. Consult a registered dietitian for a personalised plan." />
              <RelatedTags tags={["Healthy Eating Guide", "Macronutrient Basics"]} />
            </div>
          </div>

          <div className="tool-panel" id="water">
            <ToolHeader
              icon="💧"
              iconClass="teal"
              title="Water Intake Calculator"
              desc="Find your optimal daily water intake to stay hydrated based on your weight, climate, and activity level."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setWaterResult(calcWater(num("wa-weight", f), num("wa-age", f), num("wa-act", f), num("wa-climate", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate Water Intake
                </button>
              </form>
              {waterResult && (
                <div className="result-box">
                  <div className="result-label">Daily Water Intake</div>
                  <div className="result-value">{waterResult.litres} litres</div>
                  <div className="result-sub">Approx. {waterResult.cups} cups (250 ml each)</div>
                </div>
              )}
              <Disclaimer text="⚠️ Needs vary with health status, medications, and illness. Increase intake if exercising heavily or in hot weather." />
              <RelatedTags tags={["Dehydration Signs", "Hydration & Health"]} />
            </div>
          </div>
        </div>

        {/* HEART & BLOOD */}
        <div className="category-title spaced">❤️ Heart & Blood Health</div>
        <div className="category-subtitle">Monitor your cardiovascular health metrics with these clinically validated tools</div>
        <div className="tools-grid">
          <div className="tool-panel" id="heartrate">
            <ToolHeader
              icon="💓"
              iconClass="pink"
              title="Heart Rate Zone Calculator"
              desc="Calculate your maximum heart rate and target heart rate zones for safe and effective cardiovascular training."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setHrResult(calcHR(num("hr-age", f), num("hr-rest", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate Heart Rate Zones
                </button>
              </form>
              {hrResult && (
                <div className="result-box">
                  <div className="result-label">Maximum Heart Rate</div>
                  <div className="result-value">{hrResult.max} bpm</div>
                  <div className="hr-zones">
                    {hrResult.zones.map((z) => (
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
                </div>
              )}
              <Disclaimer text="⚠️ Stop exercising immediately if you experience chest pain, dizziness, or shortness of breath." />
              <RelatedTags tags={["Cardio Training", "Heart Health Guide"]} />
            </div>
          </div>

          <div className="tool-panel" id="bloodpressure">
            <ToolHeader
              icon="🩺"
              iconClass="blue"
              title="Blood Pressure Tracker"
              desc="Enter your blood pressure reading to understand your category and receive personalised guidance."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setBpResult(calcBP(num("bp-sys", f), num("bp-dia", f)));
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
                <button type="submit" className="calc-btn">
                  Analyse Reading
                </button>
              </form>
              {bpResult && (
                <div className="result-box">
                  <div className="result-label">Blood Pressure Category</div>
                  <div className="result-value">
                    {bpResult.sys} / {bpResult.dia} mmHg
                  </div>
                  <span className={`bpcat ${bpResult.cls}`}>{bpResult.category}</span>
                  <div className="result-sub" style={{ marginTop: 8 }}>
                    {bpResult.advice}
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ A single reading is not diagnostic. Monitor regularly and consult your doctor if readings are consistently elevated." />
              <RelatedTags tags={["Hypertension Guide", "Heart-Healthy Diet"]} />
            </div>
          </div>
        </div>

        {/* WOMEN'S HEALTH */}
        <div className="category-title spaced">🤰 Women&apos;s Health</div>
        <div className="category-subtitle">Reproductive health calculators designed with obstetricians and gynaecologists</div>
        <div className="tools-grid">
          <div className="tool-panel" id="pregnancy">
            <ToolHeader
              icon="🤰"
              iconClass="pink"
              title="Pregnancy Due Date Calculator"
              desc="Calculate your estimated due date (EDD) and key pregnancy milestones from your last menstrual period."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPregResult(calcPregnancy(str("preg-lmp", e.currentTarget)));
                }}
              >
                <div className="form-row single">
                  <div className="form-group">
                    <label htmlFor="preg-lmp">First Day of Last Menstrual Period (LMP)</label>
                    <input type="date" id="preg-lmp" name="preg-lmp" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preg-cycle">Cycle Length (days)</label>
                    <input type="number" id="preg-cycle" name="preg-cycle" placeholder="28" min={21} max={45} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="preg-method">Method</label>
                    <select id="preg-method" name="preg-method" defaultValue="lmp">
                      <option value="lmp">Last Period (LMP)</option>
                      <option value="ivf">IVF Transfer Date</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="calc-btn">
                  Calculate Due Date
                </button>
              </form>
              {pregResult && (
                <div className="result-box">
                  <div className="result-label">Estimated Due Date (EDD)</div>
                  <div className="result-value">{pregResult.edd}</div>
                  <div className="result-sub">{pregResult.weeksText}</div>
                  <div className="preg-trimesters">
                    <div className="preg-t1">🟢 1st Trimester: Weeks 1–13 (ends {pregResult.t1End})</div>
                    <div className="preg-t2">🟡 2nd Trimester: Weeks 14–27 (ends {pregResult.t2End})</div>
                    <div className="preg-t3">🔴 3rd Trimester: Weeks 28–40 (due {pregResult.eddShort})</div>
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ EDD is an estimate — only ~5% of babies are born on their due date. Ultrasound dating is the most accurate method." />
              <RelatedTags tags={["Prenatal Care", "Pregnancy Nutrition", "Birth Plan"]} />
            </div>
          </div>

          <div className="tool-panel" id="ovulation">
            <ToolHeader
              icon="🌸"
              iconClass="purple"
              title="Ovulation Calculator"
              desc="Predict your fertile window and ovulation date to help with family planning or conception."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setOvResult(
                    calcOvulation(
                      str("ov-lmp", f),
                      num("ov-cycle", f) || 28,
                      num("ov-luteal", f) || 14,
                    ),
                  );
                }}
              >
                <div className="form-row single">
                  <div className="form-group">
                    <label htmlFor="ov-lmp">First Day of Last Period</label>
                    <input type="date" id="ov-lmp" name="ov-lmp" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ov-cycle">Cycle Length (days)</label>
                    <input type="number" id="ov-cycle" name="ov-cycle" placeholder="28" min={21} max={45} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ov-luteal">Luteal Phase (days)</label>
                    <input type="number" id="ov-luteal" name="ov-luteal" placeholder="14" min={10} max={16} />
                  </div>
                </div>
                <button type="submit" className="calc-btn">
                  Calculate Fertile Window
                </button>
              </form>
              {ovResult && (
                <div className="result-box">
                  <div className="result-label">Ovulation Date</div>
                  <div className="result-value">{ovResult.ovDate}</div>
                  <div className="result-sub">{ovResult.window}</div>
                  <div className="result-sub" style={{ marginTop: 4 }}>
                    Next period expected: {ovResult.nextPeriod}
                  </div>
                </div>
              )}
              <Disclaimer text="⚠️ Ovulation calculators provide estimates only. Cycle irregularities affect accuracy. Consult a fertility specialist for conception planning." />
              <RelatedTags tags={["Fertility Guide", "Menstrual Health"]} />
            </div>
          </div>
        </div>

        {/* RISK ASSESSMENT */}
        <div className="category-title spaced">🩸 Risk Assessment Tools</div>
        <div className="category-subtitle">Clinically validated screening tools to assess your risk for common conditions</div>
        <div className="tools-grid">
          <div className="tool-panel" id="diabetes">
            <ToolHeader
              icon="🩸"
              iconClass="amber"
              title="Diabetes Risk Assessment"
              desc="Assess your risk of developing Type 2 diabetes using the validated ADA risk screening questionnaire."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setDbResult(
                    calcDiabetes([
                      num("db-age", f),
                      num("db-bmi", f),
                      num("db-fam", f),
                      num("db-act", f),
                      num("db-bp", f),
                      num("db-gest", f),
                    ]),
                  );
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
                <button type="submit" className="calc-btn">
                  Assess My Risk
                </button>
              </form>
              {dbResult && (
                <div style={{ marginTop: 14 }}>
                  <div className={`risk-badge ${dbResult.cls}`}>{dbResult.badge}</div>
                  <div className="risk-advice">{dbResult.advice}</div>
                </div>
              )}
              <Disclaimer text="⚠️ This is a screening tool, not a diagnostic test. Only a blood glucose test (HbA1c or fasting glucose) can diagnose diabetes." />
              <RelatedTags tags={["Type 2 Diabetes Guide", "Blood Sugar Management"]} />
            </div>
          </div>

          <div className="tool-panel" id="smoking">
            <ToolHeader
              icon="🚭"
              iconClass="green"
              title="Smoking Risk Calculator"
              desc="Understand your cumulative smoking exposure (pack years) and associated health risks including lung cancer and COPD."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setSmResult(calcSmoking(num("sm-cpd", f), num("sm-yrs", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate Smoking Risk
                </button>
              </form>
              {smResult && (
                <div className="result-box">
                  <div className="result-label">Pack Years</div>
                  <div className="result-value">{smResult.packYears} pack years</div>
                  <div className="result-sub">{smResult.risk}</div>
                </div>
              )}
              <Disclaimer text="⚠️ No level of smoking is safe. Quitting at any age has immediate and long-term health benefits. Speak to your doctor about cessation support." />
              <RelatedTags tags={["Quitting Smoking Guide", "Lung Health", "COPD Risk"]} />
            </div>
          </div>

          <div className="tool-panel" id="kidney">
            <ToolHeader
              icon="🫘"
              iconClass="blue"
              title="eGFR / Kidney Function Calculator"
              desc="Estimate your kidney function using the CKD-EPI equation based on your serum creatinine level."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setKdResult(calcKidney(num("kd-creat", f), num("kd-age", f), str("kd-sex", f), str("kd-race", f)));
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
                <button type="submit" className="calc-btn">
                  Calculate eGFR
                </button>
              </form>
              {kdResult && (
                <div className="result-box">
                  <div className="result-label">Estimated GFR (eGFR)</div>
                  <div className="result-value">{kdResult.egfr} mL/min/1.73m²</div>
                  <div className="result-sub">CKD Stage: {kdResult.stage}</div>
                </div>
              )}
              <Disclaimer text="⚠️ eGFR requires a lab creatinine result. This calculator is for educational purposes only — CKD staging requires clinical evaluation." />
              <RelatedTags tags={["Kidney Disease Guide", "CKD Stages"]} />
            </div>
          </div>
        </div>

        {/* MENTAL HEALTH */}
        <div className="category-title spaced">🧘 Mental Health Screening</div>
        <div className="category-subtitle">
          Validated screening tools used in clinical practice — not diagnostic, but an important first step
        </div>
        <div className="tools-grid">
          <div className="tool-panel" id="mentalhealth">
            <ToolHeader
              icon="🧠"
              iconClass="purple"
              title="PHQ-9 Depression Screening"
              desc="The PHQ-9 is the gold-standard clinical screening tool for depression severity, used by doctors worldwide."
            />
            <div className="tool-body">
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
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                ))}
              </div>
              <button type="button" className="calc-btn" onClick={() => setPhqResult(calcPHQ9(phqScores.reduce((a, b) => a + b, 0)))}>
                Calculate Score
              </button>
              {phqResult && (
                <div style={{ marginTop: 14 }}>
                  <div className={`risk-badge ${phqResult.cls}`}>{phqResult.badge}</div>
                  <div className="risk-advice">{phqResult.advice}</div>
                </div>
              )}
              <Disclaimer text="⚠️ This is a screening tool only. If you are having thoughts of self-harm, please call a crisis line immediately: 988 Suicide & Crisis Lifeline (call/text 988)." />
              <RelatedTags tags={["Mental Health Resources", "Find a Psychiatrist", "Therapy Options"]} />
            </div>
          </div>

          <div className="tool-panel" id="symptom">
            <ToolHeader
              icon="🔎"
              iconClass="teal"
              title="Symptom Checker"
              desc="Enter your symptoms to get guidance on possible conditions and whether you need to seek urgent medical care."
            />
            <div className="tool-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  setSyResult(checkSymptom(str("sy-symp", f), str("sy-dur", f)));
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
                <button type="submit" className="calc-btn">
                  Check Symptoms
                </button>
              </form>
              {syResult && (
                <div style={{ marginTop: 14 }}>
                  <div className={`risk-badge ${syResult.cls}`}>{syResult.badge}</div>
                  <div className="risk-advice spaced">{syResult.advice}</div>
                </div>
              )}
              <Disclaimer text="⚠️ This tool does not provide a diagnosis. Always consult a qualified doctor for proper evaluation and treatment." />
              <RelatedTags tags={["Book a Consultation", "Emergency Signs"]} />
            </div>
          </div>
        </div>

        {/* CTA */}
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
