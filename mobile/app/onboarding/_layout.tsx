import { Stack, Redirect } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useAuthStore } from '@/store/auth.store'

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    />
  )
}
