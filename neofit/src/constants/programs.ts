import { SplitType } from '@/types'

export interface ProgramExercise {
  slug: string
  sets: number
  reps: string
  restTime: number
  notes?: string
}

export interface ProgramDay {
  dayLabel: string
  focus: string
  exercises: ProgramExercise[]
  estimatedDuration: number
}

export interface Program {
  id: string
  name: string
  tagline: string
  description: string
  split_type: SplitType
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  daysPerWeek: number
  weeklySchedule: string[] // e.g. ['Push','Pull','Legs','Rest','Push','Pull','Legs']
  tags: string[]
  accentColor: string
  days: ProgramDay[]
  coreExercises: ProgramExercise[]
}

// ─────────────────────────────────────────────────────────
// V-TAPER PHYSIQUE PROGRAM
// ─────────────────────────────────────────────────────────
export const V_TAPER_PROGRAM: Program = {
  id: 'v-taper',
  name: 'V-Taper Physique',
  tagline: 'Build a wide back, capped shoulders & a narrow waist',
  description:
    'A 6-day Push/Pull/Legs split engineered for the classic V-taper aesthetic. Prioritises lat width, shoulder width (especially side and rear delts), upper chest thickness, and a tight core. Suitable for intermediate lifters training 5–6 days per week.',
  split_type: 'ppl',
  difficulty: 'intermediate',
  daysPerWeek: 6,
  weeklySchedule: ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Legs'],
  tags: ['Aesthetics', 'PPL', 'V-Taper', 'Hypertrophy'],
  accentColor: '#8BAE9E',

  days: [
    // ── PUSH ──────────────────────────────────────────────
    {
      dayLabel: 'Push',
      focus: 'Chest, Shoulders & Triceps',
      estimatedDuration: 75,
      exercises: [
        { slug: 'incline-dumbbell-press',      sets: 4, reps: '8-12',  restTime: 90 },
        { slug: 'barbell-bench-press',          sets: 4, reps: '6-10',  restTime: 90 },
        { slug: 'tricep-dip',                   sets: 3, reps: '10-15', restTime: 75 },
        { slug: 'cable-fly',                    sets: 3, reps: '12-15', restTime: 60 },
        { slug: 'barbell-overhead-press',       sets: 4, reps: '8-10',  restTime: 90 },
        { slug: 'dumbbell-lateral-raise',       sets: 4, reps: '12-15', restTime: 45 },
        { slug: 'rear-delt-fly',                sets: 3, reps: '12-15', restTime: 45 },
        { slug: 'tricep-pushdown',              sets: 3, reps: '10-15', restTime: 45 },
        { slug: 'overhead-tricep-extension',    sets: 3, reps: '10-12', restTime: 45 },
      ],
    },
    // ── PULL ──────────────────────────────────────────────
    {
      dayLabel: 'Pull',
      focus: 'Back & Biceps',
      estimatedDuration: 65,
      exercises: [
        { slug: 'pull-up',                sets: 4, reps: '6-12',  restTime: 90 },
        { slug: 'lat-pulldown',           sets: 4, reps: '10-12', restTime: 75 },
        { slug: 'barbell-bent-over-row',  sets: 4, reps: '8-12',  restTime: 90 },
        { slug: 'seated-cable-row',       sets: 3, reps: '10-12', restTime: 75 },
        { slug: 'face-pull',              sets: 3, reps: '12-15', restTime: 45 },
        { slug: 'barbell-curl',           sets: 3, reps: '10-12', restTime: 45 },
        { slug: 'hammer-curl',            sets: 3, reps: '10-12', restTime: 45 },
      ],
    },
    // ── LEGS ──────────────────────────────────────────────
    {
      dayLabel: 'Legs',
      focus: 'Quads, Hamstrings, Glutes & Calves',
      estimatedDuration: 70,
      exercises: [
        { slug: 'barbell-back-squat',      sets: 4, reps: '6-10',        restTime: 120 },
        { slug: 'romanian-deadlift',       sets: 4, reps: '8-12',        restTime: 90  },
        { slug: 'dumbbell-walking-lunge',  sets: 3, reps: '12 each leg', restTime: 60  },
        { slug: 'leg-press',               sets: 3, reps: '10-15',       restTime: 75  },
        { slug: 'leg-curl',                sets: 3, reps: '12-15',       restTime: 45  },
        { slug: 'calf-raise',              sets: 4, reps: '15-20',       restTime: 30  },
      ],
    },
  ],

  coreExercises: [
    { slug: 'plank',            sets: 3, reps: '60s',          restTime: 60 },
    { slug: 'hanging-leg-raise', sets: 3, reps: '12-15',       restTime: 45 },
    { slug: 'dead-bug',         sets: 3, reps: '12 each side', restTime: 45 },
    { slug: 'cable-crunch',     sets: 3, reps: '15',           restTime: 45 },
    { slug: 'vacuum-hold',      sets: 3, reps: '30s',          restTime: 30 },
  ],
}

