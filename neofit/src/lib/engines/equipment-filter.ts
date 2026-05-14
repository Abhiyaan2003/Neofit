/**
 * Equipment Filter Engine
 * Ensures ONLY valid exercises are included based on user equipment.
 */
import { Exercise, EquipmentItem } from '@/types'

/**
 * Filter exercises based on user's available equipment.
 * 
 * Rules:
 * - No equipment → ONLY bodyweight, mobility, cardio, warmup exercises
 * - Has equipment → compatible exercises + bodyweight exercises
 * - equipmentRequired must be fully satisfied
 * - equipmentOptional is ignored (nice-to-have)
 */
export function filterByEquipment(
  exercises: Exercise[],
  userEquipment: EquipmentItem[],
): Exercise[] {
  const hasEquipment = userEquipment.length > 0

  return exercises.filter(ex => {
    // Bodyweight exercises always pass
    if (ex.isBodyweight && ex.equipmentRequired.length === 0) return true

    // No equipment → only bodyweight, warmup, mobility, cardio
    if (!hasEquipment) {
      return (
        ex.equipmentRequired.length === 0 &&
        ['warmup', 'mobility', 'cardio', 'fat_loss', 'core'].includes(ex.category)
      )
    }

    // Has equipment → check if ALL required equipment is available
    return ex.equipmentRequired.every(eq => userEquipment.includes(eq))
  })
}

/**
 * Filter exercises by workout location (home/gym).
 */
export function filterByLocation(
  exercises: Exercise[],
  location: 'home' | 'gym',
): Exercise[] {
  return exercises.filter(ex => {
    if (location === 'home') return ex.homeFriendly
    return ex.gymFriendly
  })
}

/**
 * Filter exercises by difficulty level.
 * Beginners skip advanced exercises.
 */
export function filterByDifficulty(
  exercises: Exercise[],
  level: 'beginner' | 'intermediate' | 'advanced',
): Exercise[] {
  const allowedLevels: Record<string, string[]> = {
    beginner: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced: ['beginner', 'intermediate', 'advanced'],
  }
  return exercises.filter(ex => allowedLevels[level].includes(ex.difficulty))
}

/**
 * Combined filter pipeline: equipment → location → difficulty
 */
export function filterExercisePool(
  exercises: Exercise[],
  userEquipment: EquipmentItem[],
  level: 'beginner' | 'intermediate' | 'advanced',
): Exercise[] {
  let pool = filterByEquipment(exercises, userEquipment)
  pool = filterByDifficulty(pool, level)
  return pool
}
