import { createClient } from '@/lib/supabase/client'
import { generateWorkoutPlan } from '@/lib/workout-engine'
import { OnboardingData } from '@/types'

/**
 * Regenerates the workout plan and updates the user profile and gym settings.
 * This can be used from onboarding or when a user edits their profile.
 */
export async function regenerateWorkoutPlanService(userId: string, data: OnboardingData) {
  const supabase = createClient()

  // 1. Update profile with new fields
  const { error: profileError } = await supabase.from('profiles').update({
    goal: data.goal,
    physique_program: data.physique_program,
    experience_level: data.experience_level,
    workout_frequency: data.workout_frequency,
    split_type: data.split_type,
    age: data.age,
    height_cm: data.height_cm,
    weight_kg: data.weight_kg,
    selected_equipment: data.selected_equipment,
    gym_preset: data.gym_preset,
    onboarding_complete: true, // ensure this is set
  }).eq('id', userId)

  if (profileError) throw new Error('Failed to update profile: ' + profileError.message)

  // 2. Deactivate any existing splits
  await supabase.from('workout_splits').update({ is_active: false }).eq('user_id', userId)

  // 3. Create or update gym profile
  const { data: gymProfile, error: gymError } = await supabase
    .from('gym_profiles')
    .upsert({ user_id: userId, name: 'My Gym', preset: data.gym_preset }, { onConflict: 'user_id' })
    .select()
    .single()

  if (gymError) throw new Error('Failed to update gym profile')

  if (gymProfile) {
    await supabase.from('gym_equipment').delete().eq('gym_profile_id', gymProfile.id)
    const { data: dbEquipment } = await supabase.from('equipment').select('id, name')
    const matching = (dbEquipment || []).filter(e => data.selected_equipment.includes(e.name as never))
    if (matching.length > 0) {
      await supabase.from('gym_equipment').insert(
        matching.map(e => ({ gym_profile_id: gymProfile.id, equipment_id: e.id }))
      )
    }
  }

  // 4. Run the NEW workout engine
  const plan = generateWorkoutPlan({
    goal: data.goal!,
    physiqueProgram: data.physique_program!,
    fitnessLevel: data.experience_level!,
    equipment: data.selected_equipment,
    split: data.split_type!,
    daysPerWeek: data.workout_frequency!,
  })

  // 5. Fetch all exercise UUIDs from DB indexed by slug
  const { data: dbExercises } = await supabase.from('exercises').select('id, slug')
  const slugToId: Record<string, string> = {}
  ;(dbExercises || []).forEach(ex => { slugToId[ex.slug] = ex.id })

  // 6. Save split - Set valid_until to 28 days from now
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 28)

  const { data: split, error: splitError } = await supabase.from('workout_splits').insert({
    user_id: userId,
    split_type: plan.split,
    is_active: true,
    valid_until: validUntil.toISOString()
  }).select().single()

  if (splitError || !split) throw new Error('Failed to create split: ' + splitError?.message)

  // 7. Save Workouts and Exercises
  for (let i = 0; i < plan.days.length; i++) {
    const day = plan.days[i]
    const { data: workout } = await supabase.from('workouts').insert({
      split_id: split.id,
      user_id: userId,
      day_of_week: day.dayNumber,
      day_label: day.dayName,
      focus: day.focus,
      estimated_duration_minutes: day.estimatedDurationMinutes,
    }).select().single()

    if (workout) {
      type ExerciseRow = {
        workout_id: string
        exercise_id: string
        order_index: number
        sets: number
        reps: string
        rest_time_seconds: number
        section: string
      }
      const exerciseRows = day.exercises
        .map((ex, idx) => {
          const dbId = slugToId[ex.exerciseSlug]
          if (!dbId) return null
          return {
            workout_id: workout.id,
            exercise_id: dbId,
            order_index: idx,
            sets: ex.sets,
            reps: ex.reps,
            rest_time_seconds: ex.restSeconds,
            section: ex.section as string,
          } as ExerciseRow
        })
        .filter((r): r is ExerciseRow => r !== null)

      if (exerciseRows.length > 0) {
        await supabase.from('workout_exercises').insert(exerciseRows)
      }
    }
  }

  return { success: true, plan }
}
