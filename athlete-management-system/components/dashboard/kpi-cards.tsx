"use client"

import { Users, AlertTriangle, Activity, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"
import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import type { PersistedSession } from "@/components/training/data"
import { computeAttendanceRate } from "@/components/training/data"
import { normalizeSquadLabel } from "@/lib/hierarchy-scope"

type Kpi = {
  label: string
  value: string
  subtitle: string
  icon: ElementType
  iconColor: string
  iconBg: string
  navigateTo?: string
}

type Props = {
  athletes: Athlete[]
  injuries: PersistedInjury[]
  sessions: PersistedSession[]
  onNavigate?: (module: string) => void
}

function buildKpis(athletes: Athlete[], injuries: PersistedInjury[], sessions: PersistedSession[]): Kpi[] {
  const activeAthletes = athletes.filter((a) => a.status !== "Pending" && a.status !== "Rejected")
  const activeInjuries = injuries.filter((i) => i.status !== "Resolved")
  const criticalCount = activeInjuries.filter((i) => i.severity === "Severe" || i.status === "Active").length

  const readinessValues = activeAthletes
    .map((a) => a.readiness)
    .filter((r): r is number => r !== null)
  const avgReadiness =
    readinessValues.length > 0
      ? Math.round(readinessValues.reduce((s, v) => s + v, 0) / readinessValues.length)
      : 0

  const squads = new Set(activeAthletes.map((a) => normalizeSquadLabel(a.squad)))
  const weekSessions = sessions
  let attendanceTotal = 0
  let attendancePresent = 0
  for (const session of weekSessions) {
    for (const id of session.assignedAthleteIds) {
      if (!activeAthletes.some((a) => a.id === id)) continue
      const status = session.attendance[id]
      if (status) {
        attendanceTotal++
        if (status === "Present") attendancePresent++
      }
    }
  }
  const attendanceRate =
    attendanceTotal > 0
      ? Math.round((attendancePresent / attendanceTotal) * 100)
      : activeAthletes.length > 0
        ? Math.round(
            activeAthletes.reduce((sum, a) => sum + (computeAttendanceRate(sessions, a.id) ?? 90), 0) /
              activeAthletes.length,
          )
        : 0

  return [
    {
      label: "Total Athletes",
      value: String(activeAthletes.length),
      subtitle: `across ${squads.size} squad${squads.size === 1 ? "" : "s"}`,
      icon: Users,
      iconColor: "text-[#1A56DB]",
      iconBg: "bg-[#1A56DB]/10",
    },
    {
      label: "Active Injuries",
      value: String(activeInjuries.length),
      subtitle: `${criticalCount} flagged critical`,
      icon: AlertTriangle,
      iconColor: "text-[#EF4444]",
      iconBg: "bg-[#EF4444]/10",
      navigateTo: "Medical",
    },
    {
      label: "Avg Readiness",
      value: `${avgReadiness}%`,
      subtitle: avgReadiness >= 80 ? "squad in good shape" : "monitor load this week",
      icon: Activity,
      iconColor: "text-[#F59E0B]",
      iconBg: "bg-[#F59E0B]/10",
    },
    {
      label: "Sessions This Week",
      value: String(weekSessions.length),
      subtitle: `${attendanceRate}% attendance rate`,
      icon: Calendar,
      iconColor: "text-[#22C55E]",
      iconBg: "bg-[#22C55E]/10",
    },
  ]
}

export function KpiCards({ athletes, injuries, sessions, onNavigate }: Props) {
  const kpis = buildKpis(athletes, injuries, sessions)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const clickable = !!kpi.navigateTo

        return (
          <div
            key={kpi.label}
            onClick={() => clickable && onNavigate?.(kpi.navigateTo!)}
            className={cn(
              "flex items-start justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow",
              clickable && "cursor-pointer hover:border-[#1A56DB]/30 hover:shadow-md",
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
              <span className="text-3xl font-bold tracking-tight text-foreground">{kpi.value}</span>
              <span className="text-xs text-muted-foreground">{kpi.subtitle}</span>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.iconBg}`}>
              <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
