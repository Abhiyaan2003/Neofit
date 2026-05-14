'use client'
// [Touched to refresh IDE]

import { useOnboardingStore, TOTAL_STEPS } from '@/store/onboarding'
import { 
  WelcomeStep, 
  GoalStep, 
  PhysiqueProgramStep, 
  ExperienceStep, 
  MeasurementsStep, 
  BuildGymStep, 
  SplitStep, 
  FrequencyStep, 
  GeneratingStep 
} from '@/features/onboarding'
import { AnimatePresence, motion } from 'framer-motion'

const STEP_COMPONENTS: Record<string, React.ComponentType> = {
  welcome: WelcomeStep,
  goal: GoalStep,
  physique_program: PhysiqueProgramStep,
  experience: ExperienceStep,
  measurements: MeasurementsStep,
  equipment: BuildGymStep,
  split: SplitStep,
  frequency: FrequencyStep,
  generating: GeneratingStep,
}

export default function OnboardingPage() {
  const { currentStep, stepIndex } = useOnboardingStore()
  const StepComponent = STEP_COMPONENTS[currentStep] || WelcomeStep

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      {currentStep !== 'welcome' && currentStep !== 'generating' && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-[#8BAE9E]"
            initial={false}
            animate={{ width: `${((stepIndex) / (TOTAL_STEPS - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 flex flex-col"
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
