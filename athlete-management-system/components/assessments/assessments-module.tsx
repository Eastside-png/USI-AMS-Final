"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { ClipboardList, Play, X, Check, ChevronRight } from "lucide-react"

// ── Data ────────────────────────────────────────────────────────────────────

const ASSESSMENTS = [
  { id: "yoyo", name: "Yo-Yo Intermittent Recovery Test", category: "Aerobic Capacity", lastRun: "2 weeks ago", unit: "Level" },
  { id: "vjump", name: "Vertical Jump Test", category: "Power", lastRun: "1 week ago", unit: "cm" },
  { id: "sprint", name: "40m Sprint", category: "Speed", lastRun: "3 days ago", unit: "sec" },
  { id: "squat", name: "Overhead Squat Assessment", category: "Movement Quality", lastRun: "1 month ago", unit: "Score /10" },
  { id: "beep", name: "Beep Test (20m Shuttle)", category: "Aerobic Fitness", lastRun: "2 weeks ago", unit: "Level" },
  { id: "grip", name: "Grip Strength", category: "Strength", lastRun: "1 week ago", unit: "kg" },
]

const SQUAD_ATHLETES = [
  "Marcus Chen", "Kavya Reddy", "Rohit Kumar", "Priya Sharma", "Arjun Mehta",
]

const BENCHMARK_DATA = [
  { test: "Yo-Yo Test", athlete: 18.2, squad: 16.8, national: 17.5 },
  { test: "Vertical Jump", athlete: 64, squad: 58, national: 61 },
  { test: "40m Sprint", athlete: 4.82, squad: 4.97, national: 4.89 },
  { test: "Overhead Squat", athlete: 8.1, squad: 7.4, national: 7.8 },
  { test: "Beep Test", athlete: 13.4, squad: 12.6, national: 13.0 },
  { test: "Grip Strength", athlete: 58, squad: 54, national: 56 },
]

const TID_BREAKDOWN = [
  { component: "Speed", score: 85, weight: 30, fullMark: 100 },
  { component: "Power", score: 79, weight: 25, fullMark: 100 },
  { component: "Endurance", score: 68, weight: 20, fullMark: 100 },
  { component: "Technical", score: 81, weight: 25, fullMark: 100 },
]

const CATEGORY_COLORS: Record<string, string> = {
  "Aerobic Capacity": "bg-blue-100 text-blue-700",
  "Power": "bg-purple-100 text-purple-700",
  "Speed": "bg-orange-100 text-orange-700",
  "Movement Quality": "bg-teal-100 text-teal-700",
  "Aerobic Fitness": "bg-sky-100 text-sky-700",
  "Strength": "bg-red-100 text-red-700",
}

// ── Run Assessment Wizard ────────────────────────────────────────────────────

type AssessmentWizardProps = {
  assessment: typeof ASSESSMENTS[0]
  onClose: () => void
}

