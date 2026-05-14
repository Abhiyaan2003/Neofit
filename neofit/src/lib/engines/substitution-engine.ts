import { EXERCISES } from '@/constants/exercises'
import { Exercise, EquipmentItem, ExperienceLevel, MovementPattern } from '@/types'

/**
 * SubstitutionEngine
 * Finds pattern-equivalent exercises based on available equipment and movement pattern.
 */
export function getSubstitutes(
  originalExerciseSlug: string,
  userEquipment: EquipmentItem[],
  fitnessLevel: ExperienceLevel,
  currentWorkoutSlugs: string[] = []
): Exercise[] {
  const original = EXERCISES.find(ex => ex.slug === originalExerciseSlug)
  if (!original) return []

  return EXERCISES.filter(ex => {
    // 1. Must be a different exercise
    if (ex.slug === originalExerciseSlug) return false

    // 2. Must not already be in the current workout
    if (currentWorkoutSlugs.includes(ex.slug)) return false

    // 3. Must match movement pattern
    if (ex.movementPattern !== original.movementPattern) return false

    // 4. Must match category (warmup stays warmup, etc)
    if (ex.category !== original.category && !(['strength', 'hypertrophy'].includes(ex.category) && ['strength', 'hypertrophy'].includes(original.category))) {
       // Allow swapping between strength/hypertrophy as they are interchangeable for most splits
       return false
    }

    // 5. Must be compatible with user equipment
    const hasEquipment = ex.equipmentRequired.every(item => userEquipment.includes(item))
    if (!hasEquipment) return false

    // 6. Must be appropriate for fitness level
    const levelMap: Record<ExperienceLevel, number> = { beginner: 1, intermediate: 2, advanced: 3 }
    const exLevel = levelMap[ex.difficulty] || 1
    const userLevel = levelMap[fitnessLevel] || 1
    if (exLevel > userLevel + 1) return false // Prevent advanced exercises for complete beginners

    return true
  })
}

/**
 * Group substitutes by "Quality" of match
 */
export function getRankedSubstitutes(
  originalExerciseSlug: string,
  userEquipment: EquipmentItem[],
  fitnessLevel: ExperienceLevel,
  currentWorkoutSlugs: string[] = []
): Exercise[] {
  const subs = getSubstitutes(originalExerciseSlug, userEquipment, fitnessLevel, currentWorkoutSlugs)
  const original = EXERCISES.find(ex => ex.slug === originalExerciseSlug)
  if (!original) return subs

  return subs.sort((a, b) => {
    // Priority 1: Same primary muscles
    const aMatch = a.primaryMuscles.filter(m => original.primaryMuscles.includes(m)).length
    const bMatch = b.primaryMuscles.filter(m => original.primaryMuscles.includes(m)).length
    if (aMatch !== bMatch) return bMatch - aMatch

    // Priority 2: Same fatigue score (roughly)
    const aFatigueDiff = Math.abs(a.fatigueScore - original.fatigueScore)
    const bFatigueDiff = Math.abs(b.fatigueScore - original.fatigueScore)
    if (aFatigueDiff !== bFatigueDiff) return aFatigueDiff - bFatigueDiff

    return 0
  })
}
