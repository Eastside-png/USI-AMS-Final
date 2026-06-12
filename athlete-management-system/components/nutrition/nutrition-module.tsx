"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Apple, AlertTriangle, Droplets, EyeOff } from "lucide-react"

// ── Data ────────────────────────────────────────────────────────────────────

const ATHLETES = [
  { id: "mc", name: "Marcus Chen", sport: "Sprint", status: "active" as const },
  { id: "kr", name: "Kavya Reddy", sport: "Sprint", status: "healthy" as const },
  { id: "rk", name: "Rohit Kumar", sport: "Sprint", status: "healthy" as const },
  { id: "ps", name: "Priya Sharma", sport: "Sprint", status: "monitoring" as const },
  { id: "am", name: "Arjun Mehta", sport: "Sprint", status: "healthy" as const },
]

type Meal = { name: string; kcal: number; protein: number }
type DayMeals = { breakfast?: Meal; lunch?: Meal; dinner?: Meal; snack?: Meal }

const MEAL_PLAN: Record<string, DayMeals> = {
  Mon: {
    breakfast: { name: "Oats, banana & protein powder", kcal: 520, protein: 42 },
    lunch: { name: "Grilled chicken rice bowl with vegetables", kcal: 680, protein: 52 },
    dinner: { name: "Salmon, sweet potato & greens", kcal: 590, protein: 48 },
    snack: { name: "Greek yoghurt & almonds", kcal: 310, protein: 22 },
  },
  Tue: {
    breakfast: { name: "Eggs, toast & avocado", kcal: 490, protein: 38 },
    lunch: { name: "Tuna pasta salad", kcal: 620, protein: 45 },
    dinner: { name: "Beef stir-fry with brown rice", kcal: 640, protein: 51 },
    snack: { name: "Protein shake & banana", kcal: 290, protein: 30 },
  },
  Wed: {
    breakfast: { name: "Overnight oats with berries", kcal: 480, protein: 35 },
    lunch: { name: "Turkey wrap with hummus", kcal: 560, protein: 42 },
    dinner: { name: "Baked chicken, quinoa & broccoli", kcal: 610, protein: 55 },
  },
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MEAL_TYPES: Array<keyof DayMeals> = ["breakfast", "lunch", "dinner", "snack"]
const MEAL_LABELS: Record<keyof DayMeals, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}

const HYDRATION_WEEKLY = [
  { day: "Mon", actual: 2.8, target: 3.5 },
  { day: "Tue", actual: 3.2, target: 3.5 },
  { day: "Wed", actual: 2.5, target: 3.5 },
  { day: "Thu", actual: 3.0, target: 3.5 },
  { day: "Fri", actual: 2.1, target: 3.5 },
  { day: "Sat", actual: 3.4, target: 3.5 },
  { day: "Sun", actual: 3.1, target: 3.5 },
]

const BODY_COMP_DATA = [
  { month: "Jan", weight: 74.2, bodyFat: 12.8, leanMass: 64.7 },
  { month: "Feb", weight: 74.5, bodyFat: 12.5, leanMass: 65.1 },
  { month: "Mar", weight: 75.1, bodyFat: 12.1, leanMass: 66.0 },
  { month: "Apr", weight: 74.8, bodyFat: 11.8, leanMass: 66.0 },
  { month: "May", weight: 75.3, bodyFat: 11.5, leanMass: 66.6 },
  { month: "Jun", weight: 75.8, bodyFat: 11.2, leanMass: 67.3 },
]

