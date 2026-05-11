import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, FontSize, Spacing } from '@/constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  secureToggle?: boolean
}

export function Input({ label, error, containerStyle, secureToggle, secureTextEntry, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textFaint}
          selectionColor={Colors.accent}
          secureTextEntry={secureToggle ? !showPassword : secureTextEntry}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputError: { borderColor: Colors.error },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  eyeBtn: { padding: Spacing.sm },
  error: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 2,
  },
})
