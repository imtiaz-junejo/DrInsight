"use client";

import { useState } from "react";
import { CalculatorCard } from "@/components/health-tools/CalculatorCard";
import { CalcButton } from "@/components/health-tools/CalcButton";
import { formChecked, formNum, formStr } from "@/components/health-tools/form-fields";
import {
  OvulationInlineResult,
  PeriodTrackerInlineResult,
  PregnancyInlineResult,
} from "@/components/health-tools/InlineToolResults";
import { RelatedTags, ResultBox, ToolDisclaimer } from "@/components/health-tools/tool-shared";
import { WomensHealthReminderBox, type WhrPrediction } from "@/components/health-tools/WomensHealthReminderBox";
import { useTrackHealthTool } from "@/hooks/use-track-health-tool";
import {
  calcPeriodTracker,
  calcPlanner,
  calcPregnancy,
  ovulationWhrPrediction,
  periodWhrPrediction,
  pregnancyWhrPrediction,
  type OvulationResult,
  type PeriodTrackerResult,
  type PregnancyInput,
  type PregnancyMethod,
  type PregnancyResult,
} from "@/app/(public)/health-tools/calculators";

function readPregnancyForm(method: PregnancyMethod, form: HTMLFormElement): PregnancyInput {
  if (method === "lmp") {
    return {
      method,
      lmp: formStr("preg-lmp", form),
      cycle: formNum("preg-cycle", form, 28),
    };
  }
  if (method === "conception") {
    return { method, conception: formStr("preg-conception", form) };
  }
  const ivfDay = formNum("preg-ivf-day", form, 5);
  return {
    method,
    ivfDate: formStr("preg-ivf-date", form),
    ivfDay: (ivfDay === 3 ? 3 : 5) as 3 | 5,
  };
}

