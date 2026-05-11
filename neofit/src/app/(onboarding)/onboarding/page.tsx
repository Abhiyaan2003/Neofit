'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { WelcomeStep } from '@/features/onboarding/WelcomeStep'
import { GoalStep } from '@/features/onboarding/GoalStep'
import { ExperienceStep } from '@/features/onboarding/ExperienceStep'
import { MeasurementsStep } from '@/features/onboarding/MeasurementsStep'
import { FrequencyStep } from '@/features/onboarding/FrequencyStep'
import { BuildGymStep } from '@/features/onboarding/BuildGymStep'
import { GeneratingStep } from '@/features/onboarding/GeneratingStep'
import { AnimatePresence, motion } from 'framer-motion'

const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  goal: GoalStep,
  experience: ExperienceStep,
  measurements: MeasurementsStep,
  frequency: FrequencyStep,
  build_gym: BuildGymStep,
  generating: GeneratingStep,
}

export default function OnboardingPage() {
  const { currentStep, stepIndex } = useOnboardingStore()
  const StepComponent = STEP_COMPONENTS[currentStep]

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      {/* Progress bar (skip on welcome/generating) */}
      {currentStep !== 'welcome' && currentStep !== 'generating' && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-[#8BAE9E]"
            initial={false}
            animate={{ width: `${((stepIndex - 1) / 5) * 100}%` }}
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
