import { PhysiqueProgramDef } from '@/types'

export const PHYSIQUE_PROGRAMS: Record<string, PhysiqueProgramDef> = {
  v_taper: {
    id: 'v_taper',
    name: 'V-Taper',
    tagline: 'Wide shoulders, narrow waist',
    description: 'Build the classic V-shaped physique by prioritizing shoulder width, lat spread, and core definition.',
    icon: '🔺',
    accentColor: '#6366F1',
    musclePriorities: {
      lats: 10, side_delts: 10, upper_chest: 8, rear_delts: 7,
      core: 8, shoulders: 9, back: 8, triceps: 6, biceps: 5,
      quads: 5, hamstrings: 4, glutes: 4, calves: 3,
    },
    recommendedSplit: 'ppl',
    recommendedFrequency: 5,
    weeklyVolumeTargets: [
      { muscle: 'lats', minSets: 14, maxSets: 20 },
      { muscle: 'side_delts', minSets: 12, maxSets: 18 },
      { muscle: 'upper_chest', minSets: 10, maxSets: 14 },
      { muscle: 'rear_delts', minSets: 8, maxSets: 12 },
      { muscle: 'core', minSets: 8, maxSets: 12 },
    ],
    keyExerciseSlugs: [
      'pull-up', 'lat-pulldown', 'dumbbell-lateral-raise', 'cable-lateral-raise',
      'incline-dumbbell-press', 'face-pull', 'hanging-leg-raise',
    ],
  },

  aesthetic_physique: {
    id: 'aesthetic_physique',
    name: 'Aesthetic Physique',
    tagline: 'Balanced, proportional, and sculpted',
    description: 'Build a symmetrical, well-proportioned physique with balanced muscle development across all groups.',
    icon: '✨',
    accentColor: '#8B5CF6',
    musclePriorities: {
      chest: 8, upper_chest: 8, back: 8, lats: 8, shoulders: 8,
      side_delts: 8, rear_delts: 7, biceps: 7, triceps: 7,
      quads: 7, hamstrings: 7, glutes: 6, calves: 6, core: 7,
    },
    recommendedSplit: 'ppl',
    recommendedFrequency: 6,
    weeklyVolumeTargets: [
      { muscle: 'chest', minSets: 12, maxSets: 16 },
      { muscle: 'back', minSets: 12, maxSets: 16 },
      { muscle: 'shoulders', minSets: 10, maxSets: 14 },
      { muscle: 'quads', minSets: 10, maxSets: 14 },
      { muscle: 'biceps', minSets: 8, maxSets: 12 },
      { muscle: 'triceps', minSets: 8, maxSets: 12 },
    ],
    keyExerciseSlugs: [
      'barbell-bench-press', 'incline-dumbbell-press', 'barbell-row',
      'pull-up', 'overhead-press', 'barbell-squat', 'romanian-deadlift',
    ],
  },

  lean_athletic: {
    id: 'lean_athletic',
    name: 'Lean Athletic',
    tagline: 'Fast, functional, and shredded',
    description: 'Build an athletic body optimized for performance, speed, and conditioning with a lean aesthetic.',
    icon: '⚡',
    accentColor: '#F59E0B',
    musclePriorities: {
      core: 9, glutes: 8, quads: 8, hamstrings: 8, shoulders: 7,
      back: 7, chest: 6, lats: 6, calves: 7, hip_flexors: 6,
      biceps: 4, triceps: 4,
    },
    recommendedSplit: 'upper_lower',
    recommendedFrequency: 4,
    weeklyVolumeTargets: [
      { muscle: 'core', minSets: 10, maxSets: 16 },
      { muscle: 'glutes', minSets: 10, maxSets: 14 },
      { muscle: 'quads', minSets: 10, maxSets: 14 },
      { muscle: 'hamstrings', minSets: 8, maxSets: 12 },
      { muscle: 'back', minSets: 8, maxSets: 12 },
    ],
    keyExerciseSlugs: [
      'barbell-squat', 'deadlift', 'pull-up', 'burpees',
      'box-jumps', 'mountain-climbers', 'plank',
    ],
  },

  mass_monster: {
    id: 'mass_monster',
    name: 'Mass Monster',
    tagline: 'Maximum size and strength',
    description: 'Prioritize heavy compound movements and high volume to pack on maximum muscle mass.',
    icon: '🦍',
    accentColor: '#EF4444',
    musclePriorities: {
      chest: 10, back: 10, quads: 10, hamstrings: 9, shoulders: 9,
      glutes: 8, triceps: 8, biceps: 7, lats: 8, traps: 7,
      calves: 5, core: 5,
    },
    recommendedSplit: 'bro_split',
    recommendedFrequency: 5,
    weeklyVolumeTargets: [
      { muscle: 'chest', minSets: 14, maxSets: 20 },
      { muscle: 'back', minSets: 14, maxSets: 20 },
      { muscle: 'quads', minSets: 12, maxSets: 18 },
      { muscle: 'shoulders', minSets: 10, maxSets: 16 },
      { muscle: 'hamstrings', minSets: 10, maxSets: 14 },
    ],
    keyExerciseSlugs: [
      'barbell-bench-press', 'barbell-squat', 'deadlift', 'barbell-row',
      'overhead-press', 'barbell-curl', 'skull-crushers',
    ],
  },

  fat_burn_accelerator: {
    id: 'fat_burn_accelerator',
    name: 'Fat Burn Accelerator',
    tagline: 'Torch fat, build lean muscle',
    description: 'High-intensity circuits, HIIT finishers, and compound-heavy training to maximize calorie burn.',
    icon: '🔥',
    accentColor: '#F97316',
    musclePriorities: {
      core: 9, glutes: 8, quads: 8, back: 7, chest: 7,
      shoulders: 6, hamstrings: 7, lats: 6, calves: 5,
      biceps: 3, triceps: 3,
    },
    recommendedSplit: 'full_body',
    recommendedFrequency: 4,
    weeklyVolumeTargets: [
      { muscle: 'core', minSets: 10, maxSets: 16 },
      { muscle: 'glutes', minSets: 8, maxSets: 14 },
      { muscle: 'quads', minSets: 8, maxSets: 14 },
      { muscle: 'back', minSets: 8, maxSets: 12 },
      { muscle: 'chest', minSets: 8, maxSets: 12 },
    ],
    keyExerciseSlugs: [
      'burpees', 'mountain-climbers', 'jumping-jacks', 'high-knees',
      'barbell-squat', 'deadlift', 'push-up',
    ],
  },

  balanced_fitness: {
    id: 'balanced_fitness',
    name: 'Balanced Fitness',
    tagline: 'Well-rounded health and strength',
    description: 'A balanced approach to fitness covering strength, endurance, flexibility, and overall health.',
    icon: '⚖️',
    accentColor: '#10B981',
    musclePriorities: {
      chest: 7, back: 7, shoulders: 7, quads: 7, hamstrings: 7,
      glutes: 7, core: 7, biceps: 6, triceps: 6, lats: 6,
      calves: 5, rear_delts: 5, side_delts: 5,
    },
    recommendedSplit: 'upper_lower',
    recommendedFrequency: 4,
    weeklyVolumeTargets: [
      { muscle: 'chest', minSets: 8, maxSets: 12 },
      { muscle: 'back', minSets: 8, maxSets: 12 },
      { muscle: 'quads', minSets: 8, maxSets: 12 },
      { muscle: 'shoulders', minSets: 6, maxSets: 10 },
      { muscle: 'core', minSets: 6, maxSets: 10 },
    ],
    keyExerciseSlugs: [
      'barbell-bench-press', 'barbell-row', 'barbell-squat',
      'overhead-press', 'plank', 'dumbbell-lateral-raise',
    ],
  },
}
