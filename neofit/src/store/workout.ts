import { create } from 'zustand'

export interface WorkoutSetState {
  completed: boolean
  reps: number
  weight: number
  isPR: boolean
  rpe?: number
}

export interface WorkoutExerciseState {
  exerciseId: string
  exerciseSlug: string
  exerciseName: string
  section: string
  targetSets: number
  targetReps: string
  restSeconds: number
  isCompleted: boolean
  sets: WorkoutSetState[]
  // Progression context
  lastWeight: number | null
  lastReps: number | null
  progressionCue: string | null
}

export interface ActiveWorkoutSession {
  sessionId: string | null
  workoutId: string
  dayLabel: string
  focus: string
  exercises: WorkoutExerciseState[]
  currentExerciseIndex: number
  startedAt: number
  totalVolume: number
  prsHit: number
}

interface WorkoutStore {
  session: ActiveWorkoutSession | null
  isResting: boolean
  restTimeRemaining: number

  // Session management
  startSession: (session: ActiveWorkoutSession) => void
  endSession: () => void

  // Set logging
  updateSetWeight: (exerciseIndex: number, setIndex: number, weight: number) => void
  updateSetReps: (exerciseIndex: number, setIndex: number, reps: number) => void
  completeSet: (exerciseIndex: number, setIndex: number) => void
  markSetAsPR: (exerciseIndex: number, setIndex: number) => void
  updateSetRPE: (exerciseIndex: number, setIndex: number, rpe: number) => void

  // Navigation
  nextExercise: () => void
  prevExercise: () => void
  goToExercise: (index: number) => void

  // Rest timer
  setResting: (val: boolean) => void
  setRestTime: (seconds: number) => void
  tickRest: () => void
  swapExercise: (index: number, newExercise: any) => void

  // Computed
  getCompletedSetsCount: () => number
  getTotalSetsCount: () => number
  getSessionVolume: () => number
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  session: null,
  isResting: false,
  restTimeRemaining: 0,

  startSession: (session) => set({ session }),

  endSession: () => set({ session: null, isResting: false, restTimeRemaining: 0 }),

  updateSetWeight: (exerciseIndex, setIndex, weight) => {
    const { session } = get()
    if (!session) return
    const exercises = [...session.exercises]
    const exercise = { ...exercises[exerciseIndex] }
    const sets = [...exercise.sets]
    sets[setIndex] = { ...sets[setIndex], weight }
    exercise.sets = sets
    exercises[exerciseIndex] = exercise
    set({ session: { ...session, exercises } })
  },

  updateSetReps: (exerciseIndex, setIndex, reps) => {
    const { session } = get()
    if (!session) return
    const exercises = [...session.exercises]
    const exercise = { ...exercises[exerciseIndex] }
    const sets = [...exercise.sets]
    sets[setIndex] = { ...sets[setIndex], reps }
    exercise.sets = sets
    exercises[exerciseIndex] = exercise
    set({ session: { ...session, exercises } })
  },

  completeSet: (exerciseIndex, setIndex) => {
    const { session } = get()
    if (!session) return
    const exercises = [...session.exercises]
    const exercise = { ...exercises[exerciseIndex] }
    const sets = [...exercise.sets]
    sets[setIndex] = { ...sets[setIndex], completed: true }
    exercise.sets = sets
    exercise.isCompleted = sets.every(s => s.completed)
    exercises[exerciseIndex] = exercise

    // Update volume
    const completedSet = sets[setIndex]
    const addedVolume = completedSet.weight * completedSet.reps

    set({
      session: {
        ...session,
        exercises,
        totalVolume: session.totalVolume + addedVolume,
      },
    })
  },

  markSetAsPR: (exerciseIndex, setIndex) => {
    const { session } = get()
    if (!session) return
    const exercises = [...session.exercises]
    const exercise = { ...exercises[exerciseIndex] }
    const sets = [...exercise.sets]
    sets[setIndex] = { ...sets[setIndex], isPR: true }
    exercise.sets = sets
    exercises[exerciseIndex] = exercise
    set({
      session: {
        ...session,
        exercises,
        prsHit: session.prsHit + 1,
      },
    })
  },

  updateSetRPE: (exerciseIndex, setIndex, rpe) => {
    const { session } = get()
    if (!session) return
    const exercises = [...session.exercises]
    const exercise = { ...exercises[exerciseIndex] }
    const sets = [...exercise.sets]
    sets[setIndex] = { ...sets[setIndex], rpe }
    exercise.sets = sets
    exercises[exerciseIndex] = exercise
    set({ session: { ...session, exercises } })
  },

  nextExercise: () => {
    const { session } = get()
    if (!session) return
    const nextIndex = Math.min(session.currentExerciseIndex + 1, session.exercises.length - 1)
    set({
      session: { ...session, currentExerciseIndex: nextIndex },
      isResting: false,
      restTimeRemaining: 0,
    })
  },

  prevExercise: () => {
    const { session } = get()
    if (!session) return
    const prevIndex = Math.max(session.currentExerciseIndex - 1, 0)
    set({
      session: { ...session, currentExerciseIndex: prevIndex },
      isResting: false,
      restTimeRemaining: 0,
    })
  },

  goToExercise: (index) => {
    const { session } = get()
    if (!session) return
    set({
      session: { ...session, currentExerciseIndex: index },
      isResting: false,
      restTimeRemaining: 0,
    })
  },

  setResting: (val) => set({ isResting: val }),
  setRestTime: (seconds) => set({ restTimeRemaining: seconds }),
  tickRest: () => {
    const { restTimeRemaining } = get()
    if (restTimeRemaining <= 1) {
      set({ isResting: false, restTimeRemaining: 0 })
    } else {
      set({ restTimeRemaining: restTimeRemaining - 1 })
    }
  },

  getCompletedSetsCount: () => {
    const { session } = get()
    if (!session) return 0
    return session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)
  },

  getTotalSetsCount: () => {
    const { session } = get()
    if (!session) return 0
    return session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  },

  getSessionVolume: () => {
    const { session } = get()
    if (!session) return 0
    return session.totalVolume
  },

  swapExercise: (index, newExercise) => {
    const { session } = get()
    if (!session) return
    const exercises = [...session.exercises]
    exercises[index] = {
      ...exercises[index],
      exerciseId: newExercise.id || exercises[index].exerciseId,
      exerciseSlug: newExercise.slug,
      exerciseName: newExercise.name,
    }
    set({ session: { ...session, exercises } })
  },
}))
