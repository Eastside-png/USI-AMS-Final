"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Athlete, RegionId, RegionStatus } from "./data"
import { REGION_LABELS, STATUS_LABELS } from "./data"

const statusBadge: Record<RegionStatus, string> = {
  healthy: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  monitoring: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  active: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
}

type Props = {
  athlete: Athlete
  region: RegionId | null
}

export function RegionDetail({ athlete, region }: Props) {
  if (!region) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          Select a body region
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Click any highlighted area on the body map to view detailed injury and
          rehabilitation information.
        </p>
      </div>
    )
  }

  const status = athlete.regions[region] ?? "healthy"
  const injury = athlete.injuries[region]

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-[#E5E7EB] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {REGION_LABELS[region]}
        </h3>
        <Badge
          variant="outline"
          className={`border text-xs font-medium ${statusBadge[status]}`}
        >
          {STATUS_LABELS[status]}
        </Badge>
      </div>

      {!injury ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-5 text-sm text-muted-foreground">
          No active or historical injuries recorded for this region. The area is
          currently healthy and cleared for full training load.
        </div>
      ) : (
        <>
          {/* Injury card */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-[140px_1fr]">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground">{injury.type}</span>

              <span className="text-muted-foreground">Date of Onset</span>
              <span className="font-medium text-foreground">
                {injury.dateOfOnset}
              </span>

              <span className="text-muted-foreground">Mechanism</span>
              <span className="font-medium text-foreground">
                {injury.mechanism}
              </span>

              <span className="text-muted-foreground">Severity</span>
              <span className="font-medium text-foreground">
                {injury.severity}
              </span>

              <span className="text-muted-foreground">Treating Physio</span>
              <span className="font-medium text-foreground">
                {injury.physio}
              </span>

              <span className="text-muted-foreground">Current Phase</span>
              <span className="font-medium text-foreground">
                {injury.phase} (Phase {injury.phaseNumber} of{" "}
                {injury.phaseTotal})
              </span>
            </div>
          </div>

          {/* Rehab progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Rehab Progress
              </span>
              <span className="text-muted-foreground">
                Phase {injury.phaseNumber} / {injury.phaseTotal}
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: injury.phaseTotal }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < injury.phaseNumber ? "bg-[#1A56DB]" : "bg-[#E5E7EB]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button className="bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90">
              Update Status
            </Button>
            <Button variant="outline">Add Note</Button>
            <Button variant="outline">View Timeline</Button>
          </div>
        </>
      )}
    </div>
  )
}
