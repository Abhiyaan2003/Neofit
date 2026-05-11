'use client'

import { use, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PROGRAMS } from '@/constants/programs'
import { activateProgram } from '@/lib/program-engine'
import { toast } from 'sonner'
import { ArrowLeft, Zap, Clock, ChevronDown, ChevronUp, Dumbbell, Target } from 'lucide-react'
import Link from 'next/link'

const DAY_COLORS: Record<string, string> = {
  Push: '#C6A274',
  Pull: '#74A5C6',
  Legs: '#A274C6',
  Rest: '#A8B0BE',
}

export default function ProgramDetailPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = use(params)
  const router = useRouter()
  const program = PROGRAMS.find(p => p.id === programId)
  const [activating, setActivating] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(0)
  const [coreExpanded, setCoreExpanded] = useState(false)

  if (!program) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <p className="text-[#A8B0BE]">Program not found</p>
      </div>
    )
  }

  const handleActivate = async () => {
    setActivating(true)
    toast.loading('Activating program…', { id: 'activate' })
    const ok = await activateProgram(program)
    toast.dismiss('activate')
    if (ok) {
      toast.success(`${program.name} activated! Your new split is ready.`)
      router.push('/workouts')
    } else {
      toast.error('Could not activate program. Please try again.')
      setActivating(false)
    }
  }

  const totalExercises = program.days.reduce((s, d) => s + d.exercises.length, 0)

  return (
    <div className="min-h-screen bg-[#0F1115] pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-14 pb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#8BAE9E]/5 blur-3xl" />
        </div>

        {/* Back */}
        <Link href="/programs" className="relative inline-flex items-center gap-1.5 text-sm text-[#A8B0BE] mb-6 hover:text-[#EDEDED] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Programs
        </Link>

        {/* Tags */}
        <div className="relative flex flex-wrap gap-1.5 mb-4">
          {program.tags.map(tag => (
            <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#A8B0BE] border border-white/8">
              {tag}
            </span>
          ))}
        </div>

        <motion.h1
          className="relative text-3xl font-bold text-[#EDEDED] mb-2 leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {program.name}
        </motion.h1>
        <motion.p
          className="relative text-sm text-[#A8B0BE] leading-relaxed mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {program.description}
        </motion.p>

        {/* Stats cards */}
        <motion.div
          className="relative grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {[
            { label: 'Days/week', value: program.daysPerWeek, icon: Zap },
            { label: 'Exercises', value: totalExercises, icon: Dumbbell },
            { label: 'Avg session', value: `${Math.round(program.days.reduce((s, d) => s + d.estimatedDuration, 0) / program.days.length)}m`, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-[#1D212B] border border-white/6 p-3 text-center">
              <Icon className="w-4 h-4 text-[#8BAE9E] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#EDEDED]">{value}</p>
              <p className="text-[10px] text-[#A8B0BE]">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Weekly schedule */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-semibold tracking-widest text-[#A8B0BE] uppercase mb-3">Weekly Schedule</h2>
        <div className="flex gap-1.5">
          {program.weeklySchedule.map((day, i) => (
            <div
              key={i}
              className="flex-1 rounded-lg py-2 text-center"
              style={{ background: day === 'Rest' ? 'rgba(255,255,255,0.04)' : `${DAY_COLORS[day]}15`, border: `1px solid ${day === 'Rest' ? 'rgba(255,255,255,0.06)' : `${DAY_COLORS[day]}30`}` }}
            >
              <p className="text-[9px] font-bold uppercase" style={{ color: DAY_COLORS[day] || '#A8B0BE' }}>
                {day.slice(0, 3)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Day breakdown */}
      <div className="px-5 mb-4">
        <h2 className="text-xs font-semibold tracking-widest text-[#A8B0BE] uppercase mb-3">Training Days</h2>
        <div className="space-y-2">
          {program.days.map((day, i) => {
            const isOpen = expandedDay === i
            const color = DAY_COLORS[day.dayLabel] || '#8BAE9E'
            return (
              <div key={i} className="rounded-2xl bg-[#1D212B] border border-white/6 overflow-hidden">
                <button
                  onClick={() => setExpandedDay(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: `${color}20`, color }}>
                      {day.dayLabel.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#EDEDED] text-sm">{day.dayLabel} Day</p>
                      <p className="text-xs text-[#A8B0BE]">{day.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[#A8B0BE]">{day.exercises.length} exercises</p>
                      <p className="text-xs text-[#A8B0BE]/60">{day.estimatedDuration}min</p>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-[#A8B0BE]/40" />
                      : <ChevronDown className="w-4 h-4 text-[#A8B0BE]/40" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                        {day.exercises.map((ex, j) => (
                          <div key={j} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] text-[#A8B0BE]/40 w-4 text-right">{j + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-[#EDEDED] capitalize">
                                  {ex.slug.replace(/-/g, ' ')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <div>
                                <p className="text-xs font-semibold text-[#EDEDED]">{ex.sets} × {ex.reps}</p>
                                <p className="text-[10px] text-[#A8B0BE]/50">{ex.restTime}s rest</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Core exercises */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl bg-[#1D212B] border border-white/6 overflow-hidden">
          <button
            onClick={() => setCoreExpanded(!coreExpanded)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-[#74C69D]/20 text-[#74C69D]">
                C
              </div>
              <div>
                <p className="font-semibold text-[#EDEDED] text-sm">Core Work</p>
                <p className="text-xs text-[#A8B0BE]">Add to any session</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-[#A8B0BE]">{program.coreExercises.length} exercises</p>
              {coreExpanded
                ? <ChevronUp className="w-4 h-4 text-[#A8B0BE]/40" />
                : <ChevronDown className="w-4 h-4 text-[#A8B0BE]/40" />}
            </div>
          </button>

          <AnimatePresence>
            {coreExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                  {program.coreExercises.map((ex, j) => (
                    <div key={j} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-[#A8B0BE]/40 w-4 text-right">{j + 1}</span>
                        <p className="text-sm font-medium text-[#EDEDED] capitalize">
                          {ex.slug.replace(/-/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#EDEDED]">{ex.sets} × {ex.reps}</p>
                        <p className="text-[10px] text-[#A8B0BE]/50">{ex.restTime}s rest</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Difficulty */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl bg-[#1D212B] border border-white/6 p-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-[#C6A274]" />
          <div>
            <p className="text-xs text-[#A8B0BE]">Difficulty</p>
            <p className="text-sm font-semibold text-[#C6A274] capitalize">{program.difficulty}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[#A8B0BE]">Recommended for</p>
            <p className="text-sm text-[#EDEDED]">1–3 yrs experience</p>
          </div>
        </div>
      </div>

      {/* Activate CTA – fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/95 to-transparent">
        <motion.button
          onClick={handleActivate}
          disabled={activating}
          className="w-full flex items-center justify-center gap-2.5 bg-[#8BAE9E] text-[#0F1115] font-bold py-4 rounded-2xl text-base disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#A3C4B4] transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {activating ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0F1115] border-t-transparent rounded-full animate-spin" />
              Activating…
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Activate {program.name}
            </>
          )}
        </motion.button>
        <p className="text-center text-xs text-[#A8B0BE]/40 mt-2">
          This will replace your current active split
        </p>
      </div>
    </div>
  )
}
