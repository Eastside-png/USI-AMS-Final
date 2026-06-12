export type RegionStatus = "healthy" | "monitoring" | "active"
export type BodyView = "front" | "back"
export type InjuryStatus = "Active" | "Improving" | "Resolved"
export type RtpApprovalStatus = "Pending" | "Approved" | "Further Review"

export type RegionId =
  | "head"
  | "leftShoulder"
  | "rightShoulder"
  | "chest"
  | "abdomen"
  | "leftHip"
  | "rightHip"
  | "leftQuad"
  | "rightQuad"
  | "leftHamstring"
  | "rightHamstring"
  | "leftKnee"
  | "rightKnee"
  | "leftCalf"
  | "rightCalf"
  | "leftAnkle"
  | "rightAnkle"
  | "upperBack"
  | "lowerBack"
  | "leftGlute"
  | "rightGlute"
  | "leftShoulderBlade"
  | "rightShoulderBlade"

export type InjuryNote = {
  id: string
  text: string
  timestamp: string
  author: string
}

export type InjuryEvent = {
  id: string
  type:
    | "Injury Created"
    | "Rehab Started"
    | "Rehab Phase Progressed"
    | "RTP Approved"
    | "Note Added"
    | "Status Updated"
    | "RTP Requested"
    | "Further Review Requested"
  timestamp: string
  author: string
  description: string
}

export type PersistedInjury = {
  id: string
  athleteId: string
  bodyRegion: RegionId
  view: BodyView
  injuryType: string
  severity: "Mild" | "Moderate" | "Severe"
  dateOfOnset: string
  mechanism: string
  treatingPhysio: string
  status: InjuryStatus
  rehabPhase: number
  phaseCriteria: Record<number, Record<string, boolean>>
  notes: InjuryNote[]
  timeline: InjuryEvent[]
  rtpApprovalStatus?: RtpApprovalStatus
}

export type InjuryFormPayload = {
  bodyRegion: RegionId
  view: BodyView
  injuryType: string
  severity: "Mild" | "Moderate" | "Severe"
  dateOfOnset: string
  mechanism: string
  treatingPhysio: string
  notes: string[]
}

export type InjuryRecord = {
  type: string
  dateOfOnset: string
  mechanism: string
  severity: "Mild" | "Moderate" | "Severe"
  physio: string
  phase: string
  phaseNumber: number
  phaseTotal: number
}

export type Athlete = {
  id: string
  name: string
  sport: string
  status: RegionStatus
  regions: Partial<Record<RegionId, RegionStatus>>
  injuries: Partial<Record<RegionId, InjuryRecord>>
}

// Region display labels keyed by region id
export const REGION_LABELS: Record<RegionId, string> = {
  head: "Head / Neck",
  leftShoulder: "Left Shoulder",
  rightShoulder: "Right Shoulder",
  chest: "Chest",
  abdomen: "Abdomen",
  leftHip: "Left Hip",
  rightHip: "Right Hip",
  leftQuad: "Left Quad",
  rightQuad: "Right Quad",
  leftHamstring: "Left Hamstring",
  rightHamstring: "Right Hamstring",
  leftKnee: "Left Knee",
  rightKnee: "Right Knee",
  leftCalf: "Left Calf",
  rightCalf: "Right Calf",
  leftAnkle: "Left Ankle",
  rightAnkle: "Right Ankle",
  upperBack: "Upper Back",
  lowerBack: "Lower Back",
  leftGlute: "Left Glute",
  rightGlute: "Right Glute",
  leftShoulderBlade: "Left Shoulder Blade",
  rightShoulderBlade: "Right Shoulder Blade",
}

export const STATUS_LABELS: Record<RegionStatus, string> = {
  healthy: "Healthy",
  monitoring: "Monitoring",
  active: "Active Injury",
}

export const REHAB_PHASES = [
  "Acute Management",
  "Sub-Acute",
  "Rehabilitation",
  "Return to Training",
  "Return to Play",
] as const

export const PHASE_CRITERIA: Record<number, string[]> = {
  1: ["Pain at rest below 3/10", "Swelling controlled", "Protected ROM completed"],
  2: ["Pain-free active ROM", "Low-load strength tolerated", "Walking gait normalized"],
  3: ["Strength above 80% of unaffected side", "Pain below 2/10 during drills", "Full ROM restored"],
  4: ["Modified training tolerated", "No compensation pattern", "Coach confirms training readiness"],
  5: ["Max-speed test asymptomatic", "Functional screen passed", "Team doctor sign-off complete"],
}

