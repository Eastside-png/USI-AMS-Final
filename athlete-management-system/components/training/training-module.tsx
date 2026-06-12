"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  ClipboardCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MESO_BLOCKS,
  MACRO_PHASES,
  RPE_COLOR,
  SESSION_TYPE_COLOR,
  DAYS,
  dateToDayKey,
  computeAttendanceRate,
  calculateAthleteAcwr,
  sessionLoad,
  type PersistedSession,
  type SessionFormPayload,
  type MesoBlock,
  type WorkloadRecord,
} from "./data"
import type { Athlete } from "@/components/athletes/data"
import { SessionBuilderModal } from "./session-builder-modal"
import { AcwrDashboard } from "./acwr-dashboard"
import { SessionDetailDrawer } from "./session-detail-drawer"

type View = "Micro" | "Meso" | "Macro"

export function TrainingModule({
  role = "Federation Admin",
  onNavigate,
  athletes,
  sessions,
  onSessionsChange,
  workloads,
  onWorkloadsChange,
  openSessionBuilder,
  initialSessionType,
  onSessionBuilderConsumed,
}: {
  role?: string
  onNavigate?: (module: string) => void
  athletes: Athlete[]
  sessions: PersistedSession[]
  onSessionsChange: (sessions: PersistedSession[]) => void
  workloads: WorkloadRecord[]
  onWorkloadsChange: (workloads: WorkloadRecord[]) => void
  openSessionBuilder?: boolean
  initialSessionType?: PersistedSession["type"]
  onSessionBuilderConsumed?: () => void
}) {
  const [view, setView] = useState<View>("Micro")
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<PersistedSession | null>(null)
  const [drawerSession, setDrawerSession] = useState<PersistedSession | null>(null)
  const [toast, setToast] = useState("")
  const [builderSessionType, setBuilderSessionType] = useState<PersistedSession["type"] | undefined>()

  useEffect(() => {
    if (openSessionBuilder) {
      setBuilderOpen(true)
      if (initialSessionType) setBuilderSessionType(initialSessionType)
      onSessionBuilderConsumed?.()
    }
  }, [openSessionBuilder, initialSessionType, onSessionBuilderConsumed])

  const sprintAthletes = athletes.filter(
    (a) => a.squad === "National Sprint Squad" && a.status === "Active",
  )

  function handleSaveSession(payload: SessionFormPayload, editingId?: string) {
    const day = dateToDayKey(payload.date)
    const squadAthleteIds = athletes
      .filter((a) => {
        if (payload.squad === "All Squads") return a.status === "Active"
        if (payload.squad === "Sprint Squad") return a.squad === "National Sprint Squad"
        return a.squad.toLowerCase().includes(payload.squad.toLowerCase().split(" ")[0])
      })
      .map((a) => a.id)

    if (editingId) {
      onSessionsChange(
        sessions.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: payload.name,
                day,
                date: payload.date,
                time: payload.time,
                squad: payload.squad,
                duration: payload.duration,
                coach: payload.coach,
                rpe: payload.rpe,
                type: payload.sessionType,
                location: payload.location,
                notes: payload.notes,
                exercises: payload.exercises,
              }
            : s,
        ),
      )
      setToast("Session updated")
      return
    }

    const created: PersistedSession = {
      id: `session-${Date.now()}`,
      name: payload.name,
      day,
      date: payload.date,
      time: payload.time,
      squad: payload.squad,
      duration: payload.duration,
      coach: payload.coach,
      rpe: payload.rpe,
      type: payload.sessionType,
      location: payload.location,
      notes: payload.notes,
      exercises: payload.exercises,
      lifecycle: "scheduled",
      assignedAthleteIds: squadAthleteIds,
      attendance: {},
      athleteRpe: {},
    }
    onSessionsChange([...sessions, created])
    setToast("Session saved to weekly calendar")
  }

  function handleSessionUpdate(updated: PersistedSession) {
    onSessionsChange(sessions.map((s) => (s.id === updated.id ? updated : s)))
  }

  function handleSessionDelete(id: string) {
    onSessionsChange(sessions.filter((s) => s.id !== id))
    onWorkloadsChange(workloads.filter((w) => w.sessionId !== id))
    setToast("Session deleted")
  }

  function handleSessionComplete(
    session: PersistedSession,
    rpeByAthlete: Record<string, number>,
  ) {
    onSessionsChange(sessions.map((s) => (s.id === session.id ? session : s)))

    const newWorkloads = [...workloads]
    for (const [athleteId, rpe] of Object.entries(rpeByAthlete)) {
      const load = sessionLoad(session.duration, rpe)
      const existing = newWorkloads.findIndex(
        (w) => w.sessionId === session.id && w.athleteId === athleteId,
      )
      const record: WorkloadRecord = {
        athleteId,
        sessionId: session.id,
        date: session.date,
        load,
      }
      if (existing >= 0) newWorkloads[existing] = record
      else newWorkloads.push(record)
    }
    onWorkloadsChange(newWorkloads)

    const flagged = Object.keys(rpeByAthlete).filter(
      (athleteId) => calculateAthleteAcwr(newWorkloads, athleteId).flagged,
    )
    setToast(
      flagged.length > 0
        ? `Session complete — ACWR flagged for ${flagged.length} athlete(s) above 1.3`
        : "Session complete — RPE saved and workloads updated",
    )
  }

  if (role === "Physiotherapist") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="max-w-xl rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <ClipboardCheck className="h-6 w-6 text-[#1A56DB]" />
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Training Availability View</h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Session design details are hidden in the physiotherapy role. Use this view to
            confirm modified-load athletes and return-to-training constraints.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Modified load", value: "4" },
              { label: "RTP monitored", value: "3" },
              { label: "Cleared today", value: "7" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#6B7280]">{item.label}</p>
                <p className="text-2xl font-bold text-[#0F172A]">{item.value}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("Medical")}
            className="mt-5 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A56DB]/90"
          >
            Review medical constraints
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Page header */}
      <div className="sticky top-16 z-20 flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Training &amp; Periodisation</h1>
          <p className="text-sm text-muted-foreground">
            {role === "Coach" ? "Your Sprint Squad - Week 23 of 52" : "Sprint Squad - Week 23 of 52"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex rounded-lg border border-border bg-muted/40 p-1">
            {(["Macro", "Meso", "Micro"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  view === v
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingSession(null)
              setBuilderOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1A56DB]/90"
          >
            <Plus className="h-4 w-4" />
            Create Session
          </button>
        </div>
      </div>

      <div className="p-6">
        {toast && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 text-sm font-semibold text-[#15803D]">
            {toast}
            <button type="button" onClick={() => setToast("")} className="text-[#166534]">Dismiss</button>
          </div>
        )}

        {view === "Micro" && (
          <MicroView sessions={sessions} onSessionClick={setDrawerSession} />
        )}
        {view === "Meso" && <MesoView />}
        {view === "Macro" && <MacroView />}

        {view === "Micro" && (
          <AcwrDashboard athletes={sprintAthletes} workloads={workloads} sessions={sessions} />
        )}
      </div>

      <SessionBuilderModal
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false)
          setEditingSession(null)
          setBuilderSessionType(undefined)
        }}
        onSave={handleSaveSession}
        initialSession={editingSession}
        defaultSessionType={builderSessionType}
      />
      <SessionDetailDrawer
        session={drawerSession}
        athletes={athletes}
        onClose={() => setDrawerSession(null)}
        onUpdate={handleSessionUpdate}
        onDelete={handleSessionDelete}
        onEdit={(session) => {
          setEditingSession(session)
          setDrawerSession(null)
          setBuilderOpen(true)
        }}
        onComplete={handleSessionComplete}
      />
    </div>
  )
}

