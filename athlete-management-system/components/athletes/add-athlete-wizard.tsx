"use client"

import { useState } from "react"
import { X, Upload, CheckCircle2, ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { OnboardingPayload } from "./data"

const STEPS = [
  { label: "Personal Details", subtitle: "Basic information" },
  { label: "Sport & Squad", subtitle: "Assignment details" },
  { label: "Medical Screening", subtitle: "Health information" },
  { label: "Documents", subtitle: "Required uploads" },
  { label: "Coach & Review", subtitle: "Final confirmation" },
]

const COUNTRIES = [
  "India", "China", "USA", "Australia", "Kenya", "Ethiopia", "Germany", "Japan", "Brazil", "South Africa",
]

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"]
const SPORTS = ["Athletics", "Swimming", "Wrestling", "Badminton", "Boxing", "Weightlifting", "Gymnastics"]
const DISCIPLINES: Record<string, string[]> = {
  Athletics: ["100m Sprint", "200m Sprint", "400m", "Long Jump", "High Jump", "Shot Put", "Marathon"],
  Swimming: ["100m Freestyle", "200m Freestyle", "100m Backstroke", "100m Breaststroke", "100m Butterfly"],
  Wrestling: ["Freestyle 57kg", "Freestyle 65kg", "Freestyle 74kg", "Freestyle 86kg", "Greco-Roman 67kg"],
  Badminton: ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"],
  Boxing: ["48kg", "51kg", "57kg", "60kg", "64kg", "69kg", "75kg"],
  Weightlifting: ["49kg", "55kg", "61kg", "67kg", "73kg", "81kg", "89kg"],
  Gymnastics: ["Artistic", "Rhythmic", "Trampoline"],
}
const SQUADS: Record<string, string[]> = {
  Athletics: ["National Sprint Squad", "Long Jump Squad", "Field Events Squad", "Marathon Squad"],
  Swimming: ["Freestyle Squad", "Backstroke Squad", "Breaststroke Squad", "Butterfly Squad"],
  Wrestling: ["Wrestling Freestyle", "Wrestling Greco-Roman"],
  Badminton: ["Badminton Men", "Badminton Women"],
  Boxing: ["Boxing Squad"],
  Weightlifting: ["Weightlifting Squad"],
  Gymnastics: ["Gymnastics Squad"],
}
const PERF_LEVELS = ["Development", "Junior", "Senior", "Elite"]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const COACHES = [
  "Ravi Kumar", "Anita Das", "Suresh Pillai", "Meera Nair", "Vikram Bose", "Deepa Menon",
]

type UploadedFile = { name: string; size: string }

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

function SelectField({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/30"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

function UploadCard({
  label,
  required,
  file,
  onUpload,
}: {
  label: string
  required?: boolean
  file: UploadedFile | null
  onUpload: (f: UploadedFile) => void
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) onUpload({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` })
  }

  return (
    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-4 py-5 transition-colors hover:border-[#1A56DB]/40 hover:bg-[#EFF6FF]">
      <input type="file" className="sr-only" onChange={handleChange} />
      {file ? (
        <>
          <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
          <span className="text-center text-xs font-medium text-[#15803D]">{file.name}</span>
          <span className="text-xs text-muted-foreground">{file.size}</span>
        </>
      ) : (
        <>
          <Upload className="h-6 w-6 text-slate-400" />
          <span className="text-center text-xs font-medium text-slate-600">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </span>
          <span className="text-xs text-muted-foreground">Click or drag to upload</span>
        </>
      )}
    </label>
  )
}

type ToggleFieldProps = {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  detail: string
  onDetailChange: (v: string) => void
}

function ToggleField({ label, value, onChange, detail, onDetailChange }: ToggleFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex gap-2">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === "Yes")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                (opt === "Yes") === value
                  ? "bg-[#1A56DB] text-white"
                  : "bg-white text-slate-500 hover:bg-slate-100",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      {value && (
        <Input
          placeholder="Provide details..."
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  )
}

/* ─── Main Wizard ─────────────────────────────────────────────────── */
export function AddAthleteWizard({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (payload: OnboardingPayload) => void
}) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  // Step 1
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [nationality, setNationality] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")

  // Step 2
  const [sport, setSport] = useState("")
  const [discipline, setDiscipline] = useState("")
  const [squad, setSquad] = useState("")
  const [perfLevel, setPerfLevel] = useState("")
  const [regNo, setRegNo] = useState("")
  const [stateAssoc, setStateAssoc] = useState("")

  // Step 3
  const [hasConditions, setHasConditions] = useState(false)
  const [conditionsDetail, setConditionsDetail] = useState("")
  const [hasMeds, setHasMeds] = useState(false)
  const [medsDetail, setMedsDetail] = useState("")
  const [hasInjuries, setHasInjuries] = useState(false)
  const [injuriesDetail, setInjuriesDetail] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [physio, setPhysio] = useState("")

  // Step 4
  const [idProof, setIdProof] = useState<UploadedFile | null>(null)
  const [dobCert, setDobCert] = useState<UploadedFile | null>(null)
  const [medFitness, setMedFitness] = useState<UploadedFile | null>(null)
  const [noc, setNoc] = useState<UploadedFile | null>(null)
  const [perfRecords, setPerfRecords] = useState<UploadedFile | null>(null)

  // Step 5
  const [primaryCoach, setPrimaryCoach] = useState("")
  const [assistCoach, setAssistCoach] = useState("")

  function canAdvance() {
    if (step === 0) return firstName && lastName && dob && gender && nationality
    if (step === 1) return sport && discipline && squad
    return true
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    onSubmit({
      firstName,
      lastName,
      dob,
      gender,
      nationality,
      phone,
      email,
      emergencyName,
      emergencyPhone,
      sport,
      discipline,
      squad,
      perfLevel,
      regNo,
      stateAssoc,
      bloodGroup,
      physio,
      primaryCoach,
      assistCoach,
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Add New Athlete</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 border-b border-[#E5E7EB] px-6 py-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    i < step || submitted
                      ? "bg-[#22C55E] text-white"
                      : i === step
                        ? "bg-[#1A56DB] text-white"
                        : "bg-slate-100 text-slate-400",
                  )}
                >
                  {i < step || submitted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] font-medium sm:block",
                    i === step ? "text-[#1A56DB]" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 mb-4 h-0.5 flex-1",
                    i < step ? "bg-[#22C55E]" : "bg-slate-200",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Athlete Profile Created</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {firstName} {lastName}&apos;s profile has been created and is{" "}
              <span className="font-medium text-[#F59E0B]">pending approval</span> from the Federation Admin.
            </p>
            <Button
              className="mt-2 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90"
              onClick={onClose}
            >
              Back to Registry
            </Button>
          </div>
        ) : (
          <>
            {/* Step content */}
            <div className="px-6 py-6">
              <h3 className="mb-0.5 text-base font-semibold text-foreground">
                {STEPS[step].label}
              </h3>
              <p className="mb-5 text-sm text-muted-foreground">{STEPS[step].subtitle}</p>

              {/* STEP 1 */}
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  {/* Photo upload placeholder */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9]">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                      <button type="button" className="text-xs text-[#1A56DB] hover:underline">
                        Upload photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>First Name</FieldLabel>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="text-sm" />
                    </div>
                    <div>
                      <FieldLabel required>Last Name</FieldLabel>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="text-sm" />
                    </div>
                    <div>
                      <FieldLabel required>Date of Birth</FieldLabel>
                      <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="text-sm" />
                    </div>
                    <div>
                      <FieldLabel required>Gender</FieldLabel>
                      <SelectField value={gender} options={GENDERS} onChange={setGender} placeholder="Select gender" />
                    </div>
                    <div>
                      <FieldLabel required>Nationality</FieldLabel>
                      <SelectField value={nationality} options={COUNTRIES} onChange={setNationality} placeholder="Select country" />
                    </div>
                    <div>
                      <FieldLabel>Phone</FieldLabel>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <FieldLabel>Email</FieldLabel>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="athlete@usi.gov.in" className="text-sm" />
                    </div>
                    <div>
                      <FieldLabel>Emergency Contact Name</FieldLabel>
                      <Input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Full name" className="text-sm" />
                    </div>
                    <div>
                      <FieldLabel>Emergency Contact Phone</FieldLabel>
                      <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="+91 98765 43210" className="text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Primary Sport</FieldLabel>
                    <SelectField value={sport} options={SPORTS} onChange={(v) => { setSport(v); setDiscipline(""); setSquad("") }} placeholder="Select sport" />
                  </div>
                  <div>
                    <FieldLabel required>Event / Discipline</FieldLabel>
                    <SelectField
                      value={discipline}
                      options={sport ? DISCIPLINES[sport] ?? [] : []}
                      onChange={setDiscipline}
                      placeholder="Select discipline"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Squad</FieldLabel>
                    <SelectField
                      value={squad}
                      options={sport ? SQUADS[sport] ?? [] : []}
                      onChange={setSquad}
                      placeholder="Select squad"
                    />
                  </div>
                  <div>
                    <FieldLabel>Performance Level</FieldLabel>
                    <SelectField value={perfLevel} options={PERF_LEVELS} onChange={setPerfLevel} placeholder="Select level" />
                  </div>
                  <div>
                    <FieldLabel>National Registration No.</FieldLabel>
                    <Input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="ATH-2024-0001" className="text-sm" />
                  </div>
                  <div>
                    <FieldLabel>State Association</FieldLabel>
                    <Input value={stateAssoc} onChange={(e) => setStateAssoc(e.target.value)} placeholder="e.g. Delhi Athletics Assoc." className="text-sm" />
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <ToggleField
                    label="Any known medical conditions?"
                    value={hasConditions}
                    onChange={setHasConditions}
                    detail={conditionsDetail}
                    onDetailChange={setConditionsDetail}
                  />
                  <ToggleField
                    label="Currently on any medications?"
                    value={hasMeds}
                    onChange={setHasMeds}
                    detail={medsDetail}
                    onDetailChange={setMedsDetail}
                  />
                  <ToggleField
                    label="Significant injuries in last 2 years?"
                    value={hasInjuries}
                    onChange={setHasInjuries}
                    detail={injuriesDetail}
                    onDetailChange={setInjuriesDetail}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Blood Group</FieldLabel>
                      <SelectField value={bloodGroup} options={BLOOD_GROUPS} onChange={setBloodGroup} placeholder="Select blood group" />
                    </div>
                    <div>
                      <FieldLabel>Primary Physiotherapist</FieldLabel>
                      <SelectField value={physio} options={COACHES} onChange={setPhysio} placeholder="Assign physio" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <UploadCard label="ID Proof (Aadhaar / Passport)" required file={idProof} onUpload={setIdProof} />
                  <UploadCard label="Date of Birth Certificate" required file={dobCert} onUpload={setDobCert} />
                  <UploadCard label="Medical Fitness Certificate" required file={medFitness} onUpload={setMedFitness} />
                  <UploadCard label="NOC from State Association" file={noc} onUpload={setNoc} />
                  <UploadCard label="Previous Performance Records (Optional)" file={perfRecords} onUpload={setPerfRecords} />
                </div>
              )}

              {/* STEP 5 */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Primary Coach</FieldLabel>
                      <SelectField value={primaryCoach} options={COACHES} onChange={setPrimaryCoach} placeholder="Select coach" />
                    </div>
                    <div>
                      <FieldLabel>Assistant Coach (optional)</FieldLabel>
                      <SelectField value={assistCoach} options={COACHES} onChange={setAssistCoach} placeholder="Select coach" />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Summary</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      {[
                        ["Full Name", `${firstName} ${lastName}`],
                        ["Date of Birth", dob || "—"],
                        ["Gender", gender || "—"],
                        ["Nationality", nationality || "—"],
                        ["Phone", phone || "—"],
                        ["Email", email || "—"],
                        ["Sport", sport || "—"],
                        ["Discipline", discipline || "—"],
                        ["Squad", squad || "—"],
                        ["Performance Level", perfLevel || "—"],
                        ["Reg. No.", regNo || "—"],
                        ["Blood Group", bloodGroup || "—"],
                        ["Primary Coach", primaryCoach || "—"],
                        ["Physio", physio || "—"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </span>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canAdvance()}
                className="gap-1 bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90 disabled:opacity-40"
              >
                {step === STEPS.length - 1 ? "Confirm & Submit" : "Next"}
                {step < STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
