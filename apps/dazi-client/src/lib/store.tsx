import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

import { ACTIVITIES, AUTO_REPLIES, ME, THREADS, USERS } from './mock-data'
import { Activity, ActivityCategory, ChatThread, UserProfile } from './types'

interface CreateActivityInput {
  title: string
  description: string
  category: ActivityCategory
  place: string
  startsAt: string
  maxMembers: number
}

interface AppStore {
  me: UserProfile
  signedIn: boolean
  activities: Activity[]
  threads: ChatThread[]
  signIn: () => void
  signOut: () => void
  userById: (id: string) => UserProfile
  joinActivity: (activityId: string) => string
  createActivity: (input: CreateActivityInput) => string
  sendMessage: (threadId: string, text: string) => void
  threadForActivity: (activityId: string) => ChatThread | undefined
}

const AppStoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false)
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES)
  const [threads, setThreads] = useState<ChatThread[]>(THREADS)
  const idCounter = useRef(0)

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1
    return `${prefix}-${Date.now()}-${idCounter.current}`
  }, [])

  const userById = useCallback(
    (id: string) => USERS.find((u) => u.id === id) ?? ME,
    [],
  )

  const threadForActivity = useCallback(
    (activityId: string) => threads.find((t) => t.activityId === activityId),
    [threads],
  )

  const joinActivity = useCallback(
    (activityId: string) => {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId && !a.memberIds.includes(ME.id)
            ? { ...a, memberIds: [...a.memberIds, ME.id] }
            : a,
        ),
      )
      const activity = activities.find((a) => a.id === activityId)
      const existing = threads.find((t) => t.activityId === activityId)
      if (existing) {
        if (!existing.participantIds.includes(ME.id)) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === existing.id
                ? { ...t, participantIds: [...t.participantIds, ME.id] }
                : t,
            ),
          )
        }
        return existing.id
      }
      const threadId = nextId('t')
      setThreads((prev) => [
        {
          id: threadId,
          kind: 'group' as const,
          title: activity?.title ?? 'Activity chat',
          activityId,
          participantIds: [...(activity?.memberIds ?? []), ME.id],
          messages: [
            {
              id: nextId('m'),
              senderId: activity?.hostId ?? ME.id,
              text: 'Welcome to the group! 🎉',
              sentAt: new Date().toISOString(),
            },
          ],
        },
        ...prev,
      ])
      return threadId
    },
    [activities, threads, nextId],
  )

  const createActivity = useCallback(
    (input: CreateActivityInput) => {
      const activityId = nextId('a')
      setActivities((prev) => [
        {
          id: activityId,
          hostId: ME.id,
          memberIds: [ME.id],
          distanceKm: 0,
          ...input,
        },
        ...prev,
      ])
      setThreads((prev) => [
        {
          id: nextId('t'),
          kind: 'group' as const,
          title: input.title,
          activityId,
          participantIds: [ME.id],
          messages: [],
        },
        ...prev,
      ])
      return activityId
    },
    [nextId],
  )

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      const message = {
        id: nextId('m'),
        senderId: ME.id,
        text,
        sentAt: new Date().toISOString(),
      }
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, message] } : t)),
      )
      const thread = threads.find((t) => t.id === threadId)
      const otherIds = (thread?.participantIds ?? []).filter((id) => id !== ME.id)
      if (otherIds.length === 0) return
      const replier = otherIds[Math.floor(Math.random() * otherIds.length)]
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setTimeout(() => {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { id: nextId('m'), senderId: replier, text: reply, sentAt: new Date().toISOString() },
                  ],
                }
              : t,
          ),
        )
      }, 1200)
    },
    [threads, nextId],
  )

  const value = useMemo<AppStore>(
    () => ({
      me: ME,
      signedIn,
      activities,
      threads,
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
      userById,
      joinActivity,
      createActivity,
      sendMessage,
      threadForActivity,
    }),
    [signedIn, activities, threads, userById, joinActivity, createActivity, sendMessage, threadForActivity],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext)
  if (!store) throw new Error('useAppStore must be used within AppStoreProvider')
  return store
}
