"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react"

// ── Data ────────────────────────────────────────────────────────────────────

const READINESS_ATHLETES = [
  {
    id: "mc", name: "Marcus Chen", score: 62, hrv: 58, sleep: 6.2, soreness: 7, energy: 5,
    trend: "down", initials: "MC",
  },
  {
    id: "kr", name: "Kavya Reddy", score: 81, hrv: 74, sleep: 7.8, soreness: 3, energy: 8,
    trend: "up", initials: "KR",
  },
  {
    id: "rk", name: "Rohit Kumar", score: 88, hrv: 82, sleep: 8.1, soreness: 2, energy: 9,
    trend: "up", initials: "RK",
  },
  {
    id: "ps", name: "Priya Sharma", score: 74, hrv: 68, sleep: 7.2, soreness: 4, energy: 7,
    trend: "flat", initials: "PS",
  },
  {
    id: "am", name: "Arjun Mehta", score: 55, hrv: 52, sleep: 5.9, soreness: 8, energy: 4,
    trend: "down", initials: "AM",
  },
  {
    id: "ns", name: "Nina Solberg", score: 91, hrv: 88, sleep: 8.4, soreness: 1, energy: 9,
    trend: "up", initials: "NS",
  },
]

const FATIGUE_DATA = [
  { day: "Mon", marcus: 68, kavya: 42, rohit: 35 },
  { day: "Tue", marcus: 71, kavya: 44, rohit: 38 },
  { day: "Wed", marcus: 75, kavya: 48, rohit: 40 },
  { day: "Thu", marcus: 72, kavya: 45, rohit: 36 },
  { day: "Fri", marcus: 80, kavya: 50, rohit: 42 },
  { day: "Sat", marcus: 78, kavya: 47, rohit: 39 },
  { day: "Sun", marcus: 82, kavya: 52, rohit: 44 },
]

const GPS_SESSION_VS_SEASON = [
  { metric: "Distance", session: 8.4, season: 7.8 },
  { metric: "HSR", session: 1.2, season: 0.98 },
  { metric: "Sprints", session: 24, season: 19 },
  { metric: "Max Speed", session: 32.4, season: 30.1 },
]

const DEVICES = [
  { name: "Marcus Chen", device: "Polar H10", lastSync: "2 min ago", battery: 78, status: "ok" },
  { name: "Kavya Reddy", device: "Garmin HRM-Pro", lastSync: "4 min ago", battery: 91, status: "ok" },
  { name: "Rohit Kumar", device: "Polar H10", lastSync: "8 min ago", battery: 55, status: "ok" },
  { name: "Priya Sharma", device: "Whoop 4.0", lastSync: "42 min ago", battery: 34, status: "warning" },
  { name: "Arjun Mehta", device: "Garmin HRM-Pro", lastSync: "3 hrs ago", battery: 12, status: "error" },
  { name: "Nina Solberg", device: "Polar H10", lastSync: "6 min ago", battery: 88, status: "ok" },
]

