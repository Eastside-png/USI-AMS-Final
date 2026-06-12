"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BodyMap } from "./body-map"
import type { Athlete, BodyView, InjuryFormPayload, RegionId, RegionStatus } from "./data"
import { REGION_LABELS } from "./data"

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "Mild" | "Moderate" | "Severe"
type WeightBearing = "Full" | "Partial" | "Non-weight bearing"
type RangeOfMotion = "Full" | "Partial" | "Minimal" | "None"

interface FormData {
  // Step 1
  region: RegionId | null
  view: BodyView
  // Step 2
  injuryType: string
  severity: Severity | ""
  dateOfOnset: string
  mechanism: string
  description: string
  // Step 3
  painScore: number
  rangeOfMotion: RangeOfMotion | ""
  weightBearing: WeightBearing | ""
  assessmentNotes: string
  // Step 4
  physio: string
  protocol: string
  estimatedRecovery: string
  notifyCoach: boolean
}

function today(): string {
  return new Date().toISOString().split("T")[0]
}

const STEP_TITLES = [
  "Select Body Region",
  "Injury Details",
  "Clinical Assessment",
  "Assign & Protocol",
  "Confirmation",
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressIndicator({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex items-center gap-0 px-2">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1
        const isComplete = stepNum < current
        const isActive = stepNum === current
        return (
          <div key={stepNum} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isComplete
                  ? "bg-[#1A56DB] text-white"
                  : isActive
                    ? "border-2 border-[#1A56DB] bg-white text-[#1A56DB]"
                    : "bg-[#F3F4F6] text-[#9CA3AF]"
              }`}
            >
              {isComplete ? <Check className="h-4 w-4" /> : stepNum}
            </div>
            {i < total - 1 && (
              <div
                className={`h-0.5 w-10 sm:w-16 transition-colors ${
                  stepNum < current ? "bg-[#1A56DB]" : "bg-[#E5E7EB]"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  )
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            value === o
              ? "border-[#1A56DB] bg-[#1A56DB]/10 text-[#1A56DB]"
              : "border-[#E5E7EB] bg-white text-muted-foreground hover:border-[#1A56DB]/40"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="min-w-[140px] text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

// ─── Step panels ─────────────────────────────────────────────────────────────

function Step1({
  form,
  athleteRegions,
  setForm,
}: {
  form: FormData
  athleteRegions: Partial<Record<RegionId, RegionStatus>>
  setForm: (f: Partial<FormData>) => void
}) {
  // We need a minimal regions map just for display — don't apply athlete statuses
  const displayRegions: Partial<Record<RegionId, RegionStatus>> = {
    ...athleteRegions,
    ...(form.region ? { [form.region]: "active" } : {}),
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Click the affected region on the body map
      </p>
      <div className="flex rounded-lg border border-[#E5E7EB] bg-white p-1">
        {(["front", "back"] as BodyView[]).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setForm({ view, region: null })}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              form.view === view
                ? "bg-[#1A56DB] text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view === "front" ? "Anterior" : "Posterior"}
          </button>
        ))}
      </div>
      <div className="w-full max-w-[260px]">
        <BodyMap
          regions={displayRegions}
          selected={form.region}
          onSelect={(r) => setForm({ region: r })}
          view={form.view}
        />
      </div>
      {form.region && (
        <Badge
          variant="outline"
          className="border-[#1A56DB]/20 bg-[#1A56DB]/10 text-sm font-medium text-[#1A56DB]"
        >
          {REGION_LABELS[form.region]} - {form.view}
        </Badge>
      )}
    </div>
  )
}

