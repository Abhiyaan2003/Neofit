/**
 * Split Engine
 * Generates workout day structures for all split types.
 */
import { SplitType, SplitDayTemplate, WorkoutFrequency, MuscleGroup, MovementPattern } from '@/types'
import { PhysiqueProgramDef, MusclePriorityMap } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  SPLIT TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

const BRO_SPLIT: SplitDayTemplate[] = [
  { label: 'Chest', focus: 'Chest Day', primaryMuscles: ['chest', 'upper_chest'], secondaryMuscles: ['triceps', 'front_delts'], movementPatterns: ['horizontal_push'] },
  { label: 'Back', focus: 'Back Day', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps', 'rear_delts'], movementPatterns: ['horizontal_pull', 'vertical_pull', 'hinge'] },
  { label: 'Shoulders', focus: 'Shoulder Day', primaryMuscles: ['shoulders', 'side_delts', 'rear_delts'], secondaryMuscles: ['traps', 'triceps'], movementPatterns: ['vertical_push', 'rotation'] },
  { label: 'Legs', focus: 'Leg Day', primaryMuscles: ['quads', 'hamstrings', 'glutes'], secondaryMuscles: ['calves', 'core'], movementPatterns: ['squat', 'hinge', 'lunge'] },
  { label: 'Arms', focus: 'Arms Day', primaryMuscles: ['biceps', 'triceps'], secondaryMuscles: ['forearms'], movementPatterns: ['vertical_pull', 'vertical_push'] },
]

const PPL: SplitDayTemplate[] = [
  { label: 'Push', focus: 'Chest, Shoulders & Triceps', primaryMuscles: ['chest', 'upper_chest', 'shoulders', 'side_delts', 'front_delts'], secondaryMuscles: ['triceps'], movementPatterns: ['horizontal_push', 'vertical_push'] },
  { label: 'Pull', focus: 'Back & Biceps', primaryMuscles: ['back', 'lats', 'rear_delts'], secondaryMuscles: ['biceps', 'traps', 'forearms'], movementPatterns: ['horizontal_pull', 'vertical_pull'] },
  { label: 'Legs', focus: 'Legs & Glutes', primaryMuscles: ['quads', 'hamstrings', 'glutes'], secondaryMuscles: ['calves', 'core'], movementPatterns: ['squat', 'hinge', 'lunge'] },
]

const UPPER_LOWER: SplitDayTemplate[] = [
  { label: 'Upper A', focus: 'Upper Body — Push Focus', primaryMuscles: ['chest', 'shoulders', 'triceps'], secondaryMuscles: ['upper_chest', 'front_delts'], movementPatterns: ['horizontal_push', 'vertical_push'] },
  { label: 'Lower A', focus: 'Lower Body — Squat Focus', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'calves', 'core'], movementPatterns: ['squat', 'lunge'] },
  { label: 'Upper B', focus: 'Upper Body — Pull Focus', primaryMuscles: ['back', 'lats', 'biceps'], secondaryMuscles: ['rear_delts', 'traps', 'forearms'], movementPatterns: ['horizontal_pull', 'vertical_pull'] },
  { label: 'Lower B', focus: 'Lower Body — Hinge Focus', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower_back', 'core', 'calves'], movementPatterns: ['hinge', 'lunge'] },
]

const FULL_BODY: SplitDayTemplate[] = [
  { label: 'Full Body A', focus: 'Compound Focus', primaryMuscles: ['chest', 'back', 'quads'], secondaryMuscles: ['shoulders', 'triceps', 'biceps', 'core'], movementPatterns: ['horizontal_push', 'horizontal_pull', 'squat'] },
  { label: 'Full Body B', focus: 'Balanced Training', primaryMuscles: ['shoulders', 'lats', 'hamstrings', 'glutes'], secondaryMuscles: ['triceps', 'biceps', 'core'], movementPatterns: ['vertical_push', 'vertical_pull', 'hinge'] },
  { label: 'Full Body C', focus: 'Athletic Movement', primaryMuscles: ['back', 'chest', 'quads', 'glutes'], secondaryMuscles: ['calves', 'core', 'biceps', 'triceps'], movementPatterns: ['horizontal_push', 'horizontal_pull', 'lunge'] },
]

// ═══════════════════════════════════════════════════════════════════════
//  PHYSIQUE MODE — Dynamic generation
// ═══════════════════════════════════════════════════════════════════════

function generatePhysiqueSplit(
  priorities: MusclePriorityMap,
  daysPerWeek: WorkoutFrequency,
): SplitDayTemplate[] {
  // Sort muscles by priority score (highest first)
  const ranked = Object.entries(priorities)
    .sort(([, a], [, b]) => b - a)

  // Group top muscles into day themes
  const dayThemes: { muscles: string[]; label: string }[] = []

  // Always start with highest priority muscles
  const topMuscles = ranked.filter(([, score]) => score >= 8).map(([m]) => m)
  const midMuscles = ranked.filter(([, score]) => score >= 5 && score < 8).map(([m]) => m)
  const lowMuscles = ranked.filter(([, score]) => score < 5).map(([m]) => m)

  // Create day groupings based on frequency
  if (daysPerWeek >= 5) {
    // High priority muscles get their own days
    const upperPush = topMuscles.filter(m => ['chest', 'upper_chest', 'shoulders', 'side_delts', 'front_delts', 'triceps'].includes(m))
    const upperPull = topMuscles.filter(m => ['back', 'lats', 'rear_delts', 'biceps', 'traps'].includes(m))
    const legs = [...topMuscles, ...midMuscles].filter(m => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m))
    const core = [...topMuscles, ...midMuscles].filter(m => ['core', 'obliques'].includes(m))

    dayThemes.push({ muscles: upperPush.length > 0 ? upperPush : ['chest', 'shoulders', 'triceps'], label: 'Push Priority' })
    dayThemes.push({ muscles: upperPull.length > 0 ? upperPull : ['back', 'lats', 'biceps'], label: 'Pull Priority' })
    dayThemes.push({ muscles: legs.length > 0 ? legs : ['quads', 'hamstrings', 'glutes'], label: 'Leg Priority' })

    // Extra days for highest priority muscles
    const remaining = [...midMuscles, ...lowMuscles].filter(m => !upperPush.includes(m) && !upperPull.includes(m) && !legs.includes(m) && !core.includes(m))
    if (daysPerWeek >= 5) dayThemes.push({ muscles: [...core, ...remaining.slice(0, 3)], label: 'Core & Weak Points' })
    if (daysPerWeek >= 6) dayThemes.push({ muscles: topMuscles.slice(0, 4), label: 'Priority Repeat' })
  } else if (daysPerWeek === 4) {
    dayThemes.push({ muscles: topMuscles.filter(m => ['chest', 'upper_chest', 'shoulders', 'side_delts', 'triceps'].includes(m)), label: 'Upper Push' })
    dayThemes.push({ muscles: topMuscles.filter(m => ['back', 'lats', 'rear_delts', 'biceps'].includes(m)), label: 'Upper Pull' })
    dayThemes.push({ muscles: [...topMuscles, ...midMuscles].filter(m => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m)), label: 'Lower A' })
    dayThemes.push({ muscles: [...topMuscles, ...midMuscles].filter(m => ['core', 'shoulders', 'side_delts', 'rear_delts', 'glutes'].includes(m)), label: 'Weak Points' })
  } else {
    // 3 days: push/pull/legs with priority weighting
    dayThemes.push({ muscles: topMuscles.filter(m => !['quads', 'hamstrings', 'glutes', 'calves', 'core', 'back', 'lats', 'biceps', 'rear_delts'].includes(m)), label: 'Push' })
    dayThemes.push({ muscles: topMuscles.filter(m => ['back', 'lats', 'rear_delts', 'biceps'].includes(m)), label: 'Pull' })
    dayThemes.push({ muscles: [...topMuscles, ...midMuscles].filter(m => ['quads', 'hamstrings', 'glutes', 'calves', 'core'].includes(m)), label: 'Legs' })
  }

  return dayThemes.slice(0, daysPerWeek).map(theme => ({
    label: theme.label,
    focus: `${theme.label} — Priority Training`,
    primaryMuscles: theme.muscles as MuscleGroup[],
    secondaryMuscles: [],
    movementPatterns: inferMovementPatterns(theme.muscles) as MovementPattern[],
  }))
}

