import { useRouter } from 'expo-router'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

import { Avatar } from '@/components/avatar'
import { formatMessageTime } from '@/lib/format'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { ChatThread } from '@/lib/types'

export default function Chats() {
  const colors = useTheme()
  const router = useRouter()
  const { threads, me, userById } = useAppStore()

  const renderRow = ({ item }: { item: ChatThread }) => {
    const last = item.messages[item.messages.length - 1]
    const other = userById(item.participantIds.find((pid) => pid !== me.id) ?? me.id)
    return (
      <Pressable
        style={styles.row}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
      >
        {item.kind === 'group' ? (
          <View style={[styles.groupAvatar, { backgroundColor: colors.card }]}>
            <Text style={styles.groupEmoji}>👥</Text>
          </View>
        ) : (
          <Avatar user={other} size={48} />
        )}
        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.rowPreview, { color: colors.textSecondary }]} numberOfLines={1}>
            {last ? `${last.senderId === me.id ? 'You: ' : ''}${last.text}` : 'Say hi 👋'}
          </Text>
        </View>
        {last && (
          <Text style={[styles.rowTime, { color: colors.textSecondary }]}>
            {formatMessageTime(last.sentAt)}
          </Text>
        )}
      </Pressable>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={threads}
        keyExtractor={(t) => t.id}
        renderItem={renderRow}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Join an activity to start chatting.
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  groupAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  groupEmoji: { fontSize: 22 },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowPreview: { fontSize: 14 },
  rowTime: { fontSize: 12 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 76 },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 15 },
})
