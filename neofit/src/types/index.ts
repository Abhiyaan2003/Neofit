// ═══════════════════════════════════════════════════════════════════════════════
//  NEOFIT — CORE TYPE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export type Goal = 'muscle_gain' | 'fat_loss' | 'strength' | 'athletic_performance'

export type PhysiqueProgram =
  | 'v_taper'
  | 'aesthetic_physique'
  | 'lean_athletic'
  | 'mass_monster'
  | 'fat_burn_accelerator'
  | 'balanced_fitness'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type WorkoutFrequency = 3 | 4 | 5 | 6

export type SplitType = 'bro_split' | 'ppl' | 'upper_lower' | 'full_body' | 'physique'

export type ExerciseCategory =
  | 'strength'
  | 'hypertrophy'
  | 'cardio'
  | 'mobility'
  | 'core'
  | 'warmup'
  | 'fat_loss'

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'rotation'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type ProgressionType = 'weight' | 'reps' | 'duration' | 'density'

export type EquipmentItem =
  | 'dumbbells'
  | 'barbell'
  | 'bench'
  | 'incline_bench'
  | 'decline_bench'
  | 'pullup_bar'
  | 'cable_machine'
  | 'smith_machine'
  | 'resistance_bands'
  | 'kettlebell'
  | 'dip_bars'
  | 'leg_press_machine'
  | 'leg_extension_machine'
  | 'leg_curl_machine'
  | 'lat_pulldown_machine'
  | 'chest_press_machine'
  | 'shoulder_press_machine'
  | 'seated_row_machine'
  | 't_bar_row_machine'
  | 'hack_squat_machine'
  | 'pec_deck_machine'
  | 'lateral_raise_machine'
  | 'calf_raise_machine'
  | 'preacher_bench'
  | 'roman_chair'
  | 'plyo_box'
  | 'ab_wheel'
  | 'treadmill'
  | 'stationary_bike'
  | 'rower'
  | 'medicine_ball'
  | 'battle_ropes'
  | 'landmine'
  | 'step_platform'
  | 'yoga_mat'
  | 'trx'

export type GymPreset = 'college_gym' | 'dumbbell_only' | 'minimal' | 'full_gym' | 'custom'

export type PhysiqueTag =
  | 'v_taper'
  | 'upper_chest'
  | 'lat_width'
  | 'shoulder_width'
  | 'aesthetic'
  | 'fat_loss'
  | 'mass_builder'
  | 'arm_size'
  | 'core_definition'
  | 'posterior_chain'
  | 'quad_sweep'
  | 'glute_builder'
  | 'conditioning'
  | 'functional'

export type MuscleGroup =
  | 'chest'
  | 'upper_chest'
  | 'back'
  | 'lats'
  | 'traps'
  | 'rear_delts'
  | 'side_delts'
  | 'front_delts'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'obliques'
  | 'lower_back'
  | 'hip_flexors'
  | 'full_body'

// ─── EXERCISE ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  slug: string
  category: ExerciseCategory
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  movementPattern: MovementPattern
  equipmentRequired: EquipmentItem[]
  equipmentOptional: EquipmentItem[]
  isBodyweight: boolean
  difficulty: Difficulty
  compatibleSplits: SplitType[]
  goals: Goal[]
  physiqueTags: PhysiqueTag[]
  fatigueScore: number              // 1-10
  recoveryHours: number             // 24-72
  progressionType: ProgressionType
  homeFriendly: boolean
  gymFriendly: boolean
  instructions: string[]
  tips: string[]
  mistakes: string[]
  defaultSets: number
  defaultReps: string
  defaultRest: number               // seconds
}

// ─── PHYSIQUE PROGRAM DEFINITION ─────────────────────────────────────────────

export interface MusclePriorityMap {
  [muscle: string]: number           // 1-10 priority score
}

