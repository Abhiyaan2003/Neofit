import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [sent, setSent] = useState(false)
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'com.neofit.app://reset-password',
    })
    if (error) Alert.alert('Error', error.message)
    else setSent(true)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        {sent ? (
          <View style={styles.center}>
            <View style={styles.iconBox}>
              <Ionicons name="mail-outline" size={36} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.body}>
              We sent password reset instructions to your email.
            </Text>
            <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 32 }} />
          </View>
        ) : (
          <>
            <View style={styles.iconBox}>
              <Ionicons name="lock-open-outline" size={32} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.body}>Enter your email and we'll send you a reset link.</Text>
            <View style={{ marginTop: 24, gap: 16 }}>
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
              <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: 56 },
  back: {
    width: 40, height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  iconBox: {
    width: 64, height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(139,174,158,0.3)',
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 8 },
  body: { fontSize: FontSize.md, color: Colors.textMuted, lineHeight: 22 },
})
