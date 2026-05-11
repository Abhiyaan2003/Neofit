import { GymPreset } from '@/types'

export const GYM_PRESETS: Record<GymPreset, string[]> = {
  college_gym: ['Dumbbells', 'Barbell', 'Flat Bench', 'Weight Plates', 'Lat Pulldown Machine', 'Leg Press Machine', 'Leg Extension Machine', 'Pull-up Bar', 'Treadmill', 'Stationary Bike'],
  dumbbell_only: ['Dumbbells', 'Flat Bench', 'Incline Bench'],
  minimal: ['Dumbbells', 'Flat Bench', 'Pull-up Bar', 'Resistance Bands'],
  full_gym: ['Dumbbells', 'Barbell', 'Flat Bench', 'Incline Bench', 'Weight Plates', 'Chest Press Machine', 'Leg Extension Machine', 'Lat Pulldown Machine', 'Cable Machine', 'Leg Press Machine', 'Smith Machine', 'Seated Row Machine', 'Leg Curl Machine', 'Pull-up Bar', 'Resistance Bands', 'Kettlebells', 'Dip Bars', 'Treadmill', 'Stationary Bike', 'Rowing Machine'],
  custom: [],
}

export const GOAL_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  muscle_gain: { label: 'Muscle Gain', description: 'Build size and definition', icon: '💪' },
  fat_loss: { label: 'Fat Loss', description: 'Burn fat, stay lean', icon: '🔥' },
  strength: { label: 'Strength', description: 'Get stronger, lift heavier', icon: '🏋️' },
  athletic: { label: 'Athletic Physique', description: 'Functional, sport-ready body', icon: '⚡' },
  beginner: { label: 'Beginner Fitness', description: 'Start your fitness journey', icon: '🌱' },
}

export const EXPERIENCE_LABELS: Record<string, { label: string; description: string }> = {
  beginner: { label: 'Beginner', description: '0-1 year of consistent training' },
  intermediate: { label: 'Intermediate', description: '1-3 years of experience' },
  advanced: { label: 'Advanced', description: '3+ years of serious training' },
}

export const MUSCLE_COLORS: Record<string, string> = {
  chest: '#8BAE9E',
  back: '#74A5C6',
  shoulders: '#C6A274',
  legs: '#A274C6',
  biceps: '#74C69D',
  triceps: '#C67474',
  core: '#C6C274',
  glutes: '#C68874',
  hamstrings: '#7474C6',
}

export const SPLIT_LABELS: Record<string, string> = {
  push_pull_legs: 'Push / Pull / Legs',
  upper_lower: 'Upper / Lower',
  bro_split: 'Body Part Split',
  full_body: 'Full Body',
}
