"use client"

import { AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import {
  calculateAthleteAcwr,
  acwrStatus,
  type PersistedSession,
  type WorkloadRecord,
} from "./data"
import type { Athlete } from "@/components/athletes/data"

export function AcwrDashboard({
  athletes,
  workloads,
  sessions,
}: {
  athletes: Athlete[]
  workloads: WorkloadRecord[]
  sessions: PersistedSession[]
}) {
  const athleteAcwr = athletes.map((athlete) => {
    const { acwr } = calculateAthleteAcwr(workloads, athlete.id)
    const status = acwrStatus(acwr)
    return {
      id: athlete.id,
      name: `${athlete.firstName} ${athlete.lastName}`,
      acwr,
      status,
      badgeColor:
        status === "danger"
          ? "bg-red-100 text-red-700"
          : status === "caution"
            ? "bg-amber-100 text-amber-700"
            : "bg-green-100 text-green-700",
    }
  })

  const flaggedCount = athleteAcwr.filter((a) => a.status === "danger").length

  const chartData = Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    const point: Record<string, string | number> = { label, day: i + 1 }
    for (const athlete of athletes.slice(0, 2)) {
      const dayWorkloads = workloads.filter((w) => {
        const wd = new Date(`${w.date}T12:00:00`)
        const diff = Math.floor((d.getTime() - wd.getTime()) / 86400000)
        return w.athleteId === athlete.id && diff >= 0 && diff <= 27 - i
      })
      const acute = dayWorkloads
        .filter((w) => {
          const wd = new Date(`${w.date}T12:00:00`)
          return (d.getTime() - wd.getTime()) / 86400000 <= 7
        })
        .reduce((s, w) => s + w.load, 0)
      const chronicTotal = dayWorkloads.reduce((s, w) => s + w.load, 0)
      const chronic = chronicTotal / 4
      point[athlete.id] = chronic > 0 ? +(acute / chronic).toFixed(2) : 0
    }
    return point
  })

  const primaryAthlete = athletes[0]

  return (
    <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Acute:Chronic Workload Ratio — Sprint Squad
          </h2>
          <p className="text-sm text-muted-foreground">
            Last 28 days · Safe zone: 0.8 – 1.3 · {sessions.filter((s) => s.lifecycle === "complete").length} completed sessions
          </p>
        </div>
        {flaggedCount > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            {flaggedCount} Athlete{flaggedCount === 1 ? "" : "s"} Above Threshold
          </span>
        )}
      </div>

      <div className="mb-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickFormatter={(val, idx) => (idx % 4 === 0 ? val : "")}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0.5, 1.6]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              formatter={(value) => [Number(value).toFixed(2), "ACWR"]}
            />
            <ReferenceArea y1={0.8} y2={1.3} fill="#10B981" fillOpacity={0.06} />
            <ReferenceLine y={0.8} stroke="#10B981" strokeDasharray="4 3" strokeWidth={1.5} />
            <ReferenceLine y={1.3} stroke="#EF4444" strokeDasharray="4 3" strokeWidth={1.5} />
            {primaryAthlete && (
              <Line
                type="monotone"
                dataKey={primaryAthlete.id}
                stroke="#1A56DB"
                strokeWidth={2}
                dot={false}
                name={`${primaryAthlete.firstName} ${primaryAthlete.lastName}`}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {athleteAcwr.map((athlete) => (
          <div
            key={athlete.id}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3",
              athlete.status === "danger" && "border-red-200 bg-red-50",
              athlete.status === "caution" && "border-amber-200 bg-amber-50",
              athlete.status === "safe" && "border-emerald-200 bg-emerald-50",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">{athlete.name}</p>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", athlete.badgeColor)}>
                {athlete.acwr > 0 ? athlete.acwr.toFixed(2) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {athlete.status === "danger" && (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-[10px] font-medium text-red-600">Above 1.3</span>
                </>
              )}
              {athlete.status === "caution" && (
                <span className="text-[10px] font-medium text-amber-600">Caution</span>
              )}
              {athlete.status === "safe" && (
                <span className="text-[10px] font-medium text-emerald-600">Safe</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {flaggedCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="mb-0.5 text-sm font-semibold text-red-700">Sprint Squad ACWR Alert</p>
            <p className="text-sm leading-relaxed text-red-600">
              {athleteAcwr
                .filter((a) => a.status === "danger")
                .map((a) => a.name)
                .join(", ")}{" "}
              {flaggedCount === 1 ? "is" : "are"} above the 1.3 safe threshold. Consider reducing session intensity.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