function AssessmentWizard({ assessment, onClose }: AssessmentWizardProps) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, string>>({})

  function toggleAthlete(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const compositeScore = 78
  const percentiles = selected.map((name) => ({
    name,
    value: results[name] ? parseFloat(results[name]) : 0,
    percentile: Math.floor(Math.random() * 30 + 65),
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
              Run Assessment — Step {step} of 3
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-[#0F172A]">{assessment.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-5 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-[#1A56DB]" : "bg-[#E5E7EB]"
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 1 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-[#374151]">Select athletes to test</p>
              <div className="flex flex-col gap-2">
                {SQUAD_ATHLETES.map((name) => (
                  <label
                    key={name}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E5E7EB] p-3 hover:bg-[#F9FAFB]"
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        selected.includes(name)
                          ? "border-[#1A56DB] bg-[#1A56DB]"
                          : "border-[#D1D5DB]"
                      }`}
                    >
                      {selected.includes(name) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-[#374151]">{name}</span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected.includes(name)}
                      onChange={() => toggleAthlete(name)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-[#374151]">
                Record results ({assessment.unit})
              </p>
              <div className="flex flex-col gap-3">
                {(selected.length > 0 ? selected : SQUAD_ATHLETES).map((name) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
                      {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="w-32 shrink-0 text-sm text-[#374151]">{name}</span>
                    <input
                      type="number"
                      placeholder={`e.g. ${assessment.unit === "sec" ? "4.85" : "17.2"}`}
                      value={results[name] ?? ""}
                      onChange={(e) =>
                        setResults((prev) => ({ ...prev, [name]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                    />
                    <span className="shrink-0 text-xs text-[#9CA3AF]">{assessment.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-[#374151]">
                Percentile comparison &amp; results
              </p>
              <div className="flex flex-col gap-2">
                {(selected.length > 0 ? percentiles : SQUAD_ATHLETES.map((name) => ({ name, value: 0, percentile: Math.floor(Math.random() * 30 + 60) }))).map((r) => (
                  <div key={r.name} className="rounded-lg border border-[#E5E7EB] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#374151]">{r.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          r.percentile >= 75
                            ? "bg-green-100 text-green-700"
                            : r.percentile >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.percentile}th percentile
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
                      <div
                        className={`h-2 rounded-full ${r.percentile >= 75 ? "bg-green-500" : r.percentile >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${r.percentile}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      Squad avg: 62nd | National: 70th
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-4">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A56DB]/90"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Check className="h-4 w-4" /> Save Results
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Module ──────────────────────────────────────────────────────────────

export function AssessmentsModule() {
  const [activeAssessment, setActiveAssessment] = useState<typeof ASSESSMENTS[0] | null>(null)

  const tidScore = TID_BREAKDOWN.reduce(
    (acc, t) => acc + (t.score * t.weight) / 100,
    0
  )

  const isAbove = (d: { athlete: number; national: number; test: string }) => {
    // For sprint, lower = better
    if (d.test === "40m Sprint") return d.athlete <= d.national
    return d.athlete >= d.national
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A56DB]/10">
            <ClipboardList className="h-5 w-5 text-[#1A56DB]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Assessments &amp; TID</h1>
            <p className="text-sm text-[#6B7280]">Assessment library and talent identification</p>
          </div>
        </div>
      </div>

      {/* Assessment Library */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[#0F172A]">Assessment Library</h2>
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Assessment
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Last Run
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {ASSESSMENTS.map((a) => (
                <tr key={a.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-5 py-3.5 font-medium text-[#111827]">{a.name}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[a.category] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {a.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#6B7280]">{a.lastRun}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveAssessment(a)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A56DB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1A56DB]/90"
                    >
                      <Play className="h-3 w-3" /> Run Assessment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom grid: Benchmark + TID */}
      <div className="grid grid-cols-5 gap-5">
        {/* Benchmark Analysis — spans 3 cols */}
        <section className="col-span-3 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#0F172A]">
            Marcus Chen — Benchmark Analysis
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={BENCHMARK_DATA}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="test"
                tick={{ fontSize: 11, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
                width={88}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="athlete" name="Marcus Chen" fill="#1A56DB" radius={[0, 3, 3, 0]} barSize={7} />
              <Bar dataKey="squad" name="Squad Avg" fill="#94A3B8" radius={[0, 3, 3, 0]} barSize={7} />
              <Bar dataKey="national" name="National Benchmark" fill="#E5E7EB" radius={[0, 3, 3, 0]} barSize={7} />
            </BarChart>
          </ResponsiveContainer>
          {/* colour key legend */}
          <div className="mt-3 flex flex-wrap gap-3">
            {BENCHMARK_DATA.map((d) => (
              <div key={d.test} className="flex items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${isAbove(d) ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-xs text-[#6B7280]">
                  {d.test}: {isAbove(d) ? "Above" : "Below"} national
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* TID Score — spans 2 cols */}
        <section className="col-span-2 flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Talent Identification Score
          </h2>

          {/* Composite donut-like score */}
          <div className="flex items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#F0F9FF] ring-8 ring-[#1A56DB]/20">
              <span className="text-4xl font-bold text-[#1A56DB]">{Math.round(tidScore)}</span>
              <span className="absolute -bottom-1 text-xs font-semibold text-[#6B7280]">/ 100</span>
            </div>
          </div>

          {/* Component bars */}
          <div className="flex flex-col gap-2.5">
            {TID_BREAKDOWN.map((t) => (
              <div key={t.component}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#374151]">
                    {t.component}
                    <span className="ml-1 text-[#9CA3AF]">({t.weight}%)</span>
                  </span>
                  <span className="font-semibold text-[#0F172A]">{t.score}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F3F4F6]">
                  <div
                    className={`h-2 rounded-full ${t.score >= 80 ? "bg-green-500" : t.score >= 70 ? "bg-[#1A56DB]" : "bg-yellow-500"}`}
                    style={{ width: `${t.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={TID_BREAKDOWN} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="component"
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Marcus Chen"
                dataKey="score"
                stroke="#1A56DB"
                fill="#1A56DB"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Wizard modal */}
      {activeAssessment && (
        <AssessmentWizard
          assessment={activeAssessment}
          onClose={() => setActiveAssessment(null)}
        />
      )}
    </div>
  )
}
