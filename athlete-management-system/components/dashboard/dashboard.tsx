"use client"

import { useMemo } from "react"
import { HierarchyFilter } from "@/components/dashboard/hierarchy-filter"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ReadinessHeatmap } from "@/components/dashboard/readiness-heatmap"
import { InjuryAlerts } from "@/components/dashboard/injury-alerts"
import { AiRecommendations } from "@/components/dashboard/ai-recommendations"
import { TrainingLoadChart } from "@/components/dashboard/training-load-chart"
import { ParticipationTrend } from "@/components/dashboard/participation-trend"
import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import type { PersistedSession, WorkloadRecord } from "@/components/training/data"
import {
  filterAthletesByScope,
  filterInjuriesByAthletes,
  filterSessionsByAthletes,
  type HierarchyScope,
} from "@/lib/hierarchy-scope"

type Props = {
  athletes: Athlete[]
  injuries: PersistedInjury[]
  sessions: PersistedSession[]
  workloads: WorkloadRecord[]
  hierarchyScope: HierarchyScope
  onHierarchyScopeChange: (scope: HierarchyScope) => void
  onNavigate?: (module: string) => void
}

export function Dashboard({
  athletes,
  injuries,
  sessions,
  workloads,
  hierarchyScope,
  onHierarchyScopeChange,
  onNavigate,
}: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const scopedAthletes = useMemo(
    () => filterAthletesByScope(athletes, hierarchyScope),
    [athletes, hierarchyScope],
  )
  const scopedAthleteIds = useMemo(
    () => new Set(scopedAthletes.map((a) => a.id)),
    [scopedAthletes],
  )
  const scopedInjuries = useMemo(
    () => filterInjuriesByAthletes(injuries, scopedAthleteIds),
    [injuries, scopedAthleteIds],
  )
  const scopedSessions = useMemo(
    () => filterSessionsByAthletes(sessions, scopedAthleteIds),
    [sessions, scopedAthleteIds],
  )

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Command Centre</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      <HierarchyFilter
        athletes={athletes}
        scope={hierarchyScope}
        onScopeChange={onHierarchyScopeChange}
      />

      <KpiCards
        athletes={scopedAthletes}
        injuries={scopedInjuries}
        sessions={scopedSessions}
        onNavigate={onNavigate}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ReadinessHeatmap athletes={scopedAthletes} />
        </div>
        <div className="lg:col-span-2">
          <InjuryAlerts athletes={scopedAthletes} injuries={scopedInjuries} />
        </div>
      </div>

      <AiRecommendations
        athletes={scopedAthletes}
        injuries={scopedInjuries}
        sessions={scopedSessions}
        workloads={workloads}
        scope={hierarchyScope}
        onNavigate={onNavigate}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TrainingLoadChart sessions={scopedSessions} />
        </div>
        <div className="lg:col-span-5">
          <ParticipationTrend sessions={scopedSessions} athleteIds={scopedAthleteIds} />
        </div>
      </div>
    </div>
  )
}
