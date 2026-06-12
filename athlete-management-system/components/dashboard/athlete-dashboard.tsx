"use client"

import { useState, useMemo } from "react"
import {
  Dumbbell,
  MapPin,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  Apple,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays,
} from "lucide-react"
import { ATHLETES } from "@/components/athletes/data"
import { INITIAL_INJURIES } from "@/components/medical/data"
import type { PersistedSession, WorkloadRecord } from "@/components/training/data"
import { SESSION_TYPE_COLOR } from "@/components/training/data"
import { REGION_LABELS } from "@/components/medical/data"
import { cn } from "@/lib/utils"
import { ATHLETE_PERSONA_ID } from "@/lib/roles"

// ── Nutrition compliance for Priya Sharma (mock week data) ───────────────────

const NUTRITION_WEEK = [
  { day: "Mon", compliant: true },
  { day: "Tue", compliant: true },
  { day: "Wed", compliant: false },
  { day: "Thu", compliant: true },
  { day: "Fri", compliant: true },
  { day: "Sat", compliant: false },
  { day: "Sun", compliant: true },
]

// ── Readiness yesterday (for trend) ─────────────────────────────────────────

const READINESS_YESTERDAY = 87

// ── Wellness slider labels ───────────────────────────────────────────────────

type WellnessKey = "sleep" | "soreness" | "mood" | "energy" | "stress"

const WELLNESS_LABELS: Record<WellnessKey, { label: string; description: string; lowLabel: string; highLabel: string }> = {
  sleep: { label: "Sleep Quality", description: "How well did you sleep?", lowLabel: "Poor", highLabel: "Excellent" },
  soreness: { label: "Muscle Soreness", description: "Overall body soreness", lowLabel: "None", highLabel: "Severe" },
  mood: { label: "Mood", description: "Current emotional state", lowLabel: "Low", highLabel: "Great" },
  energy: { label: "Energy Level", description: "Physical energy available", lowLabel: "Depleted", highLabel: "Energised" },
  stress: { label: "Stress", description: "Mental / life stress", lowLabel: "None", highLabel: "High" },
}

const WELLNESS_KEYS: WellnessKey[] = ["sleep", "soreness", "mood", "energy", "stress"]

type WellnessValues = Record<WellnessKey, number>

function sliderColor(key: WellnessKey, value: number): string {
  // soreness and stress: high = bad; others: high = good
  const inverted = key === "soreness" || key === "stress"
  const effective = inverted ? 11 - value : value
  if (effective >= 8) return "#22C55E"
  if (effective >= 5) return "#F59E0B"
  return "#EF4444"
}

function computeReadinessFromWellness(w: WellnessValues): number {
  // invert soreness + stress, average the rest
  const normalised = [
    w.sleep,
    11 - w.soreness,
    w.mood,
    w.energy,
    11 - w.stress,
  ]
  const avg = normalised.reduce((s, v) => s + v, 0) / normalised.length
  return Math.round((avg / 10) * 100)
}

