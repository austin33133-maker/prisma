import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Avatar } from '@/components/avatar'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { ChatMessage } from '@/lib/types'

export default function ChatRoom() {
  const colors = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { threads, me, userById, sendMessage } = useAppStore()
  const [draft, setDraft] = useState('')

  const thread = threads.find((t) => t.id === id)
  if (!thread) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: 24 }}>Chat not found.</Text>
      </View>
    )
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    sendMessage(thread.id, text)
    setDraft('')
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === me.id
    const sender = userById(item.senderId)
    return (
      <View style={[styles.messageRow, mine ? styles.messageRowMine : null]}>
        {!mine && <Avatar user={sender} size={30} />}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: mine ? colors.bubbleMine : colors.bubbleOther,
              borderBottomRightRadius: mine ? 4 : 18,
              borderBottomLeftRadius: mine ? 18 : 4,
            },
          ]}
        >
          {!mine && thread.kind === 'group' && (
            <Text style={[styles.senderName, { color: sender.avatarColor }]}>{sender.name}</Text>
          )}
          <Text style={[styles.messageText, { color: mine ? colors.onPrimary : colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: thread.title }} />
      <FlatList
        data={[...thread.messages].reverse()}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messages}
      />
      <View
        style={[
          styles.inputBar,
          { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Message"
          placeholderTextColor={colors.textSecondary}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendButton, { backgroundColor: draft.trim() ? colors.primary : colors.chip }]}
          onPress={send}
        >
          <Ionicons name="arrow-up" size={20} color={draft.trim() ? colors.onPrimary : colors.textSecondary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messages: { padding: 16, gap: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  messageRowMine: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, gap: 2, flexShrink: 1 },
  senderName: { fontSize: 12, fontWeight: '700' },
  messageText: { fontSize: 15, lineHeight: 21 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, height: 42, borderRadius: 21, paddingHorizontal: 16, fontSize: 15 },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
})
