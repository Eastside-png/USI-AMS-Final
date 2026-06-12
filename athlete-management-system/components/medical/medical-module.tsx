"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, FileText, ShieldCheck, Plus, X, ChevronDown } from "lucide-react"
import { AthleteSelector } from "./athlete-selector"
import { BodyMap } from "./body-map"
import { ReportInjuryModal } from "./report-injury-modal"
import { WellnessTab } from "./wellness-tab"
import { RehabTrackerTab } from "./rehab-tracker-tab"
import {
  ATHLETES,
  PHASE_CRITERIA,
  REHAB_PHASES,
  REGION_LABELS,
  deriveRegionStatuses,
  getInjuriesByAthleteId,
  injuryRegionStatus,
  type BodyView,
  type InjuryFormPayload,
  type InjuryStatus,
  type PersistedInjury,
  type RegionId,
  type RegionStatus,
} from "./data"

const TABS = [
  "Body Map",
  "Injury Log",
  "Rehab Tracker",
  "Wellness",
  "Return-to-Play",
] as const

type Tab = (typeof TABS)[number]

// Default selected region per athlete: first active injury, else first recorded, else null
function defaultRegion(athleteId: string): RegionId | null {
  const athlete = ATHLETES.find((a) => a.id === athleteId)
  if (!athlete) return null
  const entries = Object.entries(athlete.regions) as [RegionId, RegionStatus][]
  const active = entries.find(([, s]) => s === "active")
  if (active) return active[0]
  return entries[0]?.[0] ?? null
}

