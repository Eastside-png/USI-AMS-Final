"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { PersistedSession } from "@/components/training/data"
import { computeWeeklyLoadData } from "@/lib/hierarchy-scope"

type Props = {
  sessions: PersistedSession[]
}

export function TrainingLoadChart({ sessions }: Props) {
  const data = computeWeeklyLoadData(sessions)

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Weekly Training Load vs Planned
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
            <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Actual" fill="#1A56DB" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="Planned" fill="#CBD5E1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
