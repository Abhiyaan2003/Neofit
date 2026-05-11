import { EXERCISES } from '@/constants/exercises'
import { GYM_PRESETS } from '@/constants'
import { Exercise, Goal, ExperienceLevel, WorkoutFrequency, SplitType, GymPreset, Workout, WorkoutSplit } from '@/types'

// ============================
// STEP 1: Determine split type
// ============================
export function determineSplitType(frequency: WorkoutFrequency, goal: Goal): SplitType {
  if (frequency === 3) return 'full_body'
  if (frequency === 4) return 'upper_lower'
  if (frequency === 5 || frequency === 6) {
    if (goal === 'strength') return 'upper_lower'
    return 'push_pull_legs'
  }
  return 'full_body'
}

// ============================
// STEP 2: Filter exercises by available equipment
// ============================
export function filterByEquipment(equipmentNames: string[]): Exercise[] {
  return EXERCISES.filter(exercise => {
    if (exercise.equipment_required.length === 0) return true // bodyweight
    return exercise.equipment_required.every(eq => equipmentNames.includes(eq))
  })
}

// ============================
// STEP 3: Filter by muscle group
// ============================
export function filterByMuscle(exercises: Exercise[], muscles: string[]): Exercise[] {
  return exercises.filter(ex => muscles.includes(ex.muscle_group))
}

// ============================
// STEP 4: Sort by priority (compound first)
// ============================
export function sortByPriority(exercises: Exercise[], goal: Goal, level: ExperienceLevel): Exercise[] {
  return [...exercises].sort((a, b) => {
    const typeScore = (ex: Exercise) => ex.exercise_type === 'compound' ? 0 : ex.exercise_type === 'isolation' ? 1 : 2
    const diffScore = (ex: Exercise) => {
      const map = { beginner: 0, intermediate: 1, advanced: 2 }
      const levelMap = { beginner: 0, intermediate: 1, advanced: 2 }
      return Math.abs(map[ex.difficulty] - levelMap[level])
    }
    return typeScore(a) - typeScore(b) || diffScore(a) - diffScore(b)
  })
}

// ============================
// STEP 5: Adjust sets/reps per goal
// ============================
export function adjustForGoal(exercise: Exercise, goal: Goal): { sets: number; reps: string; rest: number } {
  switch (goal) {
    case 'strength':
      return { sets: Math.max(exercise.default_sets, 5), reps: '3-6', rest: 180 }
    case 'muscle_gain':
      return { sets: exercise.default_sets, reps: exercise.default_reps, rest: exercise.rest_time_seconds }
    case 'fat_loss':
      return { sets: 3, reps: '12-15', rest: 60 }
    case 'athletic':
      return { sets: 4, reps: '8-12', rest: 90 }
    case 'beginner':
      return { sets: 3, reps: '10-12', rest: 90 }
    default:
      return { sets: exercise.default_sets, reps: exercise.default_reps, rest: exercise.rest_time_seconds }
  }
}

// ============================
// SPLIT DEFINITIONS
// ============================
const PUSH_PULL_LEGS_TEMPLATE = [
  { label: 'Push', focus: 'Chest, Shoulders & Triceps', muscles: ['chest', 'shoulders', 'triceps'] },
  { label: 'Pull', focus: 'Back & Biceps', muscles: ['back', 'biceps'] },
  { label: 'Legs', focus: 'Legs & Glutes', muscles: ['legs', 'hamstrings', 'glutes'] },
]

const UPPER_LOWER_TEMPLATE = [
  { label: 'Upper A', focus: 'Upper Body — Push Focus', muscles: ['chest', 'shoulders', 'triceps', 'back'] },
  { label: 'Lower A', focus: 'Lower Body — Squat Focus', muscles: ['legs', 'glutes'] },
  { label: 'Upper B', focus: 'Upper Body — Pull Focus', muscles: ['back', 'biceps', 'shoulders'] },
  { label: 'Lower B', focus: 'Lower Body — Hinge Focus', muscles: ['hamstrings', 'glutes', 'core'] },
]

const FULL_BODY_TEMPLATE = [
  { label: 'Full Body A', focus: 'Compound Full Body', muscles: ['chest', 'back', 'legs', 'shoulders'] },
  { label: 'Full Body B', focus: 'Full Body — Variation', muscles: ['back', 'legs', 'chest', 'core'] },
  { label: 'Full Body C', focus: 'Full Body — Athletic', muscles: ['legs', 'chest', 'back', 'biceps'] },
]

// ============================
// MAIN ENGINE: Generate Workout Plan
// ============================
export interface GeneratedWorkoutDay {
  dayLabel: string
  focus: string
  exercises: Array<{ exercise: Exercise; sets: number; reps: string; restTime: number }>
  estimatedDuration: number
}

export function generateWorkoutPlan(
  goal: Goal,
  level: ExperienceLevel,
  frequency: WorkoutFrequency,
  equipmentNames: string[],
  gymPreset?: GymPreset
): { splitType: SplitType; days: GeneratedWorkoutDay[] } {
  const splitType = determineSplitType(frequency, goal)
  const availableExercises = filterByEquipment(equipmentNames)
  
  let template: typeof PUSH_PULL_LEGS_TEMPLATE
  if (splitType === 'push_pull_legs') template = PUSH_PULL_LEGS_TEMPLATE
  else if (splitType === 'upper_lower') template = UPPER_LOWER_TEMPLATE
  else template = FULL_BODY_TEMPLATE

  // Cycle through the template days to fill the frequency
  const days: GeneratedWorkoutDay[] = []
  for (let i = 0; i < frequency; i++) {
    const templateDay = template[i % template.length]
    const muscleExercises = filterByMuscle(availableExercises, templateDay.muscles)
    const sorted = sortByPriority(muscleExercises, goal, level)
    
    // Pick exercises: 1-2 compounds + 1-2 isolations per session, max 5-6 exercises
    const compounds = sorted.filter(e => e.exercise_type === 'compound').slice(0, 3)
    const isolations = sorted.filter(e => e.exercise_type === 'isolation' || e.exercise_type === 'bodyweight').slice(0, 3)
    const selected = [...compounds, ...isolations].slice(0, 5)
    
    const exercisesWithParams = selected.map(ex => {
      const params = adjustForGoal(ex, goal)
      return { exercise: ex, sets: params.sets, reps: params.reps, restTime: params.rest }
    })
    
    const estimatedDuration = exercisesWithParams.reduce((total, ex) => {
      const setTime = ex.sets * (30 + ex.restTime)
      return total + Math.round(setTime / 60)
    }, 10) // 10 min warmup baseline

    days.push({
      dayLabel: templateDay.label,
      focus: templateDay.focus,
      exercises: exercisesWithParams,
      estimatedDuration,
    })
  }

  return { splitType, days }
}

// ============================
// GET equipment names from preset
// ============================
export function getEquipmentFromPreset(preset: GymPreset, customEquipment: string[] = []): string[] {
  if (preset === 'custom') return customEquipment
  return GYM_PRESETS[preset] || []
}
