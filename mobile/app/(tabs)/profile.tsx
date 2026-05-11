import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.goal?.replace('_', ' ').toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="settings-outline" size={20} color={Colors.text} />
              <Text style={styles.rowText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Ionicons name="notifications-outline" size={20} color={Colors.text} />
              <Text style={styles.rowText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
            </View>
          </View>
        </View>

        <Button
          title="Sign Out"
          variant="secondary"
          onPress={signOut}
          style={{ marginTop: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 80, height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: FontWeight.bold, color: Colors.background },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4, letterSpacing: 1 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: 12 },
  rowText: { fontSize: FontSize.md, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 52 },
})
