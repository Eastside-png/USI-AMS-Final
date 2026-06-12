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
  const items = navItems.filter(
    (item) => item.label === "AI Copilot" || visibleModules.includes(item.label),
  )

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#0F172A]">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#3B82F6] text-sm font-bold text-white">
          USI
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold text-[#3B82F6]">USI</span>
          <span className="text-xs font-medium text-slate-400">AMS</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = item.label === active
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1A56DB]/15 text-white"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-slate-200",
                !isActive && item.highlight && "text-[#3B82F6] hover:text-[#3B82F6]",
              )}
            >
              {isActive && (
                <span className="absolute inset-y-1 left-0 w-[3px] rounded-r bg-[#1A56DB]" />
              )}
              <span className="relative">
                <Icon className="h-5 w-5 shrink-0" />
                {item.badge && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0F172A]" />
                )}
                {item.label === "Athletes" && pendingAthleteCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-white ring-2 ring-[#0F172A]">
                    {pendingAthleteCount}
                  </span>
                )}
              </span>
              <span className="flex flex-1 items-center justify-between">
                {item.label}
                {item.label === "Athletes" && pendingAthleteCount > 0 && (
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
