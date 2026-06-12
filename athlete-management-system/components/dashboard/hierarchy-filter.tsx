"use client"

import { ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Athlete } from "@/components/athletes/data"
import {
  applyHierarchySelection,
  buildHierarchyOptions,
  filterAthletesByScope,
  type HierarchyScope,
} from "@/lib/hierarchy-scope"

type Props = {
  athletes: Athlete[]
  scope: HierarchyScope
  onScopeChange: (scope: HierarchyScope) => void
}

export function HierarchyFilter({ athletes, scope, onScopeChange }: Props) {
  const levels = buildHierarchyOptions(athletes, scope)
  const selected = [scope.federation, scope.discipline, scope.academy, scope.squad]
  const athleteCount = filterAthletesByScope(athletes, scope).length

  function handleSelect(levelIndex: number, label: string) {
    onScopeChange(applyHierarchySelection(scope, levelIndex, label))
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        {levels.map((level, i) => (
          <div key={level.key} className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus:outline-none",
                  i === levels.length - 1
                    ? "bg-[#1A56DB]/10 text-[#1A56DB]"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {selected[i]}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuGroup>
                  {level.options.map((opt) => (
                    <DropdownMenuItem
                      key={opt.label}
                      onClick={() => handleSelect(i, opt.label)}
                      className="flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{opt.count}</span>
                        <Check
                          className={cn(
                            "h-3.5 w-3.5 text-[#1A56DB]",
                            selected[i] === opt.label ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {i < levels.length - 1 && (
              <span className="text-muted-foreground/40">/</span>
            )}
          </div>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">{athleteCount} athletes</span>
      </span>
    </div>
  )
}
