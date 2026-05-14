import { WorkoutFrequency } from '@/types'

/**
 * Calculates how many consecutive days a user can take off before their streak breaks,
 * based on their weekly workout frequency.
 */
export function getMaxRestGap(frequency: WorkoutFrequency | null): number {
  if (!frequency) return 1
  if (frequency <= 3) return 3 // e.g. workout Friday, rest Sat, Sun, Mon. Streak breaks Tuesday if no workout.
  if (frequency === 4) return 2
  if (frequency === 5) return 2
  return 1
}

/**
 * Evaluates the user's streak based on their session history and frequency.
 * Returns the updated current_streak and longest_streak.
 *
 * @param currentStreak The streak number stored in the profile
 * @param longestStreak The longest streak stored in the profile
 * @param lastWorkoutDate The ISO date string of the last completed workout (can be null)
 * @param frequency The user's target workouts per week
 * @param completedWorkoutToday Boolean indicating if a workout was completed today
 * @returns { current_streak: number, longest_streak: number, is_broken: boolean }
 */
export function evaluateStreak(
  currentStreak: number,
  longestStreak: number,
  lastWorkoutDate: string | null,
  frequency: WorkoutFrequency | null,
  completedWorkoutToday: boolean
) {
  if (!lastWorkoutDate && completedWorkoutToday) {
    return { current_streak: 1, longest_streak: Math.max(1, longestStreak), is_broken: false }
  }
  
  if (!lastWorkoutDate) {
    return { current_streak: 0, longest_streak: longestStreak, is_broken: false }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastDate = new Date(lastWorkoutDate)
  lastDate.setHours(0, 0, 0, 0)

  const diffTime = Math.abs(today.getTime() - lastDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  let newCurrentStreak = currentStreak
  let isBroken = false

  const maxGap = getMaxRestGap(frequency)

  if (completedWorkoutToday) {
    // If they already worked out today, streak doesn't increment twice
    if (diffDays === 0) {
      newCurrentStreak = currentStreak
    } else if (diffDays <= maxGap + 1) {
      // They worked out within the allowed gap + 1 (the day they are working out)
      newCurrentStreak += 1
    } else {
      // Gap was too large, streak broke, but they worked out today so it's 1
      newCurrentStreak = 1
      isBroken = true
    }
  } else {
    // Just checking status without completing a workout
    if (diffDays > maxGap) {
      newCurrentStreak = 0
      isBroken = true
    }
  }

  return {
    current_streak: newCurrentStreak,
    longest_streak: Math.max(newCurrentStreak, longestStreak),
    is_broken: isBroken
  }
}
