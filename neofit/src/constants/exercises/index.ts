import { Exercise } from '@/types'
import { CHEST_EXERCISES } from '@/constants/exercises/chest'
import { BACK_EXERCISES } from '@/constants/exercises/back'
import { SHOULDER_EXERCISES } from '@/constants/exercises/shoulders'
import { ARM_EXERCISES } from '@/constants/exercises/arms'
import { LEG_EXERCISES } from '@/constants/exercises/legs'
import { CORE_EXERCISES } from '@/constants/exercises/core'
import { CARDIO_EXERCISES } from '@/constants/exercises/cardio'
import { WARMUP_COOLDOWN_EXERCISES } from '@/constants/exercises/warmup-cooldown'

export const EXERCISES: Exercise[] = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...ARM_EXERCISES,
  ...LEG_EXERCISES,
  ...CORE_EXERCISES,
  ...CARDIO_EXERCISES,
  ...WARMUP_COOLDOWN_EXERCISES,
]
