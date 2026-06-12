import type { Athlete } from "@/components/athletes/data"

function readinessColor(score: number) {
  if (score >= 80) return { bg: "bg-[#22C55E]", ring: "ring-[#22C55E]/30", text: "text-[#22C55E]" }
  if (score >= 60) return { bg: "bg-[#F59E0B]", ring: "ring-[#F59E0B]/30", text: "text-[#F59E0B]" }
  return { bg: "bg-[#EF4444]", ring: "ring-[#EF4444]/30", text: "text-[#EF4444]" }
}

type Props = {
  athletes: Athlete[]
}

export function ReadinessHeatmap({ athletes }: Props) {
  const scoped = athletes
    .filter((a) => a.readiness !== null && a.status !== "Pending" && a.status !== "Rejected")
    .sort((a, b) => (b.readiness ?? 0) - (a.readiness ?? 0))

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Squad Readiness Overview</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" /> 80+
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" /> 60-79
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /> &lt;60
          </span>
        </div>
      </div>
      {scoped.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No athletes with readiness data in this scope.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {scoped.map((a) => {
            const score = a.readiness ?? 0
            const c = readinessColor(score)
            const name = `${a.firstName} ${a.lastName}`
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-4 ${c.bg} ${c.ring}`}
                >
                  {a.initials}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{name}</span>
                  <span className={`text-sm font-semibold ${c.text}`}>{score}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
