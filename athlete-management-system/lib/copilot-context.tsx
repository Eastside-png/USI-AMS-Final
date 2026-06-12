import type { ReactNode } from "react"
import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import { REHAB_PHASES } from "@/components/medical/data"
import type { PersistedSession, WorkloadRecord } from "@/components/training/data"
import { calculateAthleteAcwr } from "@/components/training/data"
import { filterAthletesByScope, scopeLabel, type HierarchyScope } from "@/lib/hierarchy-scope"

export type CopilotAction =
  | { type: "review-athlete"; athleteId: string }
  | { type: "create-rehab-plan"; athleteId: string }
  | { type: "schedule-recovery"; athleteId?: string }
  | { type: "view-injury-risk"; athleteId: string }
  | { type: "open-readiness-dashboard" }
  | { type: "navigate"; module: string }

export type CopilotMessage = {
  id: string
  role: "user" | "ai"
  content: string | ReactNode
  actionButtons?: { label: string; action: CopilotAction }[]
  timestamp: string
}

function athleteName(athlete: Athlete) {
  return `${athlete.firstName} ${athlete.lastName}`
}

function moduleSubtitle(module: string, contextAthleteId?: string | null, athletes?: Athlete[]) {
  const athlete = contextAthleteId ? athletes?.find((a) => a.id === contextAthleteId) : null
  if (athlete) return `${module} Module — ${athleteName(athlete)}`
  return `${module} Module`
}

function quickActionsForModule(module: string): string[] {
  switch (module) {
    case "Dashboard":
      return ["Squad readiness summary", "Top injury flags", "Load overview"]
    case "Athletes":
      return ["Readiness check", "Injury status", "Compliance review"]
    case "Medical":
      return ["Active injury count", "RTP candidates", "Rehab progress"]
    case "Training":
      return ["This week's load", "ACWR flags", "Session risks"]
    case "Analytics":
      return ["Federation performance brief", "Key anomalies", "Compare squads"]
    default:
      return ["Summarise readiness", "Flag injury risk", "Generate report"]
  }
}

function suggestedPromptsForModule(module: string): string[] {
  switch (module) {
    case "Dashboard":
      return ["Who needs rest today?", "Summarise squad readiness", "Any injury flags?"]
    case "Athletes":
      return ["Compare readiness", "Injury history", "Attendance gaps"]
    case "Medical":
      return ["RTP timeline", "Rehab blockers", "Critical cases"]
    case "Training":
      return ["Adjust Thursday load", "ACWR outliers", "Recovery sessions needed"]
    case "Analytics":
      return ["Top performers", "Anomaly report", "Federation trends"]
    default:
      return ["Who needs rest today?", "Summarise last week", "Any injury flags?"]
  }
}

function buildDashboardMessages(
  athletes: Athlete[],
  injuries: PersistedInjury[],
  workloads: WorkloadRecord[],
  scope: HierarchyScope,
): CopilotMessage[] {
  const scoped = filterAthletesByScope(athletes, scope)
  const active = scoped.filter((a) => a.status !== "Pending" && a.status !== "Rejected")
  const readinessValues = active.map((a) => a.readiness).filter((r): r is number => r !== null)
  const avgReadiness =
    readinessValues.length > 0
      ? Math.round(readinessValues.reduce((s, v) => s + v, 0) / readinessValues.length)
      : 0
  const full = active.filter((a) => (a.readiness ?? 0) >= 80).length
  const modified = active.filter((a) => (a.readiness ?? 0) >= 60 && (a.readiness ?? 0) < 80).length
  const restricted = active.filter((a) => (a.readiness ?? 0) < 60).length

  const scopedIds = new Set(active.map((a) => a.id))
  const scopedInjuries = injuries.filter((i) => scopedIds.has(i.athleteId) && i.status !== "Resolved")
  const criticalInjuries = scopedInjuries.filter((i) => i.severity === "Severe" || i.status === "Active")

  const acwrFlags = active
    .map((a) => ({ athlete: a, ...calculateAthleteAcwr(workloads, a.id) }))
    .filter((x) => x.flagged)
    .slice(0, 2)

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return [
    {
      id: "a-init",
      role: "ai",
      content: (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            {scopeLabel(scope)} Readiness Summary — {today}
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-50 p-2.5 text-center">
              <p className="text-lg font-bold text-[#1A56DB]">{avgReadiness}%</p>
              <p className="text-[10px] text-muted-foreground">Avg Readiness</p>
              <p className="text-[10px] font-medium text-muted-foreground">{active.length} athletes in scope</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg bg-emerald-50 p-2 text-center">
                <p className="text-sm font-bold text-emerald-700">{full}</p>
                <p className="text-[10px] text-muted-foreground">Full</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2 text-center">
                <p className="text-sm font-bold text-amber-700">{modified}</p>
                <p className="text-[10px] text-muted-foreground">Modified</p>
              </div>
              <div className="col-span-2 rounded-lg bg-red-50 p-2 text-center">
                <p className="text-sm font-bold text-red-700">{restricted}</p>
                <p className="text-[10px] text-muted-foreground">Restricted</p>
              </div>
            </div>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            {scopedInjuries.length} active injuries ({criticalInjuries.length} critical).{" "}
            {acwrFlags.length > 0
              ? `ACWR flags: ${acwrFlags.map((x) => `${x.athlete.firstName} (${x.acwr})`).join(", ")}.`
              : "No ACWR spikes in this scope."}
          </p>
        </div>
      ),
      actionButtons: [
        { label: "Open Readiness Dashboard", action: { type: "open-readiness-dashboard" } },
        ...(acwrFlags[0]
          ? [
              {
                label: `Review ${acwrFlags[0].athlete.firstName}`,
                action: { type: "review-athlete" as const, athleteId: acwrFlags[0].athlete.id },
              },
            ]
          : []),
      ],
      timestamp: "Now",
    },
  ]
}

