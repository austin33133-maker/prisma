import { useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { ActivityCategory, CATEGORY_META } from '@/lib/types'

const WHEN_OPTIONS = [
  { label: 'Tonight', hours: 6 },
  { label: 'Tomorrow', hours: 26 },
  { label: 'This weekend', hours: 72 },
]

export default function CreateActivity() {
  const colors = useTheme()
  const router = useRouter()
  const { createActivity } = useAppStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [place, setPlace] = useState('')
  const [category, setCategory] = useState<ActivityCategory>('food')
  const [whenIndex, setWhenIndex] = useState(0)
  const [maxMembers, setMaxMembers] = useState(4)

  const canSubmit = title.trim().length > 0 && place.trim().length > 0

  const submit = () => {
    const startsAt = new Date(Date.now() + WHEN_OPTIONS[whenIndex].hours * 3_600_000).toISOString()
    const id = createActivity({
      title: title.trim(),
      description: description.trim() || 'No details yet — ask in the group chat!',
      place: place.trim(),
      category,
      startsAt,
      maxMembers,
    })
    setTitle('')
    setDescription('')
    setPlace('')
    router.push({ pathname: '/activity/[id]', params: { id } })
  }

  const inputStyle = [styles.input, { backgroundColor: colors.card, color: colors.text }]

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.textSecondary }]}>What are you up to?</Text>
        <TextInput
          style={inputStyle}
          placeholder="e.g. Badminton doubles, need 2 more"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <View style={styles.chipRow}>
          {(Object.entries(CATEGORY_META) as Array<[ActivityCategory, { label: string; emoji: string }]>).map(
            ([key, meta]) => {
              const selected = category === key
              return (
                <Pressable
                  key={key}
                  style={[styles.chip, { backgroundColor: selected ? colors.chipSelected : colors.chip }]}
                  onPress={() => setCategory(key)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.onPrimary : colors.text }]}>
                    {meta.emoji} {meta.label}
                  </Text>
                </Pressable>
              )
            },
          )}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>When</Text>
        <View style={styles.chipRow}>
          {WHEN_OPTIONS.map((option, index) => {
            const selected = whenIndex === index
            return (
              <Pressable
                key={option.label}
                style={[styles.chip, { backgroundColor: selected ? colors.chipSelected : colors.chip }]}
                onPress={() => setWhenIndex(index)}
              >
                <Text style={[styles.chipText, { color: selected ? colors.onPrimary : colors.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Where</Text>
        <TextInput
          style={inputStyle}
          placeholder="Meeting spot"
          placeholderTextColor={colors.textSecondary}
          value={place}
          onChangeText={setPlace}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Group size (including you)</Text>
        <View style={styles.stepperRow}>
          <Pressable
            style={[styles.stepperButton, { backgroundColor: colors.card }]}
            onPress={() => setMaxMembers((n) => Math.max(2, n - 1))}
          >
            <Text style={[styles.stepperSign, { color: colors.text }]}>−</Text>
          </Pressable>
          <Text style={[styles.stepperValue, { color: colors.text }]}>{maxMembers}</Text>
          <Pressable
            style={[styles.stepperButton, { backgroundColor: colors.card }]}
            onPress={() => setMaxMembers((n) => Math.min(12, n + 1))}
          >
            <Text style={[styles.stepperSign, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Details (optional)</Text>
        <TextInput
          style={[...inputStyle, styles.multiline]}
          placeholder="Anything buddies should know — skill level, budget, plan…"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Pressable
          style={[styles.submit, { backgroundColor: canSubmit ? colors.primary : colors.chip }]}
          onPress={submit}
          disabled={!canSubmit}
        >
          <Text style={[styles.submitText, { color: canSubmit ? colors.onPrimary : colors.textSecondary }]}>
            Post activity
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 10, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 10 },
  input: { borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 16 },
  multiline: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, height: 36, borderRadius: 18, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepperSign: { fontSize: 22, fontWeight: '600' },
  stepperValue: { fontSize: 20, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  submit: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  submitText: { fontSize: 16, fontWeight: '700' },
})
