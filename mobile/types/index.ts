// Shared types — mirrors web app src/types/index.ts
export type Goal = 'muscle_gain' | 'fat_loss' | 'strength' | 'athletic' | 'beginner'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type WorkoutFrequency = 3 | 4 | 5 | 6
export type SplitType = 'push_pull_legs' | 'upper_lower' | 'bro_split' | 'full_body'
export type EquipmentCategory = 'free_weights' | 'machines' | 'functional' | 'cardio'
export type ExerciseType = 'compound' | 'isolation' | 'cardio' | 'bodyweight'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type GymPreset = 'college_gym' | 'dumbbell_only' | 'minimal' | 'full_gym' | 'custom'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  goal: Goal | null
  experience_level: ExperienceLevel | null
  workout_frequency: WorkoutFrequency | null
  onboarding_complete: boolean
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  slug: string
  muscle_group: string
  secondary_muscles: string[]
  equipment_required: string[]
  exercise_type: ExerciseType
  difficulty: Difficulty
  video_url: string | null
  thumbnail_url: string | null
  instructions: string[]
  common_mistakes: string[]
  default_sets: number
  default_reps: string
  rest_time_seconds: number
  calories_per_set: number | null
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  exercises: Exercise
  order_index: number
  sets: number
  reps: string
  rest_time_seconds: number
  notes: string | null
}

export interface Workout {
  id: string
  split_id: string
  user_id: string
  day_of_week: number
  day_label: string
  focus: string
  estimated_duration_minutes: number | null
  workout_exercises?: WorkoutExercise[]
}

export interface WorkoutSplit {
  id: string
  user_id: string
  split_type: SplitType
  is_active: boolean
  generated_at: string
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

// Active session state
export interface SetState {
  completed: boolean
  reps: number
  weight: number
}