function buildAthleteProfileMessages(
  athlete: Athlete,
  injuries: PersistedInjury[],
  sessions: PersistedSession[],
): CopilotMessage[] {
  const athleteInjuries = injuries.filter((i) => i.athleteId === athlete.id && i.status !== "Resolved")
  const primaryInjury = athleteInjuries[0]
  const present = sessions.filter((s) => s.attendance[athlete.id] === "Present").length
  const total = sessions.filter((s) => s.assignedAthleteIds.includes(athlete.id)).length
  const attendance = total > 0 ? Math.round((present / total) * 100) : athlete.attendanceRate ?? 0

  return [
    {
      id: "a-athlete",
      role: "ai",
      content: (
        <div>
          <p className="mb-2 text-sm leading-relaxed text-foreground">
            <strong>{athleteName(athlete)}</strong> — {athlete.sport}, {athlete.squad}
          </p>
          <ul className="mb-2 space-y-1 text-sm">
            <li>
              Readiness: <strong>{athlete.readiness ?? "—"}%</strong> · Status:{" "}
              <strong>{athlete.status}</strong>
            </li>
            <li>
              Attendance: <strong>{attendance}%</strong> across {total} assigned sessions
            </li>
            <li>
              Injuries:{" "}
              {athleteInjuries.length > 0 ? (
                <strong>
                  {primaryInjury?.injuryType} (Phase {primaryInjury?.rehabPhase}/5)
                </strong>
              ) : (
                <strong>None active</strong>
              )}
            </li>
          </ul>
        </div>
      ),
      actionButtons: [
        { label: "Review Athlete", action: { type: "review-athlete", athleteId: athlete.id } },
        ...(primaryInjury
          ? [
              {
                label: "Create Rehab Plan",
                action: { type: "create-rehab-plan" as const, athleteId: athlete.id },
              },
              {
                label: "View Injury Risk",
                action: { type: "view-injury-risk" as const, athleteId: athlete.id },
              },
            ]
          : []),
        {
          label: "Schedule Recovery Session",
          action: { type: "schedule-recovery", athleteId: athlete.id },
        },
      ],
      timestamp: "Now",
    },
  ]
}

function buildMedicalMessages(athletes: Athlete[], injuries: PersistedInjury[]): CopilotMessage[] {
  const active = injuries.filter((i) => i.status !== "Resolved")
  const rtpCandidates = active.filter((i) => i.rehabPhase >= 4)
  const critical = active.filter((i) => i.severity === "Severe" || i.status === "Active")

  const rtpAthlete = rtpCandidates[0]
    ? athletes.find((a) => a.id === rtpCandidates[0].athleteId)
    : null

  return [
    {
      id: "a-medical",
      role: "ai",
      content: (
        <div>
          <p className="mb-2 text-sm leading-relaxed text-foreground">
            <strong>{active.length} active injuries</strong> across the federation.{" "}
            {critical.length} require close monitoring.
          </p>
          {rtpAthlete && rtpCandidates[0] && (
            <p className="mb-2 text-sm text-muted-foreground">
              RTP candidate: <strong>{athleteName(rtpAthlete)}</strong> —{" "}
              {rtpCandidates[0].injuryType}, Phase {rtpCandidates[0].rehabPhase}/5 (
              {REHAB_PHASES[rtpCandidates[0].rehabPhase - 1]}).
            </p>
          )}
          <ul className="space-y-1 text-xs text-muted-foreground">
            {active.slice(0, 3).map((inj) => {
              const a = athletes.find((x) => x.id === inj.athleteId)
              return (
                <li key={inj.id}>
                  {a ? athleteName(a) : inj.athleteId}: {inj.injuryType} — Phase {inj.rehabPhase}/5
                </li>
              )
            })}
          </ul>
        </div>
      ),
      actionButtons: [
        ...(rtpAthlete
          ? [
              {
                label: "Create Rehab Plan",
                action: { type: "create-rehab-plan" as const, athleteId: rtpAthlete.id },
              },
              {
                label: "Review Athlete",
                action: { type: "review-athlete" as const, athleteId: rtpAthlete.id },
              },
            ]
          : []),
        ...(critical[0]
          ? [
              {
                label: "View Injury Risk",
                action: {
                  type: "view-injury-risk" as const,
                  athleteId: critical[0].athleteId,
                },
              },
            ]
          : []),
      ],
      timestamp: "Now",
    },
  ]
}

