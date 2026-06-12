export type AthleteStatus = "Active" | "Injured" | "Monitoring" | "Pending" | "Suspended" | "Rejected"

export type Athlete = {
  id: string
  firstName: string
  lastName: string
  sport: string
  discipline: string
  squad: string
  status: AthleteStatus
  readiness: number | null
  coach: string
  assistCoach?: string
  lastActive: string
  age: number
  height: string
  weight: string
  nationality: string
  bloodGroup: string
  phone: string
  email: string
  emergencyContact: string
  nationalRegNo: string
  stateAssociation: string
  performanceLevel: string
  enrolledDate: string
  initials: string
  avatarColor: string
  gender?: string
  dateOfBirth?: string
  rejectionReason?: string
  attendanceRate?: number | null
}

export type OnboardingPayload = {
  firstName: string
  lastName: string
  dob: string
  gender: string
  nationality: string
  phone: string
  email: string
  emergencyName: string
  emergencyPhone: string
  sport: string
  discipline: string
  squad: string
  perfLevel: string
  regNo: string
  stateAssoc: string
  bloodGroup: string
  physio: string
  primaryCoach: string
  assistCoach: string
}

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#06B6D4", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#6B7280"]

function calcAge(dob: string): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function createAthleteFromOnboarding(payload: OnboardingPayload): Athlete {
  const id = `${payload.firstName}-${payload.lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + `-${Date.now()}`
  const initials = `${payload.firstName[0] ?? ""}${payload.lastName[0] ?? ""}`.toUpperCase()
  return {
    id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    sport: payload.sport,
    discipline: payload.discipline,
    squad: payload.squad,
    status: "Pending",
    readiness: null,
    coach: payload.primaryCoach || "Unassigned",
    assistCoach: payload.assistCoach || undefined,
    lastActive: "Never",
    age: calcAge(payload.dob),
    height: "—",
    weight: "—",
    nationality: payload.nationality,
    bloodGroup: payload.bloodGroup || "—",
    phone: payload.phone || "—",
    email: payload.email || "—",
    emergencyContact: payload.emergencyName
      ? `${payload.emergencyName}${payload.emergencyPhone ? ` — ${payload.emergencyPhone}` : ""}`
      : "—",
    nationalRegNo: payload.regNo || "Pending",
    stateAssociation: payload.stateAssoc || "—",
    performanceLevel: payload.perfLevel || "Development",
    enrolledDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    initials,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    gender: payload.gender,
    dateOfBirth: payload.dob,
  }
}

export const INITIAL_ATHLETES: Athlete[] = [
  {
    id: "marcus-chen",
    firstName: "Marcus",
    lastName: "Chen",
    sport: "Athletics",
    discipline: "100m Sprint",
    squad: "National Sprint Squad",
    status: "Injured",
    readiness: 71,
    coach: "Ravi Kumar",
    lastActive: "Today",
    age: 24,
    height: "180 cm",
    weight: "74 kg",
    nationality: "India",
    bloodGroup: "O+",
    phone: "+91 98765 43210",
    email: "marcus.chen@usi.gov.in",
    emergencyContact: "Chen Wei — +91 98765 00001",
    nationalRegNo: "ATH-2021-0041",
    stateAssociation: "Delhi Athletics Association",
    performanceLevel: "Elite",
    enrolledDate: "12 Mar 2021",
    initials: "MC",
    avatarColor: "#3B82F6",
  },
  {
    id: "priya-sharma",
    firstName: "Priya",
    lastName: "Sharma",
    sport: "Athletics",
    discipline: "100m Sprint",
    squad: "National Sprint Squad",
    status: "Active",
    readiness: 92,
    coach: "Ravi Kumar",
    lastActive: "Today",
    age: 22,
    height: "163 cm",
    weight: "57 kg",
    nationality: "India",
    bloodGroup: "A+",
    phone: "+91 98765 43211",
    email: "priya.sharma@usi.gov.in",
    emergencyContact: "Ramesh Sharma — +91 98765 00002",
    nationalRegNo: "ATH-2022-0018",
    stateAssociation: "Maharashtra Athletics Association",
    performanceLevel: "Elite",
    enrolledDate: "5 Jun 2022",
    initials: "PS",
    avatarColor: "#10B981",
  },
  {
    id: "arjun-singh",
    firstName: "Arjun",
    lastName: "Singh",
    sport: "Swimming",
    discipline: "100m Freestyle",
    squad: "Freestyle Squad",
    status: "Active",
    readiness: 84,
    coach: "Anita Das",
    lastActive: "Yesterday",
    age: 23,
    height: "185 cm",
    weight: "80 kg",
    nationality: "India",
    bloodGroup: "B+",
    phone: "+91 98765 43212",
    email: "arjun.singh@usi.gov.in",
    emergencyContact: "Harpreet Singh — +91 98765 00003",
    nationalRegNo: "SWM-2020-0027",
    stateAssociation: "Punjab Swimming Federation",
    performanceLevel: "Senior",
    enrolledDate: "19 Jan 2020",
    initials: "AS",
    avatarColor: "#06B6D4",
  },
  {
    id: "kavya-reddy",
    firstName: "Kavya",
    lastName: "Reddy",
    sport: "Athletics",
    discipline: "Long Jump",
    squad: "Long Jump Squad",
    status: "Monitoring",
    readiness: 68,
    coach: "Ravi Kumar",
    lastActive: "Today",
    age: 21,
    height: "165 cm",
    weight: "59 kg",
    nationality: "India",
    bloodGroup: "AB+",
    phone: "+91 98765 43213",
    email: "kavya.reddy@usi.gov.in",
    emergencyContact: "Suresh Reddy — +91 98765 00004",
    nationalRegNo: "ATH-2023-0009",
    stateAssociation: "Telangana Athletics Association",
    performanceLevel: "Junior",
    enrolledDate: "8 Aug 2023",
    initials: "KR",
    avatarColor: "#F59E0B",
  },
  {
    id: "rohit-kumar",
    firstName: "Rohit",
    lastName: "Kumar",
    sport: "Swimming",
    discipline: "100m Backstroke",
    squad: "Backstroke Squad",
    status: "Active",
    readiness: 88,
    coach: "Anita Das",
    lastActive: "2 days ago",
    age: 25,
    height: "182 cm",
    weight: "78 kg",
    nationality: "India",
    bloodGroup: "O-",
    phone: "+91 98765 43214",
    email: "rohit.kumar@usi.gov.in",
    emergencyContact: "Sunita Kumar — +91 98765 00005",
    nationalRegNo: "SWM-2019-0014",
    stateAssociation: "UP Aquatics Association",
    performanceLevel: "Senior",
    enrolledDate: "3 Feb 2019",
    initials: "RK",
    avatarColor: "#8B5CF6",
  },
  {
    id: "aisha-patel",
    firstName: "Aisha",
    lastName: "Patel",
    sport: "Athletics",
    discipline: "100m Sprint",
    squad: "National Sprint Squad",
    status: "Active",
    readiness: 95,
    coach: "Ravi Kumar",
    lastActive: "Today",
    age: 20,
    height: "160 cm",
    weight: "54 kg",
    nationality: "India",
    bloodGroup: "A-",
    phone: "+91 98765 43215",
    email: "aisha.patel@usi.gov.in",
    emergencyContact: "Ibrahim Patel — +91 98765 00006",
    nationalRegNo: "ATH-2024-0003",
    stateAssociation: "Gujarat Athletics Association",
    performanceLevel: "Junior",
    enrolledDate: "14 Jan 2024",
    initials: "AP",
    avatarColor: "#EC4899",
  },
  {
    id: "vikram-nair",
    firstName: "Vikram",
    lastName: "Nair",
    sport: "Wrestling",
    discipline: "Freestyle 74kg",
    squad: "Wrestling Freestyle",
    status: "Pending",
    readiness: null,
    coach: "Unassigned",
    lastActive: "Never",
    age: 19,
    height: "174 cm",
    weight: "74 kg",
    nationality: "India",
    bloodGroup: "B-",
    phone: "+91 98765 43216",
    email: "vikram.nair@usi.gov.in",
    emergencyContact: "Krishnan Nair — +91 98765 00007",
    nationalRegNo: "WRS-2024-0021",
    stateAssociation: "Kerala Wrestling Association",
    performanceLevel: "Development",
    enrolledDate: "Pending",
    initials: "VN",
    avatarColor: "#6B7280",
  },
  {
    id: "sanya-mehta",
    firstName: "Sanya",
    lastName: "Mehta",
    sport: "Badminton",
    discipline: "Women's Singles",
    squad: "Badminton Women",
    status: "Active",
    readiness: 79,
    coach: "Suresh Pillai",
    lastActive: "Today",
    age: 23,
    height: "167 cm",
    weight: "62 kg",
    nationality: "India",
    bloodGroup: "O+",
    phone: "+91 98765 43217",
    email: "sanya.mehta@usi.gov.in",
    emergencyContact: "Pradeep Mehta — +91 98765 00008",
    nationalRegNo: "BAD-2021-0033",
    stateAssociation: "Rajasthan Badminton Association",
    performanceLevel: "Senior",
    enrolledDate: "22 Sep 2021",
    initials: "SM",
    avatarColor: "#14B8A6",
  },
]

export const ATHLETES = INITIAL_ATHLETES

export const STATUS_CONFIG: Record<
  AthleteStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  Active: {
    label: "Active",
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    dot: "bg-[#22C55E]",
  },
  Injured: {
    label: "Injured",
    bg: "bg-[#FEE2E2]",
    text: "text-[#B91C1C]",
    dot: "bg-[#EF4444]",
  },
  Monitoring: {
    label: "Monitoring",
    bg: "bg-[#FEF9C3]",
    text: "text-[#92400E]",
    dot: "bg-[#F59E0B]",
  },
  Pending: {
    label: "Pending",
    bg: "bg-[#F3F4F6]",
    text: "text-[#374151]",
    dot: "bg-[#9CA3AF]",
  },
  Suspended: {
    label: "Suspended",
    bg: "bg-[#F3E8FF]",
    text: "text-[#6B21A8]",
    dot: "bg-[#A855F7]",
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-[#FEE2E2]",
    text: "text-[#991B1B]",
    dot: "bg-[#DC2626]",
  },
}

export function readinessColor(val: number): string {
  if (val > 80) return "#22C55E"
  if (val >= 60) return "#F59E0B"
  return "#EF4444"
}

export function readinessBadgeClass(val: number): string {
  if (val > 80) return "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
  if (val >= 60) return "bg-[#FEF9C3] text-[#92400E] border-[#FDE68A]"
  return "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]"
}