export function WomensHealthTools() {
  const track = useTrackHealthTool();
  const [pregMethod, setPregMethod] = useState<PregnancyMethod>("lmp");
  const [pregPrediction, setPregPrediction] = useState<WhrPrediction | null>(null);
  const [ovPrediction, setOvPrediction] = useState<WhrPrediction | null>(null);
  const [periodPrediction, setPeriodPrediction] = useState<WhrPrediction | null>(null);
  const [pregResult, setPregResult] = useState<PregnancyResult | null>(null);
  const [ovResult, setOvResult] = useState<OvulationResult | null>(null);
  const [periodResult, setPeriodResult] = useState<PeriodTrackerResult | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const runCalc = async (id: string, fn: () => void) => {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 200));
    fn();
    track(id);
    setLoadingId(null);
  };

  return (
    <>
      <CalculatorCard
        id="pregnancy"
        icon="🤰"
        iconClass="pink"
        title="Pregnancy Due Date Calculator"
        description="Calculate your estimated due date (EDD) and key pregnancy milestones from your LMP, conception date, or IVF transfer date."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = readPregnancyForm(pregMethod, form);
            void runCalc("pregnancy", () => {
              setPregPrediction(pregnancyWhrPrediction(input));
              setPregResult(calcPregnancy(input));
            });
          }}
        >
          <div className="form-row single">
            <div className="form-group">
              <label htmlFor="preg-method">Method</label>
              <select
                id="preg-method"
                name="preg-method"
                value={pregMethod}
                onChange={(e) => setPregMethod(e.target.value as PregnancyMethod)}
              >
                <option value="lmp">Last Period (LMP)</option>
                <option value="conception">Known Conception Date</option>
                <option value="ivf">IVF Transfer Date</option>
              </select>
            </div>
          </div>

          {pregMethod === "lmp" && (
            <>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="preg-lmp">First Day of Last Menstrual Period (LMP)</label>
                  <input type="date" id="preg-lmp" name="preg-lmp" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="preg-cycle">Cycle Length (days)</label>
                  <input type="number" id="preg-cycle" name="preg-cycle" placeholder="28" min={21} max={45} defaultValue={28} />
                </div>
              </div>
            </>
          )}

          {pregMethod === "conception" && (
            <div className="form-row single">
              <div className="form-group">
                <label htmlFor="preg-conception">Date of Conception</label>
                <input type="date" id="preg-conception" name="preg-conception" required />
              </div>
            </div>
          )}

          {pregMethod === "ivf" && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preg-ivf-date">Embryo Transfer Date</label>
                <input type="date" id="preg-ivf-date" name="preg-ivf-date" required />
              </div>
              <div className="form-group">
                <label htmlFor="preg-ivf-day">Transfer Day</label>
                <select id="preg-ivf-day" name="preg-ivf-day" defaultValue="5">
                  <option value="3">Day 3</option>
                  <option value="5">Day 5</option>
                </select>
              </div>
            </div>
          )}

          <CalcButton loading={loadingId === "pregnancy"}>Calculate Due Date</CalcButton>
        </form>
        <ResultBox show={Boolean(pregResult)} title="Estimated Due Date (EDD)" toolTitle="Pregnancy Due Date Calculator">
          {pregResult ? <PregnancyInlineResult result={pregResult} /> : null}
        </ResultBox>
        <ToolDisclaimer>
          ⚠️ EDD is an estimate — only ~5% of babies are born on their due date. Ultrasound dating is the most accurate
          method.
        </ToolDisclaimer>
        <WomensHealthReminderBox toolKey="pregnancy" prediction={pregPrediction} />
        <RelatedTags tags={["Prenatal Care", "Pregnancy Nutrition", "Birth Plan"]} />
      </CalculatorCard>

      <CalculatorCard
        id="ovulation"
        icon="🌸"
        iconClass="purple"
        title="Pregnancy Planner (Ovulation Calculator)"
        description="Find your most fertile days to help you conceive, based on your last period, cycle length and period length."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const lmp = formStr("pp-lmp", form);
            const cycle = formNum("pp-cycle", form, 28);
            const period = formNum("pp-period", form, 5);
            void runCalc("ovulation", () => {
              setOvPrediction(ovulationWhrPrediction(lmp, cycle));
              setOvResult(calcPlanner(lmp, cycle, period, formChecked("pp-irregular", form)));
            });
          }}
        >
          <div className="form-row single">
            <div className="form-group">
              <label htmlFor="pp-lmp">First Day of Last Menstrual Period</label>
              <input type="date" id="pp-lmp" name="pp-lmp" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pp-cycle">Cycle Length (days)</label>
              <input type="number" id="pp-cycle" name="pp-cycle" placeholder="28" min={21} max={35} defaultValue={28} />
            </div>
            <div className="form-group">
              <label htmlFor="pp-period">Period Length (days)</label>
              <input type="number" id="pp-period" name="pp-period" placeholder="5" min={1} max={7} defaultValue={5} />
            </div>
          </div>
          <div className="form-row single">
            <div className="form-group form-check-row">
              <input type="checkbox" id="pp-irregular" name="pp-irregular" />
              <label htmlFor="pp-irregular">My cycles are irregular</label>
            </div>
          </div>
          <CalcButton loading={loadingId === "ovulation"}>Find My Fertile Days</CalcButton>
        </form>
        <ResultBox show={Boolean(ovResult)} title="Your Fertility Insights" toolTitle="Pregnancy Planner">
          {ovResult ? <OvulationInlineResult result={ovResult} /> : null}
        </ResultBox>
        <ToolDisclaimer>
          📌 Fertile window usually spans 5 days before ovulation and 1 day after. Irregular cycles or medical conditions
          may affect accuracy.
        </ToolDisclaimer>
        <WomensHealthReminderBox toolKey="ovulation" prediction={ovPrediction} />
        <RelatedTags tags={["Ovulation Tracking", "Conception Tips", "Fertility"]} />
      </CalculatorCard>

      <CalculatorCard
        id="period-tracker"
        icon="🩸"
        iconClass="pink"
        title="Menstrual Period Tracker"
        description="Predict your next period, ovulation window and fertile days based on your cycle history."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const lmp = formStr("mt-lmp", form);
            const cycle = formNum("mt-cycle", form, 28);
            const period = formNum("mt-period", form, 5);
            void runCalc("period-tracker", () => {
              setPeriodPrediction(periodWhrPrediction(lmp, cycle));
              setPeriodResult(calcPeriodTracker(lmp, cycle, period));
            });
          }}
        >
          <div className="form-row single">
            <div className="form-group">
              <label htmlFor="mt-lmp">First Day of Last Period</label>
              <input type="date" id="mt-lmp" name="mt-lmp" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mt-cycle">Cycle Length (days)</label>
              <input type="number" id="mt-cycle" name="mt-cycle" placeholder="28" min={21} max={35} defaultValue={28} />
            </div>
            <div className="form-group">
              <label htmlFor="mt-period">Period Length (days)</label>
              <input type="number" id="mt-period" name="mt-period" placeholder="5" min={1} max={7} defaultValue={5} />
            </div>
          </div>
          <CalcButton loading={loadingId === "period-tracker"}>Track My Period</CalcButton>
        </form>
        <ResultBox show={Boolean(periodResult)} title="Cycle Overview" toolTitle="Menstrual Period Tracker">
          {periodResult ? <PeriodTrackerInlineResult result={periodResult} /> : null}
        </ResultBox>
        <ToolDisclaimer>
          ⚠️ Results are estimates based on a regular cycle. Actual dates may vary due to stress, hormones or health
          conditions.
        </ToolDisclaimer>
        <WomensHealthReminderBox toolKey="period" prediction={periodPrediction} />
        <RelatedTags tags={["Cycle Tracking", "PMS", "Fertility"]} />
      </CalculatorCard>
    </>
  );
}