function buildTrainingMessages(
  athletes: Athlete[],
  sessions: PersistedSession[],
  workloads: WorkloadRecord[],
): CopilotMessage[] {
  const weekSessions = sessions
  const acwrFlags = athletes
    .filter((a) => a.status === "Active" || a.status === "Monitoring")
    .map((a) => ({ athlete: a, ...calculateAthleteAcwr(workloads, a.id) }))
    .filter((x) => x.acwr >= 1.1)
    .sort((a, b) => b.acwr - a.acwr)
    .slice(0, 3)

  const totalLoad = weekSessions.reduce((s, sess) => s + sess.duration * sess.rpe, 0)

  return [
    {
      id: "a-training",
      role: "ai",
      content: (
        <div>
          <p className="mb-2 text-sm leading-relaxed text-foreground">
            This week: <strong>{weekSessions.length} sessions</strong> scheduled · estimated load{" "}
            <strong>{totalLoad.toLocaleString()}</strong> AU.
          </p>
          {acwrFlags.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-800">ACWR flags</p>
              {acwrFlags.map(({ athlete, acwr }) => (
                <div key={athlete.id} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                  <p className="text-xs font-semibold text-amber-800">{athleteName(athlete)}</p>
                  <p className="text-xs text-amber-700">ACWR {acwr} — consider recovery session</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No ACWR spikes detected this week.</p>
          )}
        </div>
      ),
      actionButtons: [
        ...(acwrFlags[0]
          ? [
              {
                label: "Schedule Recovery Session",
                action: { type: "schedule-recovery" as const, athleteId: acwrFlags[0].athlete.id },
              },
              {
                label: "View Injury Risk",
                action: { type: "view-injury-risk" as const, athleteId: acwrFlags[0].athlete.id },
              },
            ]
          : []),
        { label: "Open Readiness Dashboard", action: { type: "open-readiness-dashboard" } },
      ],
      timestamp: "Now",
    },
  ]
}

function buildAnalyticsMessages(athletes: Athlete[], injuries: PersistedInjury[]): CopilotMessage[] {
  const sports = [...new Set(athletes.map((a) => a.sport))]
  const avgBySport = sports.map((sport) => {
    const group = athletes.filter((a) => a.sport === sport && a.readiness !== null)
    const avg =
      group.length > 0
        ? Math.round(group.reduce((s, a) => s + (a.readiness ?? 0), 0) / group.length)
        : 0
    return { sport, avg, count: group.length }
  })

  const injuryRate = athletes.length
    ? Math.round((injuries.filter((i) => i.status !== "Resolved").length / athletes.length) * 100)
    : 0

  return [
    {
      id: "a-analytics",
      role: "ai",
      content: (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Federation Performance Brief</p>
          <ul className="mb-2 space-y-1 text-sm">
            {avgBySport.map(({ sport, avg, count }) => (
              <li key={sport}>
                {sport}: <strong>{avg}%</strong> avg readiness ({count} athletes)
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Injury rate: {injuryRate}% · Key anomaly:{" "}
            {avgBySport.sort((a, b) => a.avg - b.avg)[0]?.sport ?? "N/A"} readiness below federation
            average.
          </p>
        </div>
      ),
      actionButtons: [
        { label: "Open Readiness Dashboard", action: { type: "open-readiness-dashboard" } },
        { label: "Open Medical", action: { type: "navigate", module: "Medical" } },
      ],
      timestamp: "Now",
    },
  ]
}

export function buildCopilotInitialMessages(
  activeModule: string,
  athletes: Athlete[],
  injuries: PersistedInjury[],
  sessions: PersistedSession[],
  workloads: WorkloadRecord[],
  hierarchyScope: HierarchyScope,
  contextAthleteId?: string | null,
): CopilotMessage[] {
  if (contextAthleteId) {
    const athlete = athletes.find((a) => a.id === contextAthleteId)
    if (athlete) return buildAthleteProfileMessages(athlete, injuries, sessions)
  }

  switch (activeModule) {
    case "Dashboard":
      return buildDashboardMessages(athletes, injuries, workloads, hierarchyScope)
    case "Medical":
      return buildMedicalMessages(athletes, injuries)
    case "Training":
      return buildTrainingMessages(athletes, sessions, workloads)
    case "Analytics":
      return buildAnalyticsMessages(athletes, injuries)
    case "Athletes":
      return buildAthleteProfileMessages(
        athletes.find((a) => a.status === "Active") ?? athletes[0],
        injuries,
        sessions,
      )
    default:
      return buildDashboardMessages(athletes, injuries, workloads, hierarchyScope)
  }
}

export {
  moduleSubtitle,
  quickActionsForModule,
  suggestedPromptsForModule,
}