const AI_ALERTS = [
  {
    severity: "high",
    athlete: "Marcus Chen",
    message: "Injury recurrence risk elevated based on 7-day load pattern. Acute-to-chronic ratio has exceeded 1.3 for 3 consecutive days.",
    action: "Reduce load 20%",
  },
  {
    severity: "moderate",
    athlete: "Kavya Reddy",
    message: "Fatigue accumulation detected. HRV has declined 14% over 5 days with insufficient recovery between sessions.",
    action: "Schedule rest day",
  },
  {
    severity: "low",
    athlete: "Rohit Kumar",
    message: "Recovery compliance at 82% — slightly below the 90% target. 2 missed post-session recovery protocols this week.",
    action: "Review protocol",
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function readinessColor(score: number) {
  if (score >= 80) return { bg: "bg-green-50", ring: "ring-green-200", text: "text-green-700", dot: "bg-green-500" }
  if (score >= 65) return { bg: "bg-yellow-50", ring: "ring-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" }
  return { bg: "bg-red-50", ring: "ring-red-200", text: "text-red-700", dot: "bg-red-500" }
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-green-500" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
  return <Minus className="h-3.5 w-3.5 text-[#9CA3AF]" />
}

function severityConfig(s: string) {
  if (s === "high") return { label: "High Risk", badge: "bg-red-100 text-red-700 border-red-200", border: "border-l-red-500" }
  if (s === "moderate") return { label: "Moderate", badge: "bg-yellow-100 text-yellow-700 border-yellow-200", border: "border-l-yellow-500" }
  return { label: "Low", badge: "bg-blue-100 text-blue-700 border-blue-200", border: "border-l-blue-500" }
}

function deviceStatusConfig(status: string) {
  if (status === "ok") return { label: "Synced", cls: "bg-green-100 text-green-700", icon: <Wifi className="h-3 w-3" /> }
  if (status === "warning") return { label: "Delayed", cls: "bg-yellow-100 text-yellow-700", icon: <AlertTriangle className="h-3 w-3" /> }
  return { label: "Sync Error", cls: "bg-red-100 text-red-700", icon: <WifiOff className="h-3 w-3" /> }
}

// ── Component ────────────────────────────────────────────────────────────────

export function SportsScienceModule({ role = "Federation Admin" }: { role?: string }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A56DB]/10">
          <Activity className="h-5 w-5 text-[#1A56DB]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">Sports Science</h1>
            {role === "Sports Scientist" && (
              <span className="rounded-full bg-[#1A56DB] px-2.5 py-0.5 text-xs font-semibold text-white">
                Primary Workspace
              </span>
            )}
          </div>
          <p className="text-sm text-[#6B7280]">Readiness, fatigue, GPS analytics and wearable data</p>
        </div>
      </div>

      {/* 1. Squad Readiness */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[#0F172A]">Squad Readiness — Today</h2>
        <div className="grid grid-cols-6 gap-3">
          {READINESS_ATHLETES.map((a) => {
            const c = readinessColor(a.score)
            return (
              <div
                key={a.id}
                className={`rounded-xl border bg-white p-3 ring-1 ${c.ring} flex flex-col gap-2`}
              >
                <div className="flex items-center gap-2">
                  <div className="relative h-9 w-9 shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
                      {a.initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${c.dot}`} />
                  </div>
                  <p className="truncate text-xs font-semibold text-[#374151]">{a.name.split(" ")[0]}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${c.text}`}>{a.score}</span>
                  <TrendIcon trend={a.trend} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "HRV", val: a.hrv },
                    { label: "Sleep", val: `${a.sleep}h` },
                    { label: "Sore", val: `${a.soreness}/10` },
                    { label: "Energy", val: `${a.energy}/10` },
                  ].map((m) => (
                    <div key={m.label} className="rounded bg-[#F9FAFB] px-1.5 py-0.5">
                      <p className="text-[10px] text-[#9CA3AF]">{m.label}</p>
                      <p className="text-xs font-semibold text-[#374151]">{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 2+3. Fatigue + GPS side by side */}
      <div className="grid grid-cols-2 gap-5">
        {/* Fatigue */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#0F172A]">Fatigue Index — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={FATIGUE_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[20, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line dataKey="marcus" name="Marcus Chen" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line dataKey="kavya" name="Kavya Reddy" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line dataKey="rohit" name="Rohit Kumar" stroke="#22C55E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-col gap-1.5">
            {[
              { name: "Marcus Chen", val: 82, status: "High" as const, color: "text-red-600 bg-red-50" },
              { name: "Kavya Reddy", val: 52, status: "Moderate" as const, color: "text-yellow-600 bg-yellow-50" },
              { name: "Rohit Kumar", val: 44, status: "Low" as const, color: "text-green-600 bg-green-50" },
            ].map((f) => (
              <div key={f.name} className="flex items-center justify-between text-sm">
                <span className="text-[#374151]">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0F172A]">{f.val}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.color}`}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GPS */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="mb-1 text-base font-semibold text-[#0F172A]">GPS — Last Session</h2>
          <p className="mb-4 text-xs text-[#9CA3AF]">Monday Sprint Training</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            {[
              { label: "Total Distance", val: "8.4 km", sub: "+0.6 km vs avg" },
              { label: "High-Speed Running", val: "1.2 km", sub: "+0.22 km vs avg" },
              { label: "Sprint Count", val: "24", sub: "+5 vs avg" },
              { label: "Max Speed", val: "32.4 km/h", sub: "+2.3 vs avg" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#9CA3AF]">{m.label}</p>
                <p className="text-lg font-bold text-[#0F172A]">{m.val}</p>
                <p className="text-xs text-green-600">{m.sub}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={GPS_SESSION_VS_SEASON} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="session" name="This Session" fill="#1A56DB" radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="season" name="Season Avg" fill="#CBD5E1" radius={[3, 3, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* 4. Devices + AI Alerts */}
      <div className="grid grid-cols-3 gap-5">
        {/* Devices — 2 cols */}
        <section className="col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#0F172A]">Connected Devices</h2>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync All
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-[#F3F4F6]">
              <tr>
                {["Athlete", "Device", "Last Sync", "Battery", "Status"].map((h) => (
                  <th key={h} className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9FAFB]">
              {DEVICES.map((d) => {
                const sc = deviceStatusConfig(d.status)
                return (
                  <tr key={d.name} className="hover:bg-[#F9FAFB]">
                    <td className="py-2.5 font-medium text-[#111827]">{d.name}</td>
                    <td className="py-2.5 text-[#6B7280]">{d.device}</td>
                    <td className="py-2.5 text-[#6B7280]">{d.lastSync}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[#F3F4F6]">
                          <div
                            className={`h-1.5 rounded-full ${d.battery > 50 ? "bg-green-500" : d.battery > 25 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${d.battery}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#6B7280]">{d.battery}%</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${sc.cls} border-current/20`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* AI Risk Alerts — 1 col */}
        <section className="col-span-1 flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="text-base font-semibold text-[#0F172A]">AI Risk Alerts</h2>
          {AI_ALERTS.map((alert) => {
            const sc = severityConfig(alert.severity)
            return (
              <div
                key={alert.athlete}
                className={`rounded-lg border-l-4 border border-[#E5E7EB] p-3 ${sc.border}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0F172A]">{alert.athlete}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sc.badge}`}>
                    {sc.label}
                  </span>
                </div>
                <p className="mb-2 text-xs leading-relaxed text-[#6B7280]">{alert.message}</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#1A56DB] hover:underline"
                >
                  {alert.action} &rarr;
                </button>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}
