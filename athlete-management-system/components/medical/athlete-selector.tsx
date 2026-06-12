"use client"

import type { Athlete, RegionStatus } from "./data"

const STATUS_DOT: Record<RegionStatus, string> = {
  healthy: "bg-[#22C55E]",
  monitoring: "bg-[#F59E0B]",
  active: "bg-[#EF4444]",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type Props = {
  athletes: Athlete[]
  selectedId: string
  onSelect: (id: string) => void
}

export function AthleteSelector({ athletes, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {athletes.map((athlete) => {
        const isSelected = athlete.id === selectedId
        return (
          <button
            key={athlete.id}
            type="button"
            onClick={() => onSelect(athlete.id)}
            className={`flex w-52 shrink-0 items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors ${
              isSelected
                ? "border-[#1A56DB] ring-1 ring-[#1A56DB]"
                : "border-[#E5E7EB] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F172A] text-sm font-bold text-white">
                {initials(athlete.name)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${STATUS_DOT[athlete.status]}`}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {athlete.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {athlete.sport}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
