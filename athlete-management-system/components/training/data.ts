"use client"

// ─── Session types ───────────────────────────────────────────────────────────

export type SessionType = "Speed" | "Strength" | "Endurance" | "Recovery" | "Technical" | "Match"
export type Location = "Track" | "Gym" | "Pool" | "Field"

export interface Exercise {
  id: string
  name: string
  category: "Warm-up" | "Speed" | "Strength" | "Plyometric" | "Cool-down"
  muscleGroup: string
  sets?: number
  reps?: number
  load?: string
  rest?: string
}

export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
export type AttendanceStatus = "Present" | "Absent" | "Excused"
export type SessionLifecycle = "scheduled" | "complete"

export interface Session {
  id: string
  name: string
  day: DayKey
  squad: string
  duration: number // minutes
  coach: string
  rpe: number
  type: SessionType
  location: Location
  notes?: string
  exercises: Exercise[]
}

export interface PersistedSession extends Session {
  date: string
  time?: string
  lifecycle: SessionLifecycle
  assignedAthleteIds: string[]
  attendance: Record<string, AttendanceStatus | undefined>
  athleteRpe: Record<string, number>
}

export type WorkloadRecord = {
  athleteId: string
  sessionId: string
  date: string
  load: number
}

export type SessionFormPayload = {
  name: string
  date: string
  time: string
  squad: string
  sessionType: SessionType
  location: Location
  rpe: number
  notes: string
  duration: number
  exercises: Exercise[]
  coach: string
}

// ─── Weekly sessions ─────────────────────────────────────────────────────────

export const WEEKLY_SESSIONS: Session[] = [
  {
    id: "s1",
    name: "Speed Endurance",
    day: "Mon",
    squad: "Sprint Squad",
    duration: 90,
    coach: "Coach Ravi",
    rpe: 7,
    type: "Speed",
    location: "Track",
    notes: "Focus on maintaining form through fatigue. 6×200m at 85% max velocity with 3-min recovery.",
    exercises: [
      { id: "e1", name: "Dynamic Warm-up", category: "Warm-up", muscleGroup: "Full Body" },
      { id: "e2", name: "200m Repeats", category: "Speed", muscleGroup: "Lower Body", sets: 6, reps: 1, load: "85% max", rest: "3 min" },
      { id: "e3", name: "Cooldown Jog", category: "Cool-down", muscleGroup: "Full Body" },
    ],
  },
  {
    id: "s2",
    name: "Strength & Power",
    day: "Tue",
    squad: "Sprint Squad",
    duration: 75,
    coach: "Coach Anita",
    rpe: 8,
    type: "Strength",
    location: "Gym",
    notes: "Compound lifts followed by power circuit. Monitor bar speed.",
    exercises: [
      { id: "e4", name: "Barbell Squat", category: "Strength", muscleGroup: "Quads / Glutes", sets: 4, reps: 5, load: "82.5 kg", rest: "2.5 min" },
      { id: "e5", name: "Romanian Deadlift", category: "Strength", muscleGroup: "Hamstrings", sets: 3, reps: 8, load: "70 kg", rest: "2 min" },
      { id: "e6", name: "Box Jump", category: "Plyometric", muscleGroup: "Lower Body", sets: 4, reps: 6, load: "BW", rest: "90 s" },
      { id: "e7", name: "Bench Press", category: "Strength", muscleGroup: "Chest / Triceps", sets: 3, reps: 8, load: "75 kg", rest: "2 min" },
    ],
  },
  {
    id: "s3",
    name: "Active Recovery",
    day: "Wed",
    squad: "Sprint Squad",
    duration: 45,
    coach: "Coach Ravi",
    rpe: 3,
    type: "Recovery",
    location: "Pool",
    notes: "Light pool work and stretching. No high-intensity effort.",
    exercises: [
      { id: "e8", name: "Aqua Jogging", category: "Warm-up", muscleGroup: "Full Body", sets: 1, reps: 1, load: "15 min", rest: "-" },
      { id: "e9", name: "Foam Rolling", category: "Cool-down", muscleGroup: "Full Body", sets: 1, reps: 1, load: "10 min", rest: "-" },
    ],
  },
  {
    id: "s4",
    name: "Sprint Mechanics",
    day: "Thu",
    squad: "Sprint Squad",
    duration: 90,
    coach: "Coach Ravi",
    rpe: 7,
    type: "Technical",
    location: "Track",
    notes: "Technical drills — A-skips, B-skips, wicket runs. Video analysis session.",
    exercises: [
      { id: "e10", name: "A-Skip Drills", category: "Speed", muscleGroup: "Hip Flexors", sets: 4, reps: 40, load: "BW", rest: "60 s" },
      { id: "e11", name: "B-Skip Drills", category: "Speed", muscleGroup: "Hamstrings", sets: 4, reps: 40, load: "BW", rest: "60 s" },
      { id: "e12", name: "Wicket Runs", category: "Speed", muscleGroup: "Lower Body", sets: 6, reps: 1, load: "BW", rest: "90 s" },
      { id: "e13", name: "Standing Starts", category: "Speed", muscleGroup: "Lower Body", sets: 6, reps: 1, load: "BW", rest: "2 min" },
    ],
  },
  {
    id: "s5",
    name: "Race Simulation",
    day: "Fri",
    squad: "Sprint Squad",
    duration: 60,
    coach: "Coach Ravi",
    rpe: 9,
    type: "Match",
    location: "Track",
    notes: "Full race simulation. Blocks start. Maximum effort. Full recovery between reps.",
    exercises: [
      { id: "e14", name: "Block Start Practice", category: "Speed", muscleGroup: "Full Body", sets: 4, reps: 1, load: "Max", rest: "3 min" },
      { id: "e15", name: "100m Race Sim", category: "Speed", muscleGroup: "Full Body", sets: 3, reps: 1, load: "Max", rest: "10 min" },
    ],
  },
  {
    id: "s6",
    name: "Recovery & Mobility",
    day: "Sat",
    squad: "All Squads",
    duration: 45,
    coach: "Physio Team",
    rpe: 3,
    type: "Recovery",
    location: "Pool",
    notes: "Full squad recovery session. Yoga and foam rolling.",
    exercises: [
      { id: "e16", name: "Yoga Flow", category: "Warm-up", muscleGroup: "Full Body", sets: 1, reps: 1, load: "30 min", rest: "-" },
      { id: "e17", name: "Foam Rolling Circuit", category: "Cool-down", muscleGroup: "Full Body", sets: 1, reps: 1, load: "15 min", rest: "-" },
    ],
  },
]

