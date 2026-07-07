import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'

export default function Onboarding() {
  const colors = useTheme()
  const router = useRouter()
  const { signIn } = useAppStore()

  const enter = () => {
    signIn()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <Text style={styles.logoEmoji}>🤝</Text>
        <Text style={[styles.title, { color: colors.text }]}>Dazi</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Find a buddy for anything.{'\n'}Food runs, courts, gigs, game nights.
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable style={[styles.button, { backgroundColor: colors.text }]} onPress={enter}>
          <Ionicons name="logo-apple" size={20} color={colors.background} />
          <Text style={[styles.buttonText, { color: colors.background }]}>Continue with Apple</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={enter}
        >
          <Ionicons name="logo-google" size={20} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Continue with Google</Text>
        </Pressable>
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={enter}>
          <Ionicons name="mail-outline" size={20} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Continue with email</Text>
        </Pressable>
        <Text style={[styles.legal, { color: colors.textSecondary }]}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoEmoji: { fontSize: 64 },
  title: { fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  tagline: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  buttons: { padding: 24, gap: 12 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 26,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  legal: { fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
})
