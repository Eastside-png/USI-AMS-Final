export type UserRole =
  | "Federation Admin"
  | "Coach"
  | "Physiotherapist"
  | "Sports Scientist"
  | "Athlete"

export const roles: UserRole[] = [
  "Federation Admin",
  "Coach",
  "Physiotherapist",
  "Sports Scientist",
  "Athlete",
]

/** Modules visible per role */
export const ROLE_VISIBLE_MODULES: Record<UserRole, string[]> = {
  "Federation Admin": [
    "Dashboard",
    "Athletes",
    "Training",
    "Medical",
    "Sports Science",
    "Nutrition",
    "Assessments",
    "Analytics",
  ],
  Coach: ["Dashboard", "Training", "Athletes", "Medical", "Assessments"],
  Physiotherapist: [
    "Medical",
    "Dashboard",
    "Athletes",
    "Sports Science",
    "Assessments",
    "Training",
  ],
  "Sports Scientist": [
    "Sports Science",
    "Dashboard",
    "Athletes",
    "Training",
    "Medical",
    "Assessments",
    "Analytics",
  ],
  Athlete: ["Dashboard"],
}

export const DEFAULT_MODULE_BY_ROLE: Record<UserRole, string> = {
  "Federation Admin": "Dashboard",
  Coach: "Training",
  Physiotherapist: "Medical",
  "Sports Scientist": "Sports Science",
  Athlete: "Dashboard",
}

/** Personas used as the "logged-in" athlete when role = Athlete */
export const ATHLETE_PERSONA_ID = "priya-sharma"