// ─── Meso blocks ──────────────────────────────────────────────────────────────

export type BlockStatus = "Completed" | "In Progress" | "Upcoming"

export interface MesoBlock {
  id: string
  name: string
  weeks: string
  status: BlockStatus
  focusAreas: string[]
  loadPercent: number
  keySessions: number
}

export const MESO_BLOCKS: MesoBlock[] = [
  {
    id: "b1",
    name: "Base Conditioning",
    weeks: "Weeks 1–4",
    status: "Completed",
    focusAreas: ["Aerobic Base", "Movement Quality", "Strength Foundation"],
    loadPercent: 65,
    keySessions: 24,
  },
  {
    id: "b2",
    name: "Speed Development",
    weeks: "Weeks 5–8",
    status: "In Progress",
    focusAreas: ["Max Velocity", "Speed Endurance", "Power"],
    loadPercent: 80,
    keySessions: 28,
  },
  {
    id: "b3",
    name: "Competition Prep",
    weeks: "Weeks 9–12",
    status: "Upcoming",
    focusAreas: ["Race Specificity", "Peaking", "Mental Prep"],
    loadPercent: 90,
    keySessions: 20,
  },
  {
    id: "b4",
    name: "Taper",
    weeks: "Weeks 13–14",
    status: "Upcoming",
    focusAreas: ["Load Reduction", "Sharpening", "Race Simulation"],
    loadPercent: 50,
    keySessions: 8,
  },
]

// ─── Macro phases ─────────────────────────────────────────────────────────────

export interface MacroPhase {
  id: string
  name: string
  period: string
  months: string
  color: string
  bgColor: string
  milestones: string[]
  widthPercent: number
}

