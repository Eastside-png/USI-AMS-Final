"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  X,
  Bot,
  Send,
  ChevronRight,
  Calendar,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Dumbbell,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Athlete } from "@/components/athletes/data"
import type { PersistedInjury } from "@/components/medical/data"
import type { PersistedSession, WorkloadRecord } from "@/components/training/data"
import type { HierarchyScope } from "@/lib/hierarchy-scope"
import {
  buildCopilotInitialMessages,
  moduleSubtitle,
  quickActionsForModule,
  suggestedPromptsForModule,
  type CopilotAction,
  type CopilotMessage,
} from "@/lib/copilot-context"

const ACTION_ICONS: Record<string, React.ElementType> = {
  "Review Athlete": Users,
  "Create Rehab Plan": Dumbbell,
  "Schedule Recovery Session": Calendar,
  "View Injury Risk": AlertTriangle,
  "Open Readiness Dashboard": Activity,
  "Open Medical": FileText,
  Export: FileText,
  "Adjust Training": TrendingUp,
}

interface Props {
  open: boolean
  onClose: () => void
  activeModule: string
  athletes: Athlete[]
  injuries: PersistedInjury[]
  sessions: PersistedSession[]
  workloads: WorkloadRecord[]
  hierarchyScope: HierarchyScope
  contextAthleteId?: string | null
  onAction: (action: CopilotAction) => void
}

export function AiCopilotPanel({
  open,
  onClose,
  activeModule,
  athletes,
  injuries,
  sessions,
  workloads,
  hierarchyScope,
  contextAthleteId,
  onAction,
}: Props) {
  const initialMessages = useMemo(
    () =>
      buildCopilotInitialMessages(
        activeModule,
        athletes,
        injuries,
        sessions,
        workloads,
        hierarchyScope,
        contextAthleteId,
      ),
    [activeModule, athletes, injuries, sessions, workloads, hierarchyScope, contextAthleteId],
  )

  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }
  }, [open, messages])

  const quickActions = quickActionsForModule(activeModule)
  const suggestedPrompts = suggestedPromptsForModule(activeModule)
  const subtitle = moduleSubtitle(activeModule, contextAthleteId, athletes)

  function sendMessage(text?: string) {
    const content = text ?? input.trim()
    if (!content) return
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const userMsg: CopilotMessage = {
      id: `u${Date.now()}`,
      role: "user",
      content,
      timestamp: now,
    }
    const active = athletes.filter((a) => a.status !== "Pending")
    const withReadiness = active.filter((a) => a.readiness !== null)
    const avgReadiness =
      withReadiness.length > 0
        ? Math.round(withReadiness.reduce((s, a) => s + (a.readiness ?? 0), 0) / withReadiness.length)
        : 0
    const aiMsg: CopilotMessage = {
      id: `a${Date.now()}`,
      role: "ai",
      content: `Based on current ${activeModule.toLowerCase()} data: ${active.length} athletes tracked, ${avgReadiness}% average readiness, ${injuries.filter((i) => i.status !== "Resolved").length} active injuries. I can drill into any athlete or squad metric — try the action buttons above.`,
      timestamp: now,
    }
    setMessages((prev) => [...prev, userMsg, aiMsg])
    setInput("")
  }

  function handleAction(action: CopilotAction) {
    onAction(action)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none" />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-[420px] flex-col bg-white shadow-2xl border-l border-border">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A56DB]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Copilot</h2>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-border bg-blue-50 px-5 py-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Viewing: {activeModule}
            {contextAthleteId
              ? ` — ${athletes.find((a) => a.id === contextAthleteId)?.firstName ?? "Athlete"}`
              : ""}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-border px-5 py-3 scrollbar-hide">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => sendMessage(action)}
              className="whitespace-nowrap rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-[#1A56DB]/40 hover:bg-blue-50 hover:text-[#1A56DB]"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "ai" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A56DB]">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-[#1A56DB] text-sm text-white"
                      : "rounded-tl-sm border border-blue-100 bg-blue-50",
                  )}
                >
                  {typeof msg.content === "string" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    msg.content
                  )}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.actionButtons.map((btn) => {
                        const Icon = ACTION_ICONS[btn.label] ?? ChevronRight
                        return (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => handleAction(btn.action)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#1A56DB]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#1A56DB] transition-colors hover:bg-blue-50"
                          >
                            <Icon className="h-3 w-3" />
                            {btn.label}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <p
                    className={cn(
                      "mt-1.5 text-[10px]",
                      msg.role === "user" ? "text-blue-200" : "text-muted-foreground/60",
                    )}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-blue-50 hover:text-[#1A56DB]"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 focus-within:border-[#1A56DB]/50 focus-within:ring-1 focus-within:ring-[#1A56DB]/20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about your athletes..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1A56DB] text-white transition-colors hover:bg-[#1A56DB]/90 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
