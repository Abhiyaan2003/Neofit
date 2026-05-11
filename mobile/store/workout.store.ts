import { create } from 'zustand'
import { WorkoutExercise, SetState } from '@/types'

interface WorkoutStore {
  // Active session
  sessionId: string | null
  workoutId: string | null
  exercises: WorkoutExercise[]
  sets: SetState[][]
  currentIdx: number
  elapsedSeconds: number
  isResting: boolean
  restSeconds: number

  // Actions
  initSession: (sessionId: string, workoutId: string, exercises: WorkoutExercise[]) => void
  completeSet: (exerciseIdx: number, setIdx: number) => void
  nextExercise: () => void
  tickElapsed: () => void
  tickRest: () => void
  skipRest: () => void
  startRest: (seconds: number) => void
  reset: () => void
}

const initialState = {
  sessionId: null,
  workoutId: null,
  exercises: [],
  sets: [],
  currentIdx: 0,
  elapsedSeconds: 0,
  isResting: false,
  restSeconds: 0,
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  ...initialState,

  initSession: (sessionId, workoutId, exercises) => {
    const sets = exercises.map(ex =>
      Array.from({ length: ex.sets }, () => ({
        completed: false,
        reps: parseInt(ex.reps.split('-')[1] || ex.reps) || 10,
        weight: 0,
      }))
    )
    set({ sessionId, workoutId, exercises, sets, currentIdx: 0, elapsedSeconds: 0 })
  },

  completeSet: (exerciseIdx, setIdx) => {
    const { sets } = get()
    const updated = sets.map((ex, i) =>
      i === exerciseIdx
        ? ex.map((s, j) => j === setIdx ? { ...s, completed: true } : s)
        : ex
    )
    set({ sets: updated })
  },

  nextExercise: () => {
    const { currentIdx, exercises } = get()
    if (currentIdx < exercises.length - 1) {
      set({ currentIdx: currentIdx + 1, isResting: false, restSeconds: 0 })
    }
  },

  tickElapsed: () => set(s => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
  tickRest: () => {
    const { restSeconds } = get()
    if (restSeconds > 0) {
      set(s => ({ restSeconds: s.restSeconds - 1 }))
    } else {
      set({ isResting: false })
    }
  },
  skipRest: () => set({ isResting: false, restSeconds: 0 }),
  startRest: (seconds) => set({ isResting: true, restSeconds: seconds }),
  reset: () => set(initialState),
}))
