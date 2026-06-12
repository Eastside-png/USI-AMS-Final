"use client"

import { useEffect, useState } from "react"
import {
  Search,
  ChevronDown,
  Download,
  LayoutList,
  LayoutGrid,
  ChevronRight,
  Mail,
  Phone,
  UserCheck,
  Edit2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  STATUS_CONFIG,
  readinessColor,
  readinessBadgeClass,
  createAthleteFromOnboarding,
  type Athlete,
  type AthleteStatus,
  type OnboardingPayload,
} from "./data"
import { AddAthleteWizard } from "./add-athlete-wizard"
import { AthleteProfile } from "./athlete-profile"
import { cn } from "@/lib/utils"
import type { PersistedInjury } from "@/components/medical/data"
import { computeAttendanceRate, type PersistedSession } from "@/components/training/data"

const SPORT_OPTIONS = ["All Sports", "Athletics", "Swimming", "Wrestling", "Badminton"]
const SQUAD_OPTIONS = [
  "All Squads",
  "National Sprint Squad",
  "Long Jump Squad",
  "Freestyle Squad",
  "Backstroke Squad",
  "Wrestling Freestyle",
  "Badminton Women",
]
const STATUS_OPTIONS: ("All" | AthleteStatus)[] = [
  "All",
  "Active",
  "Injured",
  "Monitoring",
  "Pending",
  "Rejected",
  "Suspended",
]
const NATIONALITY_OPTIONS = ["All Nationalities", "India"]

function AvatarCircle({
  athlete,
  size = "md",
}: {
  athlete: Athlete
  size?: "sm" | "md" | "lg"
}) {
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", sizeClass)}
      style={{ backgroundColor: athlete.avatarColor }}
    >
      {athlete.initials}
    </div>
  )
}

function StatusBadge({ status }: { status: AthleteStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function ReadinessBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        readinessBadgeClass(value),
      )}
    >
      {value}%
    </span>
  )
}

function ReadinessBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-muted-foreground">—</span>
  const color = readinessColor(value)
  return (
    <div className="flex items-center gap-2">
      <ReadinessBadge value={value} />
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function RejectAthleteModal({
  athlete,
  onClose,
  onConfirm,
}: {
  athlete: Athlete
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState("")
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-foreground">Reject Application</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {athlete.firstName} {athlete.lastName} — provide a reason for rejection.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Rejection reason (required)..."
          className="mt-4 w-full resize-none rounded-lg border border-[#E5E7EB] p-3 text-sm focus:border-[#1A56DB] focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
          >
            Confirm Rejection
          </Button>
        </div>
      </div>
    </div>
  )
}

function SelectDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

/* ─── Athlete Row Drawer ─────────────────────────────────────────── */
function AthleteDrawer({
  athlete,
  onClose,
  onViewProfile,
}: {
  athlete: Athlete
  onClose: () => void
  onViewProfile: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[athlete.status]

  const recentActivity = [
    { text: "Wellness check-in submitted", time: "2h ago", color: "#22C55E" },
    { text: "Training session logged — 4.2km warm-up", time: "8h ago", color: "#3B82F6" },
    { text: "Coach note added by Ravi Kumar", time: "Yesterday", color: "#8B5CF6" },
    { text: "Document uploaded: Medical Fitness Cert.", time: "3 days ago", color: "#F59E0B" },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[500px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <span className="text-sm font-medium text-muted-foreground">Athlete Summary</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close drawer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          {/* Profile block */}
          <div className="flex items-start gap-4">
            <AvatarCircle athlete={athlete} size="lg" />
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                {athlete.firstName} {athlete.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {athlete.sport} — {athlete.discipline}
              </p>
              <p className="text-xs text-muted-foreground">{athlete.squad}</p>
              <div className="mt-1">
                <StatusBadge status={athlete.status} />
              </div>
            </div>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Age", value: `${athlete.age} yrs` },
              { label: "Height", value: athlete.height },
              { label: "Weight", value: athlete.weight },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-0.5 rounded-lg bg-[#F8FAFC] p-3"
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-sm font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Readiness */}
          <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
            <span className="text-sm font-medium text-foreground">Readiness Score</span>
            <ReadinessBar value={athlete.readiness} />
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              {athlete.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              {athlete.phone}
            </div>
          </div>

          {/* Recent activity */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Activity
            </h3>
            <div className="flex flex-col gap-2">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm text-foreground">{item.text}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="border-t border-[#E5E7EB] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
              onClick={() => onViewProfile(athlete.id)}
            >
              View Full Profile
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Assign Coach
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <ChevronDown className="h-3.5 w-3.5" />
              Change Status
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ─── Card View ──────────────────────────────────────────────────── */
function AthleteCard({
  athlete,
  onClick,
}: {
  athlete: Athlete
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <AvatarCircle athlete={athlete} size="md" />
        <StatusBadge status={athlete.status} />
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {athlete.firstName} {athlete.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{athlete.sport} — {athlete.discipline}</p>
        <p className="text-xs text-muted-foreground">{athlete.squad}</p>
      </div>
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2">
        <span className="text-xs text-muted-foreground">{athlete.coach}</span>
        <ReadinessBar value={athlete.readiness} />
      </div>
    </button>
  )
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function AthleteRegistry({
  role = "Federation Admin",
  injuries = [],
  athletes,
  onAthletesChange,
  sessions = [],
  initialProfileAthleteId,
  onProfileAthleteIdConsumed,
  onProfileAthleteChange,
}: {
  role?: string
  injuries?: PersistedInjury[]
  athletes: Athlete[]
  onAthletesChange: (athletes: Athlete[]) => void
  sessions?: PersistedSession[]
  initialProfileAthleteId?: string | null
  onProfileAthleteIdConsumed?: () => void
  onProfileAthleteChange?: (id: string | null) => void
}) {
  const [search, setSearch] = useState("")
  const [sport, setSport] = useState("All Sports")
  const [squad, setSquad] = useState("All Squads")
  const [status, setStatus] = useState<string>("All")
  const [nationality, setNationality] = useState("All Nationalities")
  const [view, setView] = useState<"table" | "card">("table")
  const [drawerAthlete, setDrawerAthlete] = useState<Athlete | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [profileAthleteId, setProfileAthleteId] = useState<string | null>(null)
  const [showApprovalQueue, setShowApprovalQueue] = useState(false)
  const [rejectAthleteId, setRejectAthleteId] = useState<string | null>(null)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (initialProfileAthleteId) {
      setProfileAthleteId(initialProfileAthleteId)
      onProfileAthleteChange?.(initialProfileAthleteId)
      onProfileAthleteIdConsumed?.()
    }
  }, [initialProfileAthleteId, onProfileAthleteIdConsumed, onProfileAthleteChange])

  const athletesWithMedicalStatus = athletes.map((athlete) => {
    const attendanceRate = sessions ? computeAttendanceRate(sessions, athlete.id) : athlete.attendanceRate ?? null
    const athleteInjuries = injuries.filter((injury) => injury.athleteId === athlete.id)
    const hasActiveInjury = athleteInjuries.some((injury) => injury.status === "Active")
    const hasMonitoringInjury = athleteInjuries.some((injury) => injury.status === "Improving")
    const allResolved = athleteInjuries.length > 0 && athleteInjuries.every((injury) => injury.status === "Resolved")

    let derivedStatus: AthleteStatus = athlete.status
    if (hasActiveInjury) derivedStatus = "Injured"
    else if (hasMonitoringInjury) derivedStatus = "Monitoring"
    else if (allResolved || athleteInjuries.length === 0) {
      if (athlete.status === "Injured") derivedStatus = "Active"
      else derivedStatus = athlete.status
    }

    return { ...athlete, status: derivedStatus, attendanceRate: attendanceRate ?? athlete.attendanceRate ?? null }
  })

  const filtered = athletesWithMedicalStatus.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.sport.toLowerCase().includes(q) ||
      a.squad.toLowerCase().includes(q)
    const matchSport = sport === "All Sports" || a.sport === sport
    // Coach: scoped to their squad only
    const roleSquad = role === "Coach" ? a.squad === "National Sprint Squad" : true
    const matchSquad = squad === "All Squads" || a.squad === squad
    const matchStatus = status === "All" || a.status === status
    const matchNat = nationality === "All Nationalities" || a.nationality === nationality
    return roleSquad && matchSearch && matchSport && matchSquad && matchStatus && matchNat
  })

  // For stats, scope the base set by role
  const baseForStats =
    role === "Coach"
      ? athletesWithMedicalStatus.filter((a) => a.squad === "National Sprint Squad")
      : athletesWithMedicalStatus

  const pendingAthletes = athletes.filter((a) => a.status === "Pending")

  const stats = {
    total: baseForStats.length,
    active: baseForStats.filter((a) => a.status === "Active").length,
    injured: baseForStats.filter((a) => a.status === "Injured").length,
    pending: pendingAthletes.length,
    suspended: baseForStats.filter((a) => a.status === "Suspended").length,
  }

  function updateAthlete(id: string, updater: (a: Athlete) => Athlete) {
    onAthletesChange(athletes.map((a) => (a.id === id ? updater(a) : a)))
  }

  function handleWizardSubmit(payload: OnboardingPayload) {
    const created = createAthleteFromOnboarding(payload)
    onAthletesChange([created, ...athletes])
    setToast(`${created.firstName} ${created.lastName} submitted — pending Federation Admin approval`)
    setShowApprovalQueue(true)
  }

  function handleApprove(id: string) {
    const athlete = athletes.find((a) => a.id === id)
    updateAthlete(id, (a) => ({
      ...a,
      status: "Active",
      readiness: a.readiness ?? 75,
      lastActive: "Today",
      enrolledDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    }))
    setToast(`${athlete?.firstName} ${athlete?.lastName} approved — now Active in registry`)
  }

  function handleReject(id: string, reason: string) {
    const athlete = athletes.find((a) => a.id === id)
    updateAthlete(id, (a) => ({ ...a, status: "Rejected", rejectionReason: reason }))
    setRejectAthleteId(null)
    setToast(`${athlete?.firstName} ${athlete?.lastName} rejected`)
  }

  if (profileAthleteId) {
    return (
      <AthleteProfile
        athleteId={profileAthleteId}
        onBack={() => {
          setProfileAthleteId(null)
          onProfileAthleteChange?.(null)
        }}
        injuries={injuries}
        athletes={athletes}
        onAthletesChange={onAthletesChange}
        sessions={sessions}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Athlete Registry</h1>
          {role === "Coach" && (
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Scoped to your squad: National Sprint Squad
            </p>
          )}
          {role === "Federation Admin" && (
            <p className="mt-0.5 text-sm text-[#6B7280]">
              All athletes across all squads and disciplines
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
            onClick={() => setWizardOpen(true)}
          >
            + Add Athlete
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", bg: "bg-white" },
          { label: "Active", value: stats.active, color: "text-[#15803D]", bg: "bg-[#DCFCE7]" },
          { label: "Injured", value: stats.injured, color: "text-[#B91C1C]", bg: "bg-[#FEE2E2]" },
          { label: "Pending", value: stats.pending, color: "text-[#92400E]", bg: "bg-[#FEF9C3]" },
          { label: "Suspended", value: stats.suspended, color: "text-[#6B21A8]", bg: "bg-[#F3E8FF]" },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5",
              s.bg,
            )}
          >
            <span className={cn("text-xl font-bold", s.color)}>{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {toast && (
        <div className="flex items-center justify-between rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 text-sm font-semibold text-[#15803D]">
          {toast}
          <button type="button" onClick={() => setToast("")} className="text-[#166534]">Dismiss</button>
        </div>
      )}

      {/* Pending approvals banner */}
      {stats.pending > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-sm font-medium text-[#92400E]">
              {stats.pending} athletes pending approval
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowApprovalQueue((open) => !open)}
            className="text-sm font-semibold text-[#1A56DB] hover:underline"
          >
            {showApprovalQueue ? "Hide Queue" : "Review Now"}
          </button>
        </div>
      )}

      {/* Approval queue */}
      {showApprovalQueue && pendingAthletes.length > 0 && (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#0F172A]">Onboarding Approval Queue</h2>
          <div className="grid gap-3">
            {pendingAthletes.map((athlete) => (
              <div key={athlete.id} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AvatarCircle athlete={athlete} size="md" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {athlete.firstName} {athlete.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {athlete.sport} — {athlete.discipline} · {athlete.squad}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Coach: {athlete.coach}
                        {athlete.assistCoach ? ` · Assistant: ${athlete.assistCoach}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#15803D] text-white hover:bg-[#166534]"
                      onClick={() => handleApprove(athlete.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectAthleteId(athlete.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#374151] sm:grid-cols-4">
                  {[
                    ["Nationality", athlete.nationality],
                    ["Reg. No.", athlete.nationalRegNo],
                    ["Performance", athlete.performanceLevel],
                    ["Enrolled", athlete.enrolledDate],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded bg-[#F8FAFC] p-2">
                      <p className="text-[#6B7280]">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, sport, squad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <SelectDropdown value={sport} options={SPORT_OPTIONS} onChange={setSport} />
        <SelectDropdown value={squad} options={SQUAD_OPTIONS} onChange={setSquad} />
        <SelectDropdown value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <SelectDropdown value={nationality} options={NATIONALITY_OPTIONS} onChange={setNationality} />

        {/* View toggle */}
        <div className="ml-auto flex rounded-md border border-[#E5E7EB] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
              view === "table"
                ? "bg-[#1A56DB] text-white"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("card")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
              view === "card"
                ? "bg-[#1A56DB] text-white"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </button>
        </div>
      </div>

      {/* Card view */}
      {view === "card" && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {filtered.map((a) => (
            <AthleteCard
              key={a.id}
              athlete={a}
              onClick={() => setDrawerAthlete(a)}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                {["Athlete", "Sport", "Squad", "Status", "Readiness", "Coach", "Last Active", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  onClick={() => setDrawerAthlete(a)}
                  className={cn(
                    "cursor-pointer border-b border-[#F1F5F9] transition-colors last:border-0 hover:bg-[#F8FAFC]",
                    i % 2 === 0 ? "" : "",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarCircle athlete={a} size="sm" />
                      <span className="font-medium text-foreground">
                        {a.firstName} {a.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.sport}</td>
                  <td className="px-4 py-3 text-slate-600">{a.squad}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ReadinessBar value={a.readiness} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.coach}</td>
                  <td className="px-4 py-3 text-slate-500">{a.lastActive}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-medium text-foreground">No athletes match the current filters.</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Clear one or more filters to return to the available squad list.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setSport("All Sports")
                  setSquad("All Squads")
                  setStatus("All")
                  setNationality("All Nationalities")
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Athlete drawer */}
      {drawerAthlete && (
        <AthleteDrawer
          athlete={drawerAthlete}
          onClose={() => setDrawerAthlete(null)}
          onViewProfile={(id) => {
            setDrawerAthlete(null)
            setProfileAthleteId(id)
            onProfileAthleteChange?.(id)
          }}
        />
      )}

      {/* Add Athlete wizard */}
      {wizardOpen && (
        <AddAthleteWizard onClose={() => setWizardOpen(false)} onSubmit={handleWizardSubmit} />
      )}

      {rejectAthleteId && (
        <RejectAthleteModal
          athlete={athletes.find((a) => a.id === rejectAthleteId)!}
          onClose={() => setRejectAthleteId(null)}
          onConfirm={(reason) => handleReject(rejectAthleteId, reason)}
        />
      )}
    </div>
  )
}
