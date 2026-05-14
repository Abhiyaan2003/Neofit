/**
 * Physique Engine
 * Drives muscle-priority-based exercise selection and volume allocation.
 */
import { Exercise, PhysiqueProgram, Goal, MuscleGroup, SplitDayTemplate, ExperienceLevel } from '@/types'
import { PhysiqueProgramDef } from '@/types'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'

// ═══════════════════════════════════════════════════════════════════════
//  MUSCLE PRIORITY SCORING
// ═══════════════════════════════════════════════════════════════════════

/**
 * Score an exercise based on how well it fits the physique program's priorities.
 * Higher score = more relevant to the user's physique goals.
 */
export function scoreExerciseForPhysique(
  exercise: Exercise,
  program: PhysiqueProgramDef,
): number {
  let score = 0

  // Primary muscle priority
  for (const muscle of exercise.primaryMuscles) {
    score += (program.musclePriorities[muscle] || 0) * 2
  }

  // Secondary muscle bonus
  for (const muscle of exercise.secondaryMuscles) {
    score += (program.musclePriorities[muscle] || 0) * 0.5
  }

  // Key exercise bonus
  if (program.keyExerciseSlugs.includes(exercise.slug)) {
    score += 15
  }

  // Physique tag alignment
  const matchingTags = exercise.physiqueTags.filter(tag =>
    tag === program.id || program.keyExerciseSlugs.length > 0
  )
  score += matchingTags.length * 2

  return score
}

// ═══════════════════════════════════════════════════════════════════════
//  EXERCISE SELECTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Select exercises for a day, prioritized by physique program scoring.
 */
export function selectExercisesForDay(
  pool: Exercise[],
  dayTemplate: SplitDayTemplate,
  program: PhysiqueProgramDef,
  counts: { compounds: number; accessories: number },
  usedSlugs: Set<string>,
): { compounds: Exercise[]; accessories: Exercise[] } {
  const dayMuscles = [...dayTemplate.primaryMuscles, ...dayTemplate.secondaryMuscles]

  // Filter to exercises targeting this day's muscles
  const dayPool = pool.filter(ex =>
    !usedSlugs.has(ex.slug) &&
    (ex.primaryMuscles.some(m => dayMuscles.includes(m)) ||
     ex.secondaryMuscles.some(m => dayMuscles.includes(m)))
  )

  // Score and sort by physique priority
  const scored = dayPool.map(ex => ({
    exercise: ex,
    score: scoreExerciseForPhysique(ex, program),
  })).sort((a, b) => b.score - a.score)

  // Separate compounds and isolation
  const compoundPool = scored.filter(s =>
    s.exercise.category === 'strength' ||
    (s.exercise.category === 'hypertrophy' && s.exercise.fatigueScore >= 5)
  )
  const accessoryPool = scored.filter(s =>
    s.exercise.category === 'hypertrophy' && s.exercise.fatigueScore < 5
  )

  // Select top compounds (avoid duplicate movement patterns)
  const selectedCompounds: Exercise[] = []
  const usedPatterns = new Set<string>()
  for (const item of compoundPool) {
    if (selectedCompounds.length >= counts.compounds) break
    if (usedPatterns.has(item.exercise.movementPattern) && selectedCompounds.length > 0) continue
    selectedCompounds.push(item.exercise)
    usedPatterns.add(item.exercise.movementPattern)
  }

  // Select top accessories
  const selectedAccessories = accessoryPool
    .filter(s => !selectedCompounds.some(c => c.slug === s.exercise.slug))
    .slice(0, counts.accessories)
    .map(s => s.exercise)

  return { compounds: selectedCompounds, accessories: selectedAccessories }
}

// ═══════════════════════════════════════════════════════════════════════
//  VOLUME ALLOCATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate target sets per muscle group per week based on physique program and experience.
 */
export function getWeeklyVolumeTargets(
  program: PhysiqueProgramDef,
  level: ExperienceLevel,
): Record<string, { min: number; max: number }> {
  const multiplier = level === 'beginner' ? 0.7 : level === 'intermediate' ? 1.0 : 1.2
  const targets: Record<string, { min: number; max: number }> = {}

  for (const target of program.weeklyVolumeTargets) {
    targets[target.muscle] = {
      min: Math.round(target.minSets * multiplier),
      max: Math.round(target.maxSets * multiplier),
    }
  }

  return targets
}

/**
 * Calculate how many sets per exercise per day to hit weekly targets.
 */
export function calculateSetsPerExercise(
  goal: Goal,
  level: ExperienceLevel,
  isCompound: boolean,
): number {
  const base: Record<Goal, number> = {
    strength: 4,
    muscle_gain: 3,
    fat_loss: 3,
    athletic_performance: 3,
  }

  const levelBonus = level === 'advanced' ? 1 : 0
  const compoundBonus = isCompound ? 1 : 0

  return (base[goal] || 3) + levelBonus + (goal === 'strength' ? compoundBonus : 0)
}

/**
 * Determine reps based on goal.
 */
export function getRepsForGoal(goal: Goal, isCompound: boolean): string {
  switch (goal) {
    case 'strength':
      return isCompound ? '3-6' : '6-8'
    case 'muscle_gain':
      return isCompound ? '8-12' : '10-15'
    case 'fat_loss':
      return '12-15'
    case 'athletic_performance':
      return isCompound ? '6-10' : '10-12'
    default:
      return '8-12'
  }
}

/**
 * Determine rest time based on goal and exercise type.
 */
export function getRestForGoal(goal: Goal, fatigueScore: number): number {
  switch (goal) {
    case 'strength':
      return fatigueScore >= 7 ? 180 : 120
    case 'muscle_gain':
      return fatigueScore >= 7 ? 120 : 75
    case 'fat_loss':
      return fatigueScore >= 7 ? 75 : 45
    case 'athletic_performance':
      return fatigueScore >= 7 ? 120 : 60
    default:
      return 90
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

export function getPhysiqueProgram(id: PhysiqueProgram): PhysiqueProgramDef {
  return PHYSIQUE_PROGRAMS[id]
}

/**
 * Get exercise counts per day section based on goal.
 */
export function getSectionCounts(
  goal: Goal,
  level: ExperienceLevel,
): { warmup: number; compounds: number; accessories: number; core: number; finisher: number; cooldown: number } {
  switch (goal) {
    case 'strength':
      return { warmup: 3, compounds: level === 'beginner' ? 2 : 3, accessories: 1, core: 1, finisher: 0, cooldown: 2 }
    case 'muscle_gain':
      return { warmup: 3, compounds: 2, accessories: level === 'beginner' ? 2 : 3, core: 2, finisher: 0, cooldown: 2 }
    case 'fat_loss':
      return { warmup: 3, compounds: 2, accessories: 2, core: 2, finisher: 2, cooldown: 2 }
    case 'athletic_performance':
      return { warmup: 3, compounds: 2, accessories: 2, core: 2, finisher: 1, cooldown: 2 }
    default:
      return { warmup: 3, compounds: 2, accessories: 2, core: 1, finisher: 0, cooldown: 2 }
  }
}
