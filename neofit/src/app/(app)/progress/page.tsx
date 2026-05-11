'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'
import { Flame, BarChart3, TrendingUp, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface SessionLog {
  completed_at: string | null
  duration_seconds: number | null
  status: string
}

interface ProgressLog {
  date: string
  weight_kg: number | null
}

export default function ProgressPage() {
  const { profile } = useAuthStore()
  const [sessions, setSessions] = useState<SessionLog[]>([])
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profile) loadProgress()
  }, [profile])

  const loadProgress = async () => {
    const supabase = createClient()
    const { data: sess } = await supabase
      .from('workout_sessions')
      .select('completed_at, duration_seconds, status')
      .eq('user_id', profile!.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(30)

    if (sess) setSessions(sess)

    const { data: logs } = await supabase
      .from('progress_logs')
      .select('date, weight_kg')
      .eq('user_id', profile!.id)
      .order('date', { ascending: true })
      .limit(30)

    if (logs) setProgressLogs(logs)
    setIsLoading(false)
  }

  const totalWorkouts = sessions.length
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / sessions.length / 60)
    : 0

  const weightData = progressLogs.filter(l => l.weight_kg).map(l => ({
    date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: l.weight_kg,
  }))

  const STAT_CARDS = [
    { label: 'Total Workouts', value: totalWorkouts, icon: Flame, color: '#F9A826' },
    { label: 'Avg Duration', value: `${avgDuration}m`, icon: BarChart3, color: '#8BAE9E' },
    { label: 'Current Streak', value: `${profile?.current_streak ?? 0}d`, icon: TrendingUp, color: '#74C69D' },
    { label: 'Best Streak', value: `${profile?.longest_streak ?? 0}d`, icon: Calendar, color: '#A274C6' },
  ]

  if (isLoading) {
    return (
      <div className="px-5 pt-14 flex flex-col gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-[#1D212B] shimmer" />)}
      </div>
    )
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-[#A8B0BE] mt-0.5">Track your consistency and growth</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#1D212B] border border-white/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-xs text-[#A8B0BE]">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weight chart */}
      {weightData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-[#1D212B] border border-white/5 mb-5"
        >
          <p className="text-sm font-semibold mb-4">Body Weight</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <XAxis dataKey="date" tick={{ fill: '#A8B0BE', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A8B0BE', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: '#1D212B', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#EDEDED', fontSize: 12 }}
                cursor={{ stroke: 'rgba(255,255,255,0.05)' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#8BAE9E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <p className="text-sm font-semibold mb-3">Recent Sessions</p>
          <div className="flex flex-col gap-2.5">
            {sessions.slice(0, 6).map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#1D212B] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#74C69D]/10 flex items-center justify-center">
                    <span className="text-xs text-[#74C69D]">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Workout completed</p>
                    <p className="text-xs text-[#A8B0BE]">
                      {session.completed_at ? new Date(session.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                    </p>
                  </div>
                </div>
                {session.duration_seconds && (
                  <span className="text-xs text-[#A8B0BE]">{Math.round(session.duration_seconds / 60)} min</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {sessions.length === 0 && (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#8BAE9E]/10 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-[#8BAE9E]/50" />
          </div>
          <p className="font-semibold mb-2">No data yet</p>
          <p className="text-sm text-[#A8B0BE]">Complete your first workout to see progress here</p>
        </div>
      )}
    </div>
  )
}
