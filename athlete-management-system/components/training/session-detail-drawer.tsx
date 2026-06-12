"use client"

import { useMemo, useState } from "react"
import {
  X,
  Clock,
  MapPin,
  User,
  Dumbbell,
  FileText,
  Trash2,
  Pencil,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  type PersistedSession,
  type AttendanceStatus,
  RPE_COLOR,
  SESSION_TYPE_COLOR,
  sessionLoad,
} from "./data"
import type { Athlete } from "@/components/athletes/data"

type Props = {
  session: PersistedSession | null
  athletes: Athlete[]
  onClose: () => void
  onUpdate: (session: PersistedSession) => void
  onDelete: (sessionId: string) => void
  onEdit: (session: PersistedSession) => void
  onComplete: (session: PersistedSession, rpeByAthlete: Record<string, number>) => void
}

const CATEGORY_COLOR: Record<string, string> = {
  "Warm-up": "bg-yellow-100 text-yellow-700",
  Speed: "bg-blue-100 text-blue-700",
  Strength: "bg-purple-100 text-purple-700",
  Plyometric: "bg-orange-100 text-orange-700",
  "Cool-down": "bg-green-100 text-green-700",
}

export function SessionDetailDrawer({
  session,
  athletes,
  onClose,
  onUpdate,
  onDelete,
  onEdit,
  onComplete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [rpeStep, setRpeStep] = useState(false)
  const [rpeDraft, setRpeDraft] = useState<Record<string, number>>({})

  const assignedAthletes = useMemo(() => {
    if (!session) return []
    return session.assignedAthleteIds
      .map((id) => athletes.find((a) => a.id === id))
      .filter(Boolean) as Athlete[]
  }, [athletes, session])

  if (!session) return null

  const rpeColor = RPE_COLOR[session.rpe] ?? "bg-slate-100 text-slate-700"
  const typeColor = SESSION_TYPE_COLOR[session.type] ?? "bg-slate-100 text-slate-700"
  const presentAthletes = assignedAthletes.filter((a) => session.attendance[a.id] === "Present")

  function setAttendance(athleteId: string, status: AttendanceStatus) {
    if (!session) return
    onUpdate({
      ...session,
      attendance: { ...session.attendance, [athleteId]: status },
    })
  }

  function handleMarkComplete() {
    if (!session) return
    const initialRpe: Record<string, number> = {}
    for (const athlete of presentAthletes) {
      initialRpe[athlete.id] = session.athleteRpe[athlete.id] ?? session.rpe
    }
    setRpeDraft(initialRpe)
    setRpeStep(true)
  }

  function submitRpe() {
    if (!session) return
    onComplete(
      { ...session, lifecycle: "complete", athleteRpe: { ...session.athleteRpe, ...rpeDraft } },
      rpeDraft,
    )
    setRpeStep(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[480px] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", typeColor)}>
                {session.type}
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", rpeColor)}>
                RPE {session.rpe}
              </span>
              {session.lifecycle === "complete" && (
                <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-semibold text-[#15803D]">
                  Complete
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">{session.name}</h2>
            <p className="text-sm text-muted-foreground">
              {session.squad} · {session.date}
              {session.time ? ` · ${session.time}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="mt-1 rounded-lg p-2 text-muted-foreground hover:bg-muted/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              [Clock, `${session.duration} min`, "Duration"],
              [MapPin, session.location, "Location"],
              [User, session.coach, "Coach"],
            ].map(([Icon, value, label]) => {
              const I = Icon as React.ElementType
              return (
                <div key={label as string} className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 p-3 text-center">
                  <I className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground truncate w-full">{value as string}</p>
                  <p className="text-[10px] text-muted-foreground">{label as string}</p>
                </div>
              )
            })}
          </div>

          {session.notes && (
            <div className="mb-5 rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Session Notes</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{session.notes}</p>
            </div>
          )}

          {/* Attendance */}
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Attendance</h3>
            <div className="flex flex-col gap-2">
              {assignedAthletes.map((athlete) => {
                const current = session.attendance[athlete.id]
                return (
                  <div key={athlete.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {athlete.firstName} {athlete.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Load if present: {sessionLoad(session.duration, session.athleteRpe[athlete.id] ?? session.rpe)} AU
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {(["Present", "Absent", "Excused"] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setAttendance(athlete.id, status)}
                          className={cn(
                            "rounded-md px-2 py-1 text-[10px] font-semibold transition-colors",
                            current === status
                              ? status === "Present"
                                ? "bg-[#DCFCE7] text-[#15803D]"
                                : status === "Absent"
                                  ? "bg-[#FEE2E2] text-[#B91C1C]"
                                  : "bg-[#FEF9C3] text-[#92400E]"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              {assignedAthletes.length === 0 && (
                <p className="text-sm text-muted-foreground">No athletes assigned to this session.</p>
              )}
            </div>
          </div>

          {/* RPE collection step */}
          {rpeStep && (
            <div className="mb-5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
              <h3 className="text-sm font-semibold text-[#0F172A]">Post-Session RPE Collection</h3>
              <p className="mt-1 text-xs text-[#6B7280]">Record RPE for all Present athletes (1–10).</p>
              <div className="mt-3 space-y-3">
                {presentAthletes.map((athlete) => (
                  <div key={athlete.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{athlete.firstName} {athlete.lastName}</span>
                      <span className="font-bold text-[#1A56DB]">{rpeDraft[athlete.id] ?? session.rpe}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={rpeDraft[athlete.id] ?? session.rpe}
                      onChange={(e) =>
                        setRpeDraft((prev) => ({ ...prev, [athlete.id]: Number(e.target.value) }))
                      }
                      className="mt-1 w-full accent-[#1A56DB]"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setRpeStep(false)}>Back</Button>
                <Button size="sm" className="bg-[#1A56DB] text-white" onClick={submitRpe}>
                  Submit RPE &amp; Update ACWR
                </Button>
              </div>
            </div>
          )}

          {/* Exercises */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Exercises ({session.exercises.length})
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {session.exercises.map((ex, idx) => (
                <div key={ex.id} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{ex.name}</p>
                    <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", CATEGORY_COLOR[ex.category] ?? "bg-slate-100 text-slate-600")}>
                      {ex.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-6 py-4">
          {confirmDelete ? (
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3">
              <p className="text-sm font-semibold text-[#B91C1C]">Delete this session?</p>
              <p className="mt-1 text-xs text-[#7F1D1D]">This cannot be undone.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                  onClick={() => {
                    onDelete(session.id)
                    onClose()
                  }}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(session)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-[#B91C1C]" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              {session.lifecycle !== "complete" && !rpeStep && (
                <Button
                  size="sm"
                  className="ml-auto gap-1 bg-[#15803D] text-white hover:bg-[#166534]"
                  onClick={handleMarkComplete}
                  disabled={presentAthletes.length === 0}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