// ─── Micro View ───────────────────────────────────────────────────────────────

function MicroView({
  sessions,
  onSessionClick,
}: {
  sessions: PersistedSession[]
  onSessionClick: (s: PersistedSession) => void
}) {
  // Get Mon–Fri dates for current week
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const dayDates = DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          {monday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} –{" "}
          {dayDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day, i) => {
          const date = dayDates[i]
          const isToday = date.toDateString() === today.toDateString()
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          const daySessions = sessions.filter((s) => s.date === dateKey)
          const isRest = day === "Sun"

          return (
            <div
              key={day}
              className={cn(
                "flex min-h-[220px] flex-col rounded-xl border bg-white",
                isToday ? "border-[#1A56DB] ring-1 ring-[#1A56DB]/20" : "border-border",
                isRest && "bg-slate-50",
              )}
            >
              {/* Day header */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-t-xl px-3 py-2",
                  isToday ? "bg-[#1A56DB]/5" : "",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    isToday ? "text-[#1A56DB]" : "text-muted-foreground",
                  )}
                >
                  {day}
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isToday ? "bg-[#1A56DB] text-white" : "text-muted-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Sessions */}
              <div className="flex flex-1 flex-col gap-2 p-2">
                {isRest ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-1">
                    <span className="text-xl">—</span>
                    <span className="text-xs text-muted-foreground">Rest Day</span>
                  </div>
                ) : daySessions.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <span className="text-xs text-muted-foreground/60">No sessions</span>
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={() => onSessionClick(session)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionCard({ session, onClick }: { session: PersistedSession; onClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rpeColor = RPE_COLOR[session.rpe] ?? "bg-slate-100 text-slate-700"
  const typeColor = SESSION_TYPE_COLOR[session.type] ?? "bg-slate-100 text-slate-700"

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full rounded-lg border border-border bg-white p-2.5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* type badge + menu */}
      <div className="mb-1.5 flex items-start justify-between gap-1">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", typeColor)}>
          {session.type}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
          className="rounded p-0.5 text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Session name */}
      <p className="mb-2 text-xs font-semibold leading-tight text-foreground">{session.name}</p>

      {/* Meta */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />
          <span className="text-[10px] text-muted-foreground">{session.duration} min</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
          <span className="text-[10px] text-muted-foreground">{session.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 shrink-0 text-muted-foreground/70" />
          <span className="text-[10px] text-muted-foreground">{session.coach}</span>
        </div>
      </div>

      {/* RPE chip */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{session.squad}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", rpeColor)}>
          RPE {session.rpe}
        </span>
      </div>
    </button>
  )
}

// ─── Meso View ────────────────────────────────────────────────────────────────

function MesoView() {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-base font-semibold text-foreground">Mesocycle — Training Blocks</h2>
      <div className="grid grid-cols-2 gap-5">
        {MESO_BLOCKS.map((block) => (
          <MesoBlockCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}

function MesoBlockCard({ block }: { block: MesoBlock }) {
  const isCompleted = block.status === "Completed"
  const isInProgress = block.status === "In Progress"

  const borderColor = isCompleted
    ? "border-emerald-400"
    : isInProgress
    ? "border-[#1A56DB]"
    : "border-border"

  const statusBadge = isCompleted
    ? "bg-emerald-100 text-emerald-700"
    : isInProgress
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-500"

  return (
    <div className={cn("rounded-xl border-2 bg-white p-5 shadow-sm", borderColor)}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {isInProgress && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#1A56DB]" />
              </span>
            )}
            <h3 className="font-semibold text-foreground">{block.name}</h3>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{block.weeks}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusBadge)}>
          {block.status}
        </span>
      </div>

      {/* Focus areas */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {block.focusAreas.map((area) => (
          <span
            key={area}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {area}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-xs text-muted-foreground">Load</p>
            <p className="text-sm font-bold text-foreground">{block.loadPercent}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#1A56DB]" />
          <div>
            <p className="text-xs text-muted-foreground">Sessions</p>
            <p className="text-sm font-bold text-foreground">{block.keySessions}</p>
          </div>
        </div>
        {isInProgress && (
          <div className="ml-auto">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-semibold text-[#1A56DB]">52%</span>
            </div>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[52%] rounded-full bg-[#1A56DB]" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Macro View ───────────────────────────────────────────────────────────────

function MacroView() {
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-base font-semibold text-foreground">Annual Macro Plan — 2026</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Sprint Squad · 52-week periodisation overview
      </p>

      {/* Timeline bar */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-white p-5">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Jan</span>
          <span>Mar</span>
          <span>Jun</span>
          <span>Sep</span>
          <span>Dec</span>
        </div>
        <div className="flex h-10 w-full overflow-hidden rounded-lg">
          {MACRO_PHASES.map((phase) => (
            <div
              key={phase.id}
              style={{ width: `${phase.widthPercent}%`, backgroundColor: phase.color }}
              className="flex items-center justify-center px-2"
            >
              <span className="truncate text-[11px] font-semibold text-white">{phase.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="grid grid-cols-4 gap-4">
        {MACRO_PHASES.map((phase) => (
          <div
            key={phase.id}
            className="rounded-xl border-2 bg-white p-4 shadow-sm"
            style={{ borderColor: phase.color }}
          >
            <div
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: phase.bgColor, color: phase.color }}
            >
              <TrendingUp className="h-3 w-3" />
              {phase.period}
            </div>
            <h3 className="mb-0.5 font-semibold text-foreground">{phase.name}</h3>
            <p className="mb-3 text-xs text-muted-foreground">{phase.months}</p>

            <div className="flex flex-col gap-1.5">
              {phase.milestones.map((m) => (
                <div key={m} className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" style={{ color: phase.color }} />
                  <span className="text-xs text-muted-foreground">{m}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
