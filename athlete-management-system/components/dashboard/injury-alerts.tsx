"use client"

import { useMemo, useState } from "react"
import { InjuryDrawer, type InjuryDetail } from "./injury-drawer"
import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import { REGION_LABELS, REHAB_PHASES } from "@/components/medical/data"

const statusStyles: Record<string, string> = {
  Critical: "bg-[#EF4444]/10 text-[#EF4444]",
  Monitoring: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Improving: "bg-[#22C55E]/10 text-[#22C55E]",
}

function daysSince(dateStr: string): number {
  const onset = new Date(`${dateStr}T12:00:00`)
  const now = new Date()
  return Math.max(1, Math.floor((now.getTime() - onset.getTime()) / (1000 * 60 * 60 * 24)))
}

function alertStatus(injury: PersistedInjury): string {
  if (injury.severity === "Severe" || injury.status === "Active") return "Critical"
  if (injury.status === "Improving") return "Improving"
  return "Monitoring"
}

function toInjuryDetail(injury: PersistedInjury, athlete: Athlete): InjuryDetail {
  const name = `${athlete.firstName} ${athlete.lastName}`
  const phaseLabel = REHAB_PHASES[injury.rehabPhase - 1] ?? `Phase ${injury.rehabPhase}`
  return {
    name,
    sport: `${athlete.sport} — ${athlete.discipline}`,
    injuryType: injury.injuryType,
    bodyRegion: REGION_LABELS[injury.bodyRegion],
    dateOfOnset: new Date(`${injury.dateOfOnset}T12:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    severity: injury.severity,
    rehabPhase: phaseLabel,
    rehabProgress: Math.round((injury.rehabPhase / 5) * 100),
    physiotherapist: injury.treatingPhysio,
    notes: injury.notes.map((n) => ({
      date: new Date(n.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      author: n.author,
      text: n.text,
    })),
  }
}

type Props = {
  athletes: Athlete[]
  injuries: PersistedInjury[]
}

export function InjuryAlerts({ athletes, injuries }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<InjuryDetail | null>(null)

  const alerts = useMemo(() => {
    const athleteMap = new Map(athletes.map((a) => [a.id, a]))
    return injuries
      .filter((injury) => athleteMap.has(injury.athleteId))
      .map((injury) => {
        const athlete = athleteMap.get(injury.athleteId)!
        const detail = toInjuryDetail(injury, athlete)
        return {
          id: injury.id,
          name: detail.name,
          injury: injury.injuryType,
          day: daysSince(injury.dateOfOnset),
          status: alertStatus(injury),
          detail,
        }
      })
      .sort((a, b) => {
        const order = { Critical: 0, Monitoring: 1, Improving: 2 }
        return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3)
      })
  }, [athletes, injuries])

  function openDrawer(detail: InjuryDetail) {
    setSelected(detail)
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Active Injury Alerts</h2>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-xs font-semibold text-white">
            {alerts.length}
          </span>
        </div>
        {alerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No active injuries in this scope.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((inj) => (
              <div key={inj.id} className="rounded-lg border border-[#E5E7EB] p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-semibold text-white">
                    {inj.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{inj.name}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[inj.status]}`}
                      >
                        {inj.status}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{inj.injury}</span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Day {inj.day} of recovery</span>
                      <button
                        type="button"
                        onClick={() => openDrawer(inj.detail)}
                        className="text-xs font-medium text-[#1A56DB] hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InjuryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} athlete={selected} />
    </>
  )
}