// ─────────────────────────────────────────────────────────
// AESTHETIC PHYSIQUE PROGRAM
// ─────────────────────────────────────────────────────────
export const AESTHETIC_PHYSIQUE_PROGRAM: Program = {
  id: 'aesthetic-physique',
  name: 'Aesthetic Physique',
  tagline: 'Balanced, proportional, and sculpted',
  description: 'A 6-day split designed for symmetry and proportion. Hits every muscle group with the ideal frequency for hypertrophy.',
  split_type: 'ppl',
  difficulty: 'intermediate',
  daysPerWeek: 6,
  weeklySchedule: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
  tags: ['Symmetry', 'Aesthetics', 'Hypertrophy'],
  accentColor: '#8B5CF6',
  days: [
    {
      dayLabel: 'Push (A)',
      focus: 'Chest, Shoulders, Triceps',
      estimatedDuration: 60,
      exercises: [
        { slug: 'barbell-bench-press', sets: 3, reps: '8-10', restTime: 120 },
        { slug: 'incline-dumbbell-press', sets: 3, reps: '10-12', restTime: 90 },
        { slug: 'dumbbell-lateral-raise', sets: 4, reps: '12-15', restTime: 60 },
        { slug: 'tricep-pushdown', sets: 3, reps: '12-15', restTime: 60 },
      ]
    },
    {
      dayLabel: 'Pull (A)',
      focus: 'Back, Biceps, Rear Delts',
      estimatedDuration: 60,
      exercises: [
        { slug: 'barbell-row', sets: 3, reps: '8-10', restTime: 120 },
        { slug: 'lat-pulldown', sets: 3, reps: '10-12', restTime: 90 },
        { slug: 'face-pull', sets: 3, reps: '15-20', restTime: 60 },
        { slug: 'barbell-curl', sets: 3, reps: '10-12', restTime: 60 },
      ]
    },
    {
      dayLabel: 'Legs (A)',
      focus: 'Quads, Hams, Glutes',
      estimatedDuration: 60,
      exercises: [
        { slug: 'barbell-squat', sets: 3, reps: '6-8', restTime: 180 },
        { slug: 'leg-press', sets: 3, reps: '10-12', restTime: 90 },
        { slug: 'leg-curl', sets: 3, reps: '12-15', restTime: 60 },
        { slug: 'calf-raise', sets: 4, reps: '15-20', restTime: 60 },
      ]
    }
  ],
  coreExercises: [
    { slug: 'hanging-leg-raise', sets: 3, reps: '15', restTime: 60 },
    { slug: 'plank', sets: 3, reps: '60s', restTime: 60 },
  ]
}

// ─────────────────────────────────────────────────────────
// LEAN ATHLETIC PROGRAM
// ─────────────────────────────────────────────────────────
export const LEAN_ATHLETIC_PROGRAM: Program = {
  id: 'lean-athletic',
  name: 'Lean Athletic',
  tagline: 'Fast, functional, and shredded',
  description: 'An upper/lower split focused on functional strength, explosiveness, and conditioning.',
  split_type: 'upper_lower',
  difficulty: 'intermediate',
  daysPerWeek: 4,
  weeklySchedule: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
  tags: ['Performance', 'Athleticism', 'Conditioning'],
  accentColor: '#F59E0B',
  days: [
    {
      dayLabel: 'Upper Body',
      focus: 'Power & Speed',
      estimatedDuration: 50,
      exercises: [
        { slug: 'pull-up', sets: 4, reps: '8-10', restTime: 90 },
        { slug: 'overhead-press', sets: 3, reps: '8-10', restTime: 90 },
        { slug: 'push-up', sets: 3, reps: 'AMRAP', restTime: 60 },
      ]
    },
    {
      dayLabel: 'Lower Body',
      focus: 'Explosiveness',
      estimatedDuration: 50,
      exercises: [
        { slug: 'barbell-squat', sets: 3, reps: '5-8', restTime: 120 },
        { slug: 'box-jumps', sets: 4, reps: '10', restTime: 90 },
        { slug: 'deadlift', sets: 3, reps: '5', restTime: 180 },
      ]
    }
  ],
  coreExercises: [
    { slug: 'mountain-climbers', sets: 3, reps: '30s', restTime: 45 },
    { slug: 'burpees', sets: 3, reps: '15', restTime: 60 },
  ]
}

