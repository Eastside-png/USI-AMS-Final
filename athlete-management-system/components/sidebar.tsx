"use client"

import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Heart,
  Activity,
  Apple,
  ClipboardList,
  BarChart3,
  Bot,
  UserCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  icon: React.ElementType
  badge?: boolean
  highlight?: boolean
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Athletes", icon: Users },
  { label: "Training", icon: Dumbbell },
  { label: "Medical", icon: Heart, badge: true },
  { label: "Sports Science", icon: Activity },
  { label: "Nutrition", icon: Apple },
  { label: "Assessments", icon: ClipboardList },
  { label: "Analytics", icon: BarChart3 },
  { label: "AI Copilot", icon: Bot, highlight: true },
]

const ROLE_ACCENT: Record<string, string> = {
  "Federation Admin": "#1A56DB",
  Coach: "#16A34A",
  Physiotherapist: "#D97706",
  "Sports Scientist": "#7C3AED",
  Athlete: "#0891B2",
}

export function Sidebar({
  active,
  onSelect,
  role,
  visibleModules,
  pendingAthleteCount = 0,
}: {
  active: string
  onSelect: (label: string) => void
  role: string
  visibleModules: string[]
  pendingAthleteCount?: number
}) {
  const accent = ROLE_ACCENT[role] ?? "#1A56DB"

  // For Athlete role, show a simplified nav with just their personal modules
  const isAthlete = role === "Athlete"

  const items = isAthlete
    ? [{ label: "Dashboard", icon: LayoutDashboard }]
    : navItems.filter(
        (item) => item.label === "AI Copilot" || visibleModules.includes(item.label),
      )

  // Fed Admin gets an approvals badge on the Athletes nav item
  const showApprovalsBadge = role === "Federation Admin" && pendingAthleteCount > 0

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#0F172A]">
      <div className="flex h-16 items-center gap-2 px-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          USI
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold" style={{ color: accent }}>USI</span>
          <span className="text-xs font-medium text-slate-400">AMS</span>
        </div>
      </div>

      {/* Role badge strip */}
      <div className="mx-3 mb-1 flex items-center gap-2 rounded-md px-3 py-1.5" style={{ backgroundColor: `${accent}18` }}>
        <UserCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
        <span className="truncate text-xs font-semibold" style={{ color: accent }}>{role}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const isActive = item.label === active
          const Icon = item.icon
          const hasApprovalsBadge = item.label === "Athletes" && showApprovalsBadge
          // Medical badge: only for non-coach, non-athlete roles
          const showMedicalBadge = item.badge && role !== "Coach" && role !== "Athlete"

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-slate-200",
                !isActive && item.highlight && "text-[#3B82F6] hover:text-[#3B82F6]",
              )}
              style={isActive ? { backgroundColor: `${accent}25` } : undefined}
            >
              {isActive && (
                <span
                  className="absolute inset-y-1 left-0 w-[3px] rounded-r"
                  style={{ backgroundColor: accent }}
                />
              )}
              <span className="relative">
                <Icon className="h-5 w-5 shrink-0" />
                {showMedicalBadge && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0F172A]" />
                )}
                {hasApprovalsBadge && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-white ring-2 ring-[#0F172A]">
                    {pendingAthleteCount}
                  </span>
                )}
              </span>
              <span className="flex flex-1 items-center justify-between">
                {item.label}
                {hasApprovalsBadge && (
                  <span className="rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-[10px] font-semibold text-[#F59E0B]">
                    {pendingAthleteCount} pending
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-slate-500">v2.4.0 - Enterprise</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-400">{role}</p>
      </div>
    </aside>
  )
}
