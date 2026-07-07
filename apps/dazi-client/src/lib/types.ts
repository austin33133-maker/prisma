export type ActivityCategory = 'food' | 'sports' | 'show' | 'games' | 'other'

export interface UserProfile {
  id: string
  name: string
  age: number
  city: string
  bio: string
  interests: string[]
  avatarColor: string
}

export interface Activity {
  id: string
  hostId: string
  category: ActivityCategory
  title: string
  description: string
  place: string
  startsAt: string
  maxMembers: number
  memberIds: string[]
  distanceKm: number
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  sentAt: string
}

export interface ChatThread {
  id: string
  kind: 'direct' | 'group'
  title: string
  activityId?: string
  participantIds: string[]
  messages: ChatMessage[]
}

export const CATEGORY_META: Record<ActivityCategory, { label: string; emoji: string }> = {
  food: { label: 'Food', emoji: '🍜' },
  sports: { label: 'Sports', emoji: '🏸' },
  show: { label: 'Shows', emoji: '🎫' },
  games: { label: 'Games', emoji: '🎲' },
  other: { label: 'Other', emoji: '✨' },
}