function Step2({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: Partial<FormData>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Injury Type</FieldLabel>
        <Select
          value={form.injuryType}
          onChange={(v) => setForm({ injuryType: v })}
          placeholder="Select injury type"
          options={[
            { value: "Strain", label: "Strain" },
            { value: "Sprain", label: "Sprain" },
            { value: "Contusion", label: "Contusion" },
            { value: "Fracture", label: "Fracture" },
            { value: "Tendinopathy", label: "Tendinopathy" },
            { value: "Ligament Tear", label: "Ligament Tear" },
            { value: "Overuse", label: "Overuse" },
            { value: "Other", label: "Other" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Severity</FieldLabel>
        <RadioGroup
          value={form.severity}
          onChange={(v) => setForm({ severity: v as Severity })}
          options={["Mild", "Moderate", "Severe"]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Date of Onset</FieldLabel>
        <input
          type="date"
          value={form.dateOfOnset}
          max={today()}
          onChange={(e) => setForm({ dateOfOnset: e.target.value })}
          className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Mechanism</FieldLabel>
        <Select
          value={form.mechanism}
          onChange={(v) => setForm({ mechanism: v })}
          placeholder="Select mechanism"
          options={[
            { value: "Contact", label: "Contact" },
            { value: "Non-contact", label: "Non-contact" },
            { value: "Overuse", label: "Overuse" },
            { value: "Unknown", label: "Unknown" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ description: e.target.value })}
          placeholder="Describe how the injury occurred..."
          rows={3}
          className="w-full resize-none rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
        />
      </div>
    </div>
  )
}

function Step3({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: Partial<FormData>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Pain Score</FieldLabel>
          <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-sm font-semibold text-foreground">
            {form.painScore} / 10
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={form.painScore}
          onChange={(e) => setForm({ painScore: Number(e.target.value) })}
          className="w-full accent-[#1A56DB]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>No pain (0)</span>
          <span>Worst pain (10)</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Range of Motion</FieldLabel>
        <Select
          value={form.rangeOfMotion}
          onChange={(v) => setForm({ rangeOfMotion: v as RangeOfMotion })}
          placeholder="Select range of motion"
          options={[
            { value: "Full", label: "Full" },
            { value: "Partial", label: "Partial" },
            { value: "Minimal", label: "Minimal" },
            { value: "None", label: "None" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Weight Bearing</FieldLabel>
        <RadioGroup
          value={form.weightBearing}
          onChange={(v) => setForm({ weightBearing: v as WeightBearing })}
          options={["Full", "Partial", "Non-weight bearing"]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Initial Assessment Notes</FieldLabel>
        <textarea
          value={form.assessmentNotes}
          onChange={(e) => setForm({ assessmentNotes: e.target.value })}
          placeholder="Enter initial assessment notes..."
          rows={3}
          className="w-full resize-none rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#1A56DB] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
        />
      </div>
    </div>
  )
}

function Step4({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: Partial<FormData>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Assigning Physio</FieldLabel>
        <Select
          value={form.physio}
          onChange={(v) => setForm({ physio: v })}
          placeholder="Select physio"
          options={[
            { value: "Dr. Meera Nair", label: "Dr. Meera Nair" },
            { value: "Dr. Rajesh Verma", label: "Dr. Rajesh Verma" },
            { value: "Dr. Sunita Rao", label: "Dr. Sunita Rao" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Initial Protocol</FieldLabel>
        <Select
          value={form.protocol}
          onChange={(v) => setForm({ protocol: v })}
          placeholder="Select protocol"
          options={[
            { value: "RICE Protocol", label: "RICE Protocol" },
            { value: "Physiotherapy", label: "Physiotherapy" },
            { value: "Medical Review", label: "Medical Review" },
            { value: "Surgery Referral", label: "Surgery Referral" },
            { value: "Monitoring Only", label: "Monitoring Only" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Estimated Recovery</FieldLabel>
        <Select
          value={form.estimatedRecovery}
          onChange={(v) => setForm({ estimatedRecovery: v })}
          placeholder="Select estimated recovery time"
          options={[
            { value: "1-3 days", label: "1-3 days" },
            { value: "1-2 weeks", label: "1-2 weeks" },
            { value: "2-4 weeks", label: "2-4 weeks" },
            { value: "4-8 weeks", label: "4-8 weeks" },
            { value: "8+ weeks", label: "8+ weeks" },
          ]}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.notifyCoach}
          onChange={(e) => setForm({ notifyCoach: e.target.checked })}
          className="h-4 w-4 rounded border-[#E5E7EB] accent-[#1A56DB]"
        />
        <span className="text-sm font-medium text-foreground">
          Notify Coach
        </span>
      </label>
    </div>
  )
}

function Step5({
  form,
  athlete,
}: {
  form: FormData
  athlete: Athlete
}) {
  const regionLabel = form.region ? REGION_LABELS[form.region] : "—"
  const dateLabel = form.dateOfOnset
    ? new Date(form.dateOfOnset + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 p-4">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
        <p className="text-sm text-foreground">
          Please review the details below before submitting the injury report for{" "}
          <span className="font-semibold">{athlete.name}</span>.
        </p>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Injury
        </p>
        <div className="divide-y divide-[#E5E7EB]">
          <SummaryRow label="Body Region" value={regionLabel} />
          <SummaryRow label="Injury Type" value={form.injuryType || "—"} />
          <SummaryRow label="Severity" value={form.severity || "—"} />
          <SummaryRow label="Date of Onset" value={dateLabel} />
          <SummaryRow label="Mechanism" value={form.mechanism || "—"} />
          {form.description && (
            <SummaryRow label="Description" value={form.description} />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Clinical Assessment
        </p>
        <div className="divide-y divide-[#E5E7EB]">
          <SummaryRow label="Pain Score" value={`${form.painScore} / 10`} />
          <SummaryRow
            label="Range of Motion"
            value={form.rangeOfMotion || "—"}
          />
          <SummaryRow label="Weight Bearing" value={form.weightBearing || "—"} />
        </div>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Assignment
        </p>
        <div className="divide-y divide-[#E5E7EB]">
          <SummaryRow label="Physio" value={form.physio || "—"} />
          <SummaryRow label="Protocol" value={form.protocol || "—"} />
          <SummaryRow
            label="Est. Recovery"
            value={form.estimatedRecovery || "—"}
          />
          <SummaryRow
            label="Notify Coach"
            value={form.notifyCoach ? "Yes" : "No"}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step validation ──────────────────────────────────────────────────────────

function isStepValid(step: number, form: FormData): boolean {
  switch (step) {
    case 1:
      return form.region !== null
    case 2:
      return !!(form.injuryType && form.severity && form.dateOfOnset && form.mechanism)
    case 3:
      return !!(form.rangeOfMotion && form.weightBearing)
    case 4:
      return !!(form.physio && form.protocol && form.estimatedRecovery)
    case 5:
      return true
    default:
      return false
  }
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  athlete: Athlete
  onClose: () => void
  onSubmit: (payload: InjuryFormPayload) => void
}

export function ReportInjuryModal({ open, athlete, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1)
  const [form, setFormState] = useState<FormData>({
    region: null,
    view: "front",
    injuryType: "",
    severity: "",
    dateOfOnset: today(),
    mechanism: "",
    description: "",
    painScore: 5,
    rangeOfMotion: "",
    weightBearing: "",
    assessmentNotes: "",
    physio: "",
    protocol: "",
    estimatedRecovery: "",
    notifyCoach: true,
  })
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1)
      setFormState({
        region: null,
        view: "front",
        injuryType: "",
        severity: "",
        dateOfOnset: today(),
        mechanism: "",
        description: "",
        painScore: 5,
        rangeOfMotion: "",
        weightBearing: "",
        assessmentNotes: "",
        physio: "",
        protocol: "",
        estimatedRecovery: "",
        notifyCoach: true,
      })
    }
  }, [open])

  function setForm(partial: Partial<FormData>) {
    setFormState((prev) => ({ ...prev, ...partial }))
  }

  function handleNext() {
    if (step < 5) setStep((s) => s + 1)
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  function handleSubmit() {
    if (form.region) {
      onSubmit({
        bodyRegion: form.region,
        view: form.view,
        injuryType: form.injuryType,
        severity: form.severity || "Mild",
        dateOfOnset: form.dateOfOnset,
        mechanism: form.mechanism,
        treatingPhysio: form.physio,
        notes: [form.description, form.assessmentNotes].filter(Boolean),
      })
      onClose()
    }
  }

  if (!open) return null

  const canAdvance = isStepValid(step, form)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[#E5E7EB] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">
              Report New Injury
            </h2>
            <p className="text-xs text-muted-foreground">
              {athlete.name} — Step {step} of 5: {STEP_TITLES[step - 1]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#F3F4F6] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center border-b border-[#E5E7EB] px-5 py-4">
          <ProgressIndicator current={step} total={5} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <Step1
              form={form}
              athleteRegions={athlete.regions}
              setForm={setForm}
            />
          )}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && <Step4 form={form} setForm={setForm} />}
          {step === 5 && <Step5 form={form} athlete={athlete} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={step === 1 ? onClose : handleBack}
            className="gap-1.5"
          >
            {step === 1 ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Back
              </>
            )}
          </Button>

          {step < 5 ? (
            <Button
              size="sm"
              disabled={!canAdvance}
              onClick={handleNext}
              className="gap-1.5 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(4)}
              >
                Back to Edit
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="gap-1.5 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
              >
                <Check className="h-4 w-4" />
                Confirm &amp; Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
