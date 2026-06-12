"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { BarChart3, Download, TrendingUp, TrendingDown, Minus, Brain, Lock } from "lucide-react"

// ── Data ────────────────────────────────────────────────────────────────────

const ATHLETES_BY_SPORT = [
  { sport: "Athletics", count: 89 },
  { sport: "Swimming", count: 64 },
  { sport: "Wrestling", count: 41 },
  { sport: "Badminton", count: 32 },
  { sport: "Others", count: 21 },
]

const AGE_DISTRIBUTION = [
  { range: "16–18", count: 38 },
  { range: "19–21", count: 72 },
  { range: "22–25", count: 81 },
  { range: "26–30", count: 44 },
  { range: "30+", count: 12 },
]

const INJURY_TREND = [
  { month: "Jul", rate: 5.8 },
  { month: "Aug", rate: 6.2 },
  { month: "Sep", rate: 5.4 },
  { month: "Oct", rate: 4.9 },
  { month: "Nov", rate: 5.1 },
  { month: "Dec", rate: 4.6 },
  { month: "Jan", rate: 5.3 },
  { month: "Feb", rate: 4.1 },
  { month: "Mar", rate: 4.8 },
  { month: "Apr", rate: 4.2 },
  { month: "May", rate: 4.5 },
  { month: "Jun", rate: 4.8 },
]

const PREDICTIONS = [
  {
    id: "injury",
    severity: "amber",
    title: "Injury Risk Index — Sprint Squad",
    value: "68/100",
    label: "Elevated",
    description: "Load accumulation has increased 18% over 3 weeks. Monitor ACWR closely.",
  },
  {
    id: "peak",
    severity: "blue",
    title: "Performance Peak Window — Marcus Chen",
    value: "3–4 wks",
    label: "Post-recovery",
    description: "Predicted peak performance window based on training periodisation model.",
  },
  {
    id: "readiness",
    severity: "amber",
    title: "Squad Readiness Forecast — Next Week",
    value: "71%",
    label: "Slight decline expected",
    description: "Projected 4% drop driven by back-to-back competition schedule.",
  },
]

const KPI_TABLE = [
  { athlete: "Marcus Chen", score: 81, national: 78, gap: +3, trend: "up" },
  { athlete: "Kavya Reddy", score: 88, national: 82, gap: +6, trend: "up" },
  { athlete: "Rohit Kumar", score: 76, national: 78, gap: -2, trend: "down" },
  { athlete: "Priya Sharma", score: 72, national: 75, gap: -3, trend: "down" },
  { athlete: "Arjun Mehta", score: 69, national: 74, gap: -5, trend: "down" },
  { athlete: "Nina Solberg", score: 91, national: 82, gap: +9, trend: "up" },
]

const LEVELS = ["Federation", "Discipline", "Academy", "Squad"]

// ── Helpers ──────────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-[#9CA3AF]" />
}

// ── Component ────────────────────────────────────────────────────────────────

