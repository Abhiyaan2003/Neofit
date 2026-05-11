import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OnboardingData } from '@/types'

type OnboardingStep = 
  | 'welcome' 
  | 'goal' 
  | 'experience' 
  | 'measurements' 
  | 'frequency' 
  | 'build_gym' 
  | 'generating'

const STEPS: OnboardingStep[] = [
  'welcome',
  'goal',
  'experience',
  'measurements',
  'frequency',
  'build_gym',
  'generating',
]

interface OnboardingStore {
  currentStep: OnboardingStep
  stepIndex: number
  data: OnboardingData
  isSubmitting: boolean
  
  goNext: () => void
  goPrev: () => void
  goToStep: (step: OnboardingStep) => void
  updateData: (partial: Partial<OnboardingData>) => void
  setSubmitting: (val: boolean) => void
  reset: () => void
}

const initialData: OnboardingData = {
  goal: null,
  experience_level: null,
  age: null,
  height_cm: null,
  weight_kg: null,
  workout_frequency: null,
  gym_preset: null,
  selected_equipment: [],
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep: 'welcome',
      stepIndex: 0,
      data: initialData,
      isSubmitting: false,

      goNext: () => {
        const { stepIndex } = get()
        if (stepIndex < STEPS.length - 1) {
          const nextIndex = stepIndex + 1
          set({ stepIndex: nextIndex, currentStep: STEPS[nextIndex] })
        }
      },

      goPrev: () => {
        const { stepIndex } = get()
        if (stepIndex > 0) {
          const prevIndex = stepIndex - 1
          set({ stepIndex: prevIndex, currentStep: STEPS[prevIndex] })
        }
      },

      goToStep: (step) => {
        const idx = STEPS.indexOf(step)
        if (idx !== -1) set({ stepIndex: idx, currentStep: step })
      },

      updateData: (partial) => {
        set(state => ({ data: { ...state.data, ...partial } }))
      },

      setSubmitting: (val) => set({ isSubmitting: val }),

      reset: () => set({ currentStep: 'welcome', stepIndex: 0, data: initialData, isSubmitting: false }),
    }),
    { name: 'neofit-onboarding' }
  )
)

export const TOTAL_STEPS = STEPS.length
