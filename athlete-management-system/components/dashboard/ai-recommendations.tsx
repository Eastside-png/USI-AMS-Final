"use client"

import { useMemo, useState } from "react"
import { Sparkles, TrendingUp, CalendarClock, Apple } from "lucide-react"
import { SessionReviewModal } from "./session-review-modal"
import type { ElementType } from "react"
import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import type { PersistedSession, WorkloadRecord } from "@/components/training/data"
import { calculateAthleteAcwr } from "@/components/training/data"
import { scopeLabel, type HierarchyScope } from "@/lib/hierarchy-scope"

type Rec = {
  icon: ElementType
  iconColor: string
  iconBg: string
  text: string
  action: string
  onAction?: () => void
}

type Props = {
  athletes: Athlete[]
  injuries: PersistedInjury[]
  sessions: PersistedSession[]
  workloads: WorkloadRecord[]
  scope: HierarchyScope
  onNavigate?: (module: string) => void
}

export function AiRecommendations({
  athletes,
  injuries,
  sessions,
  workloads,
  scope,
  onNavigate,
}: Props) {
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const recs = useMemo(() => {
    const active = athletes.filter((a) => a.status !== "Pending" && a.status !== "Rejected")
    const items: Rec[] = []

    const acwrValues = active.map((a) => ({
      athlete: a,
      ...calculateAthleteAcwr(workloads, a.id),
    }))
    const highestAcwr = acwrValues.sort((a, b) => b.acwr - a.acwr)[0]
    if (highestAcwr && highestAcwr.acwr > 1.1) {
      items.push({
        icon: TrendingUp,
        iconColor: "text-[#EF4444]",
        iconBg: "bg-[#EF4444]/10",
        text: `${scope.squad !== "All Squads" ? scope.squad : scopeLabel(scope)} ACWR is ${highestAcwr.acwr} — ${highestAcwr.flagged ? "above safe zone" : "approaching caution"}. Recommend reducing Thursday session intensity for ${highestAcwr.athlete.firstName} ${highestAcwr.athlete.lastName}.`,
        action: "Review Session",
        onAction: () => setSessionModalOpen(true),
      })
    }

    const rtpCandidate = injuries
      .filter((i) => i.rehabPhase >= 3 && i.status !== "Resolved")
      .map((i) => {
        const athlete = active.find((a) => a.id === i.athleteId)
        return athlete ? { injury: i, athlete } : null
      })
      .filter(Boolean)[0]

    if (rtpCandidate) {
      items.push({
        icon: CalendarClock,
        iconColor: "text-[#1A56DB]",
        iconBg: "bg-[#1A56DB]/10",
        text: `${rtpCandidate.athlete.firstName} ${rtpCandidate.athlete.lastName} is in Phase ${rtpCandidate.injury.rehabPhase}/5 for ${rtpCandidate.injury.injuryType.toLowerCase()} — due for return-to-play assessment based on rehab progression.`,
        action: "Schedule Assessment",
        onAction: () => onNavigate?.("Medical"),
      })
    }

    const lowReadiness = active.filter((a) => (a.readiness ?? 100) < 70)
    if (lowReadiness.length > 0) {
      items.push({
        icon: Apple,
        iconColor: "text-[#F59E0B]",
        iconBg: "bg-[#F59E0B]/10",
        text: `Readiness below 70% for ${lowReadiness.length} athlete${lowReadiness.length === 1 ? "" : "s"} in scope (${lowReadiness.map((a) => a.firstName).join(", ")}). Review recovery and nutrition plans.`,
        action: "View Athletes",
        onAction: () => onNavigate?.("Athletes"),
      })
    }

    if (items.length === 0) {
      items.push({
        icon: Sparkles,
        iconColor: "text-[#22C55E]",
        iconBg: "bg-[#22C55E]/10",
        text: `${active.length} athletes in ${scopeLabel(scope)} — no critical flags. Maintain current load and monitor readiness trends.`,
        action: "Open Analytics",
        onAction: () => onNavigate?.("Analytics"),
      })
    }

    return items.slice(0, 3)
  }, [athletes, injuries, workloads, scope, onNavigate])

  return (
    <>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#1A56DB]" />
          <h2 className="text-base font-semibold text-foreground">AI Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {recs.map((rec, i) => {
            const Icon = rec.icon
            return (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${rec.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${rec.iconColor}`} />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{rec.text}</p>
                </div>
                <button
                  type="button"
                  onClick={rec.onAction}
                  className="mt-auto w-full rounded-md border border-[#1A56DB] bg-white px-3 py-2 text-sm font-medium text-[#1A56DB] transition-colors hover:bg-[#1A56DB] hover:text-white"
                >
                  {rec.action}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <SessionReviewModal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} />
    </>
  )
}
