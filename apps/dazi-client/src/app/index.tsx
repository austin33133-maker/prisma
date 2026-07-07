import { Redirect } from 'expo-router'

import { useAppStore } from '@/lib/store'

export default function Index() {
  const { signedIn } = useAppStore()
  return <Redirect href={signedIn ? '/(tabs)' : '/onboarding'} />
}
