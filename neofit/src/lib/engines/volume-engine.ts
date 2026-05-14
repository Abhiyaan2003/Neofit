/**
 * Volume Engine — weekly sets per muscle vs program targets
 *
 * Tracks how many working sets hit each muscle group in the current week
 * and compares against the physique program's volume targets.
 */

import { MuscleGroup, PhysiqueProgram } from '@/types'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'

export type VolumeStatus = 'under' | 'optimal' | 'over'

export interface MuscleVolumeReport {
  muscle: MuscleGroup
  label: string
  actualSets: number
  targetMin: number
  targetMax: number
  status: VolumeStatus
  percentage: number // 0-100+ representing completion toward target
}

// ─── Default weekly volume targets (sets) per muscle ──────────
// These are overridden by the physique program's priorities
const DEFAULT_VOLUME_TARGETS: Record<string, { min: number; max: number }> = {
  chest: { min: 10, max: 16 },
  upper_chest: { min: 4, max: 8 },
  lats: { min: 10, max: 16 },
  mid_back: { min: 6, max: 10 },
  traps: { min: 4, max: 8 },
  shoulders: { min: 8, max: 14 },
  front_delts: { min: 4, max: 8 },
  side_delts: { min: 6, max: 12 },
  rear_delts: { min: 6, max: 10 },
  biceps: { min: 8, max: 14 },
  triceps: { min: 8, max: 14 },
  quads: { min: 10, max: 16 },
  hamstrings: { min: 8, max: 12 },
  glutes: { min: 8, max: 14 },
  calves: { min: 6, max: 12 },
  abs: { min: 6, max: 12 },
  obliques: { min: 4, max: 8 },
  forearms: { min: 4, max: 8 },
  lower_back: { min: 4, max: 8 },
}

// ─── Priority-scaled volume targets ──────────────────────────
// Muscles with higher priority in a physique program get higher targets
function getScaledTargets(
  program: PhysiqueProgram | null
): Record<string, { min: number; max: number }> {
  if (!program || !PHYSIQUE_PROGRAMS[program]) {
    return DEFAULT_VOLUME_TARGETS
  }

  const programDef = PHYSIQUE_PROGRAMS[program]
  const priorities = programDef.musclePriorities
  const scaled = { ...DEFAULT_VOLUME_TARGETS }

  for (const [muscle, priority] of Object.entries(priorities)) {
    const base = DEFAULT_VOLUME_TARGETS[muscle] || { min: 6, max: 10 }
    // Scale: priority 10 = 1.3x, priority 1 = 0.6x
    const scale = 0.6 + ((priority as number) / 10) * 0.7
    scaled[muscle] = {
      min: Math.round(base.min * scale),
      max: Math.round(base.max * scale),
    }
  }

  return scaled
}

/**
 * Given exercise logs from the past 7 days, compute sets per muscle.
 */
export function countWeeklySets(
  logs: { primaryMuscles: MuscleGroup[]; secondaryMuscles: MuscleGroup[]; sets: number }[]
): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const log of logs) {
    // Primary muscles get full set credit
    for (const m of log.primaryMuscles) {
      counts[m] = (counts[m] || 0) + log.sets
    }
    // Secondary muscles get ~50% credit (rounded up)
    for (const m of log.secondaryMuscles) {
      counts[m] = (counts[m] || 0) + Math.ceil(log.sets * 0.5)
    }
  }

  return counts
}

/**
 * Generate a full weekly volume report.
 */
export function getWeeklyVolumeReport(
  weeklySets: Record<string, number>,
  physiqueProgram: PhysiqueProgram | null
): MuscleVolumeReport[] {
  const targets = getScaledTargets(physiqueProgram)

  // Display labels for muscles
  const MUSCLE_LABELS: Record<string, string> = {
    chest: 'Chest', upper_chest: 'Upper Chest',
    lats: 'Lats', mid_back: 'Mid Back', traps: 'Traps', lower_back: 'Lower Back',
    shoulders: 'Shoulders', front_delts: 'Front Delts', side_delts: 'Side Delts', rear_delts: 'Rear Delts',
    biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
    quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves',
    abs: 'Abs', obliques: 'Obliques',
  }

  // Only report muscles that have targets
  const report: MuscleVolumeReport[] = []

  for (const [muscle, target] of Object.entries(targets)) {
    const actual = weeklySets[muscle] || 0
    let status: VolumeStatus = 'optimal'
    if (actual < target.min) status = 'under'
    else if (actual > target.max) status = 'over'

    const percentage = target.max > 0
      ? Math.round((actual / target.max) * 100)
      : 0

    report.push({
      muscle: muscle as MuscleGroup,
      label: MUSCLE_LABELS[muscle] || muscle,
      actualSets: actual,
      targetMin: target.min,
      targetMax: target.max,
      status,
      percentage,
    })
  }

  // Sort: under-trained first (most actionable), then by priority
  return report.sort((a, b) => {
    const statusOrder = { under: 0, optimal: 1, over: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })
}

/**
 * Get a summary for dashboard display — top 6 most relevant muscles.
 * Prioritizes muscles that are under-trained or key to the physique program.
 */
export function getDashboardVolumeSnapshot(
  weeklySets: Record<string, number>,
  physiqueProgram: PhysiqueProgram | null
): MuscleVolumeReport[] {
  const full = getWeeklyVolumeReport(weeklySets, physiqueProgram)

  // Get the major display muscles (not every sub-group)
  const majorMuscles = [
    'chest', 'lats', 'shoulders', 'biceps', 'triceps',
    'quads', 'hamstrings', 'glutes', 'abs',
  ]

  const filtered = full.filter(r => majorMuscles.includes(r.muscle))

  // Show top 6: under-trained first, then by highest volume difference
  return filtered.slice(0, 6)
}
