import { GymPreset, EquipmentItem, PhysiqueProgram, SplitType, Goal, ExperienceLevel } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  GYM PRESETS — pre-fill equipment selections
// ═══════════════════════════════════════════════════════════════════════

export const GYM_PRESETS: Record<GymPreset, EquipmentItem[]> = {
  college_gym: ['dumbbells', 'barbell', 'bench', 'incline_bench', 'pullup_bar', 'lat_pulldown_machine', 'leg_press_machine', 'leg_extension_machine', 'cable_machine', 'stationary_bike', 'treadmill'],
  dumbbell_only: ['dumbbells', 'bench', 'incline_bench'],
  minimal: ['dumbbells', 'bench', 'pullup_bar', 'resistance_bands', 'yoga_mat'],
  full_gym: ['dumbbells', 'barbell', 'bench', 'incline_bench', 'decline_bench', 'pullup_bar', 'cable_machine', 'smith_machine', 'leg_press_machine', 'leg_extension_machine', 'leg_curl_machine', 'lat_pulldown_machine', 'chest_press_machine', 'shoulder_press_machine', 'seated_row_machine', 't_bar_row_machine', 'hack_squat_machine', 'pec_deck_machine', 'lateral_raise_machine', 'calf_raise_machine', 'preacher_bench', 'roman_chair', 'dip_bars', 'plyo_box', 'kettlebell', 'resistance_bands', 'treadmill', 'stationary_bike', 'rower', 'medicine_ball', 'battle_ropes', 'landmine', 'step_platform', 'yoga_mat', 'trx'],
  custom: [],
}

// ═══════════════════════════════════════════════════════════════════════
//  EQUIPMENT METADATA
// ═══════════════════════════════════════════════════════════════════════

export const EQUIPMENT_ITEMS: { id: EquipmentItem; label: string; icon: string }[] = [
  { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { id: 'barbell', label: 'Barbell', icon: '🔩' },
  { id: 'bench', label: 'Flat Bench', icon: '🪑' },
  { id: 'incline_bench', label: 'Incline Bench', icon: '📐' },
  { id: 'decline_bench', label: 'Decline Bench', icon: '📉' },
  { id: 'pullup_bar', label: 'Pull-Up Bar', icon: '🔝' },
  { id: 'cable_machine', label: 'Cable Machine', icon: '🔗' },
  { id: 'smith_machine', label: 'Smith Machine', icon: '⚙️' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: '🔴' },
  { id: 'kettlebell', label: 'Kettlebell', icon: '🔔' },
  { id: 'dip_bars', label: 'Dip Bars', icon: '💪' },
  { id: 'leg_press_machine', label: 'Leg Press', icon: '🦵' },
  { id: 'leg_extension_machine', label: 'Leg Extension', icon: '🦿' },
  { id: 'leg_curl_machine', label: 'Leg Curl', icon: '🦿' },
  { id: 'lat_pulldown_machine', label: 'Lat Pulldown', icon: '📥' },
  { id: 'chest_press_machine', label: 'Chest Press', icon: '🫁' },
  { id: 'shoulder_press_machine', label: 'Shoulder Press', icon: '🔼' },
  { id: 'seated_row_machine', label: 'Seated Row', icon: '🚣' },
  { id: 't_bar_row_machine', label: 'T-Bar Row', icon: '⚓' },
  { id: 'hack_squat_machine', label: 'Hack Squat', icon: '🏗️' },
  { id: 'pec_deck_machine', label: 'Pec Deck', icon: '🦋' },
  { id: 'lateral_raise_machine', label: 'Lateral Raise', icon: '👐' },
  { id: 'calf_raise_machine', label: 'Calf Raise', icon: '🦶' },
  { id: 'preacher_bench', label: 'Preacher Bench', icon: '⛪' },
  { id: 'roman_chair', label: 'Roman Chair', icon: '🏛️' },
  { id: 'plyo_box', label: 'Plyo Box', icon: '📦' },
  { id: 'ab_wheel', label: 'Ab Wheel', icon: '🎡' },
  { id: 'treadmill', label: 'Treadmill', icon: '🏃' },
  { id: 'stationary_bike', label: 'Stationary Bike', icon: '🚲' },
  { id: 'rower', label: 'Rower', icon: '🛶' },
  { id: 'medicine_ball', label: 'Medicine Ball', icon: '🏀' },
  { id: 'battle_ropes', label: 'Battle Ropes', icon: '〰️' },
  { id: 'landmine', label: 'Landmine', icon: '🧨' },
  { id: 'step_platform', label: 'Step Platform', icon: '🪜' },
  { id: 'yoga_mat', label: 'Yoga Mat', icon: '🧘' },
  { id: 'trx', label: 'TRX', icon: '🔱' },
]

// ═══════════════════════════════════════════════════════════════════════
//  LABEL MAPS
// ═══════════════════════════════════════════════════════════════════════

export const GOAL_LABELS: Record<Goal, { label: string; description: string; icon: string }> = {
  muscle_gain: { label: 'Muscle Gain', description: 'Build size and strength', icon: '💪' },
  fat_loss: { label: 'Fat Loss', description: 'Burn fat, stay lean', icon: '🔥' },
  strength: { label: 'Strength', description: 'Get stronger, lift heavier', icon: '🏋️' },
  athletic_performance: { label: 'Athletic Performance', description: 'Speed, power, agility', icon: '⚡' },
}

export const SPLIT_LABELS: Record<SplitType, { label: string; description: string; icon: string }> = {
  bro_split: { label: 'Bro Split', description: 'One muscle group per day', icon: '💪' },
  ppl: { label: 'Push / Pull / Legs', description: 'Classic 3-way split', icon: '🔄' },
  upper_lower: { label: 'Upper / Lower', description: 'Alternating upper and lower', icon: '⬆️' },
  full_body: { label: 'Full Body', description: 'Train everything each session', icon: '🫂' },
  physique: { label: 'Physique Mode', description: 'Adaptive muscle-priority system', icon: '✨' },
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, { label: string; description: string; icon: string }> = {
  beginner: { label: 'Beginner', description: '0-1 year of training', icon: '🌱' },
  intermediate: { label: 'Intermediate', description: '1-3 years of experience', icon: '🔥' },
  advanced: { label: 'Advanced', description: '3+ years of serious training', icon: '👑' },
}

export const MUSCLE_COLORS: Record<string, string> = {
  chest: '#8BAE9E', upper_chest: '#7DA68F', back: '#74A5C6', lats: '#5D98BD',
  shoulders: '#C6A274', side_delts: '#D4AC6E', rear_delts: '#C9A15A', front_delts: '#BF9E6A',
  traps: '#94A3B8', biceps: '#74C69D', triceps: '#C67474', forearms: '#A3B899',
  quads: '#A274C6', hamstrings: '#7474C6', glutes: '#C68874', calves: '#B085C5',
  core: '#C6C274', obliques: '#BFBB6E', lower_back: '#9E8BAE', hip_flexors: '#AE8B9E',
  full_body: '#9E8BAE',
}
