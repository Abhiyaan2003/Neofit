'use client'

import { motion } from 'framer-motion'
import { Dumbbell, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'

export function WelcomeStep() {
  const { goNext } = useOnboardingStore()

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#8BAE9E]/6 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center max-w-xs mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="w-20 h-20 rounded-3xl bg-[#8BAE9E] flex items-center justify-center mb-8 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <Dumbbell className="w-10 h-10 text-[#0F1115]" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to
          <br />
          <span className="text-gradient">Neofit</span>
        </motion.h1>

        <motion.p
          className="text-[#A8B0BE] text-base leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Let&apos;s build your personalized training plan in just a few steps. Tell us about your goals and your gym — we&apos;ll handle the rest.
        </motion.p>

        <motion.button
          onClick={goNext}
          className="group w-full flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold py-4 px-8 rounded-2xl hover:bg-[#A3C4B4] transition-colors text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          Let&apos;s get started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.p
          className="text-xs text-[#A8B0BE]/50 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Takes about 2 minutes
        </motion.p>
      </motion.div>
    </div>
  )
}
