'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { auditExercisePerformance, AuditResult } from '@/lib/engines/performance-audit-engine'
import { ExercisePerformance } from '@/lib/engines/progression-engine'

interface PerformanceAuditProps {
  userId: string
}

export function PerformanceAudit({ userId }: PerformanceAuditProps) {
  const [audits, setAudits] = useState<AuditResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAudits()
  }, [userId])

  const loadAudits = async () => {
    const supabase = createClient()
    
    // Get last 3 weeks of logs
    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)

    const { data: logs } = await supabase
      .from('session_exercise_logs')
      .select('exercise_slug, reps_completed, weight_kg, completed_at, exercises(name, exercise_type)')
      .eq('user_id', userId)
      .gte('completed_at', threeWeeksAgo.toISOString())
      .order('completed_at', { ascending: false })

    if (!logs || logs.length === 0) {
      setIsLoading(false)
      return
    }

    // Group logs by exercise
    const historyMap: Record<string, ExercisePerformance[]> = {}
    for (const log of logs) {
      const slug = log.exercise_slug
      if (!slug) continue
      
      const date = log.completed_at ? log.completed_at.split('T')[0] : 'unknown'
      if (!historyMap[slug]) historyMap[slug] = []
      
      let dayRecord = historyMap[slug].find(d => d.date === date)
      if (!dayRecord) {
        dayRecord = {
          exerciseSlug: slug,
          exerciseName: (log.exercises as any)?.name || slug,
          isCompound: (log.exercises as any)?.exercise_type === 'compound',
          date,
          sets: []
        }
        historyMap[slug].push(dayRecord)
      }
      dayRecord.sets.push({ reps: log.reps_completed || 0, weightKg: Number(log.weight_kg) || 0 })
    }

    // Run audit for each exercise with >2 sessions
    const results: AuditResult[] = []
    for (const [slug, history] of Object.entries(historyMap)) {
      if (history.length < 2) continue
      // For audit, we assume a standard 8-12 rep range if unknown, 
      // but ideally we'd fetch the target from workout_exercises
      const audit = auditExercisePerformance(history, '8-12')
      if (audit.adjustment !== 'MAINTAIN') {
        results.push({ ...audit, reason: `${history[0].exerciseName}: ${audit.reason}` })
      }
    }

    setAudits(results.slice(0, 3)) // Show top 3 insights
    setIsLoading(false)
  }

  if (isLoading || audits.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-[#F9A826]" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#F9A826]">Intelligence Insights</h3>
      </div>
      
      <div className="space-y-3">
        {audits.map((audit, i) => (
          <div 
            key={i}
            className="p-4 rounded-2xl bg-[#F9A826]/5 border border-[#F9A826]/10 flex items-start gap-3"
          >
            <div className={`mt-0.5 p-1.5 rounded-lg ${
              audit.adjustment === 'INCREASE' ? 'bg-[#74C69D]/20 text-[#74C69D]' : 
              audit.adjustment === 'DELOAD_SUGGESTED' ? 'bg-[#F9A826]/20 text-[#F9A826]' :
              'bg-[#FF6B6B]/20 text-[#FF6B6B]'
            }`}>
              {audit.adjustment === 'INCREASE' && <TrendingUp className="w-4 h-4" />}
              {audit.adjustment === 'DELOAD_SUGGESTED' && <AlertTriangle className="w-4 h-4" />}
              {audit.adjustment === 'DECREASE' && <TrendingDown className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">{audit.reason}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F9A826]/40" 
                    style={{ width: `${audit.score}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#A8B0BE]">{Math.round(audit.score)}% Eff.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
