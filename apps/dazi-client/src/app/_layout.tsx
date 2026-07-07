import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import { useColorScheme } from 'react-native'

import { AppStoreProvider } from '@/lib/store'
import { Colors } from '@/lib/theme'

export default function RootLayout() {
  const scheme = useColorScheme()
  const colors = scheme === 'dark' ? Colors.dark : Colors.light
  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <AppStoreProvider>
      <ThemeProvider
        value={{
          ...navTheme,
          colors: {
            ...navTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text,
            border: colors.border,
          },
        }}
      >
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="activity/[id]" options={{ title: 'Activity' }} />
          <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
        </Stack>
      </ThemeProvider>
    </AppStoreProvider>
  )
}
