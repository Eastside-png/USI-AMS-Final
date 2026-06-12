"use client"

import { useState } from "react"
import {
  Moon,
  Activity,
  Smile,
  Zap,
  Brain,
  TrendingDown,
  TrendingUp,
  Minus,
  Bot,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Athlete } from "./data"

// ─── Static wellness data ─────────────────────────────────────────────────────

const SLEEP_TREND = [
  { day: "Mon", value: 7.5 },
  { day: "Tue", value: 7.2 },
  { day: "Wed", value: 6.8 },
  { day: "Thu", value: 6.3 },
  { day: "Fri", value: 5.9 },
  { day: "Sat", value: 5.7 },
  { day: "Sun", value: 6.0 },
]

const SORENESS_TREND = [
  { day: "Mon", value: 2.5 },
  { day: "Tue", value: 2.8 },
  { day: "Wed", value: 3.0 },
  { day: "Thu", value: 3.5 },
  { day: "Fri", value: 4.0 },
  { day: "Sat", value: 4.2 },
  { day: "Sun", value: 4.0 },
]

type WellnessMetric = {
  key: string
  label: string
  value: number
  max: number
  lowerIsBetter?: boolean
  icon: React.ElementType
}

const WELLNESS_METRICS: WellnessMetric[] = [
  { key: "sleep", label: "Sleep Quality", value: 6, max: 10, icon: Moon },
  {
    key: "soreness",
    label: "Muscle Soreness",
    value: 4,
    max: 10,
    lowerIsBetter: true,
    icon: Activity,
  },
  { key: "mood", label: "Mood", value: 7, max: 10, icon: Smile },
  { key: "energy", label: "Energy Level", value: 5, max: 10, icon: Zap },
  {
    key: "stress",
    label: "Stress Level",
    value: 3,
    max: 10,
    lowerIsBetter: true,
    icon: Brain,
  },
]

type TrendDir = "up" | "down" | "flat"

const METRIC_TRENDS: Record<string, TrendDir> = {
  sleep: "down",
  soreness: "up",
  mood: "flat",
  energy: "down",
  stress: "flat",
}

