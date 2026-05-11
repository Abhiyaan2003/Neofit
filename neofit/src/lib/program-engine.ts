import { createClient } from '@/lib/supabase/client'
import { Program } from '@/constants/programs'
import { toast } from 'sonner'

/**
 * Activates a program for the current user:
 * 1. Deactivates existing splits
 * 2. Creates workout_split → workouts → workout_exercises
 *    Each workout day gets its day exercises + the program's core exercises appended at the end
 */
export async function activateProgram(program: Program): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    toast.error('Not logged in')
    return false
  }

  try {
    // ── 1. Fetch all exercise UUIDs from DB indexed by slug ──────────────
    const { data: dbExercises, error: exErr } = await supabase
      .from('exercises')
      .select('id, slug')

    if (exErr) throw exErr

    const slugToId: Record<string, string> = {}
    ;(dbExercises || []).forEach(ex => {
      slugToId[ex.slug] = ex.id
    })

    // ── 2. Deactivate all existing splits for this user ──────────────────
    await supabase
      .from('workout_splits')
      .update({ is_active: false })
      .eq('user_id', user.id)

    // ── 3. Create new split ──────────────────────────────────────────────
    const { data: split, error: splitErr } = await supabase
      .from('workout_splits')
      .insert({
        user_id: user.id,
        split_type: program.split_type,
        is_active: true,
      })
      .select()
      .single()

    if (splitErr || !split) throw splitErr ?? new Error('Failed to create split')

    // ── 4. For each day, create workout + all exercises (day + core) ─────
    for (let i = 0; i < program.days.length; i++) {
      const day = program.days[i]

      // Core adds ~15 min per session
      const coreMinutes = program.coreExercises.length > 0 ? 15 : 0

      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .insert({
          split_id: split.id,
          user_id: user.id,
          day_of_week: i + 1,
          day_label: day.dayLabel,
          focus: day.focus,
          estimated_duration_minutes: day.estimatedDuration + coreMinutes,
        })
        .select()
        .single()

      if (wErr || !workout) throw wErr ?? new Error('Failed to create workout')

      // Combine day exercises + core exercises into one ordered list
      const allExercises = [
        ...day.exercises,
        ...program.coreExercises,
      ]

      type ExRow = {
        workout_id: string
        exercise_id: string
        order_index: number
        sets: number
        reps: string
        rest_time_seconds: number
        notes: string | null
      }

      const rows: ExRow[] = allExercises
        .map((ex, idx) => {
          const dbId = slugToId[ex.slug]
          if (!dbId) {
            console.warn(`[activateProgram] No DB id found for slug: ${ex.slug}`)
            return null
          }
          return {
            workout_id: workout.id,
            exercise_id: dbId,
            order_index: idx,
            sets: ex.sets,
            reps: ex.reps,
            rest_time_seconds: ex.restTime,
            notes: ex.notes ?? null,
          } satisfies ExRow
        })
        .filter((r): r is ExRow => r !== null)

      if (rows.length > 0) {
        const { error: rowErr } = await supabase.from('workout_exercises').insert(rows)
        if (rowErr) throw rowErr
      }
    }

    return true
  } catch (err) {
    console.error('activateProgram error:', err)
    return false
  }
}