export interface PhysiqueProgramDef {
  id: PhysiqueProgram
  name: string
  tagline: string
  description: string
  icon: string
  accentColor: string
  musclePriorities: MusclePriorityMap
  recommendedSplit: SplitType
  recommendedFrequency: WorkoutFrequency
  weeklyVolumeTargets: { muscle: string; minSets: number; maxSets: number }[]
  keyExerciseSlugs: string[]         // exercises this program prioritizes
}

// ─── SPLIT DAY TEMPLATE ──────────────────────────────────────────────────────

export interface SplitDayTemplate {
  label: string
  focus: string
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  movementPatterns: MovementPattern[]
}

// ─── GENERATED PLAN ──────────────────────────────────────────────────────────

export interface GeneratedExerciseEntry {
  exerciseName: string
  exerciseSlug: string
  sets: number
  reps: string
  restSeconds: number
  equipmentNeeded: EquipmentItem[]
  tips: string[]
  fatigueScore: number
  section: 'warmup' | 'primary_compound' | 'secondary_compound' | 'accessory' | 'core' | 'finisher' | 'cooldown'
}

export interface GeneratedDay {
  dayNumber: number
  dayName: string
  focus: string
  targetMuscles: MuscleGroup[]
  exercises: GeneratedExerciseEntry[]
  totalFatigue: number
  estimatedDurationMinutes: number
}

export interface GeneratedPlan {
  planName: string
  goal: Goal
  physiqueProgram: PhysiqueProgram
  split: SplitType
  daysPerWeek: WorkoutFrequency
  days: GeneratedDay[]
  weeklyMuscleSets: Record<string, number>
}

// ─── DATABASE MODELS ─────────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  goal: Goal | null
  physique_program: PhysiqueProgram | null
  experience_level: ExperienceLevel | null
  workout_frequency: WorkoutFrequency | null
  split_type: SplitType | null
  selected_equipment: EquipmentItem[]
  gym_preset: GymPreset | null
  onboarding_complete: boolean
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  icon: string
  description: string | null
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  exercise?: Exercise
  order_index: number
  sets: number
  reps: string
  rest_time_seconds: number
  notes: string | null
  section: string | null
}

export interface Workout {
  id: string
  split_id: string
  user_id: string
  day_of_week: number
  day_label: string
  focus: string
  estimated_duration_minutes: number | null
  exercises?: WorkoutExercise[]
}

export interface WorkoutSplit {
  id: string
  user_id: string
  split_type: SplitType
  is_active: boolean
  generated_at: string
  valid_until: string
  workouts?: Workout[]
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string | null
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  total_volume_kg: number | null
  notes: string | null
  status: 'in_progress' | 'completed' | 'skipped'
}

export interface ProgressLog {
  id: string
  user_id: string
  date: string
  weight_kg: number | null
  body_fat_percent: number | null
  notes: string | null
  created_at: string
}

export interface GymProfile {
  id: string
  user_id: string
  name: string
  preset: GymPreset | null
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

export interface OnboardingData {
  goal: Goal | null
  physique_program: PhysiqueProgram | null
  experience_level: ExperienceLevel | null
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  workout_frequency: WorkoutFrequency | null
  split_type: SplitType | null
  gym_preset: GymPreset | null
  selected_equipment: EquipmentItem[]
}

// ─── ACTIVE WORKOUT SESSION ──────────────────────────────────────────────────

export interface ActiveExerciseSet {
  setNumber: number
  reps: number | null
  weight: number | null
  completed: boolean
  rpe?: number
}

export interface ActiveWorkoutExercise {
  exercise: Exercise
  targetSets: number
  targetReps: string
  restTime: number
  sets: ActiveExerciseSet[]
  isCompleted: boolean
}

export interface ActiveSession {
  sessionId: string
  workoutId: string
  startedAt: Date
  exercises: ActiveWorkoutExercise[]
  currentExerciseIndex: number
  currentSetIndex: number
}