export function AnalyticsModule({
  role = "Federation Admin",
  onNavigate,
}: {
  role?: string
  onNavigate?: (module: string) => void
}) {
  const allowedLevels = useMemo(
    () => (role === "Federation Admin" ? LEVELS : ["Discipline", "Academy", "Squad"]),
    [role],
  )
  const [activeLevel, setActiveLevel] = useState(allowedLevels[0])

  useEffect(() => {
    if (!allowedLevels.includes(activeLevel)) setActiveLevel(allowedLevels[0])
  }, [activeLevel, allowedLevels])

  if (role === "Coach" || role === "Physiotherapist") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="max-w-lg rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Lock className="h-6 w-6 text-[#1A56DB]" />
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Analytics View Limited</h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Federation-level analytics are hidden for this role. Squad-level signals are
            available inside Training, Medical, and Sports Science.
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.(role === "Physiotherapist" ? "Medical" : "Training")}
            className="mt-5 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A56DB]/90"
          >
            Open role dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A56DB]/10">
            <BarChart3 className="h-5 w-5 text-[#1A56DB]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Analytics</h1>
            <p className="text-sm text-[#6B7280]">
              {role === "Federation Admin"
                ? "Performance intelligence across the federation"
                : "Performance intelligence for applied science teams"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
          >
            <Download className="h-4 w-4" /> Export PDF Report
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
          >
            <Download className="h-4 w-4" /> Export CSV Data
          </button>
        </div>
      </div>

      {/* Drill-down breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-[#6B7280]">
        {(role === "Federation Admin"
          ? ["All Federation", "Athletics", "National Academy", "Sprint Squad"]
          : ["Athletics", "National Academy", "Sprint Squad"]
        ).map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-1">
            <span className={i === arr.length - 1 ? "font-semibold text-[#0F172A]" : "hover:text-[#374151] cursor-pointer"}>
              {crumb}
            </span>
            {i < arr.length - 1 && <span className="text-[#CBD5E1]">/</span>}
          </span>
        ))}
      </div>

      {/* Level switcher */}
      <div className="inline-flex rounded-xl border border-[#E5E7EB] bg-white p-1">
        {allowedLevels.map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setActiveLevel(lvl)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              activeLevel === lvl
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Athletes", value: "247", delta: "+12 this year", up: true },
          { label: "Active Programs", value: "12", delta: "+2 this cycle", up: true },
          { label: "Injury Rate", value: "4.8%", delta: "-0.6% vs last yr", up: false },
          { label: "Avg Performance Score", value: "76%", delta: "+2.4% vs last yr", up: true },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs text-[#9CA3AF]">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-[#0F172A]">{c.value}</p>
            <p className={`mt-1 text-xs font-medium ${c.up ? "text-green-600" : "text-red-600"}`}>
              {c.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Three charts */}
      <div className="grid grid-cols-3 gap-5">
        {/* Athletes by Sport */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">Athletes by Sport</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={ATHLETES_BY_SPORT}
              layout="vertical"
              margin={{ top: 0, right: 8, bottom: 0, left: 56 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="sport"
                tick={{ fontSize: 11, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
                width={54}
              />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="count" name="Athletes" radius={[0, 4, 4, 0]} barSize={14}>
                {ATHLETES_BY_SPORT.map((_, i) => (
                  <Cell
                    key={i}
                    fill={["#1A56DB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"][i]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={AGE_DISTRIBUTION} margin={{ top: 0, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="count" name="Athletes" fill="#1A56DB" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Injury Rate Trend */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">Injury Rate — Last 12 Months</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={INJURY_TREND} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[3, 8]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Line dataKey="rate" name="Injury Rate (%)" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictive Analytics */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#1A56DB]" />
          <h2 className="text-base font-semibold text-[#0F172A]">AI Predictive Insights</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PREDICTIONS.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 ${
                p.severity === "amber"
                  ? "border-[#F59E0B]/40 bg-[#FFFBEB]"
                  : "border-[#BFDBFE] bg-[#EFF6FF]"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#0F172A] leading-snug">{p.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.severity === "amber"
                      ? "bg-[#F59E0B]/20 text-[#92400E]"
                      : "bg-[#1A56DB]/20 text-[#1E3A8A]"
                  }`}
                >
                  {p.label}
                </span>
              </div>
              <p className="mb-1 text-2xl font-bold text-[#0F172A]">{p.value}</p>
              <p className="text-xs leading-relaxed text-[#6B7280]">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KPI Intelligence Table */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[#0F172A]">KPI Intelligence Table</h2>
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <tr>
                {["Athlete", "Performance Score", "National Benchmark", "Gap", "Trend"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {KPI_TABLE.map((row) => (
                <tr key={row.athlete} className="hover:bg-[#F9FAFB]">
                  <td className="px-5 py-3 font-medium text-[#111827]">{row.athlete}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-[#F3F4F6]">
                        <div
                          className="h-2 rounded-full bg-[#1A56DB]"
                          style={{ width: `${row.score}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#0F172A]">{row.score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280]">{row.national}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.gap > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.gap > 0 ? `+${row.gap}` : row.gap}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <TrendIcon trend={row.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
