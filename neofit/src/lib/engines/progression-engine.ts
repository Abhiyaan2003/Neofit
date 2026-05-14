/**
 * Progression Engine — double progression + PR detection
 *
 * Rules:
 * 1. All sets hit max reps → increase_weight (+2.5kg compound, +1kg isolation)
 * 2. All sets hit min reps → maintain
 * 3. Missed reps → maintain + encourage
 * 4. Weight × reps exceeds previous best → PR
 */

export interface SetLog {
  reps: number
  weightKg: number
}

export interface ExercisePerformance {
  exerciseSlug: string
  exerciseName: string
  isCompound: boolean
  date: string
  sets: SetLog[]
}

export type ProgressionType = 'increase_weight' | 'increase_reps' | 'maintain'

export interface ProgressionSuggestion {
  exerciseSlug: string
  type: ProgressionType
  suggestedWeightKg: number
  suggestedReps: string
  reason: string
}

export interface PRRecord {
  exerciseSlug: string
  exerciseName: string
  weightKg: number
  reps: number
  estimatedOneRM: number
  date: string
}

// ─── Weight increments ─────────────────────────────────────────
const COMPOUND_INCREMENT = 2.5  // kg
const ISOLATION_INCREMENT = 1.0 // kg

/**
 * Calculate estimated 1RM using Epley formula: weight × (1 + reps / 30)
 */
export function estimateOneRM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0
  if (reps === 1) return weightKg
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

/**
 * Parse a rep range string like "8-12" into { min, max }
 */
function parseRepRange(reps: string): { min: number; max: number } {
  const parts = reps.split('-').map(Number)
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] }
  }
  const single = parseInt(reps)
  return { min: single || 8, max: single || 12 }
}

/**
 * Get a progression suggestion based on last session's performance.
 */
export function getProgressionSuggestion(
  lastPerformance: ExercisePerformance,
  targetReps: string
): ProgressionSuggestion {
  const { min, max } = parseRepRange(targetReps)
  const sets = lastPerformance.sets.filter(s => s.weightKg > 0 || s.reps > 0)

  if (sets.length === 0) {
    return {
      exerciseSlug: lastPerformance.exerciseSlug,
      type: 'maintain',
      suggestedWeightKg: 0,
      suggestedReps: targetReps,
      reason: 'No previous data — start with a comfortable weight',
    }
  }

  const lastWeight = sets[0].weightKg
  const allHitMax = sets.every(s => s.reps >= max)
  const allHitMin = sets.every(s => s.reps >= min)
  const increment = lastPerformance.isCompound ? COMPOUND_INCREMENT : ISOLATION_INCREMENT

  if (allHitMax) {
    return {
      exerciseSlug: lastPerformance.exerciseSlug,
      type: 'increase_weight',
      suggestedWeightKg: lastWeight + increment,
      suggestedReps: `${min}-${max}`,
      reason: `You hit ${max} reps on all sets — time to go heavier! 💪`,
    }
  }

  if (allHitMin) {
    return {
      exerciseSlug: lastPerformance.exerciseSlug,
      type: 'increase_reps',
      suggestedWeightKg: lastWeight,
      suggestedReps: `${min}-${max}`,
      reason: `Keep pushing for ${max} reps before increasing weight`,
    }
  }

  return {
    exerciseSlug: lastPerformance.exerciseSlug,
    type: 'maintain',
    suggestedWeightKg: lastWeight,
    suggestedReps: `${min}-${max}`,
    reason: 'Focus on form — you\'ll get there! 🔥',
  }
}

/**
 * Check if a set is a new personal record.
 * Compares estimated 1RM against the historical best.
 */
export function checkForPR(
  currentSet: SetLog,
  history: ExercisePerformance[]
): boolean {
  if (currentSet.weightKg <= 0 || currentSet.reps <= 0) return false

  const currentE1RM = estimateOneRM(currentSet.weightKg, currentSet.reps)

  let bestE1RM = 0
  for (const perf of history) {
    for (const set of perf.sets) {
      const e1rm = estimateOneRM(set.weightKg, set.reps)
      if (e1rm > bestE1RM) bestE1RM = e1rm
    }
  }

  return currentE1RM > bestE1RM && bestE1RM > 0
}

/**
 * Extract the best set from a performance log for display.
 */
export function getBestSet(performance: ExercisePerformance): SetLog | null {
  if (performance.sets.length === 0) return null
  return performance.sets.reduce((best, set) => {
    const score = estimateOneRM(set.weightKg, set.reps)
    const bestScore = estimateOneRM(best.weightKg, best.reps)
    return score > bestScore ? set : best
  })
}

/**
 * Format the "last session" display string.
 */
export function formatLastPerformance(performance: ExercisePerformance | null): string {
  if (!performance || performance.sets.length === 0) return 'No previous data'
  const best = getBestSet(performance)
  if (!best) return 'No previous data'
  if (best.weightKg === 0) return `${best.reps} reps (bodyweight)`
  return `${best.weightKg}kg × ${best.reps}`
}

/**
 * Get progression summary emoji.
 */
export function getProgressionEmoji(type: ProgressionType): string {
  switch (type) {
    case 'increase_weight': return '⬆️'
    case 'increase_reps': return '🔄'
    case 'maintain': return '✊'
  }
}
