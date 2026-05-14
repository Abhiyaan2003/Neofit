/**
 * Neofit Workout Generator
 * Orchestrates: Split Engine → Physique Engine → Equipment Filter → Workout Assembly
 */
import { EXERCISES } from '@/constants/exercises'
import {
  Exercise, Goal, ExperienceLevel, WorkoutFrequency, SplitType,
  PhysiqueProgram, EquipmentItem, GeneratedPlan, GeneratedDay,
  GeneratedExerciseEntry, MuscleGroup,
} from '@/types'
import { filterExercisePool } from '@/lib/engines/equipment-filter'
import { getDaysForSplit } from '@/lib/engines/split-engine'
import {
  getPhysiqueProgram, selectExercisesForDay, calculateSetsPerExercise,
  getRepsForGoal, getRestForGoal, getSectionCounts,
} from '@/lib/engines/physique-engine'

// ═══════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr]
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s
}

function estimateDuration(exercises: GeneratedExerciseEntry[]): number {
  return Math.round(exercises.reduce((t, ex) => t + (ex.sets * (35 + ex.restSeconds)) / 60, 0))
}

// ═══════════════════════════════════════════════════════════════════════
//  SECTION SELECTORS
// ═══════════════════════════════════════════════════════════════════════

function selectWarmup(pool: Exercise[], dayMuscles: MuscleGroup[], count: number): Exercise[] {
  const warmups = pool.filter(ex => ex.category === 'warmup')
  const relevant = warmups.filter(ex =>
    ex.primaryMuscles.some(m => dayMuscles.includes(m)) ||
    ex.secondaryMuscles.some(m => dayMuscles.includes(m))
  )
  const general = warmups.filter(ex => !relevant.includes(ex))
  return [...shuffleArray(relevant), ...shuffleArray(general)].slice(0, count)
}

function selectCore(pool: Exercise[], count: number, usedSlugs: Set<string>): Exercise[] {
  const coreExs = pool.filter(ex =>
    ex.category === 'core' && !usedSlugs.has(ex.slug)
  )
  return shuffleArray(coreExs).slice(0, count)
}

function selectFinisher(pool: Exercise[], count: number, goal: Goal, usedSlugs: Set<string>): Exercise[] {
  const finishers = pool.filter(ex =>
    (ex.category === 'cardio' || ex.category === 'fat_loss') &&
    !usedSlugs.has(ex.slug)
  )
  if (goal === 'fat_loss') {
    // Prioritize high-fatigue HIIT exercises
    return finishers.sort((a, b) => b.fatigueScore - a.fatigueScore).slice(0, count)
  }
  return shuffleArray(finishers).slice(0, count)
}

function selectCooldown(pool: Exercise[], dayMuscles: MuscleGroup[], count: number): Exercise[] {
  const stretches = pool.filter(ex => ex.category === 'mobility')
  const relevant = stretches.filter(ex =>
    ex.primaryMuscles.some(m => dayMuscles.includes(m))
  )
  const general = stretches.filter(ex => !relevant.includes(ex))
  return [...shuffleArray(relevant), ...shuffleArray(general)].slice(0, count)
}

// ═══════════════════════════════════════════════════════════════════════
//  ENTRY BUILDER
// ═══════════════════════════════════════════════════════════════════════

