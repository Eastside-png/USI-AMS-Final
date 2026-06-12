import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import type { PersistedSession } from "@/components/training/data"
import { sessionLoad } from "@/components/training/data"

export type HierarchyScope = {
  federation: string
  discipline: string
  academy: string
  squad: string
}

export const DEFAULT_HIERARCHY_SCOPE: HierarchyScope = {
  federation: "All Federation",
  discipline: "All Disciplines",
  academy: "All Academies",
  squad: "All Squads",
}

const NORTHERN_KEYWORDS = ["delhi", "punjab", "rajasthan", "maharashtra", "uttar", "gujarat"]

export function getAthleteFederation(athlete: Athlete): string {
  const assoc = athlete.stateAssociation.toLowerCase()
  return NORTHERN_KEYWORDS.some((k) => assoc.includes(k))
    ? "Northern Federation"
    : "Southern Federation"
}

export function getAthleteAcademy(athlete: Athlete): string {
  if (athlete.performanceLevel === "Elite" || athlete.performanceLevel === "Senior") {
    return "National Academy"
  }
  if (athlete.performanceLevel === "Junior") return "Regional Centre"
  return "State Centre"
}

export function normalizeSquadLabel(squad: string): string {
  const s = squad.toLowerCase()
  if (s.includes("sprint")) return "Sprint Squad"
  if (s.includes("long jump") || s.includes("distance") || s.includes("marathon")) return "Distance Squad"
  if (s.includes("jump") || s.includes("field")) return "Jumps Squad"
  if (s.includes("freestyle") || s.includes("backstroke") || s.includes("wrestling") || s.includes("badminton")) {
    return "Throws Squad"
  }
  return squad
}

export function squadMatchesScope(athlete: Athlete, squadScope: string): boolean {
  if (squadScope === "All Squads") return true
  return normalizeSquadLabel(athlete.squad) === squadScope
}

export function filterAthletesByScope(athletes: Athlete[], scope: HierarchyScope): Athlete[] {
  return athletes.filter((athlete) => {
    if (scope.federation !== "All Federation" && getAthleteFederation(athlete) !== scope.federation) {
      return false
    }
    if (scope.discipline !== "All Disciplines" && athlete.sport !== scope.discipline) return false
    if (scope.academy !== "All Academies" && getAthleteAcademy(athlete) !== scope.academy) return false
    if (!squadMatchesScope(athlete, scope.squad)) return false
    return true
  })
}

export function filterInjuriesByAthletes(
  injuries: PersistedInjury[],
  athleteIds: Set<string>,
): PersistedInjury[] {
  return injuries.filter(
    (injury) => athleteIds.has(injury.athleteId) && injury.status !== "Resolved",
  )
}

export function filterSessionsByAthletes(
  sessions: PersistedSession[],
  athleteIds: Set<string>,
): PersistedSession[] {
  return sessions.filter((session) =>
    session.assignedAthleteIds.some((id) => athleteIds.has(id)),
  )
}

export function buildHierarchyOptions(athletes: Athlete[], scope: HierarchyScope) {
  const federationOptions = [
    { label: "All Federation", count: athletes.length },
    {
      label: "Northern Federation",
      count: athletes.filter((a) => getAthleteFederation(a) === "Northern Federation").length,
    },
    {
      label: "Southern Federation",
      count: athletes.filter((a) => getAthleteFederation(a) === "Southern Federation").length,
    },
  ]

  const afterFederation = filterAthletesByScope(athletes, {
    ...scope,
    discipline: "All Disciplines",
    academy: "All Academies",
    squad: "All Squads",
  })

  const disciplines = [...new Set(afterFederation.map((a) => a.sport))].sort()
  const disciplineOptions = [
    { label: "All Disciplines", count: afterFederation.length },
    ...disciplines.map((d) => ({
      label: d,
      count: afterFederation.filter((a) => a.sport === d).length,
    })),
  ]

  const afterDiscipline = filterAthletesByScope(athletes, {
    ...scope,
    academy: "All Academies",
    squad: "All Squads",
  })

  const academies = ["National Academy", "Regional Centre", "State Centre"]
  const academyOptions = [
    { label: "All Academies", count: afterDiscipline.length },
    ...academies.map((a) => ({
      label: a,
      count: afterDiscipline.filter((ath) => getAthleteAcademy(ath) === a).length,
    })),
  ]

  const afterAcademy = filterAthletesByScope(athletes, { ...scope, squad: "All Squads" })
  const squads = [...new Set(afterAcademy.map((a) => normalizeSquadLabel(a.squad)))].sort()
  const squadOptions = [
    { label: "All Squads", count: afterAcademy.length },
    ...squads.map((s) => ({
      label: s,
      count: afterAcademy.filter((a) => normalizeSquadLabel(a.squad) === s).length,
    })),
  ]

  return [
    { key: "federation", options: federationOptions },
    { key: "discipline", options: disciplineOptions },
    { key: "academy", options: academyOptions },
    { key: "squad", options: squadOptions },
  ]
}

export function applyHierarchySelection(
  scope: HierarchyScope,
  levelIndex: number,
  label: string,
): HierarchyScope {
  const keys: (keyof HierarchyScope)[] = ["federation", "discipline", "academy", "squad"]
  const next = { ...scope, [keys[levelIndex]]: label }

  if (levelIndex === 0 && label === "All Federation") {
    return { ...DEFAULT_HIERARCHY_SCOPE }
  }
  if (levelIndex === 1 && label === "All Disciplines") {
    return { ...next, academy: "All Academies", squad: "All Squads" }
  }
  if (levelIndex === 2 && label === "All Academies") {
    return { ...next, squad: "All Squads" }
  }
  return next
}

export function computeWeeklyLoadData(sessions: PersistedSession[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
  return days.map((day) => {
    const daySessions = sessions.filter((s) => s.day === day)
    const actual = daySessions.reduce((sum, s) => sum + sessionLoad(s.duration, s.rpe), 0)
    const planned = daySessions.length > 0 ? Math.round(actual * 0.92) : 0
    return { day, Actual: actual, Planned: planned || actual }
  })
}

export function computeAttendanceTrend(sessions: PersistedSession[], athleteIds: Set<string>) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const day = (i + 1) * 3
    const relevant = sessions.filter((s) => s.lifecycle === "complete")
    if (relevant.length === 0) {
      return { day: String(day), rate: 90 + (i % 3) }
    }
    let total = 0
    let present = 0
    for (const session of relevant) {
      for (const id of session.assignedAthleteIds) {
        if (!athleteIds.has(id)) continue
        const status = session.attendance[id]
        if (status) {
          total++
          if (status === "Present") present++
        }
      }
    }
    const rate = total > 0 ? Math.round((present / total) * 100) : 92
    return { day: String(day), rate: Math.min(100, Math.max(75, rate - i)) }
  })
  return points
}

export function scopeLabel(scope: HierarchyScope): string {
  const parts = [scope.federation]
  if (scope.discipline !== "All Disciplines") parts.push(scope.discipline)
  if (scope.academy !== "All Academies") parts.push(scope.academy)
  if (scope.squad !== "All Squads") parts.push(scope.squad)
  return parts.join(" › ")
}