function readinessColorClass(score: number): {
  bg: string; text: string; border: string; ring: string
} {
  if (score >= 80) return { bg: "bg-[#DCFCE7]", text: "text-[#15803D]", border: "border-[#BBF7D0]", ring: "#22C55E" }
  if (score >= 60) return { bg: "bg-[#FEF9C3]", text: "text-[#92400E]", border: "border-[#FDE68A]", ring: "#F59E0B" }
  return { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]", border: "border-[#FECACA]", ring: "#EF4444" }
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AthleteDashboardProps {
  sessions: PersistedSession[]
  workloads: WorkloadRecord[]
  onWorkloadsChange?: (w: WorkloadRecord[]) => void
}

// ── Main component ───────────────────────────────────────────────────────────

export function AthleteDashboard({ sessions, workloads, onWorkloadsChange }: AthleteDashboardProps) {
  const athlete = ATHLETES.find((a) => a.id === ATHLETE_PERSONA_ID)!
  const injuries = INITIAL_INJURIES.filter(
    (inj) => inj.athleteId === ATHLETE_PERSONA_ID && inj.status !== "Resolved",
  )

  // ── Today's session ────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10)
  const todaySession = useMemo(
    () =>
      sessions.find(
        (s) =>
          s.date === todayStr &&
          s.assignedAthleteIds.includes(ATHLETE_PERSONA_ID),
      ) ?? null,
    [sessions, todayStr],
  )

  // ── Readiness ──────────────────────────────────────────────────────────────
  const [readiness, setReadiness] = useState(athlete.readiness ?? 74)

  // ── Wellness check-in state ────────────────────────────────────────────────
  const [wellnessSubmitted, setWellnessSubmitted] = useState(false)
  const [sliders, setSliders] = useState<WellnessValues>({
    sleep: 7,
    soreness: 3,
    mood: 7,
    energy: 7,
    stress: 3,
  })
  const [submittedValues, setSubmittedValues] = useState<WellnessValues | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSlider(key: WellnessKey, value: number) {
    setSliders((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmitWellness() {
    setSubmitting(true)
    window.setTimeout(() => {
      const newReadiness = computeReadinessFromWellness(sliders)
      setReadiness(newReadiness)
      setSubmittedValues({ ...sliders })
      setWellnessSubmitted(true)
      setSubmitting(false)
    }, 600)
  }

  // ── Nutrition compliance ───────────────────────────────────────────────────
  const compliantDays = NUTRITION_WEEK.filter((d) => d.compliant).length
  const nutritionPct = Math.round((compliantDays / NUTRITION_WEEK.length) * 100)

  // ── Readiness display ──────────────────────────────────────────────────────
  const rdColors = readinessColorClass(readiness)
  const trendDelta = readiness - READINESS_YESTERDAY
  const TrendIcon =
    trendDelta > 0 ? TrendingUp : trendDelta < 0 ? TrendingDown : Minus
  const trendColor =
    trendDelta > 0 ? "text-[#15803D]" : trendDelta < 0 ? "text-[#B91C1C]" : "text-[#6B7280]"
  const trendLabel =
    trendDelta > 0
      ? `+${trendDelta} vs yesterday`
      : trendDelta < 0
        ? `${trendDelta} vs yesterday`
        : "Same as yesterday"

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            {greeting}, {athlete.firstName}
          </h1>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#E0F2FE] bg-[#F0F9FF] px-4 py-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: athlete.avatarColor }}
          >
            {athlete.initials}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-[#0F172A]">{athlete.firstName} {athlete.lastName}</span>
            <span className="text-xs text-[#6B7280]">{athlete.discipline} · {athlete.squad}</span>
          </div>
        </div>
      </div>

      {/* Top row: Training + Readiness */}
      <div className="grid grid-cols-2 gap-4">

        {/* Widget 1: Today's Training */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF]">
              <Dumbbell className="h-4 w-4 text-[#1A56DB]" />
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A]">{"Today's Training"}</h2>
          </div>

          {todaySession ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-[#0F172A]">{todaySession.name}</p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      SESSION_TYPE_COLOR[todaySession.type],
                    )}
                  >
                    {todaySession.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                  <Clock className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span>{todaySession.time ?? "08:00"} · {todaySession.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                  <MapPin className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span>{todaySession.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                  <User className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span>{todaySession.coach}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span>RPE target: {todaySession.rpe}/10</span>
                </div>
              </div>

              {todaySession.notes && (
                <p className="rounded-md bg-[#F8FAFC] px-3 py-2 text-xs leading-relaxed text-[#6B7280]">
                  {todaySession.notes}
                </p>
              )}

              <button
                type="button"
                className="flex items-center gap-1.5 self-start text-xs font-semibold text-[#1A56DB] hover:underline"
              >
                View session details
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
              <CalendarDays className="h-8 w-8 text-[#E5E7EB]" />
              <p className="text-sm font-medium text-[#374151]">No session scheduled today</p>
              <p className="text-xs text-[#9CA3AF]">Check back tomorrow or see your coach</p>
            </div>
          )}
        </div>

        {/* Widget 2: Readiness Score */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4]">
              <TrendingUp className="h-4 w-4 text-[#22C55E]" />
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A]">Readiness Score</h2>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2">
            {/* Circular-ish score badge */}
            <div
              className={cn(
                "flex h-24 w-24 flex-col items-center justify-center rounded-full border-4",
                rdColors.bg,
                rdColors.border,
              )}
              style={{ borderColor: rdColors.ring }}
            >
              <span className={cn("text-3xl font-black", rdColors.text)}>{readiness}</span>
              <span className={cn("text-xs font-semibold", rdColors.text)}>/100</span>
            </div>

            {/* Trend */}
            <div className={cn("flex items-center gap-1.5 text-sm font-semibold", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{trendLabel}</span>
            </div>

            <p className="text-center text-xs leading-relaxed text-[#6B7280]">
              {readiness >= 80
                ? "You are well-rested and ready to perform."
                : readiness >= 60
                  ? "Moderate readiness — consider lighter warm-up."
                  : "Low readiness — flag to your coach before high-intensity work."}
            </p>
          </div>
        </div>
      </div>

      {/* Widget 3: Wellness Check-In (full width) */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF7ED]">
              <CheckCircle2 className="h-4 w-4 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">Wellness Check-In</h2>
              <p className="text-xs text-[#6B7280]">Daily self-report · updates your readiness score</p>
            </div>
          </div>
          {wellnessSubmitted && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#15803D]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Submitted today
            </span>
          )}
        </div>

        {wellnessSubmitted && submittedValues ? (
          /* Read-only submitted view */
          <div className="mt-4 grid grid-cols-5 gap-3">
            {WELLNESS_KEYS.map((key) => {
              const val = submittedValues[key]
              const color = sliderColor(key, val)
              return (
                <div key={key} className="flex flex-col items-center gap-1.5 rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] p-3">
                  <span className="text-xs font-medium text-[#6B7280]">{WELLNESS_LABELS[key].label}</span>
                  <span className="text-2xl font-black" style={{ color }}>{val}</span>
                  <span className="text-xs text-[#9CA3AF]">/10</span>
                </div>
              )
            })}
          </div>
        ) : (
          /* Slider input view */
          <div className="mt-4 flex flex-col gap-4">
            {WELLNESS_KEYS.map((key) => {
              const val = sliders[key]
              const color = sliderColor(key, val)
              const meta = WELLNESS_LABELS[key]
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-[#374151]">{meta.label}</p>
                    <p className="text-xs text-[#9CA3AF]">{meta.description}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={val}
                      onChange={(e) => handleSlider(key, Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-current"
                      style={{ accentColor: color }}
                      aria-label={meta.label}
                    />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF]">
                      <span>{meta.lowLabel}</span>
                      <span>{meta.highLabel}</span>
                    </div>
                  </div>
                  <span
                    className="w-10 shrink-0 rounded-md border px-2 py-0.5 text-center text-sm font-bold"
                    style={{ color, borderColor: color, backgroundColor: `${color}18` }}
                  >
                    {val}
                  </span>
                </div>
              )
            })}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitWellness}
              className="mt-1 self-start rounded-lg bg-[#1A56DB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A56DB]/90 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Check-In"}
            </button>
          </div>
        )}
      </div>

      {/* Bottom row: Medical Restrictions + Nutrition Compliance */}
      <div className="grid grid-cols-2 gap-4">

        {/* Widget 4: Medical Restrictions */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1F2]">
              <ShieldAlert className="h-4 w-4 text-[#E11D48]" />
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A]">Medical Restrictions</h2>
          </div>

          {injuries.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
              <p className="text-sm font-medium text-[#374151]">No active restrictions</p>
              <p className="text-xs text-[#9CA3AF]">You are cleared for full training</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {injuries.map((inj) => {
                const isActive = inj.status === "Active"
                return (
                  <div
                    key={inj.id}
                    className={cn(
                      "rounded-lg border px-4 py-3",
                      isActive
                        ? "border-[#FECACA] bg-[#FFF5F5]"
                        : "border-[#FDE68A] bg-[#FFFBEB]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0F172A]">{inj.injuryType}</p>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          isActive
                            ? "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]"
                            : "border-[#FDE68A] bg-[#FEF9C3] text-[#92400E]",
                        )}
                      >
                        {inj.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {REGION_LABELS[inj.bodyRegion]}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-[#374151]">
                      {isActive
                        ? "No training — await medical clearance"
                        : "Modified training only — no high-impact activity"}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Widget 5: Nutrition Compliance */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4]">
              <Apple className="h-4 w-4 text-[#16A34A]" />
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A]">Nutrition Compliance</h2>
          </div>

          {/* Circular percentage */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div
              className={cn(
                "flex h-24 w-24 flex-col items-center justify-center rounded-full border-4",
                nutritionPct >= 80
                  ? "border-[#22C55E] bg-[#DCFCE7]"
                  : nutritionPct >= 50
                    ? "border-[#F59E0B] bg-[#FEF9C3]"
                    : "border-[#EF4444] bg-[#FEE2E2]",
              )}
            >
              <span
                className={cn(
                  "text-3xl font-black",
                  nutritionPct >= 80
                    ? "text-[#15803D]"
                    : nutritionPct >= 50
                      ? "text-[#92400E]"
                      : "text-[#B91C1C]",
                )}
              >
                {nutritionPct}%
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280]">this week</span>
            </div>

            {/* Day breakdown dots */}
            <div className="flex items-center gap-2">
              {NUTRITION_WEEK.map(({ day, compliant }) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      compliant ? "bg-[#22C55E]" : "bg-[#E5E7EB]",
                    )}
                  />
                  <span className="text-[10px] text-[#9CA3AF]">{day}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-xs leading-relaxed text-[#6B7280]">
              {compliantDays} of 7 days on plan
              {nutritionPct >= 80
                ? " — excellent adherence this week."
                : nutritionPct >= 50
                  ? " — check in with your nutritionist."
                  : " — please review your meal plan with staff."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