const SQUAD_DATA = [
  {
    name: "Marcus Chen",
    sport: "Track & Field",
    sleep: 6,
    soreness: 4,
    mood: 7,
    energy: 5,
    overall: 5.5,
    trend: "down" as TrendDir,
    alert: true,
  },
  {
    name: "Amara Okafor",
    sport: "Swimming",
    sleep: 8,
    soreness: 2,
    mood: 8,
    energy: 7,
    overall: 7.8,
    trend: "up" as TrendDir,
    alert: false,
  },
  {
    name: "Leo Fernandez",
    sport: "Football",
    sleep: 7,
    soreness: 5,
    mood: 6,
    energy: 6,
    overall: 6.3,
    trend: "flat" as TrendDir,
    alert: false,
  },
  {
    name: "Sofia Rossi",
    sport: "Gymnastics",
    sleep: 9,
    soreness: 1,
    mood: 9,
    energy: 9,
    overall: 9.0,
    trend: "up" as TrendDir,
    alert: false,
  },
  {
    name: "Priya Sharma",
    sport: "Athletics",
    sleep: 9,
    soreness: 1,
    mood: 9,
    energy: 8,
    overall: 9.1,
    trend: "up" as TrendDir,
    alert: false,
  },
  {
    name: "Daniel Kim",
    sport: "Rowing",
    sleep: 7,
    soreness: 3,
    mood: 7,
    energy: 6,
    overall: 6.8,
    trend: "flat" as TrendDir,
    alert: false,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(
  value: number,
  lowerIsBetter?: boolean,
): { badge: string; bar: string } {
  const effectiveValue = lowerIsBetter ? 10 - value : value
  if (effectiveValue >= 7)
    return {
      badge: "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
      bar: "bg-[#22C55E]",
    }
  if (effectiveValue >= 5)
    return {
      badge: "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
      bar: "bg-[#F59E0B]",
    }
  return {
    badge: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
    bar: "bg-[#EF4444]",
  }
}

function tableCellColor(value: number, lowerIsBetter?: boolean): string {
  const effectiveValue = lowerIsBetter ? 10 - value : value
  if (effectiveValue >= 7) return "text-[#22C55E]"
  if (effectiveValue >= 5) return "text-[#F59E0B]"
  return "text-[#EF4444]"
}

function TrendIcon({ dir }: { dir: TrendDir }) {
  if (dir === "up")
    return <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
  if (dir === "down")
    return <TrendingDown className="h-3.5 w-3.5 text-[#EF4444]" />
  return <Minus className="h-3.5 w-3.5 text-[#9CA3AF]" />
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  athlete: Athlete
}

export function WellnessTab({ athlete }: Props) {
  const [alertDismissed, setAlertDismissed] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      {/* Daily Wellness Check-in Card */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {"Today's Wellness"} &mdash; {athlete.name}
          </h2>
          <Badge
            variant="outline"
            className="border-[#1A56DB]/20 bg-[#1A56DB]/10 text-xs font-medium text-[#1A56DB]"
          >
            Daily Check-in
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {WELLNESS_METRICS.map((metric) => {
            const colors = scoreColor(metric.value, metric.lowerIsBetter)
            const trend = METRIC_TRENDS[metric.key]
            const Icon = metric.icon
            const pct = (metric.value / metric.max) * 100

            return (
              <div key={metric.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon dir={trend} />
                    <Badge
                      variant="outline"
                      className={`border text-xs font-semibold ${colors.badge}`}
                    >
                      {metric.value}/{metric.max}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div
                    className={`h-full rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Alert Banner */}
      {!alertDismissed && (
        <div className="flex items-start gap-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/8 p-4">
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">{athlete.name}</span> has
              reported below-average sleep quality for 3 consecutive days (avg
              5.8/10). Elevated muscle soreness correlates with{"  "}
              {"Tuesday's"} high-intensity session. Recommend reviewing training
              load before{"  "}{"Thursday's"} session.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 bg-[#F59E0B] text-xs font-medium text-white hover:bg-[#F59E0B]/90"
              >
                Review Training Load
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-[#F59E0B]/30 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10"
                onClick={() => setAlertDismissed(true)}
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAlertDismissed(true)}
            className="shrink-0 text-[#F59E0B]/60 transition-colors hover:text-[#F59E0B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 7-Day Trend Charts */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Sleep Quality */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Sleep Quality — 7-Day Trend
              </h3>
            </div>
            <Badge
              variant="outline"
              className="border-[#EF4444]/20 bg-[#EF4444]/10 text-xs font-medium text-[#EF4444]"
            >
              Declining
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={SLEEP_TREND}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 5, 10]}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                }}
                formatter={(value) => [`${value ?? 0}/10`, "Sleep"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1A56DB"
                strokeWidth={2}
                dot={{ r: 3, fill: "#1A56DB" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Soreness */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Muscle Soreness — 7-Day Trend
              </h3>
            </div>
            <Badge
              variant="outline"
              className="border-[#F59E0B]/20 bg-[#F59E0B]/10 text-xs font-medium text-[#F59E0B]"
            >
              Increasing
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={SORENESS_TREND}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 5, 10]}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                }}
                formatter={(value) => [`${value ?? 0}/10`, "Soreness"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 3, fill: "#F59E0B" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Squad Wellness Overview */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Squad Wellness Overview
          </h2>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Athlete</th>
                <th className="px-3 py-3 text-center">Sleep</th>
                <th className="px-3 py-3 text-center">Soreness</th>
                <th className="px-3 py-3 text-center">Mood</th>
                <th className="px-3 py-3 text-center">Energy</th>
                <th className="px-3 py-3 text-center">Overall</th>
                <th className="px-5 py-3 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {SQUAD_DATA.map((row) => {
                const isSelected = row.name === athlete.name
                return (
                  <tr
                    key={row.name}
                    className={`transition-colors ${
                      isSelected ? "bg-[#F59E0B]/5" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span
                          className={`font-medium text-foreground ${isSelected ? "text-[#D97706]" : ""}`}
                        >
                          {row.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {row.sport}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-semibold ${tableCellColor(row.sleep)}`}
                    >
                      {row.sleep}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-semibold ${tableCellColor(row.soreness, true)}`}
                    >
                      {row.soreness}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-semibold ${tableCellColor(row.mood)}`}
                    >
                      {row.mood}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-semibold ${tableCellColor(row.energy)}`}
                    >
                      {row.energy}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`font-semibold ${tableCellColor(row.overall)}`}
                      >
                        {row.overall.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center">
                        <TrendIcon dir={row.trend} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
