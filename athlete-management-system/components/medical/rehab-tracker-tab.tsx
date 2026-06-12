"use client"

import { useState } from "react"
import {
  Check,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Athlete } from "./data"

// ─── Types ────────────────────────────────────────────────────────────────────

type PhaseStatus = "complete" | "active" | "upcoming"

type Exercise = {
  name: string
  setsReps: string
  status: "done" | "in-progress" | "pending"
}

type Phase = {
  number: number
  title: string
  status: PhaseStatus
  days: string
  objectives: string[]
  completionCriteria: string
  exercises: Exercise[]
  physioNotes: string
}

type CriterionStatus = "green" | "amber" | "red"

type Criterion = {
  label: string
  current: string
  target: string
  pct: number
  status: CriterionStatus
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    number: 1,
    title: "Acute Management",
    status: "complete",
    days: "Days 1–3",
    objectives: [
      "Reduce pain and swelling with RICE protocol",
      "Protect the injured tissue from further damage",
      "Begin gentle passive range-of-motion exercises",
    ],
    completionCriteria:
      "Pain at rest <3/10 and minimal swelling observed by physio.",
    exercises: [
      { name: "Ice & Elevation", setsReps: "4 × 20 min / day", status: "done" },
      {
        name: "Passive Hamstring Stretch",
        setsReps: "3 × 30 sec",
        status: "done",
      },
      {
        name: "Isometric Glute Activation",
        setsReps: "3 × 10 reps",
        status: "done",
      },
    ],
    physioNotes:
      "Phase completed without complications. Swelling resolved by day 2. Patient tolerated all exercises well.",
  },
  {
    number: 2,
    title: "Sub-Acute",
    status: "complete",
    days: "Days 4–10",
    objectives: [
      "Restore pain-free passive and active ROM",
      "Begin low-load eccentric strengthening",
      "Improve neuromuscular control of hamstring",
    ],
    completionCriteria:
      "Full passive ROM and pain <2/10 during light activity.",
    exercises: [
      {
        name: "Nordic Hamstring Curl (assisted)",
        setsReps: "3 × 6 reps",
        status: "done",
      },
      {
        name: "Single-Leg Romanian Deadlift",
        setsReps: "3 × 8 reps each",
        status: "done",
      },
      { name: "Walking lunges", setsReps: "2 × 15 m", status: "done" },
    ],
    physioNotes:
      "Good progression. Pain-free ROM achieved by day 8. Slight compensation pattern noted — addressed with cue correction.",
  },
  {
    number: 3,
    title: "Rehabilitation",
    status: "active",
    days: "Days 11–21 est.",
    objectives: [
      "Restore full range of motion",
      "Progressive strengthening of hamstring complex",
      "Pain-free jogging achieved",
    ],
    completionCriteria:
      "Hamstring strength >80% of unaffected side, pain <2/10, full ROM restored.",
    exercises: [
      {
        name: "Nordic Hamstring Curl",
        setsReps: "4 × 8 reps",
        status: "in-progress",
      },
      {
        name: "Resisted Leg Curl",
        setsReps: "3 × 12 reps @ 60% 1RM",
        status: "in-progress",
      },
      { name: "Jogging Progression (straight)", setsReps: "2 × 400 m", status: "pending" },
    ],
    physioNotes:
      "Patient progressing well. Pain during jogging reduced from 3/10 to 1.5/10 this week. Focus on eccentric load tolerance before advancing.",
  },
  {
    number: 4,
    title: "Return to Training",
    status: "upcoming",
    days: "Days 22–32 est.",
    objectives: [
      "Full training participation at modified intensity",
      "Sport-specific movement patterns without compensation",
      "Achieve target hamstring strength ratio",
    ],
    completionCriteria:
      "Full training load tolerated over 5 consecutive sessions.",
    exercises: [
      {
        name: "Sprint Drills (progressive)",
        setsReps: "4 × 60 m",
        status: "pending",
      },
      {
        name: "Agility Ladder",
        setsReps: "3 × 2 min",
        status: "pending",
      },
      {
        name: "High-speed Running",
        setsReps: "2 × 100 m @ 80%",
        status: "pending",
      },
    ],
    physioNotes: "To be completed after Phase 3 criteria are met.",
  },
  {
    number: 5,
    title: "Return to Play",
    status: "upcoming",
    days: "Days 33+ est.",
    objectives: [
      "Full competitive match participation",
      "Asymptomatic at 100% sprint speed",
      "Medical clearance obtained",
    ],
    completionCriteria:
      "Physio and team doctor sign-off following final functional screen.",
    exercises: [
      {
        name: "Full Training Integration",
        setsReps: "5 × sessions",
        status: "pending",
      },
      {
        name: "Maximal Sprint Test",
        setsReps: "3 × 40 m",
        status: "pending",
      },
      {
        name: "Functional Movement Screen",
        setsReps: "1 × assessment",
        status: "pending",
      },
    ],
    physioNotes: "Final clearance assessment pending completion of all prior phases.",
  },
]