export const MACRO_PHASES: MacroPhase[] = [
  {
    id: "p1",
    name: "Pre-Season",
    period: "Jan – Mar",
    months: "3 months",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    milestones: ["Fitness testing", "Squad selection", "Base conditioning block"],
    widthPercent: 25,
  },
  {
    id: "p2",
    name: "Competition Season",
    period: "Apr – Aug",
    months: "5 months",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    milestones: ["National Championships", "Asian Games qualifiers", "Peak performance window"],
    widthPercent: 42,
  },
  {
    id: "p3",
    name: "Recovery",
    period: "Sep – Oct",
    months: "2 months",
    color: "#10B981",
    bgColor: "#ECFDF5",
    milestones: ["Physical recovery", "Mental reset", "Off-season assessments"],
    widthPercent: 17,
  },
  {
    id: "p4",
    name: "Planning",
    period: "Nov – Dec",
    months: "2 months",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    milestones: ["Annual review", "Goal setting", "Next season planning"],
    widthPercent: 16,
  },
]

// ─── Exercise library ─────────────────────────────────────────────────────────

export const EXERCISE_LIBRARY: Exercise[] = [
  { id: "lib1", name: "Dynamic Warm-up", category: "Warm-up", muscleGroup: "Full Body" },
  { id: "lib2", name: "High Knees", category: "Warm-up", muscleGroup: "Hip Flexors" },
  { id: "lib3", name: "Leg Swings", category: "Warm-up", muscleGroup: "Hamstrings / Hip" },
  { id: "lib4", name: "Butt Kicks", category: "Warm-up", muscleGroup: "Hamstrings" },
  { id: "lib5", name: "100m Sprint", category: "Speed", muscleGroup: "Full Body" },
  { id: "lib6", name: "200m Repeat", category: "Speed", muscleGroup: "Lower Body" },
  { id: "lib7", name: "Flying 30m", category: "Speed", muscleGroup: "Full Body" },
  { id: "lib8", name: "A-Skip Drills", category: "Speed", muscleGroup: "Hip Flexors" },
  { id: "lib9", name: "B-Skip Drills", category: "Speed", muscleGroup: "Hamstrings" },
  { id: "lib10", name: "Barbell Squat", category: "Strength", muscleGroup: "Quads / Glutes" },
  { id: "lib11", name: "Romanian Deadlift", category: "Strength", muscleGroup: "Hamstrings" },
  { id: "lib12", name: "Hip Thrust", category: "Strength", muscleGroup: "Glutes" },
  { id: "lib13", name: "Bench Press", category: "Strength", muscleGroup: "Chest / Triceps" },
  { id: "lib14", name: "Pull-ups", category: "Strength", muscleGroup: "Back / Biceps" },
  { id: "lib15", name: "Box Jump", category: "Plyometric", muscleGroup: "Lower Body" },
  { id: "lib16", name: "Hurdle Hop", category: "Plyometric", muscleGroup: "Lower Body" },
  { id: "lib17", name: "Depth Jump", category: "Plyometric", muscleGroup: "Lower Body" },
  { id: "lib18", name: "Bounding", category: "Plyometric", muscleGroup: "Full Body" },
  { id: "lib19", name: "Foam Rolling", category: "Cool-down", muscleGroup: "Full Body" },
  { id: "lib20", name: "Static Stretching", category: "Cool-down", muscleGroup: "Full Body" },
  { id: "lib21", name: "Cooldown Jog", category: "Cool-down", muscleGroup: "Full Body" },
]

// ─── ACWR data ────────────────────────────────────────────────────────────────

export interface AcwrPoint {
  day: number // 1–28
  label: string
  marcus: number
}

function genAcwr(): AcwrPoint[] {
  const points: AcwrPoint[] = []
  const today = new Date()
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    const day = 28 - i
    // Marcus starts safe, dips slightly, then spikes above 1.3 in last 3 days
    let marcus: number
    if (day <= 10) marcus = 0.85 + Math.random() * 0.2
    else if (day <= 18) marcus = 0.95 + Math.random() * 0.25
    else if (day <= 25) marcus = 1.1 + Math.random() * 0.15
    else marcus = 1.33 + Math.random() * 0.12 // last 3 days above 1.3
    points.push({ day, label, marcus: +marcus.toFixed(2) })
  }
  return points
}

export const ACWR_DATA = genAcwr()

export interface AcwrAthlete {
  name: string
  acwr: number
  status: "danger" | "caution" | "safe"
  badge: string
  badgeColor: string
}

