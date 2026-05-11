import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const router = useRouter()
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    })
    if (error) {
      Alert.alert('Sign up failed', error.message)
    } else {
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Click it to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.logoWrapper}>
            <Ionicons name="person-add-outline" size={28} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start your transformation today</Text>
        </View>

        <View style={styles.fields}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
                placeholder="Arjun Sharma"
                autoCapitalize="words"
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                secureToggle
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  header: { paddingTop: 56, marginBottom: 8 },
  back: {
    width: 40, height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', paddingVertical: 32 },
  logoWrapper: {
    width: 60, height: 60,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,174,158,0.3)',
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 6 },
  fields: { gap: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: FontSize.sm, color: Colors.textMuted },
  footerLink: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.semibold },
})
