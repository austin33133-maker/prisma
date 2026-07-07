import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { Avatar } from '@/components/avatar'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'

const MENU_ITEMS: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { icon: 'create-outline', label: 'Edit profile' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'shield-checkmark-outline', label: 'Privacy & safety' },
  { icon: 'help-circle-outline', label: 'Help & feedback' },
]

export default function Profile() {
  const colors = useTheme()
  const router = useRouter()
  const { me, activities, signOut } = useAppStore()

  const hosted = activities.filter((a) => a.hostId === me.id).length
  const joined = activities.filter((a) => a.memberIds.includes(me.id) && a.hostId !== me.id).length

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Avatar user={me} size={84} />
        <Text style={[styles.name, { color: colors.text }]}>
          {me.name}, {me.age}
        </Text>
        <Text style={[styles.city, { color: colors.textSecondary }]}>
          <Ionicons name="location-outline" size={14} /> {me.city}
        </Text>
        <Text style={[styles.bio, { color: colors.textSecondary }]}>{me.bio}</Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{hosted}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hosted</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{joined}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Joined</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{me.interests.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Interests</Text>
        </View>
      </View>

      <View style={styles.interestRow}>
        {me.interests.map((interest) => (
          <View key={interest} style={[styles.interestChip, { backgroundColor: colors.chip }]}>
            <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.menu, { backgroundColor: colors.card }]}>
        {MENU_ITEMS.map((item, index) => (
          <View key={item.label}>
            {index > 0 && <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />}
            <Pressable style={styles.menuItem}>
              <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.signOut}
        onPress={() => {
          signOut()
          router.replace('/onboarding')
        }}
      >
        <Text style={[styles.signOutText, { color: colors.primary }]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 6 },
  name: { fontSize: 24, fontWeight: '800', marginTop: 6 },
  city: { fontSize: 14 },
  bio: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  statsCard: { flexDirection: 'row', borderRadius: 16, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  statDivider: { width: StyleSheet.hairlineWidth },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  interestChip: { paddingHorizontal: 12, height: 30, borderRadius: 15, justifyContent: 'center' },
  interestText: { fontSize: 13, fontWeight: '600' },
  menu: { borderRadius: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  menuDivider: { height: StyleSheet.hairlineWidth, marginLeft: 48 },
  signOut: { alignItems: 'center', paddingVertical: 8 },
  signOutText: { fontSize: 15, fontWeight: '600' },
})
