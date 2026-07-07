import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { Avatar } from '@/components/avatar'
import { formatWhen } from '@/lib/format'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { Activity, ActivityCategory, CATEGORY_META } from '@/lib/types'

const FILTERS: Array<{ key: ActivityCategory | 'all'; label: string; emoji: string }> = [
  { key: 'all', label: 'All', emoji: '🌏' },
  ...(Object.entries(CATEGORY_META) as Array<[ActivityCategory, { label: string; emoji: string }]>).map(
    ([key, meta]) => ({ key, label: meta.label, emoji: meta.emoji }),
  ),
]

export default function Explore() {
  const colors = useTheme()
  const router = useRouter()
  const { activities, me, userById } = useAppStore()
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all')

  const visible = useMemo(
    () => (filter === 'all' ? activities : activities.filter((a) => a.category === filter)),
    [activities, filter],
  )

  const renderCard = ({ item }: { item: Activity }) => {
    const host = userById(item.hostId)
    const joined = item.memberIds.includes(me.id)
    const full = item.memberIds.length >= item.maxMembers
    return (
      <Pressable
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => router.push({ pathname: '/activity/[id]', params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{CATEGORY_META[item.category].emoji}</Text>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              {formatWhen(item.startsAt)}
            </Text>
          </View>
          {joined ? (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.onPrimary }]}>Joined</Text>
            </View>
          ) : full ? (
            <View style={[styles.badge, { backgroundColor: colors.chip }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Full</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.hostRow}>
            <Avatar user={host} size={24} />
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{host.name}</Text>
          </View>
          <View style={styles.footerRight}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              {item.distanceKm.toFixed(1)} km
            </Text>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              {item.memberIds.length}/{item.maxMembers}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const selected = filter === f.key
            return (
              <Pressable
                key={f.key}
                style={[styles.chip, { backgroundColor: selected ? colors.chipSelected : colors.chip }]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.chipText, { color: selected ? colors.onPrimary : colors.text }]}>
                  {f.emoji} {f.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
      <FlatList
        data={visible}
        keyExtractor={(a) => a.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.listHeader, { color: colors.textSecondary }]}>
            Nearby in {me.city}
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingVertical: 10 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 17, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  listHeader: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  card: { borderRadius: 16, padding: 14, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardEmoji: { fontSize: 28 },
  cardHeaderText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { fontSize: 13 },
  badge: { paddingHorizontal: 10, height: 24, borderRadius: 12, justifyContent: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
})