function makeCriteria(completeThrough = 0): Record<number, Record<string, boolean>> {
  return Object.fromEntries(
    Object.entries(PHASE_CRITERIA).map(([phase, criteria]) => [
      Number(phase),
      Object.fromEntries(criteria.map((criterion) => [criterion, Number(phase) <= completeThrough])),
    ]),
  ) as Record<number, Record<string, boolean>>
}

function iso(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

export const INITIAL_INJURIES: PersistedInjury[] = [
  {
    id: "inj-marcus-left-hamstring",
    athleteId: "marcus-chen",
    bodyRegion: "leftHamstring",
    view: "back",
    injuryType: "Grade II Hamstring Strain",
    severity: "Moderate",
    dateOfOnset: "2025-05-28",
    mechanism: "Sprinting - sudden acceleration",
    treatingPhysio: "Dr. Meera Nair",
    status: "Active",
    rehabPhase: 3,
    phaseCriteria: makeCriteria(2),
    notes: [
      {
        id: "note-marcus-1",
        text: "Pain-free ROM achieved. Continue eccentric loading before sprint exposure.",
        timestamp: iso(2),
        author: "Dr. Meera Nair",
      },
    ],
    timeline: [
      {
        id: "evt-marcus-1",
        type: "Injury Created",
        timestamp: iso(14),
        author: "Dr. Meera Nair",
        description: "Grade II hamstring strain report created.",
      },
      {
        id: "evt-marcus-2",
        type: "Rehab Started",
        timestamp: iso(12),
        author: "Dr. Meera Nair",
        description: "Phase 1 acute management initiated.",
      },
      {
        id: "evt-marcus-3",
        type: "Rehab Phase Progressed",
        timestamp: iso(5),
        author: "Dr. Meera Nair",
        description: "Advanced to Phase 3 - Rehabilitation.",
      },
    ],
  },
  {
    id: "inj-marcus-right-knee",
    athleteId: "marcus-chen",
    bodyRegion: "rightKnee",
    view: "front",
    injuryType: "Patellar Tendinopathy",
    severity: "Mild",
    dateOfOnset: "2025-06-12",
    mechanism: "Overuse - repetitive loading",
    treatingPhysio: "Dr. Meera Nair",
    status: "Improving",
    rehabPhase: 2,
    phaseCriteria: makeCriteria(1),
    notes: [],
    timeline: [
      {
        id: "evt-knee-1",
        type: "Injury Created",
        timestamp: iso(7),
        author: "Dr. Meera Nair",
        description: "Patellar tendinopathy monitoring plan created.",
      },
      {
        id: "evt-knee-2",
        type: "Rehab Started",
        timestamp: iso(6),
        author: "Dr. Meera Nair",
        description: "Load-management protocol started.",
      },
    ],
  },
  {
    id: "inj-leo-lower-back",
    athleteId: "leo-fernandez",
    bodyRegion: "lowerBack",
    view: "back",
    injuryType: "Lumbar Strain",
    severity: "Moderate",
    dateOfOnset: "2025-06-01",
    mechanism: "Non-contact - heavy lifting",
    treatingPhysio: "Dr. James Whitfield",
    status: "Improving",
    rehabPhase: 2,
    phaseCriteria: makeCriteria(1),
    notes: [],
    timeline: [
      {
        id: "evt-leo-back-1",
        type: "Injury Created",
        timestamp: iso(11),
        author: "Dr. James Whitfield",
        description: "Lumbar strain report created for lower back.",
      },
      {
        id: "evt-leo-back-2",
        type: "Rehab Started",
        timestamp: iso(10),
        author: "Dr. James Whitfield",
        description: "Phase 1 acute management initiated.",
      },
    ],
  },
  {
    id: "inj-priya-left-knee",
    athleteId: "priya-sharma",
    bodyRegion: "leftKnee",
    view: "front",
    injuryType: "IT Band Syndrome",
    severity: "Moderate",
    dateOfOnset: "2025-05-15",
    mechanism: "Overuse - high mileage loading",
    treatingPhysio: "Dr. Meera Nair",
    status: "Active",
    rehabPhase: 3,
    phaseCriteria: makeCriteria(2),
    notes: [],
    timeline: [
      {
        id: "evt-priya-1",
        type: "Injury Created",
        timestamp: iso(18),
        author: "Dr. Meera Nair",
        description: "IT Band Syndrome injury report created.",
      },
      {
        id: "evt-priya-2",
        type: "Rehab Started",
        timestamp: iso(17),
        author: "Dr. Meera Nair",
        description: "Rehab plan started.",
      },
    ],
  },
]

export function injuryRegionStatus(injury: PersistedInjury): RegionStatus {
  if (injury.status === "Resolved") return "healthy"
  if (injury.status === "Improving") return "monitoring"
  return "active"
}

export function getInjuriesByAthleteId(
  injuries: PersistedInjury[],
  athleteId: string,
): PersistedInjury[] {
  return injuries.filter((injury) => injury.athleteId === athleteId)
}

export function deriveRegionStatuses(
  injuries: PersistedInjury[],
  athleteId: string,
  view?: BodyView,
): Partial<Record<RegionId, RegionStatus>> {
  const statuses: Partial<Record<RegionId, RegionStatus>> = {}
  for (const injury of injuries) {
    if (injury.athleteId !== athleteId) continue
    if (view && injury.view !== view) continue
    const status = injuryRegionStatus(injury)
    if (status === "healthy") continue
    const previous = statuses[injury.bodyRegion]
    if (previous === "active") continue
    statuses[injury.bodyRegion] = status === "active" || previous !== "monitoring" ? status : previous
  }
  return statuses
}

export const ATHLETES: Athlete[] = [
  {
    id: "marcus-chen",
    name: "Marcus Chen",
    sport: "Track & Field — Sprints",
    status: "active",
    regions: {
      leftHamstring: "active",
      rightKnee: "monitoring",
    },
    injuries: {
      leftHamstring: {
        type: "Grade II Hamstring Strain",
        dateOfOnset: "28 May 2025",
        mechanism: "Sprinting — sudden acceleration",
        severity: "Moderate",
        physio: "Dr. Meera Nair",
        phase: "Rehabilitation",
        phaseNumber: 3,
        phaseTotal: 5,
      },
      rightKnee: {
        type: "Patellar Tendinopathy",
        dateOfOnset: "12 Jun 2025",
        mechanism: "Overuse — repetitive loading",
        severity: "Mild",
        physio: "Dr. Meera Nair",
        phase: "Monitoring",
        phaseNumber: 1,
        phaseTotal: 5,
      },
    },
  },
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    sport: "Swimming — Freestyle",
    status: "monitoring",
    regions: {
      rightShoulder: "monitoring",
    },
    injuries: {
      rightShoulder: {
        type: "Rotator Cuff Tendinitis",
        dateOfOnset: "02 Jun 2025",
        mechanism: "Overuse — repetitive stroke load",
        severity: "Mild",
        physio: "Dr. James Whitfield",
        phase: "Monitoring",
        phaseNumber: 2,
        phaseTotal: 5,
      },
    },
  },
  {
    id: "leo-fernandez",
    name: "Leo Fernandez",
    sport: "Football — Midfielder",
    status: "active",
    regions: {
      rightAnkle: "active",
      leftCalf: "monitoring",
    },
    injuries: {
      rightAnkle: {
        type: "Lateral Ankle Sprain (Grade II)",
        dateOfOnset: "20 May 2025",
        mechanism: "Inversion — landing from jump",
        severity: "Moderate",
        physio: "Dr. Meera Nair",
        phase: "Rehabilitation",
        phaseNumber: 4,
        phaseTotal: 5,
      },
      leftCalf: {
        type: "Calf Tightness",
        dateOfOnset: "08 Jun 2025",
        mechanism: "Fatigue — compensation pattern",
        severity: "Mild",
        physio: "Dr. Meera Nair",
        phase: "Monitoring",
        phaseNumber: 1,
        phaseTotal: 5,
      },
    },
  },
  {
    id: "sofia-rossi",
    name: "Sofia Rossi",
    sport: "Gymnastics — All-Around",
    status: "healthy",
    regions: {},
    injuries: {},
  },
  {
    id: "daniel-kim",
    name: "Daniel Kim",
    sport: "Rowing — Single Scull",
    status: "monitoring",
    regions: {
      abdomen: "monitoring",
    },
    injuries: {
      abdomen: {
        type: "Lower Back Strain",
        dateOfOnset: "30 May 2025",
        mechanism: "Repetitive flexion — catch phase",
        severity: "Mild",
        physio: "Dr. James Whitfield",
        phase: "Monitoring",
        phaseNumber: 2,
        phaseTotal: 5,
      },
    },
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    sport: "Track & Field — Distance",
    status: "active",
    regions: {
      leftKnee: "active",
    },
    injuries: {
      leftKnee: {
        type: "IT Band Syndrome",
        dateOfOnset: "15 May 2025",
        mechanism: "Overuse — high mileage loading",
        severity: "Moderate",
        physio: "Dr. Meera Nair",
        phase: "Rehabilitation",
        phaseNumber: 3,
        phaseTotal: 5,
      },
    },
  },
]