function inferMovementPatterns(muscles: string[]): string[] {
  const patterns: string[] = []
  if (muscles.some(m => ['chest', 'upper_chest', 'front_delts', 'triceps'].includes(m))) patterns.push('horizontal_push')
  if (muscles.some(m => ['shoulders', 'side_delts'].includes(m))) patterns.push('vertical_push')
  if (muscles.some(m => ['back', 'lats', 'rear_delts'].includes(m))) patterns.push('horizontal_pull', 'vertical_pull')
  if (muscles.some(m => ['quads', 'glutes'].includes(m))) patterns.push('squat', 'lunge')
  if (muscles.some(m => ['hamstrings', 'lower_back'].includes(m))) patterns.push('hinge')
  if (muscles.some(m => ['core', 'obliques'].includes(m))) patterns.push('rotation', 'carry')
  return [...new Set(patterns)]
}

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

export function getSplitTemplate(split: SplitType): SplitDayTemplate[] {
  switch (split) {
    case 'bro_split': return BRO_SPLIT
    case 'ppl': return PPL
    case 'upper_lower': return UPPER_LOWER
    case 'full_body': return FULL_BODY
    case 'physique': return FULL_BODY // default, use generatePhysiqueSplit for actual
  }
}

export function getDaysForSplit(
  split: SplitType,
  daysPerWeek: WorkoutFrequency,
  physiqueProgram?: PhysiqueProgramDef,
): SplitDayTemplate[] {
  if (split === 'physique' && physiqueProgram) {
    return generatePhysiqueSplit(physiqueProgram.musclePriorities, daysPerWeek)
  }

  const template = getSplitTemplate(split)
  const days: SplitDayTemplate[] = []

  for (let i = 0; i < daysPerWeek; i++) {
    days.push(template[i % template.length])
  }

  return days
}
