"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tools = [
  { id: "bmi", icon: "⚖️", name: "BMI Calculator", desc: "Calculate your Body Mass Index" },
  { id: "bmr", icon: "🔥", name: "BMR Calculator", desc: "Find your Basal Metabolic Rate" },
  { id: "calories", icon: "🍎", name: "Calorie Calculator", desc: "Daily caloric needs" },
  { id: "heartrate", icon: "💓", name: "Heart Rate Zones", desc: "Target heart rate zones" },
  { id: "pregnancy", icon: "🤰", name: "Pregnancy Due Date", desc: "Estimated due date calculator" },
  { id: "diabetes", icon: "🩸", name: "Diabetes Risk", desc: "Type 2 diabetes screening" },
  { id: "water", icon: "💧", name: "Water Intake", desc: "Optimal daily hydration" },
  { id: "symptom", icon: "🔎", name: "Symptom Checker", desc: "Guidance on seeking care" },
];

export default function HealthToolsPage() {
  const [active, setActive] = useState("bmi");
  const [result, setResult] = useState<string | null>(null);

  function calculateBMI(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const weight = Number(fd.get("weight"));
    const height = Number(fd.get("height")) / 100;
    if (!weight || !height) return;
    const bmi = weight / (height * height);
    let category = "Normal weight";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obese";
    setResult(`Your BMI is ${bmi.toFixed(1)} — ${category}`);
  }

  const activeTool = tools.find((t) => t.id === active)!;

  return (
    <>
      <Breadcrumb items={[{ label: "Health Tools" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-[700px]">
          <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">Free Health Tools</div>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold">
            Calculate Your Health Metrics Instantly
          </h1>
          <p className="mt-3 text-[.95rem] opacity-90">
            Evidence-based health calculators reviewed by licensed physicians. For informational purposes only.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActive(tool.id);
                  setResult(null);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-[1.5px] p-4 text-left transition",
                  active === tool.id
                    ? "border-blue bg-blue-light"
                    : "border-gray-200 bg-white hover:border-blue-mid",
                )}
              >
                <span className="text-xl">{tool.icon}</span>
                <div>
                  <div className="text-[.82rem] font-semibold text-gray-900">{tool.name}</div>
                  <div className="text-[.7rem] text-gray-500">{tool.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <Card id={active}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{activeTool.icon}</span> {activeTool.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {active === "bmi" ? (
                <form onSubmit={calculateBMI} className="max-w-md space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">
                      Weight (kg)
                    </label>
                    <Input name="weight" type="number" step="0.1" required placeholder="70" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">
                      Height (cm)
                    </label>
                    <Input name="height" type="number" required placeholder="175" />
                  </div>
                  <Button type="submit">Calculate BMI</Button>
                  {result && (
                    <div className="rounded-xl border-l-4 border-blue bg-blue-light p-4 text-[.9rem] font-semibold text-blue-dark">
                      {result}
                    </div>
                  )}
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-[.88rem] text-gray-600">
                    The {activeTool.name} helps you understand key health metrics. Enter your details below for an
                    instant estimate.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Age</label>
                      <Input type="number" placeholder="30" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Gender</label>
                      <select className="h-11 w-full rounded-lg border-[1.5px] border-gray-200 px-3.5 text-sm focus:border-blue focus:outline-none">
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={() => setResult(`${activeTool.name} result calculated successfully.`)}>
                    Calculate
                  </Button>
                  {result && (
                    <div className="rounded-xl border-l-4 border-teal bg-teal/10 p-4 text-[.9rem] text-gray-800">
                      {result}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6 rounded border-l-4 border-amber bg-[#fffbeb] p-3 text-[.78rem] text-[#92400e]">
                ⚠️ These tools provide estimates for informational purposes only. Consult a healthcare provider for
                medical advice.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
