"use client"

import { Bell, Check, ChevronDown, Search } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { roles, type UserRole } from "@/lib/roles"

const notifications = [
  {
    title: "Marcus Chen: Rehab Phase 3 criteria review due",
    time: "2 hours ago",
  },
  {
    title: "ACWR Alert: 2 athletes above safe zone",
    time: "3 hours ago",
  },
  {
    title: "New athlete pending approval: Vikram Nair",
    time: "Yesterday",
  },
]

export function TopBar({
  module,
  role,
  onRoleChange,
}: {
  module: string
  role: UserRole
  onRoleChange: (role: UserRole) => void
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  return (
    <header className="fixed inset-x-0 left-60 top-0 z-20 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">USI AMS</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-semibold text-foreground">{module}</span>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search athletes, sessions, reports..."
          className="h-9 w-full pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-96 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Notifications</p>
                  <p className="text-xs text-[#6B7280]">{unreadCount} unread alerts</p>
                </div>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                  Live
                </span>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {notifications.map((notification) => (
                  <div key={notification.title} className="flex gap-3 px-4 py-3 hover:bg-[#F8FAFC]">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1A56DB]" />
                    <div>
                      <p className="text-sm font-medium leading-snug text-[#111827]">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setUnreadCount(0)}
                className="flex w-full items-center justify-center gap-2 border-t border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#1A56DB] hover:bg-[#F8FAFC]"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </button>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            {role}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className="flex items-center justify-between"
                >
                  {r}
                  <Check
                    className={cn(
                      "h-4 w-4 text-[#1A56DB]",
                      role === r ? "opacity-100" : "opacity-0",
                    )}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A56DB] text-sm font-semibold text-white">
          KT
        </div>
      </div>
    </header>
  )
}
