"use client"

import { Bot } from "lucide-react"

export function AiCopilotButton() {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#1A56DB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A56DB]/30 transition-all hover:bg-[#1A56DB]/90 hover:shadow-xl"
    >
      <Bot className="h-5 w-5" />
      AI Copilot
    </button>
  )
}