const CRITERIA: Criterion[] = [
  {
    label: "Hamstring strength vs. unaffected side",
    current: "71%",
    target: ">80%",
    pct: 71,
    status: "amber",
  },
  {
    label: "Pain score during activity",
    current: "1.5 / 10",
    target: "<2 / 10",
    pct: 85,
    status: "green",
  },
  {
    label: "Full ROM restored",
    current: "85%",
    target: "100%",
    pct: 85,
    status: "amber",
  },
]

const SESSIONS = [
  {
    date: "Mon 16 Jun",
    time: "09:00",
    physio: "Dr. Meera Nair",
    type: "Strength & Conditioning",
    duration: "45 min",
  },
  {
    date: "Wed 18 Jun",
    time: "10:30",
    physio: "Dr. Meera Nair",
    type: "Jogging Progression",
    duration: "30 min",
  },
  {
    date: "Fri 20 Jun",
    time: "09:00",
    physio: "Dr. Meera Nair",
    type: "Functional Assessment",
    duration: "60 min",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function criterionBarColor(status: CriterionStatus): string {
  if (status === "green") return "bg-[#22C55E]"
  if (status === "amber") return "bg-[#F59E0B]"
  return "bg-[#EF4444]"
}

function criterionTextColor(status: CriterionStatus): string {
  if (status === "green") return "text-[#22C55E]"
  if (status === "amber") return "text-[#F59E0B]"
  return "text-[#EF4444]"
}

function exerciseStatusBadge(status: Exercise["status"]) {
  if (status === "done")
    return (
      <Badge
        variant="outline"
        className="border-[#22C55E]/20 bg-[#22C55E]/10 text-xs font-medium text-[#22C55E]"
      >
        Done
      </Badge>
    )
  if (status === "in-progress")
    return (
      <Badge
        variant="outline"
        className="border-[#1A56DB]/20 bg-[#1A56DB]/10 text-xs font-medium text-[#1A56DB]"
      >
        In Progress
      </Badge>
    )
  return (
    <Badge
      variant="outline"
      className="border-[#E5E7EB] bg-[#F3F4F6] text-xs font-medium text-muted-foreground"
    >
      Pending
    </Badge>
  )
}

// ─── Phase Node ───────────────────────────────────────────────────────────────

function PhaseNode({
  phase,
  isExpanded,
  onToggle,
}: {
  phase: Phase
  isExpanded: boolean
  onToggle: () => void
}) {
  const isClickable = phase.status !== "upcoming"

  const iconEl =
    phase.status === "complete" ? (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E]">
        <Check className="h-4 w-4 text-white" />
      </div>
    ) : phase.status === "active" ? (
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A56DB] bg-white">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#1A56DB]" />
      </div>
    ) : (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#E5E7EB] bg-[#F3F4F6]">
        <Lock className="h-3.5 w-3.5 text-[#9CA3AF]" />
      </div>
    )

  const labelColor =
    phase.status === "active"
      ? "text-[#1A56DB]"
      : phase.status === "complete"
        ? "text-foreground"
        : "text-muted-foreground"

  return (
    <button
      type="button"
      onClick={isClickable ? onToggle : undefined}
      disabled={!isClickable}
      className={`flex flex-col items-center gap-1.5 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
    >
      {iconEl}
      <span className={`text-center text-xs font-medium leading-tight ${labelColor}`}>
        Phase {phase.number}
        <br />
        <span className="font-normal text-muted-foreground">{phase.days}</span>
      </span>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  athlete: Athlete
}

export function RehabTrackerTab({ athlete }: Props) {
  const [expandedPhase, setExpandedPhase] = useState<number>(3)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  function togglePhase(n: number) {
    setExpandedPhase((prev) => (prev === n ? 0 : n))
  }

  const expanded = PHASES.find((p) => p.number === expandedPhase)

  return (
    <div className="flex flex-col gap-5">
      {/* Phase Timeline */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-6 text-base font-semibold text-foreground">
          Rehab Phase Timeline — {athlete.name}
        </h2>

        {/* Timeline row */}
        <div className="flex items-start justify-between gap-0">
          {PHASES.map((phase, i) => (
            <div key={phase.number} className="flex flex-1 items-center">
              {/* Node */}
              <PhaseNode
                phase={phase}
                isExpanded={expandedPhase === phase.number}
                onToggle={() => togglePhase(phase.number)}
              />
              {/* Connector line */}
              {i < PHASES.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 transition-colors ${
                    phase.status === "complete" ? "bg-[#22C55E]" : "bg-[#E5E7EB]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Expanded phase detail */}
        {expanded && (
          <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Phase {expanded.number}: {expanded.title}
                </h3>
                {expanded.status === "complete" && (
                  <Badge
                    variant="outline"
                    className="border-[#22C55E]/20 bg-[#22C55E]/10 text-xs text-[#22C55E]"
                  >
                    Completed
                  </Badge>
                )}
                {expanded.status === "active" && (
                  <Badge
                    variant="outline"
                    className="border-[#1A56DB]/20 bg-[#1A56DB]/10 text-xs text-[#1A56DB]"
                  >
                    In Progress
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={() => togglePhase(expanded.number)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Objectives */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Objectives
                </p>
                <ul className="flex flex-col gap-1.5">
                  {expanded.objectives.map((obj) => (
                    <li key={obj} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1A56DB]" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exercises */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Exercises
                </p>
                <div className="flex flex-col gap-2">
                  {expanded.exercises.map((ex) => (
                    <div
                      key={ex.name}
                      className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {ex.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ex.setsReps}
                        </span>
                      </div>
                      {exerciseStatusBadge(ex.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Criteria */}
            <div className="mt-3 border-t border-[#E5E7EB] pt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Completion Criteria
              </p>
              <p className="text-sm text-foreground">{expanded.completionCriteria}</p>
            </div>

            {/* Physio notes */}
            <div className="mt-3 border-t border-[#E5E7EB] pt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Physio Notes
              </p>
              <p className="text-sm text-muted-foreground">{expanded.physioNotes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Current Phase Detail Panel */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Phase 3 — Criteria to Advance
          </h2>
          <Badge
            variant="outline"
            className="border-[#1A56DB]/20 bg-[#1A56DB]/10 text-xs font-medium text-[#1A56DB]"
          >
            2 of 3 criteria met
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {CRITERIA.map((c) => (
            <div key={c.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {c.label}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-semibold ${criterionTextColor(c.status)}`}>
                    {c.current}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    target {c.target}
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className={`h-full rounded-full transition-all ${criterionBarColor(c.status)}`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Return to Play button */}
        <div className="mt-6 flex items-center justify-end">
          <div className="relative">
            <button
              type="button"
              disabled
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              className="cursor-not-allowed rounded-md border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              Return-to-Play Clearance
            </button>
            {tooltipVisible && (
              <div className="absolute bottom-full right-0 mb-2 w-64 rounded-md border border-[#E5E7EB] bg-white p-3 shadow-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
                  <p className="text-xs leading-relaxed text-foreground">
                    Return-to-Play clearance requires completion of all phases.
                    Currently in Phase 3 of 5.
                  </p>
                </div>
                <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-[#E5E7EB] bg-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Upcoming Rehab Sessions
          </h2>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {SESSIONS.map((session) => (
            <div
              key={`${session.date}-${session.time}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {session.date.split(" ")[0]}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {session.date.split(" ").slice(1).join(" ")}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {session.type}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {session.physio}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-[#E5E7EB] text-xs text-muted-foreground"
              >
                {session.duration}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
