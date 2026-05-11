import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.accent} />
        </View>
        <Text style={styles.title}>Progress Tracking</Text>
        <Text style={styles.subtitle}>
          Detailed charts and volume tracking will be available here soon. Keep lifting!
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconBox: {
    width: 80, height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 22 },
})
