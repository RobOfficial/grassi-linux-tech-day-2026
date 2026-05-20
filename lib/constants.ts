// SQLite-friendly "enums" — Prisma SQLite non supporta enum nativi.

export const Role = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AttemptStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];

export const BadgeCondition = {
  STANDS_COMPLETED: "STANDS_COMPLETED",
  TOTAL_POINTS: "TOTAL_POINTS",
} as const;
export type BadgeCondition = (typeof BadgeCondition)[keyof typeof BadgeCondition];
