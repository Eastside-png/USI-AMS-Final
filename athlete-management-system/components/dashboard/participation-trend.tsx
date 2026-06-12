"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { PersistedSession } from "@/components/training/data"
import { computeAttendanceTrend } from "@/lib/hierarchy-scope"

type Props = {
  sessions: PersistedSession[]
  athleteIds: Set<string>
}

export function ParticipationTrend({ sessions, athleteIds }: Props) {
  const data = computeAttendanceTrend(sessions, athleteIds)

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Attendance Rate — Last 30 Days
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
            <YAxis
              domain={[75, 100]}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#64748B"
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
              formatter={(v) => [`${v}%`, "Attendance"]}
              labelFormatter={(l) => `Day ${l}`}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#22C55E" }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
