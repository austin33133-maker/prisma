import { StyleSheet, Text, View } from 'react-native'

import { UserProfile } from '@/lib/types'

export function Avatar({ user, size = 40 }: { user: UserProfile; size?: number }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: user.avatarColor },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{user.name[0]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})
