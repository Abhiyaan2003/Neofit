/**
 * Recovery Engine — muscle-level fatigue tracking
 * 
 * Uses each exercise's fatigueScore and recoveryHours to determine
 * whether a muscle group is fresh, recovering, or still fatigued.
 */

import { MuscleGroup, ExperienceLevel, Exercise } from '@/types'

// ─── Recovery hours by muscle size ────────────────────────────
const RECOVERY_HOURS: Record<string, number> = {
  // Large muscle groups need more recovery
  quads: 72, hamstrings: 72, glutes: 72,
  chest: 48, lats: 48, traps: 48, lower_back: 48,
  // Medium groups
  shoulders: 48, side_delts: 48, rear_delts: 48, front_delts: 48,
  upper_chest: 48, mid_back: 48,
  // Smaller groups recover faster
  biceps: 36, triceps: 36,
  forearms: 24, calves: 36,
  abs: 24, obliques: 24,
}

export type RecoveryStatus = 'fresh' | 'recovering' | 'fatigued'

export interface MuscleRecoveryState {
  muscle: MuscleGroup
  status: RecoveryStatus
  hoursRemaining: number
  lastTrainedAt: string | null
}

// ─── Daily fatigue caps by experience ─────────────────────────
const FATIGUE_CAPS: Record<ExperienceLevel, number> = {
  beginner: 25,
  intermediate: 35,
  advanced: 45,
}

/**
 * Determine if a muscle group can be trained based on last trained timestamp.
 */
export function canTrainMuscle(
  muscle: MuscleGroup,
  lastTrainedAt: Date | null,
  now: Date = new Date()
): boolean {
  if (!lastTrainedAt) return true
  const recoveryMs = (RECOVERY_HOURS[muscle] ?? 48) * 3600 * 1000
  const elapsed = now.getTime() - lastTrainedAt.getTime()
  return elapsed >= recoveryMs
}

/**
 * Get recovery status for all muscles based on session history.
 * 
 * @param sessionHistory - Array of { muscles: MuscleGroup[], trainedAt: Date }
 */
export function getMuscleRecoveryStatus(
  sessionHistory: { muscles: MuscleGroup[]; trainedAt: Date }[],
  now: Date = new Date()
): MuscleRecoveryState[] {
  // Build a map of last-trained timestamps per muscle
  const lastTrained: Record<string, Date> = {}

  for (const session of sessionHistory) {
    for (const muscle of session.muscles) {
      const existing = lastTrained[muscle]
      if (!existing || session.trainedAt > existing) {
        lastTrained[muscle] = session.trainedAt
      }
    }
  }

  // All muscle groups we track
  const allMuscles = Object.keys(RECOVERY_HOURS) as MuscleGroup[]

  return allMuscles.map(muscle => {
    const trainedAt = lastTrained[muscle] || null
    if (!trainedAt) {
      return { muscle, status: 'fresh' as RecoveryStatus, hoursRemaining: 0, lastTrainedAt: null }
    }

    const recoveryMs = (RECOVERY_HOURS[muscle] ?? 48) * 3600 * 1000
    const elapsedMs = now.getTime() - trainedAt.getTime()
    const remainingMs = Math.max(0, recoveryMs - elapsedMs)
    const hoursRemaining = Math.ceil(remainingMs / (3600 * 1000))

    let status: RecoveryStatus = 'fresh'
    if (remainingMs > 0) {
      // More than 50% remaining = fatigued, else recovering
      status = remainingMs > recoveryMs * 0.5 ? 'fatigued' : 'recovering'
    }

    return {
      muscle,
      status,
      hoursRemaining,
      lastTrainedAt: trainedAt.toISOString(),
    }
  })
}

/**
 * Calculate total fatigue score for a list of exercises.
 */
export function calculateTotalFatigue(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => sum + (ex.fatigueScore ?? 5), 0)
}

/**
 * Get the fatigue cap for a given experience level.
 */
export function getFatigueCap(level: ExperienceLevel): number {
  return FATIGUE_CAPS[level]
}

/**
 * Filter exercises that would push a day's fatigue over the cap.
 * Returns exercises in priority order that fit within the cap.
 */
export function fitWithinFatigueCap(
  exercises: Exercise[],
  level: ExperienceLevel,
  currentFatigue: number = 0
): Exercise[] {
  const cap = FATIGUE_CAPS[level]
  const result: Exercise[] = []
  let running = currentFatigue

  for (const ex of exercises) {
    const score = ex.fatigueScore ?? 5
    if (running + score <= cap) {
      result.push(ex)
      running += score
    }
  }

  return result
}

/**
 * Get muscles trained from a list of exercises (combining primary + secondary).
 */
export function getMusclesTrained(exercises: Exercise[]): MuscleGroup[] {
  const muscles = new Set<MuscleGroup>()
  for (const ex of exercises) {
    for (const m of ex.primaryMuscles) muscles.add(m)
    for (const m of ex.secondaryMuscles) muscles.add(m)
  }
  return Array.from(muscles)
}
