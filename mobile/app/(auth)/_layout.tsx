import { Stack, Redirect } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useAuthStore } from '@/store/auth.store'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Redirect href="/" />
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
