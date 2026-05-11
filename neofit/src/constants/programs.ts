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
  split_type: 'push_pull_legs',
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

// Registry of all available programs
export const PROGRAMS: Program[] = [V_TAPER_PROGRAM]
