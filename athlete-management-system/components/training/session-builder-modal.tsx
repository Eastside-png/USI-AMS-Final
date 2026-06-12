"use client"

import { useEffect, useState } from "react"
import {
  X,
  GripVertical,
  Plus,
  Trash2,
  Search,
  Clock,
  Dumbbell,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  EXERCISE_LIBRARY,
  type Exercise,
  type SessionType,
  type Location,
  type PersistedSession,
  type SessionFormPayload,
} from "./data"

interface SessionExercise extends Exercise {
  uid: string
  sets: number
  reps: number
  load: string
  rest: string
}

const SESSION_TYPES: SessionType[] = ["Speed", "Strength", "Endurance", "Recovery", "Technical", "Match"]
const LOCATIONS: Location[] = ["Track", "Gym", "Pool", "Field"]
const SQUADS = ["Sprint Squad", "Distance Squad", "Field Events", "All Squads"]
const CATEGORIES = ["All", "Warm-up", "Speed", "Strength", "Plyometric", "Cool-down"] as const

interface Props {
  open: boolean
  onClose: () => void
  onSave: (payload: SessionFormPayload, editingId?: string) => void
  initialSession?: PersistedSession | null
  defaultSessionType?: SessionType
}

export function SessionBuilderModal({ open, onClose, onSave, initialSession, defaultSessionType }: Props) {
  // Form state
  const [sessionName, setSessionName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [squad, setSquad] = useState("Sprint Squad")
  const [sessionType, setSessionType] = useState<SessionType>("Speed")
  const [location, setLocation] = useState<Location>("Track")
  const [rpe, setRpe] = useState(7)
  const [notes, setNotes] = useState("")

  // Exercise state
  const [exercises, setExercises] = useState<SessionExercise[]>([])
  const [libSearch, setLibSearch] = useState("")
  const [libCategory, setLibCategory] = useState<typeof CATEGORIES[number]>("All")
  const [justAdded, setJustAdded] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (initialSession) {
      setSessionName(initialSession.name)
      setDate(initialSession.date)
      setTime(initialSession.time ?? "")
      setSquad(initialSession.squad)
      setSessionType(initialSession.type)
      setLocation(initialSession.location)
      setRpe(initialSession.rpe)
      setNotes(initialSession.notes ?? "")
      setExercises(
        initialSession.exercises.map((ex) => ({
          ...ex,
          uid: ex.id,
          sets: ex.sets ?? 3,
          reps: ex.reps ?? 8,
          load: ex.load ?? "BW",
          rest: ex.rest ?? "90 s",
        })),
      )
    } else {
      setSessionName("")
      setDate("")
      setTime("")
      setSquad("Sprint Squad")
      setSessionType(defaultSessionType ?? "Speed")
      setLocation("Track")
      setRpe(defaultSessionType === "Recovery" ? 4 : 7)
      setNotes("")
      setExercises([])
    }
  }, [open, initialSession, defaultSessionType])

  const filteredLibrary = EXERCISE_LIBRARY.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(libSearch.toLowerCase())
    const matchCat = libCategory === "All" || ex.category === libCategory
    return matchSearch && matchCat
  })

  function addExercise(ex: Exercise) {
    const uid = `${ex.id}-${Date.now()}`
    setExercises((prev) => [
      ...prev,
      { ...ex, uid, sets: 3, reps: 8, load: "BW", rest: "90 s" },
    ])
    setJustAdded(ex.id)
    setTimeout(() => setJustAdded(null), 1200)
  }

  function removeExercise(uid: string) {
    setExercises((prev) => prev.filter((e) => e.uid !== uid))
  }

  function updateExercise(uid: string, field: keyof SessionExercise, value: string | number) {
    setExercises((prev) =>
      prev.map((e) => (e.uid === uid ? { ...e, [field]: value } : e)),
    )
  }

  // Summary calcs
  const totalVolume = exercises.reduce((acc, e) => acc + e.sets * e.reps, 0)
  const estDuration = 10 + exercises.length * 8 + (rpe >= 8 ? 15 : 0)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative flex h-[90vh] w-[90vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Left panel (60%) ── */}
        <div className="flex w-[60%] flex-col border-r border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {initialSession ? "Edit Session" : "Create Session"}
              </h2>
              <p className="text-sm text-muted-foreground">Configure your training session</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Session Name */}
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Session Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. Speed Endurance — Sprint Squad"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                />
              </div>

              {/* Time */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                />
              </div>

              {/* Squad */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Squad</label>
                <select
                  value={squad}
                  onChange={(e) => setSquad(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                >
                  {SQUADS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Session Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Session Type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as SessionType)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as Location)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Target RPE */}
              <div className="col-span-2">
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Target RPE</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      rpe <= 3
                        ? "bg-emerald-100 text-emerald-700"
                        : rpe <= 6
                        ? "bg-yellow-100 text-yellow-700"
                        : rpe <= 8
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {rpe} / 10
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-[#1A56DB]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Easy (1)</span>
                  <span>Moderate (5)</span>
                  <span>Max (10)</span>
                </div>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Coaching notes, focus areas, athlete modifications..."
                  className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
                />
              </div>
            </div>

            {/* Exercise list */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Exercises{" "}
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {exercises.length}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click an exercise in the library to add
                </p>
              </div>

              {exercises.length === 0 ? (
                <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border">
                  <Dumbbell className="h-5 w-5 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground/60">
                    No exercises added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {exercises.map((ex, idx) => (
                    <div
                      key={ex.uid}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40" />
                      <span className="w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate text-xs font-medium text-foreground">
                        {ex.name}
                      </span>
                      {/* Sets */}
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateExercise(ex.uid, "sets", Number(e.target.value))}
                        className="w-10 rounded border border-border bg-white px-1 py-0.5 text-center text-xs focus:outline-none"
                        min={1}
                      />
                      <span className="text-xs text-muted-foreground">×</span>
                      {/* Reps */}
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateExercise(ex.uid, "reps", Number(e.target.value))}
                        className="w-10 rounded border border-border bg-white px-1 py-0.5 text-center text-xs focus:outline-none"
                        min={1}
                      />
                      {/* Load */}
                      <input
                        type="text"
                        value={ex.load}
                        onChange={(e) => updateExercise(ex.uid, "load", e.target.value)}
                        placeholder="Load"
                        className="w-14 rounded border border-border bg-white px-1 py-0.5 text-center text-xs focus:outline-none"
                      />
                      {/* Rest */}
                      <input
                        type="text"
                        value={ex.rest}
                        onChange={(e) => updateExercise(ex.uid, "rest", e.target.value)}
                        placeholder="Rest"
                        className="w-14 rounded border border-border bg-white px-1 py-0.5 text-center text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.uid)}
                        className="rounded p-1 text-muted-foreground/50 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary strip */}
          <div className="flex items-center gap-6 border-t border-border bg-slate-50 px-6 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Est. Duration</p>
                <p className="text-sm font-bold text-foreground">{estDuration} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Total Volume</p>
                <p className="text-sm font-bold text-foreground">{totalVolume} reps</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Exercises</p>
                <p className="text-sm font-bold text-foreground">{exercises.length}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!sessionName.trim() || !date) return
                onSave(
                  {
                    name: sessionName.trim(),
                    date,
                    time,
                    squad,
                    sessionType,
                    location,
                    rpe,
                    notes,
                    duration: estDuration,
                    exercises: exercises.map(({ uid: _uid, ...ex }) => ({
                      id: ex.id,
                      name: ex.name,
                      category: ex.category,
                      muscleGroup: ex.muscleGroup,
                      sets: ex.sets,
                      reps: ex.reps,
                      load: ex.load,
                      rest: ex.rest,
                    })),
                    coach: "Coach Ravi",
                  },
                  initialSession?.id,
                )
                onClose()
              }}
              className="ml-auto rounded-lg bg-[#1A56DB] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1A56DB]/90 disabled:opacity-50"
              disabled={!sessionName.trim() || !date}
            >
              Save Session
            </button>
          </div>
        </div>

        {/* ── Right panel (40%) — Exercise Library ── */}
        <div className="flex w-[40%] flex-col bg-slate-50">
          <div className="border-b border-border px-4 py-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Exercise Library</h3>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                placeholder="Search exercises..."
                className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]/30"
              />
            </div>
            {/* Category filters */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setLibCategory(cat)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    libCategory === cat
                      ? "bg-[#1A56DB] text-white"
                      : "bg-white text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise cards */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              {filteredLibrary.map((ex) => {
                const isAdded = justAdded === ex.id
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addExercise(ex)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border bg-white p-3 text-left transition-all hover:border-[#1A56DB]/40 hover:shadow-sm",
                      isAdded ? "border-emerald-400 bg-emerald-50" : "border-border",
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      {isAdded ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{ex.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            ex.category === "Warm-up" && "bg-yellow-100 text-yellow-700",
                            ex.category === "Speed" && "bg-blue-100 text-blue-700",
                            ex.category === "Strength" && "bg-purple-100 text-purple-700",
                            ex.category === "Plyometric" && "bg-orange-100 text-orange-700",
                            ex.category === "Cool-down" && "bg-green-100 text-green-700",
                          )}
                        >
                          {ex.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{ex.muscleGroup}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filteredLibrary.length === 0 && (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-sm text-muted-foreground">No exercises found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