export const ACWR_ATHLETES: AcwrAthlete[] = [
  { name: "Marcus Chen", acwr: 1.41, status: "danger", badge: "1.41", badgeColor: "bg-red-100 text-red-700" },
  { name: "Priya Sharma", acwr: 1.12, status: "safe", badge: "1.12", badgeColor: "bg-green-100 text-green-700" },
  { name: "Arjun Singh", acwr: 0.94, status: "safe", badge: "0.94", badgeColor: "bg-green-100 text-green-700" },
  { name: "Kavya Reddy", acwr: 1.29, status: "caution", badge: "1.29", badgeColor: "bg-amber-100 text-amber-700" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const RPE_COLOR: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-yellow-100 text-yellow-700",
  5: "bg-yellow-100 text-yellow-700",
  6: "bg-yellow-100 text-yellow-700",
  7: "bg-orange-100 text-orange-700",
  8: "bg-orange-100 text-orange-700",
  9: "bg-red-100 text-red-700",
  10: "bg-red-100 text-red-700",
}

export const SESSION_TYPE_COLOR: Record<SessionType, string> = {
  Speed:     "bg-blue-100 text-blue-700",
  Strength:  "bg-purple-100 text-purple-700",
  Endurance: "bg-teal-100 text-teal-700",
  Recovery:  "bg-green-100 text-green-700",
  Technical: "bg-indigo-100 text-indigo-700",
  Match:     "bg-red-100 text-red-700",
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const DAY_INDEX: Record<DayKey, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(12, 0, 0, 0)
  return d
}

export function dateToDayKey(dateStr: string): DayKey {
  const d = new Date(`${dateStr}T12:00:00`)
  const keys: DayKey[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return keys[d.getDay()] as DayKey
}

export function dateForDayInCurrentWeek(day: DayKey): string {
  const monday = getMonday(new Date())
  const d = new Date(monday)
  d.setDate(monday.getDate() + DAY_INDEX[day])
  return formatLocalDate(d)
}

export function seedSessionsForCurrentWeek(): PersistedSession[] {
  const sprintAthletes = ["marcus-chen", "priya-sharma", "aisha-patel", "kavya-reddy"]
  return WEEKLY_SESSIONS.map((session) => ({
    ...session,
    date: dateForDayInCurrentWeek(session.day),
    lifecycle: "scheduled" as const,
    assignedAthleteIds: session.squad.includes("Sprint") ? sprintAthletes : [],
    attendance: {},
    athleteRpe: {},
  }))
}

export function sessionLoad(duration: number, rpe: number): number {
  return duration * rpe
}

export function calculateAthleteAcwr(
  records: WorkloadRecord[],
  athleteId: string,
  asOf = new Date(),
): { acute: number; chronic: number; acwr: number; flagged: boolean } {
  const cutoff = (days: number) => {
    const d = new Date(asOf)
    d.setDate(d.getDate() - days)
    d.setHours(0, 0, 0, 0)
    return d
  }
  const athleteRecords = records.filter((r) => r.athleteId === athleteId)
  const inWindow = (days: number) =>
    athleteRecords.filter((r) => new Date(`${r.date}T12:00:00`) >= cutoff(days))

  const acute = inWindow(7).reduce((sum, r) => sum + r.load, 0)
  const chronicTotal = inWindow(28).reduce((sum, r) => sum + r.load, 0)
  const chronic = chronicTotal / 4
  const acwr = chronic > 0 ? +(acute / chronic).toFixed(2) : 0
  return { acute, chronic: +chronic.toFixed(0), acwr, flagged: acwr > 1.3 }
}

export function acwrStatus(acwr: number): "danger" | "caution" | "safe" {
  if (acwr > 1.3) return "danger"
  if (acwr >= 1.1) return "caution"
  return "safe"
}

export function computeAttendanceRate(
  sessions: PersistedSession[],
  athleteId: string,
): number | null {
  const relevant = sessions.filter(
    (s) => s.lifecycle === "complete" && s.assignedAthleteIds.includes(athleteId),
  )
  if (relevant.length === 0) return null
  const marked = relevant.filter((s) => s.attendance[athleteId])
  if (marked.length === 0) return null
  const present = marked.filter((s) => s.attendance[athleteId] === "Present").length
  return Math.round((present / marked.length) * 100)
}