// ─────────────────────────────────────────────────────────
// MASS MONSTER PROGRAM
// ─────────────────────────────────────────────────────────
export const MASS_MONSTER_PROGRAM: Program = {
  id: 'mass-monster',
  name: 'Mass Monster',
  tagline: 'Maximum size and strength',
  description: 'A classic high-volume bro-split for maximal hypertrophy and raw power.',
  split_type: 'bro_split',
  difficulty: 'advanced',
  daysPerWeek: 5,
  weeklySchedule: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Rest', 'Rest'],
  tags: ['Bodybuilding', 'Mass', 'Heavy'],
  accentColor: '#EF4444',
  days: [
    {
      dayLabel: 'Chest Day',
      focus: 'Chest Hypertrophy',
      estimatedDuration: 70,
      exercises: [
        { slug: 'barbell-bench-press', sets: 4, reps: '6-8', restTime: 120 },
        { slug: 'incline-dumbbell-press', sets: 3, reps: '10-12', restTime: 90 },
        { slug: 'cable-fly', sets: 4, reps: '15', restTime: 60 },
      ]
    },
    {
      dayLabel: 'Leg Day',
      focus: 'Leg Growth',
      estimatedDuration: 75,
      exercises: [
        { slug: 'barbell-squat', sets: 4, reps: '8-10', restTime: 150 },
        { slug: 'leg-press', sets: 4, reps: '12-15', restTime: 90 },
        { slug: 'romanian-deadlift', sets: 4, reps: '10', restTime: 120 },
      ]
    }
  ],
  coreExercises: [
    { slug: 'cable-crunch', sets: 4, reps: '15', restTime: 60 },
  ]
}

// ─────────────────────────────────────────────────────────
// FAT BURN ACCELERATOR PROGRAM
// ─────────────────────────────────────────────────────────
export const FAT_BURN_ACCELERATOR_PROGRAM: Program = {
  id: 'fat-burn-accelerator',
  name: 'Fat Burn Accelerator',
  tagline: 'Torch fat, build lean muscle',
  description: 'Full-body training with minimal rest and metabolic finishers to maximize caloric expenditure.',
  split_type: 'full_body',
  difficulty: 'beginner',
  daysPerWeek: 4,
  weeklySchedule: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'HIIT'],
  tags: ['Fat Loss', 'Metabolic', 'Full Body'],
  accentColor: '#F97316',
  days: [
    {
      dayLabel: 'Metabolic Circuit',
      focus: 'High Intensity',
      estimatedDuration: 45,
      exercises: [
        { slug: 'burpees', sets: 4, reps: '15', restTime: 30 },
        { slug: 'kettlebell-swing', sets: 4, reps: '20', restTime: 30 },
        { slug: 'push-up', sets: 4, reps: '15', restTime: 30 },
      ]
    }
  ],
  coreExercises: [
    { slug: 'mountain-climbers', sets: 3, reps: '45s', restTime: 30 },
  ]
}

// ─────────────────────────────────────────────────────────
// BALANCED FITNESS PROGRAM
// ─────────────────────────────────────────────────────────
export const BALANCED_FITNESS_PROGRAM: Program = {
  id: 'balanced-fitness',
  name: 'Balanced Fitness',
  tagline: 'Well-rounded health and strength',
  description: 'Focuses on all aspects of fitness: strength, hypertrophy, and general health.',
  split_type: 'upper_lower',
  difficulty: 'beginner',
  daysPerWeek: 4,
  weeklySchedule: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
  tags: ['Health', 'Fitness', 'Longevity'],
  accentColor: '#10B981',
  days: [
    {
      dayLabel: 'Upper Body',
      focus: 'General Strength',
      estimatedDuration: 55,
      exercises: [
        { slug: 'barbell-bench-press', sets: 3, reps: '10', restTime: 90 },
        { slug: 'lat-pulldown', sets: 3, reps: '10', restTime: 90 },
        { slug: 'dumbbell-lateral-raise', sets: 3, reps: '12', restTime: 60 },
      ]
    }
  ],
  coreExercises: [
    { slug: 'plank', sets: 3, reps: '45s', restTime: 45 },
  ]
}

// Registry of all available programs
export const PROGRAMS: Program[] = [
  V_TAPER_PROGRAM,
  AESTHETIC_PHYSIQUE_PROGRAM,
  LEAN_ATHLETIC_PROGRAM,
  MASS_MONSTER_PROGRAM,
  FAT_BURN_ACCELERATOR_PROGRAM,
  BALANCED_FITNESS_PROGRAM
]