function nowIso() {
  return new Date().toISOString()
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function phaseCriteriaComplete(injury: PersistedInjury) {
  return Object.values(injury.phaseCriteria[injury.rehabPhase] ?? {}).every(Boolean)
}

function allPhasesComplete(injury: PersistedInjury) {
  return injury.rehabPhase === 5 && phaseCriteriaComplete(injury)
}

function canRequestRtp(injury: PersistedInjury) {
  return allPhasesComplete(injury) && !injury.rtpApprovalStatus
}

function AllInjuriesOverview({
  injuries,
  onSelectInjury,
}: {
  injuries: PersistedInjury[]
  onSelectInjury: (injury: PersistedInjury) => void
}) {
  if (injuries.length === 0) return null

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">All Athlete Injuries</h2>
        <span className="text-xs text-[#6B7280]">{injuries.length} records</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {injuries.map((injury) => {
          const athlete = ATHLETES.find((a) => a.id === injury.athleteId)
          const regionColor =
            injuryRegionStatus(injury) === "active"
              ? "border-[#FCA5A5] bg-[#FFF5F5]"
              : injuryRegionStatus(injury) === "monitoring"
                ? "border-[#FDE68A] bg-[#FFFBEB]"
                : "border-[#BBF7D0] bg-[#F0FDF4]"
          return (
            <button
              key={injury.id}
              type="button"
              onClick={() => onSelectInjury(injury)}
              className={`rounded-lg border p-3 text-left transition-colors hover:brightness-[0.98] ${regionColor}`}
            >
              <p className="text-sm font-semibold text-[#0F172A]">{injury.injuryType}</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                {athlete?.name ?? injury.athleteId} · {REGION_LABELS[injury.bodyRegion]} ·{" "}
                {injury.view === "front" ? "Anterior" : "Posterior"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-[#374151]">
                  {injury.status}
                </span>
                <span className="text-xs text-[#6B7280]">Phase {injury.rehabPhase}/5</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InjuryCard({
  injury,
  athleteName,
  onTimeline,
  onStatus,
  onNote,
  onCriteria,
  onAdvance,
  onRtp,
  showStatusDropdown = true,
}: {
  injury: PersistedInjury
  athleteName: string
  onTimeline: () => void
  onStatus: (status: InjuryStatus) => void
  onNote: () => void
  onCriteria: (criterion: string, checked: boolean) => void
  onAdvance: () => void
  onRtp: () => void
  showStatusDropdown?: boolean
}) {
  const criteria = injury.phaseCriteria[injury.rehabPhase] ?? {}
  const canAdvance = phaseCriteriaComplete(injury)
  const canRtp = canRequestRtp(injury)
  const [statusOpen, setStatusOpen] = useState(false)

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">{injury.injuryType}</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            {athleteName} - {REGION_LABELS[injury.bodyRegion]} - {injury.view === "front" ? "Anterior" : "Posterior"}
          </p>
        </div>
        {showStatusDropdown ? (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusOpen((open) => !open)}
              className="gap-1.5"
            >
              Update Status
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  {(["Active", "Improving", "Resolved"] as InjuryStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        onStatus(status)
                        setStatusOpen(false)
                      }}
                      className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-[#F8FAFC] ${
                        injury.status === status ? "font-semibold text-[#1A56DB]" : "text-[#374151]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1A56DB]">
            {injury.status}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
        {[
          ["Severity", injury.severity],
          ["Onset", new Date(injury.dateOfOnset).toLocaleDateString("en-GB")],
          ["Physio", injury.treatingPhysio],
          ["Status colour", injuryRegionStatus(injury)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[#F8FAFC] p-3">
            <p className="text-xs text-[#6B7280]">{label}</p>
            <p className="mt-1 text-sm font-semibold capitalize text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0F172A]">
            Phase {injury.rehabPhase}: {REHAB_PHASES[injury.rehabPhase - 1]}
          </p>
          <span className="text-xs text-[#6B7280]">
            {Object.values(criteria).filter(Boolean).length} / {Object.values(criteria).length} criteria
          </span>
        </div>
        <div className="grid gap-2">
          {Object.entries(criteria).map(([criterion, checked]) => (
            <label key={criterion} className="flex items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onCriteria(criterion, event.target.checked)}
                className="h-4 w-4 accent-[#1A56DB]"
              />
              {criterion}
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!canAdvance || injury.rehabPhase >= 5}
            onClick={onAdvance}
            className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
          >
            Advance Phase
          </Button>
          <Button
            size="sm"
            disabled={!canRtp}
            onClick={onRtp}
            className="bg-[#15803D] text-white hover:bg-[#166534] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
          >
            Return to Play
          </Button>
          {injury.rtpApprovalStatus && (
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#1A56DB]">
              RTP {injury.rtpApprovalStatus}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onTimeline}>
          View Timeline
        </Button>
        <Button variant="outline" size="sm" onClick={onNote}>
          Add Note
        </Button>
      </div>
    </div>
  )
}

function TimelineDrawer({
  injury,
  onClose,
}: {
  injury: PersistedInjury | null
  onClose: () => void
}) {
  if (!injury) return null
  const items = [...injury.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Timeline</p>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">{injury.injuryType}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                  {item.type === "RTP Approved" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                  ) : item.type === "Note Added" ? (
                    <FileText className="h-4 w-4 text-[#1A56DB]" />
                  ) : (
                    <Clock className="h-4 w-4 text-[#1A56DB]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A]">{item.type}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {formatDateTime(item.timestamp)} by {item.author}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#374151]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}

function AddNoteModal({
  injury,
  onClose,
  onSave,
}: {
  injury: PersistedInjury | null
  onClose: () => void
  onSave: (text: string) => void
}) {
  const [text, setText] = useState("")
  if (!injury) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#0F172A]">Add Note</h2>
        <p className="mt-1 text-sm text-[#6B7280]">{injury.injuryType}</p>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          className="mt-4 w-full resize-none rounded-lg border border-[#E5E7EB] p-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          placeholder="Write clinical note..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!text.trim()}
            onClick={() => {
              onSave(text.trim())
              setText("")
            }}
            className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
          >
            Save Note
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MedicalModule({
  role = "Federation Admin",
  onNavigate,
  injuries,
  onInjuriesChange,
  initialSelectedId,
  initialTab,
  onMedicalNavConsumed,
}: {
  role?: string
  onNavigate?: (module: string) => void
  injuries: PersistedInjury[]
  onInjuriesChange: (injuries: PersistedInjury[]) => void
  initialSelectedId?: string
  initialTab?: Tab
  onMedicalNavConsumed?: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "Body Map")
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? "marcus-chen")
  const [bodyView, setBodyView] = useState<BodyView>("front")
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(
    "leftHamstring",
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [timelineInjuryId, setTimelineInjuryId] = useState<string | null>(null)
  const [noteInjuryId, setNoteInjuryId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId)
    if (initialTab) setActiveTab(initialTab)
    if (initialSelectedId || initialTab) onMedicalNavConsumed?.()
  }, [initialSelectedId, initialTab, onMedicalNavConsumed])

  const baseAthlete = useMemo(
    () => ATHLETES.find((a) => a.id === selectedId) ?? ATHLETES[0],
    [selectedId],
  )

  const athleteInjuries = useMemo(
    () => getInjuriesByAthleteId(injuries, selectedId),
    [injuries, selectedId],
  )

  const activeCaseCount = useMemo(
    () => injuries.filter((injury) => injury.status !== "Resolved").length,
    [injuries],
  )

  const athlete = useMemo(() => {
    return {
      ...baseAthlete,
      regions: deriveRegionStatuses(injuries, selectedId),
    }
  }, [baseAthlete, injuries, selectedId])

  const selectedInjury = useMemo(
    () =>
      athleteInjuries.find(
        (injury) => injury.bodyRegion === selectedRegion && injury.view === bodyView,
      ) ?? null,
    [athleteInjuries, bodyView, selectedRegion],
  )

  function handleSelectInjuryFromOverview(injury: PersistedInjury) {
    setSelectedId(injury.athleteId)
    setBodyView(injury.view)
    setSelectedRegion(injury.bodyRegion)
    setActiveTab("Body Map")
  }

  function handleSelectAthlete(id: string) {
    setSelectedId(id)
    const firstInjury = injuries.find((injury) => injury.athleteId === id && injury.status !== "Resolved")
    setBodyView(firstInjury?.view ?? "front")
    setSelectedRegion(firstInjury?.bodyRegion ?? defaultRegion(id))
  }

  function updateInjury(id: string, updater: (injury: PersistedInjury) => PersistedInjury) {
    onInjuriesChange(injuries.map((injury) => (injury.id === id ? updater(injury) : injury)))
  }

  function handleInjurySubmit(payload: InjuryFormPayload) {
    const timestamp = nowIso()
    const newInjury: PersistedInjury = {
      id: `inj-${selectedId}-${payload.bodyRegion}-${Date.now()}`,
      athleteId: selectedId,
      bodyRegion: payload.bodyRegion,
      view: payload.view,
      injuryType: payload.injuryType,
      severity: payload.severity,
      dateOfOnset: payload.dateOfOnset,
      mechanism: payload.mechanism,
      treatingPhysio: payload.treatingPhysio,
      status: "Active",
      rehabPhase: 1,
      phaseCriteria: Object.fromEntries(
        Object.entries(PHASE_CRITERIA).map(([phase, criteria]) => [
          Number(phase),
          Object.fromEntries(criteria.map((criterion) => [criterion, false])),
        ]),
      ) as PersistedInjury["phaseCriteria"],
      notes: payload.notes.map((note, index) => ({
        id: `note-${timestamp}-${index}`,
        text: note,
        timestamp,
        author: payload.treatingPhysio,
      })),
      timeline: [
        {
          id: `evt-created-${timestamp}`,
          type: "Injury Created",
          timestamp,
          author: payload.treatingPhysio,
          description: `${payload.injuryType} report created for ${REGION_LABELS[payload.bodyRegion]}.`,
        },
        {
          id: `evt-rehab-${timestamp}`,
          type: "Rehab Started",
          timestamp,
          author: payload.treatingPhysio,
          description: "Phase 1 rehab plan started.",
        },
      ],
    }
    onInjuriesChange([newInjury, ...injuries])
    setActiveTab("Body Map")
    setBodyView(payload.view)
    setSelectedRegion(payload.bodyRegion)
    setSuccessMessage("Injury report saved")
  }

  function addEvent(injury: PersistedInjury, event: PersistedInjury["timeline"][number]) {
    return { ...injury, timeline: [...injury.timeline, event] }
  }

  function handleStatus(id: string, status: InjuryStatus) {
    updateInjury(id, (injury) =>
      addEvent(
        { ...injury, status },
        {
          id: `evt-status-${Date.now()}`,
          type: "Status Updated",
          timestamp: nowIso(),
          author: role,
          description: `Status changed to ${status}.`,
        },
      ),
    )
  }

  function handleCriteria(id: string, criterion: string, checked: boolean) {
    updateInjury(id, (injury) => ({
      ...injury,
      phaseCriteria: {
        ...injury.phaseCriteria,
        [injury.rehabPhase]: {
          ...injury.phaseCriteria[injury.rehabPhase],
          [criterion]: checked,
        },
      },
    }))
  }

  function handleAdvance(id: string) {
    updateInjury(id, (injury) =>
      addEvent(
        { ...injury, rehabPhase: Math.min(5, injury.rehabPhase + 1) },
        {
          id: `evt-phase-${Date.now()}`,
          type: "Rehab Phase Progressed",
          timestamp: nowIso(),
          author: role,
          description: `Advanced to Phase ${Math.min(5, injury.rehabPhase + 1)}.`,
        },
      ),
    )
  }

  function handleRequestRtp(id: string) {
    updateInjury(id, (injury) =>
      addEvent(
        { ...injury, rtpApprovalStatus: "Pending" },
        {
          id: `evt-rtp-request-${Date.now()}`,
          type: "RTP Requested",
          timestamp: nowIso(),
          author: role,
          description: "Return-to-play approval request sent to Federation Admin.",
        },
      ),
    )
    setSuccessMessage("RTP approval request sent to Federation Admin")
  }

  function handleAdminDecision(id: string, decision: "Approved" | "Further Review") {
    const injury = injuries.find((item) => item.id === id)
    updateInjury(id, (current) =>
      addEvent(
        {
          ...current,
          status: decision === "Approved" ? "Resolved" : current.status,
          rtpApprovalStatus: decision,
        },
        {
          id: `evt-admin-${Date.now()}`,
          type: decision === "Approved" ? "RTP Approved" : "Further Review Requested",
          timestamp: nowIso(),
          author: "Federation Admin",
          description:
            decision === "Approved"
              ? "Return-to-play approved. Athlete status updated to Active."
              : "Further rehab review requested before RTP clearance.",
        },
      ),
    )
    if (decision === "Approved" && injury) {
      const remainingActive = injuries.filter(
        (item) =>
          item.athleteId === injury.athleteId &&
          item.id !== id &&
          item.status !== "Resolved",
      )
      if (remainingActive.length === 0) {
        setSuccessMessage(
          `RTP approved — ${ATHLETES.find((a) => a.id === injury.athleteId)?.name ?? "Athlete"} cleared to Active status`,
        )
      } else {
        setSuccessMessage("RTP approved successfully")
      }
    } else {
      setSuccessMessage(decision === "Approved" ? "RTP approved successfully" : "Further review requested")
    }
  }

  function handleAddNote(id: string, text: string) {
    const timestamp = nowIso()
    updateInjury(id, (injury) =>
      addEvent(
        {
          ...injury,
          notes: [
            ...injury.notes,
            {
              id: `note-${Date.now()}`,
              text,
              timestamp,
              author: role,
            },
          ],
        },
        {
          id: `evt-note-${Date.now()}`,
          type: "Note Added",
          timestamp,
          author: role,
          description: text,
        },
      ),
    )
    setNoteInjuryId(null)
    setSuccessMessage("Clinical note saved to injury timeline")
  }

  if (role === "Coach") {
    // Scope to sprint squad athletes only
    const coachAthleteIds = new Set(
      ATHLETES.filter((a) => a.squad === "National Sprint Squad").map((a) => a.id),
    )
    const coachInjuries = injuries.filter((inj) => coachAthleteIds.has(inj.athleteId))

    const available = ATHLETES.filter(
      (a) =>
        coachAthleteIds.has(a.id) &&
        !coachInjuries.some((inj) => inj.athleteId === a.id && inj.status !== "Resolved"),
    ).length
    const modified = coachInjuries.filter(
      (inj) => inj.status === "Improving",
    ).length
    const unavailable = coachInjuries.filter(
      (inj) => inj.status === "Active",
    ).length

    // Group active/improving injuries by athlete
    const activeInjuriesByAthlete = ATHLETES.filter((a) => coachAthleteIds.has(a.id))
      .map((a) => {
        const athleteInjuries = coachInjuries.filter(
          (inj) => inj.athleteId === a.id && inj.status !== "Resolved",
        )
        return { athlete: a, injuries: athleteInjuries }
      })
      .filter((item) => item.injuries.length > 0)

    return (
      <div className="flex flex-col gap-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Medical Overview</h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Athlete availability for your squad — clinical details are restricted to medical staff
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-[#1A56DB]" />
            <span className="text-xs font-semibold text-[#1A56DB]">Coach View</span>
          </div>
        </div>

        {/* Availability summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Available to Train", value: available, color: "text-[#15803D]", bg: "bg-[#DCFCE7]", border: "border-[#BBF7D0]" },
            { label: "Modified Training", value: modified, color: "text-[#92400E]", bg: "bg-[#FEF9C3]", border: "border-[#FDE68A]" },
            { label: "Unavailable", value: unavailable, color: "text-[#B91C1C]", bg: "bg-[#FEE2E2]", border: "border-[#FECACA]" },
          ].map((s) => (
            <div key={s.label} className={`flex flex-col gap-1 rounded-xl border p-4 ${s.bg} ${s.border}`}>
              <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-sm font-medium text-[#374151]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Athlete injury status list */}
        {activeInjuriesByAthlete.length > 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="border-b border-[#F1F5F9] px-5 py-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Active Injury Status &amp; Restrictions
              </h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Injury type, affected area, current status, and training restrictions visible to coaching staff
              </p>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {activeInjuriesByAthlete.map(({ athlete, injuries: athlInjs }) => (
                <div key={athlete.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: athlete.avatarColor }}
                    >
                      {athlete.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{athlete.firstName} {athlete.lastName}</p>
                      <p className="text-xs text-[#6B7280]">{athlete.discipline}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {athlInjs.map((inj) => {
                      const isActive = inj.status === "Active"
                      const statusColor = isActive
                        ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]"
                        : "bg-[#FEF9C3] text-[#92400E] border-[#FDE68A]"
                      const restriction = isActive
                        ? "No training — clearance required from medical staff before return"
                        : "Modified training only — avoid high-impact activities on affected area"
                      return (
                        <div
                          key={inj.id}
                          className={`rounded-lg border px-4 py-3 ${isActive ? "border-[#FECACA] bg-[#FFF5F5]" : "border-[#FDE68A] bg-[#FFFBEB]"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0F172A]">{inj.injuryType}</p>
                              <p className="mt-0.5 text-xs text-[#6B7280]">
                                {REGION_LABELS[inj.bodyRegion]} · {inj.view === "front" ? "Anterior" : "Posterior"}
                              </p>
                            </div>
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                              {inj.status}
                            </span>
                          </div>
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-[#374151]">
                            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6B7280]" />
                            <span><span className="font-semibold">Restriction:</span> {restriction}</span>
                          </div>
                          <p className="mt-1.5 text-xs text-[#9CA3AF]">
                            Onset {new Date(inj.dateOfOnset).toLocaleDateString("en-GB")} · Rehab Phase {inj.rehabPhase}/5
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCFCE7]">
                <ShieldCheck className="h-6 w-6 text-[#15803D]" />
              </div>
              <p className="font-semibold text-[#0F172A]">All athletes available</p>
              <p className="text-sm text-[#6B7280]">No active injury restrictions for your squad</p>
            </div>
          </div>
        )}

        <p className="text-xs text-[#9CA3AF]">
          Clinical notes, detailed medical records, and treatment plans are restricted to Physiotherapists and Federation Admin.
        </p>
      </div>
    )
  }

  return (
      <div className="flex flex-col gap-5 p-6">
      {/* Title row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              Medical &amp; Injury Intelligence
            </h1>
            {role === "Physiotherapist" && (
              <Badge className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]">
                Primary Workspace
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-[#22C55E]/20 bg-[#22C55E]/10 text-xs font-medium text-[#22C55E]"
            >
              {activeCaseCount} Active Cases
            </Badge>
          </div>

          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
          >
            <Plus className="h-4 w-4" />
            Report New Injury
          </Button>
        </div>
        {successMessage && (
          <div className="flex items-center justify-between rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 text-sm font-semibold text-[#15803D]">
            {successMessage}
            <button type="button" onClick={() => setSuccessMessage("")} className="text-[#166534]">
              Dismiss
            </button>
          </div>
        )}

        {role === "Federation Admin" && injuries.some((injury) => injury.rtpApprovalStatus === "Pending") && (
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#1A56DB]" />
              <h2 className="text-sm font-semibold text-[#0F172A]">RTP Approvals Queue</h2>
            </div>
            <div className="grid gap-3">
              {injuries
                .filter((injury) => injury.rtpApprovalStatus === "Pending")
                .map((injury) => {
                  const queueAthlete = ATHLETES.find((a) => a.id === injury.athleteId)
                  const completedPhases = injury.rehabPhase - 1 + (phaseCriteriaComplete(injury) ? 1 : 0)
                  return (
                    <div key={injury.id} className="rounded-lg bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {queueAthlete?.name ?? injury.athleteId} — {injury.injuryType}
                          </p>
                          <p className="mt-1 text-xs text-[#6B7280]">
                            {REGION_LABELS[injury.bodyRegion]} · {injury.view === "front" ? "Anterior" : "Posterior"} ·{" "}
                            {injury.severity} · {injury.treatingPhysio}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-[#15803D] text-white hover:bg-[#166534]" onClick={() => handleAdminDecision(injury.id, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAdminDecision(injury.id, "Further Review")}>
                            Request Further Review
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 rounded-lg bg-[#F8FAFC] p-3 text-xs text-[#374151] sm:grid-cols-3">
                        <div>
                          <p className="font-semibold text-[#0F172A]">Rehab Summary</p>
                          <p className="mt-1">Phase {injury.rehabPhase}/5 — {REHAB_PHASES[injury.rehabPhase - 1]}</p>
                          <p>{completedPhases} phases completed</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">Current Phase Criteria</p>
                          <ul className="mt-1 space-y-0.5">
                            {Object.entries(injury.phaseCriteria[injury.rehabPhase] ?? {}).map(([criterion, done]) => (
                              <li key={criterion} className={done ? "text-[#15803D]" : "text-[#6B7280]"}>
                                {done ? "✓" : "○"} {criterion}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">Timeline</p>
                          <p className="mt-1">{injury.timeline.length} events · {injury.notes.length} notes</p>
                          <p className="text-[#6B7280]">
                            Onset {new Date(injury.dateOfOnset).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Sub-nav tabs */}
        <nav className="flex gap-6 border-b border-[#E5E7EB]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-[#1A56DB] text-[#1A56DB]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Athlete selector */}
      <AthleteSelector
        athletes={ATHLETES}
        selectedId={selectedId}
        onSelect={handleSelectAthlete}
      />

      {/* Tab content */}
      {activeTab === "Body Map" && (
        <div className="flex flex-col gap-5">
          <AllInjuriesOverview injuries={injuries} onSelectInjury={handleSelectInjuryFromOverview} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex w-fit rounded-lg border border-[#E5E7EB] bg-white p-1">
              {(["front", "back"] as BodyView[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => {
                    setBodyView(view)
                    const regionOnView = athleteInjuries.find((injury) => injury.view === view && injury.status !== "Resolved")
                    setSelectedRegion(regionOnView?.bodyRegion ?? null)
                  }}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                    bodyView === view
                      ? "bg-[#1A56DB] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {view === "front" ? "Anterior" : "Posterior"}
                </button>
              ))}
            </div>
            <BodyMap
              regions={deriveRegionStatuses(injuries, selectedId, bodyView)}
              selected={selectedRegion}
              onSelect={setSelectedRegion}
              view={bodyView}
            />
          </div>
          <div className="flex flex-col gap-4">
            {!selectedRegion ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
                <div>
                  <p className="font-semibold text-[#0F172A]">Select a body region</p>
                  <p className="mt-1 text-sm text-[#6B7280]">Choose any highlighted anterior or posterior region.</p>
                </div>
              </div>
            ) : selectedInjury ? (
              <InjuryCard
                injury={selectedInjury}
                athleteName={athlete.name}
                onTimeline={() => setTimelineInjuryId(selectedInjury.id)}
                onStatus={(status) => handleStatus(selectedInjury.id, status)}
                onNote={() => setNoteInjuryId(selectedInjury.id)}
                onCriteria={(criterion, checked) => handleCriteria(selectedInjury.id, criterion, checked)}
                onAdvance={() => handleAdvance(selectedInjury.id)}
                onRtp={() => handleRequestRtp(selectedInjury.id)}
              />
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#0F172A]">{REGION_LABELS[selectedRegion]}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">
                  No persisted injury exists for this {bodyView === "front" ? "anterior" : "posterior"} region.
                </p>
                <Button className="mt-4 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90" onClick={() => setModalOpen(true)}>
                  Report injury here
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {activeTab === "Rehab Tracker" && <RehabTrackerTab athlete={athlete} />}

      {activeTab === "Wellness" && <WellnessTab athlete={athlete} />}

      {activeTab === "Injury Log" && (
        <div className="grid gap-4">
          {injuries.map((injury) => {
            const injuryAthlete = ATHLETES.find((a) => a.id === injury.athleteId)
            return (
              <InjuryCard
                key={injury.id}
                injury={injury}
                athleteName={injuryAthlete?.name ?? injury.athleteId}
                onTimeline={() => setTimelineInjuryId(injury.id)}
                onStatus={(status) => handleStatus(injury.id, status)}
                onNote={() => setNoteInjuryId(injury.id)}
                onCriteria={(criterion, checked) => handleCriteria(injury.id, criterion, checked)}
                onAdvance={() => handleAdvance(injury.id)}
                onRtp={() => handleRequestRtp(injury.id)}
              />
            )
          })}
          {injuries.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <p className="text-base font-medium text-foreground">No injury records yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">Create the first injury report to populate the register.</p>
                <Button size="sm" onClick={() => setModalOpen(true)} className="mt-2 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90">
                  Report New Injury
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "Return-to-Play" && (
        <div className="grid gap-4">
          {injuries
            .filter((injury) => injury.rehabPhase === 5 || injury.rtpApprovalStatus)
            .map((injury) => {
              const injuryAthlete = ATHLETES.find((a) => a.id === injury.athleteId)
              return (
                <InjuryCard
                  key={injury.id}
                  injury={injury}
                  athleteName={injuryAthlete?.name ?? injury.athleteId}
                  onTimeline={() => setTimelineInjuryId(injury.id)}
                  onStatus={(status) => handleStatus(injury.id, status)}
                  onNote={() => setNoteInjuryId(injury.id)}
                  onCriteria={(criterion, checked) => handleCriteria(injury.id, criterion, checked)}
                  onAdvance={() => handleAdvance(injury.id)}
                  onRtp={() => handleRequestRtp(injury.id)}
                />
              )
            })}
          {!injuries.some((injury) => injury.rehabPhase === 5 || injury.rtpApprovalStatus) && (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
              <div>
                <p className="text-base font-medium text-foreground">No RTP candidates yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Complete all five rehab phases to activate return-to-play clearance.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Injury Modal */}
      <ReportInjuryModal
        open={modalOpen}
        athlete={athlete}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInjurySubmit}
      />
      <TimelineDrawer
        injury={injuries.find((injury) => injury.id === timelineInjuryId) ?? null}
        onClose={() => setTimelineInjuryId(null)}
      />
      <AddNoteModal
        injury={injuries.find((injury) => injury.id === noteInjuryId) ?? null}
        onClose={() => setNoteInjuryId(null)}
        onSave={(text) => noteInjuryId && handleAddNote(noteInjuryId, text)}
      />
    </div>
  )
}