const SUPPLEMENTS = [
  { name: "Creatine Monohydrate", dose: "5 g", timing: "Post-training", compliance: 94 },
  { name: "Vitamin D3", dose: "2000 IU", timing: "Morning", compliance: 88 },
  { name: "Omega-3", dose: "2 caps", timing: "With dinner", compliance: 91 },
  { name: "Whey Protein", dose: "30 g", timing: "Post-training", compliance: 87 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

const STATUS_DOT: Record<string, string> = {
  healthy: "bg-[#22C55E]",
  monitoring: "bg-[#F59E0B]",
  active: "bg-[#EF4444]",
}

// ── Component ────────────────────────────────────────────────────────────────

export function NutritionModule({
  role = "Federation Admin",
  onNavigate,
}: {
  role?: string
  onNavigate?: (module: string) => void
}) {
  const [selectedAthlete, setSelectedAthlete] = useState("mc")

  if (role === "Sports Scientist") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="max-w-lg rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <EyeOff className="h-6 w-6 text-[#1A56DB]" />
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Nutrition Hidden</h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Nutrition planning is hidden in the Sports Scientist role. Athlete readiness,
            fatigue, GPS, and device data are available in Sports Science.
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.("Sports Science")}
            className="mt-5 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A56DB]/90"
          >
            Open Sports Science
          </button>
        </div>
      </div>
    )
  }

  const todayHydration = 2.8
  const hydrationTarget = 3.5
  const hydrationPct = Math.round((todayHydration / hydrationTarget) * 100)

  const totalKcal = Object.values(MEAL_PLAN.Mon)
    .filter(Boolean)
    .reduce((s, m) => s + (m as Meal).kcal, 0)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A56DB]/10">
          <Apple className="h-5 w-5 text-[#1A56DB]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Nutrition</h1>
          <p className="text-sm text-[#6B7280]">Meal planning, body composition and supplement management</p>
        </div>
      </div>

      {/* Athlete selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {ATHLETES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelectedAthlete(a.id)}
            className={`flex w-48 shrink-0 items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors ${
              selectedAthlete === a.id
                ? "border-[#1A56DB] ring-1 ring-[#1A56DB]"
                : "border-[#E5E7EB] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
                {initials(a.name)}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${STATUS_DOT[a.status]}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{a.name}</p>
              <p className="truncate text-xs text-muted-foreground">{a.sport}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Compliance alert */}
      <div className="flex items-start gap-3 rounded-xl border border-[#F59E0B]/40 bg-[#FFFBEB] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
        <p className="text-sm text-[#92400E]">
          <span className="font-semibold">Nutrition plan compliance dropped to 67% this week.</span>{" "}
          3 missed meals logged. Consider a check-in with the sports dietitian.
        </p>
      </div>

      {/* Weekly meal plan */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0F172A]">Weekly Meal Plan — Marcus Chen</h2>
          <div className="flex items-center gap-4 rounded-lg bg-[#F0F9FF] px-4 py-2 text-sm">
            <span className="text-[#374151]">Target: <strong>3,200 kcal</strong></span>
            <span className="text-[#374151]">Planned: <strong>{totalKcal.toLocaleString()} kcal</strong></span>
            <span className="font-semibold text-green-700">On Track</span>
          </div>
        </div>

        {/* Macro targets */}
        <div className="mb-3 flex gap-4">
          {[
            { label: "Protein", target: "180g", current: "178g", pct: 99, color: "bg-blue-500" },
            { label: "Carbs", target: "380g", current: "362g", pct: 95, color: "bg-orange-400" },
            { label: "Fat", target: "85g", current: "82g", pct: 96, color: "bg-purple-500" },
          ].map((m) => (
            <div key={m.label} className="flex flex-1 items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5">
              <div className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#374151]">{m.label}</span>
                  <span className="text-xs text-[#9CA3AF]">{m.current} / {m.target}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-[#F3F4F6]">
                  <div className={`h-1.5 rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 7-col grid */}
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const meals = MEAL_PLAN[day]
            return (
              <div key={day} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                <div className="border-b border-[#F3F4F6] bg-[#F8FAFC] px-3 py-1.5 text-center text-xs font-semibold text-[#374151]">
                  {day}
                </div>
                <div className="flex flex-col gap-1 p-2">
                  {MEAL_TYPES.map((type) => {
                    const meal = meals?.[type]
                    return (
                      <div
                        key={type}
                        className={`rounded-md px-2 py-1.5 ${meal ? "bg-[#EFF6FF] border border-[#BFDBFE]" : "border border-dashed border-[#E5E7EB] bg-transparent"}`}
                      >
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#6B7280]">
                          {MEAL_LABELS[type]}
                        </p>
                        {meal ? (
                          <>
                            <p className="text-[10px] font-medium leading-snug text-[#1E40AF]">{meal.name}</p>
                            <p className="text-[9px] text-[#6B7280]">{meal.kcal} kcal · {meal.protein}g pro</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-[#CBD5E1]">—</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Hydration + Body Comp */}
      <div className="grid grid-cols-5 gap-5">
        {/* Hydration — 2 cols */}
        <section className="col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-[#1A56DB]" />
            <h2 className="text-base font-semibold text-[#0F172A]">Hydration Tracking</h2>
          </div>
          <div className="mb-4">
            <div className="mb-1 flex items-end justify-between">
              <span className="text-3xl font-bold text-[#1A56DB]">{todayHydration}L</span>
              <span className="text-sm text-[#9CA3AF]">/ {hydrationTarget}L target</span>
            </div>
            <div className="h-3 rounded-full bg-[#DBEAFE]">
              <div
                className="h-3 rounded-full bg-[#1A56DB] transition-all"
                style={{ width: `${hydrationPct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[#9CA3AF]">{hydrationPct}% of daily target</p>
          </div>
          <p className="mb-2 text-xs font-semibold text-[#374151]">Weekly compliance</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={HYDRATION_WEEKLY} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 4]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }} />
              <Bar dataKey="actual" name="Actual (L)" fill="#1A56DB" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="target" name="Target (L)" fill="#DBEAFE" radius={[3, 3, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Body Comp — 3 cols */}
        <section className="col-span-3 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#0F172A]">Body Composition Trends — 6 Months</h2>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={BODY_COMP_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line dataKey="weight" name="Weight (kg)" stroke="#1A56DB" strokeWidth={2} dot={false} />
              <Line dataKey="bodyFat" name="Body Fat (%)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line dataKey="leanMass" name="Lean Mass (kg)" stroke="#22C55E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Supplement management */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[#0F172A]">Supplement Management</h2>
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <tr>
                {["Supplement", "Dosage", "Timing", "Compliance"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {SUPPLEMENTS.map((s) => (
                <tr key={s.name} className="hover:bg-[#F9FAFB]">
                  <td className="px-5 py-3 font-medium text-[#111827]">{s.name}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{s.dose}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{s.timing}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-[#F3F4F6]">
                        <div
                          className={`h-2 rounded-full ${s.compliance >= 90 ? "bg-green-500" : s.compliance >= 80 ? "bg-[#1A56DB]" : "bg-yellow-500"}`}
                          style={{ width: `${s.compliance}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold ${s.compliance >= 90 ? "text-green-700" : s.compliance >= 80 ? "text-[#1A56DB]" : "text-yellow-700"}`}
                      >
                        {s.compliance}%
                      </span>
                    </div>
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
