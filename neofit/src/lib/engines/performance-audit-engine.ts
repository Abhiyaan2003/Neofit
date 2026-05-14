import { ExercisePerformance, estimateOneRM } from './progression-engine'

export type VolumeAdjustment = 'INCREASE' | 'DECREASE' | 'MAINTAIN' | 'DELOAD_SUGGESTED'

export interface AuditResult {
  adjustment: VolumeAdjustment
  reason: string
  score: number // 0-100
  trend: 'up' | 'down' | 'stable'
}

/**
 * PerformanceAuditEngine
 * Analyzes the last few sessions to see if the user is plateauing, 
 * overtraining, or ready for more volume.
 */
export function auditExercisePerformance(
  history: ExercisePerformance[],
  targetReps: string
): AuditResult {
  if (history.length < 2) {
    return { adjustment: 'MAINTAIN', reason: 'Need more data to audit trends.', score: 0, trend: 'stable' }
  }

  // Get last 3 sessions (or whatever we have)
  const recent = history.slice(0, 3)
  
  // Calculate efficiency (reps hit vs target max)
  const maxReps = parseInt(targetReps.split('-')[1] || targetReps) || 10
  
  const efficiencies = recent.map(session => {
    const totalReps = session.sets.reduce((sum, s) => sum + s.reps, 0)
    const expectedReps = session.sets.length * maxReps
    return (totalReps / expectedReps) * 100
  })

  // Calculate E1RM trend
  const e1rms = recent.map(session => {
    const bestSet = session.sets.reduce((best, s) => {
      const e1rm = estimateOneRM(s.weightKg, s.reps)
      return e1rm > best ? e1rm : best
    }, 0)
    return bestSet
  })

  const avgEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
  const currentE1RM = e1rms[0]
  const prevE1RM = e1rms[1]
  
  const trend = currentE1RM > prevE1RM * 1.02 ? 'up' : currentE1RM < prevE1RM * 0.98 ? 'down' : 'stable'

  // Logic 1: Ready for more?
  if (avgEfficiency >= 98 && trend === 'up') {
    return {
      adjustment: 'INCREASE',
      reason: 'Consistent top-range performance. You are ready for higher intensity.',
      score: avgEfficiency,
      trend: 'up'
    }
  }

  // Logic 2: Stalling?
  if (trend === 'stable' && avgEfficiency < 90 && history.length >= 4) {
    // Check if stalled for 4 sessions
    return {
      adjustment: 'DELOAD_SUGGESTED',
      reason: 'Progress has plateaued over 4 sessions. A deload or exercise swap is recommended.',
      score: avgEfficiency,
      trend: 'stable'
    }
  }

  // Logic 3: Regression?
  if (trend === 'down' && avgEfficiency < 80) {
    return {
      adjustment: 'DECREASE',
      reason: 'Performance is trending down. Reducing volume to prioritize recovery.',
      score: avgEfficiency,
      trend: 'down'
    }
  }

  return {
    adjustment: 'MAINTAIN',
    reason: 'Performance is stable. Keep pushing.',
    score: avgEfficiency,
    trend
  }
}
