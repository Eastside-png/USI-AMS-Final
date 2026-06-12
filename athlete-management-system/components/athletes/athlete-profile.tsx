"use client"

import { useState } from "react"
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  BarChart2,
  Utensils,
  Dumbbell,
  Heart,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG, readinessColor, readinessBadgeClass, type Athlete } from "./data"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { PersistedInjury } from "@/components/medical/data"
import { REGION_LABELS, REHAB_PHASES } from "@/components/medical/data"
import { computeAttendanceRate, type PersistedSession } from "@/components/training/data"

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "medical", label: "Medical", icon: Heart },
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "history", label: "History", icon: History },
] as const

type TabId = (typeof TABS)[number]["id"]

/* ─── Mini stat card ───────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-bold" style={{ color: color ?? "inherit" }}>
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

/* ─── Overview tab ────────────────────────────────────────────── */
function OverviewTab({ athlete }: { athlete: Athlete }) {
  const activity = [
    {
      text: "Completed rehab session with Dr. Meera Nair",
      time: "2 hours ago",
      color: "#22C55E",
      icon: CheckCircle2,
    },
    {
      text: "Wellness check-in submitted — Sleep: 6/10",
      time: "8 hours ago",
      color: "#3B82F6",
      icon: Activity,
    },
    {
      text: "ACWR flagged by AI — 1.41 (above safe zone)",
      time: "Yesterday",
      color: "#EF4444",
      icon: AlertTriangle,
    },
    {
      text: "Injury update: Phase 3 criteria review",
      time: "2 days ago",
      color: "#F59E0B",
      icon: Clock,
    },
    {
      text: "Training session skipped — medical restriction",
      time: "2 days ago",
      color: "#6B7280",
      icon: Minus,
    },
  ]

  const perf = [
    { label: "Sessions Attended", value: "14 / 20", color: "#3B82F6", trend: "down" },
    { label: "Avg Sprint Time (100m)", value: "10.42s", color: "#10B981", trend: "up" },
    { label: "Wellness Score", value: "6.4 / 10", color: "#F59E0B", trend: "down" },
    { label: "Load Compliance", value: "62%", color: "#EF4444", trend: "down" },
  ]

  const TrendIcon = ({ dir }: { dir: string }) =>
    dir === "up" ? (
      <TrendingUp className="h-4 w-4 text-[#22C55E]" />
    ) : dir === "down" ? (
      <TrendingDown className="h-4 w-4 text-[#EF4444]" />
    ) : (
      <Minus className="h-4 w-4 text-slate-400" />
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          ["Primary Coach", athlete.coach],
          ["Assistant Coach", athlete.assistCoach ?? "—"],
          ["Attendance Rate", athlete.attendanceRate != null ? `${athlete.attendanceRate}%` : "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Performance cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {perf.map((p) => (
          <div
            key={p.label}
            className="flex flex-col gap-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-4"
          >
            <span className="text-xs text-muted-foreground">{p.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold" style={{ color: p.color }}>
                {p.value}
              </span>
              <TrendIcon dir={p.trend} />
            </div>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Activity</h3>
        <div className="flex flex-col">
          {activity.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-4 py-3",
                  i < activity.length - 1 && "border-b border-[#F1F5F9]",
                )}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.color}18` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                </div>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <span className="text-sm text-foreground">{item.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Medical tab ─────────────────────────────────────────────── */
function formatMedicalDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function MedicalTab({ injuries }: { injuries: PersistedInjury[] }) {
  const activeInjuries = injuries.filter((injury) => injury.status !== "Resolved")
  const resolvedInjuries = injuries.filter((injury) => injury.status === "Resolved")

  return (
    <div className="flex flex-col gap-6">
      {activeInjuries.length > 0 ? (
        <div className="grid gap-4">
          {activeInjuries.map((injury) => (
            <div key={injury.id} className="rounded-xl border border-[#FCA5A5] bg-[#FFF5F5] p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#B91C1C]">Active Injury</h3>
                <span className="rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-xs font-medium text-[#B91C1C]">
                  {injury.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Injury", injury.injuryType],
                  ["Region", REGION_LABELS[injury.bodyRegion]],
                  ["View", injury.view === "front" ? "Anterior" : "Posterior"],
                  ["Reported", formatMedicalDate(injury.dateOfOnset)],
                  ["Mechanism", injury.mechanism],
                  ["Severity", injury.severity],
                  ["Phase", `Phase ${injury.rehabPhase} — ${REHAB_PHASES[injury.rehabPhase - 1]}`],
                  ["Physio", injury.treatingPhysio],
                  ["Notes", `${injury.notes.length} notes`],
                  ["RTP Status", injury.rtpApprovalStatus ?? "Not requested"],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              {injury.notes.length > 0 && (
                <div className="mt-4 rounded-lg border border-[#FECACA] bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#B91C1C]">Latest Note</p>
                  <p className="mt-1 text-sm text-[#374151]">{injury.notes[injury.notes.length - 1]?.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5">
          <h3 className="text-sm font-semibold text-[#15803D]">No Active Injuries</h3>
          <p className="mt-2 text-sm text-[#166534]">
            This athlete has no active medical restrictions in the shared injury register.
          </p>
        </div>
      )}

      {/* Injury history from persisted records */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Injury History</h3>
        </div>
        {injuries.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">No injury records on file.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {["Injury", "Region", "Date", "Phase", "Status"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...injuries]
                .sort((a, b) => new Date(b.dateOfOnset).getTime() - new Date(a.dateOfOnset).getTime())
                .map((injury) => (
                  <tr key={injury.id} className="border-t border-[#F1F5F9]">
                    <td className="px-4 py-3 font-medium text-foreground">{injury.injuryType}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {REGION_LABELS[injury.bodyRegion]} ({injury.view === "front" ? "Ant." : "Post."})
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatMedicalDate(injury.dateOfOnset)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {injury.status === "Resolved" ? "Complete" : `Phase ${injury.rehabPhase}/5`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          injury.status === "Active"
                            ? "bg-[#FEE2E2] text-[#B91C1C]"
                            : injury.status === "Improving"
                              ? "bg-[#FEF3C7] text-[#B45309]"
                              : "bg-[#DCFCE7] text-[#15803D]",
                        )}
                      >
                        {injury.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {resolvedInjuries.length > 0 && (
          <p className="border-t border-[#F1F5F9] px-5 py-3 text-xs text-muted-foreground">
            {resolvedInjuries.length} resolved case{resolvedInjuries.length === 1 ? "" : "s"} via RTP clearance
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Training tab ────────────────────────────────────────────── */
const loadData = [
  { day: "Mon", load: 420 },
  { day: "Tue", load: 0, restricted: true },
  { day: "Wed", load: 310 },
  { day: "Thu", load: 0, restricted: true },
  { day: "Fri", load: 260 },
  { day: "Sat", load: 180 },
  { day: "Sun", load: 0 },
]

const monthlyLoad = [
  { week: "W1", acute: 1800, chronic: 1600 },
  { week: "W2", acute: 2100, chronic: 1700 },
  { week: "W3", acute: 2400, chronic: 1800 },
  { week: "W4", acute: 1170, chronic: 1850 },
]

function TrainingTab() {
  const schedule = [
    { day: "Monday", session: "Rehabilitation — Sprint mechanics drill", duration: "90 min", coach: "Dr. Meera Nair", status: "Completed" },
    { day: "Tuesday", session: "Rest — Medical restriction", duration: "—", coach: "—", status: "Restricted" },
    { day: "Wednesday", session: "Physio + Pool recovery", duration: "60 min", coach: "Anita Das", status: "Completed" },
    { day: "Thursday", session: "Rest — Medical restriction", duration: "—", coach: "—", status: "Restricted" },
    { day: "Friday", session: "Light gym — upper body only", duration: "45 min", coach: "Ravi Kumar", status: "Completed" },
    { day: "Saturday", session: "Physio session", duration: "60 min", coach: "Dr. Meera Nair", status: "Upcoming" },
    { day: "Sunday", session: "Rest", duration: "—", coach: "—", status: "Rest" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* This week */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Current Week Schedule</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {["Day", "Session", "Duration", "Coach", "Status"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, i) => (
              <tr key={i} className="border-t border-[#F1F5F9]">
                <td className="px-4 py-3 font-medium text-foreground">{row.day}</td>
                <td className="px-4 py-3 text-slate-600">{row.session}</td>
                <td className="px-4 py-3 text-slate-500">{row.duration}</td>
                <td className="px-4 py-3 text-slate-500">{row.coach}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    row.status === "Completed" ? "bg-[#DCFCE7] text-[#15803D]" :
                    row.status === "Restricted" ? "bg-[#FEE2E2] text-[#B91C1C]" :
                    row.status === "Upcoming" ? "bg-[#DBEAFE] text-[#1D4ED8]" :
                    "bg-[#F3F4F6] text-[#6B7280]"
                  )}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly load */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Monthly Training Load (ACWR)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyLoad} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="acute" name="Acute Load" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="chronic" name="Chronic Load" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ─── Nutrition tab ───────────────────────────────────────────── */
function NutritionTab() {
  const complianceData = [
    { day: "Jun 1", compliance: 82 }, { day: "Jun 5", compliance: 75 },
    { day: "Jun 10", compliance: 90 }, { day: "Jun 15", compliance: 68 },
    { day: "Jun 20", compliance: 72 }, { day: "Jun 25", compliance: 80 },
    { day: "Jun 30", compliance: 78 },
  ]

  const dietPlan = [
    { meal: "Breakfast", time: "7:00 AM", items: "Oats, banana, boiled eggs (3), milk 250ml", calories: "620 kcal" },
    { meal: "Pre-Training", time: "9:30 AM", items: "Dates (4), peanut butter toast", calories: "280 kcal" },
    { meal: "Lunch", time: "1:00 PM", items: "Brown rice 200g, chicken 180g, mixed vegetables", calories: "780 kcal" },
    { meal: "Post-Training", time: "4:30 PM", items: "Protein shake, banana", calories: "320 kcal" },
    { meal: "Dinner", time: "7:30 PM", items: "Chapati (3), dal, paneer 100g, salad", calories: "680 kcal" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Daily Caloric Target" value="2,680 kcal" />
        <StatCard label="Protein Target" value="182 g" />
        <StatCard label="Compliance (30d)" value="78%" color="#F59E0B" />
        <StatCard label="Assigned Dietician" value="Dr. Pooja Iyer" />
      </div>

      {/* Meal plan */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Current Diet Plan</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {["Meal", "Time", "Items", "Calories"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dietPlan.map((row, i) => (
              <tr key={i} className="border-t border-[#F1F5F9]">
                <td className="px-4 py-3 font-medium text-foreground">{row.meal}</td>
                <td className="px-4 py-3 text-slate-500">{row.time}</td>
                <td className="px-4 py-3 text-slate-600">{row.items}</td>
                <td className="px-4 py-3 font-medium text-[#3B82F6]">{row.calories}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compliance chart */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Compliance Rate — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={complianceData}>
            <defs>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="compliance" name="Compliance %" stroke="#10B981" strokeWidth={2} fill="url(#compGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ─── Documents tab ───────────────────────────────────────────── */
function DocumentsTab() {
  const docs = [
    { name: "Aadhaar Card", type: "ID Proof", uploaded: "14 Jan 2024", status: "Verified" },
    { name: "Birth Certificate", type: "Date of Birth", uploaded: "14 Jan 2024", status: "Verified" },
    { name: "Medical Fitness Certificate", type: "Medical", uploaded: "10 Mar 2025", status: "Verified" },
    { name: "NOC — Delhi Athletics", type: "NOC", uploaded: "12 Jan 2024", status: "Verified" },
    { name: "2023 Performance Records", type: "Performance", uploaded: "8 Dec 2023", status: "Verified" },
    { name: "Anti-Doping Declaration", type: "Compliance", uploaded: "20 Feb 2025", status: "Verified" },
  ]

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <div className="border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Uploaded Documents</h3>
        <span className="text-xs text-muted-foreground">{docs.length} documents</span>
      </div>
      <div className="divide-y divide-[#F1F5F9]">
        {docs.map((doc, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                <FileText className="h-4 w-4 text-[#1A56DB]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{doc.name}</span>
                <span className="text-xs text-muted-foreground">{doc.type} · Uploaded {doc.uploaded}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-medium text-[#15803D]">
                {doc.status}
              </span>
              <button type="button" className="rounded p-1 text-slate-400 hover:text-slate-600">
                <Eye className="h-4 w-4" />
              </button>
              <button type="button" className="rounded p-1 text-slate-400 hover:text-slate-600">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── History tab ─────────────────────────────────────────────── */
function HistoryTab() {
  const squadHistory = [
    { squad: "National Sprint Squad", from: "Jun 2022", to: "Present", coach: "Ravi Kumar" },
    { squad: "Development Sprint Squad", from: "Mar 2021", to: "Jun 2022", coach: "Sanjay Mehta" },
  ]
  const coachHistory = [
    { coach: "Ravi Kumar", from: "Jun 2022", to: "Present", sport: "Athletics" },
    { coach: "Sanjay Mehta", from: "Mar 2021", to: "Jun 2022", sport: "Athletics" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Enrollment */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Enrollment Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Enrolled", "12 March 2021"],
            ["Registration No.", "ATH-2021-0041"],
            ["Performance Level", "Elite"],
            ["State Association", "Delhi Athletics Association"],
            ["Primary Sport", "Athletics"],
            ["Current Discipline", "100m Sprint"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Squad history */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Squad History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {["Squad", "From", "To", "Coach"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {squadHistory.map((row, i) => (
              <tr key={i} className="border-t border-[#F1F5F9]">
                <td className="px-4 py-3 font-medium text-foreground">{row.squad}</td>
                <td className="px-4 py-3 text-slate-500">{row.from}</td>
                <td className="px-4 py-3 text-slate-500">{row.to}</td>
                <td className="px-4 py-3 text-slate-500">{row.coach}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coach history */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Coach History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {["Coach", "From", "To", "Sport"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coachHistory.map((row, i) => (
              <tr key={i} className="border-t border-[#F1F5F9]">
                <td className="px-4 py-3 font-medium text-foreground">{row.coach}</td>
                <td className="px-4 py-3 text-slate-500">{row.from}</td>
                <td className="px-4 py-3 text-slate-500">{row.to}</td>
                <td className="px-4 py-3 text-slate-500">{row.sport}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Profile page root ───────────────────────────────────────── */
export function AthleteProfile({
  athleteId,
  onBack,
  injuries = [],
  athletes,
  onAthletesChange,
  sessions = [],
}: {
  athleteId: string
  onBack: () => void
  injuries?: PersistedInjury[]
  athletes: Athlete[]
  onAthletesChange: (athletes: Athlete[]) => void
  sessions?: PersistedSession[]
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [coachDraft, setCoachDraft] = useState("")
  const [editingCoach, setEditingCoach] = useState(false)
  const baseAthlete = athletes.find((a) => a.id === athleteId) ?? athletes[0]
  const athlete = {
    ...baseAthlete,
    attendanceRate: sessions
      ? computeAttendanceRate(sessions, athleteId) ?? baseAthlete.attendanceRate
      : baseAthlete.attendanceRate,
  }
  const athleteInjuries = injuries.filter((injury) => injury.athleteId === athleteId)
  const hasActiveInjury = athleteInjuries.some((injury) => injury.status === "Active")
  const hasMonitoringInjury = athleteInjuries.some((injury) => injury.status === "Improving")
  let derivedStatusKey: keyof typeof STATUS_CONFIG = athlete.status
  if (hasActiveInjury) derivedStatusKey = "Injured"
  else if (hasMonitoringInjury) derivedStatusKey = "Monitoring"
  else if (athlete.status === "Injured") derivedStatusKey = "Active"
  const statusCfg = STATUS_CONFIG[derivedStatusKey]
  const readiness = athlete.readiness ?? 0
  const readinessCol = readiness ? readinessColor(readiness) : "#9CA3AF"

  const statusStrip = [
    { label: "Readiness", value: readiness ? `${readiness}%` : "—", color: readinessCol },
    { label: "Injury", value: athleteInjuries.some((injury) => injury.status !== "Resolved") ? "Active" : "None", color: athleteInjuries.some((injury) => injury.status !== "Resolved") ? "#EF4444" : "#22C55E" },
    { label: "Training Load", value: "High", color: "#F59E0B" },
    { label: "Nutrition", value: "78%", color: "#22C55E" },
    { label: "Documents", value: "Complete", color: "#22C55E" },
  ]

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Registry
      </button>

      {/* Profile header card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-wrap items-start gap-5">
          {/* Avatar */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: athlete.avatarColor }}
          >
            {athlete.initials}
          </div>

          {/* Name + meta */}
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {athlete.firstName} {athlete.lastName}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusCfg.bg,
                  statusCfg.text,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                {statusCfg.label}
              </span>
              {athlete.readiness != null && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    readinessBadgeClass(athlete.readiness),
                  )}
                >
                  Readiness {athlete.readiness}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {athlete.sport} — {athlete.discipline}
            </p>
            <p className="text-xs text-muted-foreground">{athlete.squad}</p>

            {/* Inline stats */}
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {[
                ["Age", `${athlete.age} yrs`],
                ["Height", athlete.height],
                ["Weight", athlete.weight],
                ["Coach", athlete.coach],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {editingCoach ? (
              <>
                <select
                  value={coachDraft}
                  onChange={(e) => setCoachDraft(e.target.value)}
                  className="h-9 rounded-md border border-[#E5E7EB] px-2 text-sm"
                >
                  {["Ravi Kumar", "Anita Das", "Suresh Pillai", "Meera Nair", "Vikram Bose", "Deepa Menon"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={() => {
                    onAthletesChange(
                      athletes.map((a) => (a.id === athleteId ? { ...a, coach: coachDraft } : a)),
                    )
                    setEditingCoach(false)
                  }}
                  className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
                >
                  Save Coach
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingCoach(false)}>Cancel</Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCoachDraft(athlete.coach)
                  setEditingCoach(true)
                }}
              >
                Assign Coach
              </Button>
            )}
            <Button size="sm" className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90">
              Message Coach
            </Button>
          </div>
        </div>

        {athlete.status === "Rejected" && athlete.rejectionReason && (
          <div className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm font-semibold text-[#B91C1C]">Rejection Reason</p>
            <p className="mt-1 text-sm text-[#7F1D1D]">{athlete.rejectionReason}</p>
          </div>
        )}

        {/* Status strip */}
        <div className="mt-5 flex gap-0 overflow-hidden rounded-lg border border-[#E5E7EB]">
          {statusStrip.map((seg, i) => (
            <div
              key={seg.label}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5",
                i < statusStrip.length - 1 && "border-r border-[#E5E7EB]",
              )}
            >
              <span className="text-xs text-muted-foreground">{seg.label}</span>
              <span className="text-sm font-semibold" style={{ color: seg.color }}>
                {seg.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 border-b border-[#E5E7EB]">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-4 pb-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-[#1A56DB] text-[#1A56DB]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && <OverviewTab athlete={athlete} />}
        {activeTab === "medical" && <MedicalTab injuries={athleteInjuries} />}
        {activeTab === "training" && <TrainingTab />}
        {activeTab === "nutrition" && <NutritionTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "history" && <HistoryTab />}
      </div>
    </div>
  )
}
