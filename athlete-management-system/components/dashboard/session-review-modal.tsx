"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Users, Zap } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
}

export function SessionReviewModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-md p-0">
        <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            Review Session
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Alert banner */}
          <div className="flex items-start gap-3 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
            <p className="text-sm text-foreground">
              Sprint Squad ACWR is{" "}
              <span className="font-semibold text-[#EF4444]">1.41</span> —
              above safe zone (≤1.30). Reducing Thursday intensity is
              recommended.
            </p>
          </div>

          {/* Session card */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Thursday Sprint Session
              </span>
              <Badge
                variant="outline"
                className="border-[#EF4444]/30 bg-[#EF4444]/10 text-xs text-[#EF4444]"
              >
                High Risk
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>12 Jun 2026, 7:00 am</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Sprint Squad (14 athletes)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Planned intensity: 90%</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-[#22C55E]" />
                <span className="text-[#22C55E]">Suggested: 65–70%</span>
              </div>
            </div>
          </div>

          {/* ACWR bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Current ACWR</span>
              <span className="font-semibold text-[#EF4444]">1.41</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              {/* safe zone 0.8–1.3 */}
              <div
                className="absolute inset-y-0 left-[26.7%] bg-[#22C55E]/30"
                style={{ width: "16.7%" }}
              />
              {/* current marker */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#EF4444]"
                style={{ width: "47%" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.8 safe zone</span>
              <span>1.3 upper limit</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <Button
            className="flex-1 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
            onClick={onClose}
          >
            Confirm Reduction
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
