import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { Avatar } from '@/components/avatar'
import { formatWhen } from '@/lib/format'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { CATEGORY_META } from '@/lib/types'

export default function ActivityDetail() {
  const colors = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { activities, me, userById, joinActivity, threadForActivity } = useAppStore()

  const activity = activities.find((a) => a.id === id)
  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: 24 }}>Activity not found.</Text>
      </View>
    )
  }

  const host = userById(activity.hostId)
  const joined = activity.memberIds.includes(me.id)
  const full = activity.memberIds.length >= activity.maxMembers
  const thread = threadForActivity(activity.id)

  const onJoin = () => {
    const threadId = joinActivity(activity.id)
    router.push({ pathname: '/chat/[id]', params: { id: threadId } })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: CATEGORY_META[activity.category].label }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>{CATEGORY_META[activity.category].emoji}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{activity.title}</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{formatWhen(activity.startsAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {activity.place} · {activity.distanceKm.toFixed(1)} km away
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {activity.memberIds.length} of {activity.maxMembers} joined
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{activity.description}</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Host</Text>
        <View style={styles.hostRow}>
          <Avatar user={host} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hostName, { color: colors.text }]}>
              {host.name}, {host.age}
            </Text>
            <Text style={[styles.hostBio, { color: colors.textSecondary }]} numberOfLines={2}>
              {host.bio}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Going</Text>
        <View style={styles.memberRow}>
          {activity.memberIds.map((memberId) => (
            <Avatar key={memberId} user={userById(memberId)} size={36} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        {joined ? (
          <Pressable
            style={[styles.cta, { backgroundColor: colors.card }]}
            onPress={() => thread && router.push({ pathname: '/chat/[id]', params: { id: thread.id } })}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
            <Text style={[styles.ctaText, { color: colors.primary }]}>Open group chat</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.cta, { backgroundColor: full ? colors.chip : colors.primary }]}
            onPress={onJoin}
            disabled={full}
          >
            <Text style={[styles.ctaText, { color: full ? colors.textSecondary : colors.onPrimary }]}>
              {full ? 'This one is full' : 'Join this activity'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 12 },
  emoji: { fontSize: 44 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  infoCard: { borderRadius: 16, padding: 16, gap: 12, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 12 },
  description: { fontSize: 15, lineHeight: 22 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostName: { fontSize: 16, fontWeight: '600' },
  hostBio: { fontSize: 13, marginTop: 2 },
  memberRow: { flexDirection: 'row', gap: 8 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  cta: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: { fontSize: 16, fontWeight: '700' },
})
