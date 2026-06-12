"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Dashboard } from "@/components/dashboard/dashboard"
import { AthleteDashboard } from "@/components/dashboard/athlete-dashboard"
import { MedicalModule } from "@/components/medical/medical-module"
import { AthleteRegistry } from "@/components/athletes/athlete-registry"
import { TrainingModule } from "@/components/training/training-module"
import { SportsScienceModule } from "@/components/sports-science/sports-science-module"
import { NutritionModule } from "@/components/nutrition/nutrition-module"
import { AssessmentsModule } from "@/components/assessments/assessments-module"
import { AnalyticsModule } from "@/components/analytics/analytics-module"
import { AiCopilotPanel } from "@/components/ai-copilot-panel"
import { Bot } from "lucide-react"
import type { UserRole } from "@/lib/roles"
import { ROLE_VISIBLE_MODULES, DEFAULT_MODULE_BY_ROLE } from "@/lib/roles"
import { INITIAL_INJURIES, type PersistedInjury } from "@/components/medical/data"
import { INITIAL_ATHLETES, type Athlete } from "@/components/athletes/data"
import {
  seedSessionsForCurrentWeek,
  type PersistedSession,
  type WorkloadRecord,
} from "@/components/training/data"
import { DEFAULT_HIERARCHY_SCOPE, type HierarchyScope } from "@/lib/hierarchy-scope"
import type { CopilotAction } from "@/lib/copilot-context"

// Use the canonical role maps from lib/roles
const defaultModuleByRole = DEFAULT_MODULE_BY_ROLE

function ModuleSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-64 rounded bg-slate-200" />
            <div className="h-4 w-40 rounded bg-slate-100" />
          </div>
          <div className="h-9 w-36 rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-slate-100 bg-white p-4">
              <div className="h-3 w-24 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 h-80 rounded-xl border border-slate-100 bg-white p-5">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="mt-8 h-52 rounded bg-slate-100" />
          </div>
          <div className="h-80 rounded-xl border border-slate-100 bg-white p-5">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [activeModule, setActiveModule] = useState("Dashboard")
  const [role, setRole] = useState<UserRole>("Federation Admin")
  const [injuries, setInjuries] = useState<PersistedInjury[]>(INITIAL_INJURIES)
  const [athletes, setAthletes] = useState<Athlete[]>(INITIAL_ATHLETES)
  const [sessions, setSessions] = useState<PersistedSession[]>(seedSessionsForCurrentWeek)
  const [workloads, setWorkloads] = useState<WorkloadRecord[]>([])
  const [loadingModule, setLoadingModule] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [hierarchyScope, setHierarchyScope] = useState<HierarchyScope>(DEFAULT_HIERARCHY_SCOPE)

  // Automatically scope Coach dashboard to Sprint Squad, Fed Admin to full federation
  const effectiveScope = useMemo<HierarchyScope>(() => {
    if (role === "Coach") {
      return {
        ...DEFAULT_HIERARCHY_SCOPE,
        discipline: "Athletics",
        squad: "Sprint Squad",
      }
    }
    return hierarchyScope
  }, [role, hierarchyScope])
  const [copilotProfileAthleteId, setCopilotProfileAthleteId] = useState<string | null>(null)
  const [navProfileAthleteId, setNavProfileAthleteId] = useState<string | null>(null)
  const [medicalNav, setMedicalNav] = useState<{ athleteId?: string; tab?: string } | null>(null)
  const [trainingNav, setTrainingNav] = useState<{ openBuilder?: boolean; sessionType?: PersistedSession["type"] } | null>(null)

  const pendingAthleteCount = useMemo(
    () => athletes.filter((a) => a.status === "Pending").length,
    [athletes],
  )

  const visibleModules = useMemo(() => ROLE_VISIBLE_MODULES[role], [role])

  useEffect(() => {
    if (!visibleModules.includes(activeModule)) {
      setActiveModule(defaultModuleByRole[role])
    }
  }, [activeModule, role, visibleModules])

  function handleModuleSelect(label: string) {
    if (label === "AI Copilot") {
      setCopilotOpen(true)
      return
    }
    if (label === activeModule) return
    setLoadingModule(true)
    setActiveModule(label)
    window.setTimeout(() => setLoadingModule(false), 500)
  }

  function handleCopilotAction(action: CopilotAction) {
    switch (action.type) {
      case "review-athlete":
        setNavProfileAthleteId(action.athleteId)
        setCopilotProfileAthleteId(action.athleteId)
        setActiveModule("Athletes")
        setCopilotOpen(false)
        break
      case "create-rehab-plan":
        setMedicalNav({ athleteId: action.athleteId, tab: "Rehab Tracker" })
        setActiveModule("Medical")
        setCopilotOpen(false)
        break
      case "schedule-recovery":
        setTrainingNav({ openBuilder: true, sessionType: "Recovery" })
        setActiveModule("Training")
        setCopilotOpen(false)
        break
      case "view-injury-risk":
        setMedicalNav({ athleteId: action.athleteId, tab: "Body Map" })
        setActiveModule("Medical")
        setCopilotOpen(false)
        break
      case "open-readiness-dashboard":
        setActiveModule("Sports Science")
        setCopilotOpen(false)
        break
      case "navigate":
        setActiveModule(action.module)
        setCopilotOpen(false)
        break
    }
  }

  const copilotContextAthleteId =
    activeModule === "Athletes" ? copilotProfileAthleteId : null

  function renderModule() {
    if (loadingModule) return <ModuleSkeleton />
    if (activeModule === "Dashboard") {
      // Athlete role gets their own personalised dashboard
      if (role === "Athlete") {
        return (
          <AthleteDashboard
            sessions={sessions}
            workloads={workloads}
            onWorkloadsChange={setWorkloads}
          />
        )
      }
      return (
        <Dashboard
          athletes={athletes}
          injuries={injuries}
          sessions={sessions}
          workloads={workloads}
          hierarchyScope={effectiveScope}
          onHierarchyScopeChange={role === "Coach" ? () => {} : setHierarchyScope}
          onNavigate={handleModuleSelect}
        />
      )
    }
    if (activeModule === "Medical") {
      return (
        <MedicalModule
          role={role}
          onNavigate={handleModuleSelect}
          injuries={injuries}
          onInjuriesChange={setInjuries}
          initialSelectedId={medicalNav?.athleteId}
          initialTab={medicalNav?.tab as "Body Map" | "Rehab Tracker" | undefined}
          onMedicalNavConsumed={() => setMedicalNav(null)}
        />
      )
    }
    if (activeModule === "Athletes") {
      return (
        <AthleteRegistry
          role={role}
          injuries={injuries}
          athletes={athletes}
          onAthletesChange={setAthletes}
          sessions={sessions}
          initialProfileAthleteId={navProfileAthleteId}
          onProfileAthleteIdConsumed={() => setNavProfileAthleteId(null)}
          onProfileAthleteChange={setCopilotProfileAthleteId}
        />
      )
    }
    if (activeModule === "Training") {
      return (
        <TrainingModule
          role={role}
          onNavigate={handleModuleSelect}
          athletes={athletes}
          sessions={sessions}
          onSessionsChange={setSessions}
          workloads={workloads}
          onWorkloadsChange={setWorkloads}
          openSessionBuilder={trainingNav?.openBuilder}
          initialSessionType={trainingNav?.sessionType}
          onSessionBuilderConsumed={() => setTrainingNav(null)}
        />
      )
    }
    if (activeModule === "Sports Science") return <SportsScienceModule role={role} />
    if (activeModule === "Nutrition") return <NutritionModule role={role} onNavigate={handleModuleSelect} />
    if (activeModule === "Assessments") return <AssessmentsModule />
    if (activeModule === "Analytics") return <AnalyticsModule role={role} onNavigate={handleModuleSelect} />

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">{activeModule}</h1>
          <p className="text-sm text-muted-foreground">
            No content is available for this module in the current role view.
          </p>
          <button
            type="button"
            onClick={() => handleModuleSelect(defaultModuleByRole[role])}
            className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A56DB]/90"
          >
            Go to {defaultModuleByRole[role]}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar
        active={activeModule}
        onSelect={handleModuleSelect}
        role={role}
        visibleModules={visibleModules}
        pendingAthleteCount={pendingAthleteCount}
      />
      <TopBar module={activeModule} role={role} onRoleChange={setRole} />

      <main className="ml-60 pt-16">
        {renderModule()}
      </main>

      {/* AI Copilot FAB — hidden for Athlete role */}
      {role !== "Athlete" && (
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#1A56DB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A56DB]/30 transition-all hover:bg-[#1A56DB]/90 hover:shadow-xl"
        >
          <Bot className="h-5 w-5" />
          AI Copilot
        </button>
      )}

      <AiCopilotPanel
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        activeModule={activeModule}
        athletes={athletes}
        injuries={injuries}
        sessions={sessions}
        workloads={workloads}
        hierarchyScope={hierarchyScope}
        contextAthleteId={copilotContextAthleteId}
        onAction={handleCopilotAction}
      />
    </div>
  )
}
