'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PROGRAMS } from '@/constants/programs'
import { ChevronRight, Zap, Target, Calendar } from 'lucide-react'

const difficultyColor = {
  beginner: '#74C69D',
  intermediate: '#C6A274',
  advanced: '#C67474',
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
}

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] px-5 pt-14 pb-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-semibold tracking-widest text-[#8BAE9E] uppercase mb-1">
          Training Programs
        </p>
        <h1 className="text-2xl font-bold text-[#EDEDED]">Choose your program</h1>
        <p className="text-sm text-[#A8B0BE] mt-1">
          Expert-designed routines. Activate one to replace your current split.
        </p>
      </motion.div>

      {/* Programs list */}
      <div className="space-y-4">
        {PROGRAMS.map((program, i) => (
          <motion.div
            key={program.id}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <Link href={`/programs/${program.id}`}>
              <div className="relative overflow-hidden rounded-2xl bg-[#1D212B] border border-white/6 p-5 hover:border-[#8BAE9E]/30 transition-all duration-300 group">
                {/* Gradient accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
                  style={{ background: `linear-gradient(90deg, ${program.accentColor}, transparent)` }}
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {program.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#A8B0BE] border border-white/8"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-[#EDEDED] mb-1 leading-tight">
                      {program.name}
                    </h2>
                    <p className="text-sm text-[#A8B0BE] leading-relaxed line-clamp-2">
                      {program.tagline}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#A8B0BE]/40 mt-1 flex-shrink-0 group-hover:text-[#8BAE9E] transition-colors" />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A8B0BE]/60" />
                    <span className="text-xs text-[#A8B0BE]">{program.daysPerWeek} days/week</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#A8B0BE]/60" />
                    <span className="text-xs text-[#A8B0BE]">{program.split_type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" style={{ color: difficultyColor[program.difficulty] }} />
                    <span
                      className="text-xs font-medium capitalize"
                      style={{ color: difficultyColor[program.difficulty] }}
                    >
                      {program.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Coming soon */}
      <motion.div
        className="mt-6 rounded-2xl border border-dashed border-white/10 p-5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-[#A8B0BE]/50">More programs coming soon</p>
        <p className="text-xs text-[#A8B0BE]/30 mt-1">Fat loss, strength & beginner plans</p>
      </motion.div>
    </div>
  )
}
