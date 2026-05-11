import { create } from 'zustand'
import { ActiveSession, ActiveWorkoutExercise } from '@/types'

interface WorkoutStore {
  activeSession: ActiveSession | null
  isResting: boolean
  restTimeRemaining: number
  
  startSession: (session: ActiveSession) => void
  endSession: () => void
  completeSet: (exerciseIndex: number, setIndex: number, reps: number, weight: number) => void
  nextExercise: () => void
  setResting: (val: boolean) => void
  setRestTime: (seconds: number) => void
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeSession: null,
  isResting: false,
  restTimeRemaining: 0,

  startSession: (session) => set({ activeSession: session }),
  
  endSession: () => set({ activeSession: null, isResting: false, restTimeRemaining: 0 }),

  completeSet: (exerciseIndex, setIndex, reps, weight) => {
    const { activeSession } = get()
    if (!activeSession) return

    const updatedExercises = [...activeSession.exercises]
    const exercise = { ...updatedExercises[exerciseIndex] }
    const updatedSets = [...exercise.sets]
    updatedSets[setIndex] = { ...updatedSets[setIndex], reps, weight, completed: true }
    
    const allSetsComplete = updatedSets.every(s => s.completed)
    exercise.sets = updatedSets
    exercise.isCompleted = allSetsComplete
    updatedExercises[exerciseIndex] = exercise

    set({
      activeSession: { ...activeSession, exercises: updatedExercises },
    })
  },

  nextExercise: () => {
    const { activeSession } = get()
    if (!activeSession) return
    const nextIndex = Math.min(
      activeSession.currentExerciseIndex + 1,
      activeSession.exercises.length - 1
    )
    set({
      activeSession: { ...activeSession, currentExerciseIndex: nextIndex, currentSetIndex: 0 },
      isResting: false,
    })
  },

  setResting: (val) => set({ isResting: val }),
  setRestTime: (seconds) => set({ restTimeRemaining: seconds }),
}))