function toEntry(
  exercise: Exercise,
  goal: Goal,
  level: ExperienceLevel,
  section: GeneratedExerciseEntry['section'],
): GeneratedExerciseEntry {
  const isCompound = exercise.fatigueScore >= 5

  // Warmup/cooldown use their own defaults
  if (section === 'warmup' || section === 'cooldown') {
    return {
      exerciseName: exercise.name, exerciseSlug: exercise.slug,
      sets: exercise.defaultSets, reps: exercise.defaultReps,
      restSeconds: exercise.defaultRest, equipmentNeeded: exercise.equipmentRequired,
      tips: exercise.tips, fatigueScore: exercise.fatigueScore, section,
    }
  }

  return {
    exerciseName: exercise.name, exerciseSlug: exercise.slug,
    sets: calculateSetsPerExercise(goal, level, isCompound),
    reps: getRepsForGoal(goal, isCompound),
    restSeconds: getRestForGoal(goal, exercise.fatigueScore),
    equipmentNeeded: exercise.equipmentRequired,
    tips: exercise.tips, fatigueScore: exercise.fatigueScore, section,
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  FATIGUE VALIDATION
// ═══════════════════════════════════════════════════════════════════════

function getDailyFatigueLimit(level: ExperienceLevel): number {
  return level === 'beginner' ? 25 : level === 'intermediate' ? 35 : 45
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════════

export interface WorkoutGenerationInput {
  goal: Goal
  physiqueProgram: PhysiqueProgram
  fitnessLevel: ExperienceLevel
  equipment: EquipmentItem[]
  split: SplitType
  daysPerWeek: WorkoutFrequency
}

export function generateWorkoutPlan(input: WorkoutGenerationInput): GeneratedPlan {
  const { goal, physiqueProgram, fitnessLevel, equipment, split, daysPerWeek } = input

  const program = getPhysiqueProgram(physiqueProgram)
  const pool = filterExercisePool(EXERCISES, equipment, fitnessLevel)
  const dayTemplates = getDaysForSplit(split, daysPerWeek, program)
  const counts = getSectionCounts(goal, fitnessLevel)
  const fatigueLimit = getDailyFatigueLimit(fitnessLevel)

  const globalUsedSlugs = new Set<string>()
  const weeklyMuscleSets: Record<string, number> = {}
  const days: GeneratedDay[] = []

  for (let i = 0; i < daysPerWeek; i++) {
    const tmpl = dayTemplates[i]
    const dayMuscles = [...tmpl.primaryMuscles, ...tmpl.secondaryMuscles]
    const dayUsedSlugs = new Set(globalUsedSlugs)

    // ── WARMUP ──
    const warmupExs = selectWarmup(pool, tmpl.primaryMuscles, counts.warmup)

    // ── MAIN EXERCISES (compound + accessory via physique engine) ──
    const { compounds, accessories } = selectExercisesForDay(
      pool, tmpl, program,
      { compounds: counts.compounds, accessories: counts.accessories },
      dayUsedSlugs,
    )
    compounds.forEach(ex => { dayUsedSlugs.add(ex.slug); globalUsedSlugs.add(ex.slug) })
    accessories.forEach(ex => { dayUsedSlugs.add(ex.slug); globalUsedSlugs.add(ex.slug) })

    // ── CORE ──
    const coreExs = selectCore(pool, counts.core, dayUsedSlugs)
    coreExs.forEach(ex => { dayUsedSlugs.add(ex.slug); globalUsedSlugs.add(ex.slug) })

    // ── FINISHER (for fat_loss / athletic) ──
    const finisherExs = selectFinisher(pool, counts.finisher, goal, dayUsedSlugs)

    // ── COOLDOWN ──
    const cooldownExs = selectCooldown(pool, tmpl.primaryMuscles, counts.cooldown)

    // ── BUILD ENTRIES ──
    const exercises: GeneratedExerciseEntry[] = [
      ...warmupExs.map(ex => toEntry(ex, goal, fitnessLevel, 'warmup')),
      ...compounds.slice(0, 1).map(ex => toEntry(ex, goal, fitnessLevel, 'primary_compound')),
      ...compounds.slice(1).map(ex => toEntry(ex, goal, fitnessLevel, 'secondary_compound')),
      ...accessories.map(ex => toEntry(ex, goal, fitnessLevel, 'accessory')),
      ...coreExs.map(ex => toEntry(ex, goal, fitnessLevel, 'core')),
      ...finisherExs.map(ex => toEntry(ex, goal, fitnessLevel, 'finisher')),
      ...cooldownExs.map(ex => toEntry(ex, goal, fitnessLevel, 'cooldown')),
    ]

    // ── FATIGUE CHECK — trim if over daily limit ──
    let totalFatigue = exercises.reduce((t, e) => t + e.fatigueScore * e.sets, 0)
    const trimmedExercises = [...exercises]
    while (totalFatigue > fatigueLimit && trimmedExercises.length > 4) {
      const lastAccessory = trimmedExercises.findIndex(e => e.section === 'accessory')
      if (lastAccessory >= 0) {
        totalFatigue -= trimmedExercises[lastAccessory].fatigueScore * trimmedExercises[lastAccessory].sets
        trimmedExercises.splice(lastAccessory, 1)
      } else break
    }

    // Track weekly volume
    for (const ex of trimmedExercises) {
      if (['warmup', 'cooldown'].includes(ex.section)) continue
      const fullEx = EXERCISES.find(e => e.slug === ex.exerciseSlug)
      if (fullEx) {
        for (const muscle of fullEx.primaryMuscles) {
          weeklyMuscleSets[muscle] = (weeklyMuscleSets[muscle] || 0) + ex.sets
        }
      }
    }

    days.push({
      dayNumber: i + 1,
      dayName: tmpl.label,
      focus: tmpl.focus,
      targetMuscles: tmpl.primaryMuscles,
      exercises: trimmedExercises,
      totalFatigue,
      estimatedDurationMinutes: estimateDuration(trimmedExercises),
    })

    // Reset global used slugs every full template cycle for variety
    if ((i + 1) % dayTemplates.length === 0) globalUsedSlugs.clear()
  }

  return {
    planName: generatePlanName(goal, physiqueProgram, split),
    goal,
    physiqueProgram,
    split,
    daysPerWeek,
    days,
    weeklyMuscleSets,
  }
}

function generatePlanName(goal: Goal, physique: PhysiqueProgram, split: SplitType): string {
  const goalNames: Record<string, string> = {
    muscle_gain: 'Hypertrophy', fat_loss: 'Shred', strength: 'Powerhouse', athletic_performance: 'Athletic',
  }
  const splitNames: Record<string, string> = {
    ppl: 'PPL', upper_lower: 'Upper/Lower', bro_split: 'Bro Split', full_body: 'Full Body', physique: 'Physique',
  }
  return `${goalNames[goal] || 'Custom'} ${splitNames[split] || ''} Program`
}
