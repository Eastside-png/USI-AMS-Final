"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type InjuryDetail = {
  name: string
  sport: string
  injuryType: string
  bodyRegion: string
  dateOfOnset: string
  severity: "Mild" | "Moderate" | "Severe"
  rehabPhase: string
  rehabProgress: number // 0–100
  physiotherapist: string
  notes: { date: string; author: string; text: string }[]
}

const severityStyles: Record<string, string> = {
  Mild: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  Moderate: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  Severe: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
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
  open: boolean
  onClose: () => void
  athlete: InjuryDetail | null
}

export function InjuryDrawer({ open, onClose, athlete }: Props) {
  if (!athlete) return null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-[400px] flex-col gap-0 p-0 sm:max-w-[400px]"
      >
        {/* Header */}
        <SheetHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <SheetTitle className="text-base font-semibold text-foreground">
            Injury Details
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Athlete identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-lg font-bold text-white">
              {initials(athlete.name)}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {athlete.name}
              </p>
              <p className="text-sm text-muted-foreground">{athlete.sport}</p>
            </div>
          </div>

          {/* Injury details */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Injury Details
            </p>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground">
                {athlete.injuryType}
              </span>
              <span className="text-muted-foreground">Body Region</span>
              <span className="font-medium text-foreground">
                {athlete.bodyRegion}
              </span>
              <span className="text-muted-foreground">Date of Onset</span>
              <span className="font-medium text-foreground">
                {athlete.dateOfOnset}
              </span>
              <span className="text-muted-foreground">Severity</span>
              <Badge
                className={`w-fit border text-xs font-medium ${severityStyles[athlete.severity]}`}
                variant="outline"
              >
                {athlete.severity}
              </Badge>
            </div>
          </div>

          {/* Rehab phase */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Rehab Phase: {athlete.rehabPhase}
              </span>
              <span className="text-muted-foreground">
                {athlete.rehabProgress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#1A56DB] transition-all"
                style={{ width: `${athlete.rehabProgress}%` }}
              />
            </div>
          </div>

          {/* Physiotherapist */}
          <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white p-3 text-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A56DB]/10 text-xs font-semibold text-[#1A56DB]">
              {initials(athlete.physiotherapist)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Treating Physiotherapist
              </p>
              <p className="font-medium text-foreground">
                {athlete.physiotherapist}
              </p>
            </div>
          </div>

          {/* Medical notes timeline */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Notes
            </p>
            <div className="relative flex flex-col gap-0">
              {athlete.notes.map((note, i) => (
                <div key={i} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#1A56DB] bg-white" />
                    {i < athlete.notes.length - 1 && (
                      <div className="w-px flex-1 bg-[#E5E7EB]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-muted-foreground">
                      {note.date} &middot; {note.author}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{note.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-[#E5E7EB] px-6 py-4">
          <Button className="w-full bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90">
            Open Full Medical Record
          </Button>
          <Button variant="outline" className="w-full">
            Update Status
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
