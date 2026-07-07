import cors from 'cors'
import express, { Request } from 'express'

import { AuthedRequest, newToken, requireAuth } from './auth'
import { prisma } from './db'

const AVATAR_COLORS = ['#FF4F5E', '#7C5CE7', '#00B894', '#0984E3', '#E17055', '#D63031', '#6C5CE7']
const CATEGORIES = new Set(['food', 'sports', 'show', 'games', 'other'])

function userId(req: Request): string {
  return (req as AuthedRequest).userId
}

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.post('/auth/register', async (req, res) => {
    const { name, age, city, bio, interests } = req.body ?? {}
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'name is required' })
      return
    }
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        age: typeof age === 'number' ? age : null,
        city: typeof city === 'string' ? city : null,
        bio: typeof bio === 'string' ? bio : null,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        interests: JSON.stringify(Array.isArray(interests) ? interests : []),
      },
    })
    const token = newToken()
    await prisma.authToken.create({ data: { token, userId: user.id } })
    res.status(201).json({ token, user })
  })

  app.get('/me', requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: userId(req) } })
    res.json({ user })
  })

  app.get('/activities', requireAuth, async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined
    const activities = await prisma.activity.findMany({
      where: category && CATEGORIES.has(category) ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        host: { select: { id: true, name: true, age: true, bio: true, avatarColor: true } },
        members: { select: { userId: true } },
      },
    })
    res.json({
      activities: activities.map(({ members, ...a }) => ({
        ...a,
        memberIds: members.map((m) => m.userId),
      })),
    })
  })

  app.post('/activities', requireAuth, async (req, res) => {
    const { title, description, category, place, startsAt, maxMembers } = req.body ?? {}
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ error: 'title is required' })
      return
    }
    if (typeof category !== 'string' || !CATEGORIES.has(category)) {
      res.status(400).json({ error: `category must be one of: ${[...CATEGORIES].join(', ')}` })
      return
    }
    if (typeof place !== 'string' || place.trim().length === 0) {
      res.status(400).json({ error: 'place is required' })
      return
    }
    const starts = new Date(startsAt)
    if (Number.isNaN(starts.getTime())) {
      res.status(400).json({ error: 'startsAt must be a valid date' })
      return
    }
    const size = Number.isInteger(maxMembers) ? (maxMembers as number) : 4
    if (size < 2 || size > 50) {
      res.status(400).json({ error: 'maxMembers must be between 2 and 50' })
      return
    }

    const hostId = userId(req)
    const activity = await prisma.$transaction(async (tx) => {
      const created = await tx.activity.create({
        data: {
          hostId,
          title: title.trim(),
          description: typeof description === 'string' ? description.trim() : '',
          category,
          place: place.trim(),
          startsAt: starts,
          maxMembers: size,
        },
      })
      await tx.activityMember.create({ data: { activityId: created.id, userId: hostId } })
      await tx.chatThread.create({
        data: {
          kind: 'group',
          title: created.title,
          activityId: created.id,
          participants: { create: { userId: hostId } },
        },
      })
      return created
    })
    res.status(201).json({ activity })
  })

  app.get('/activities/:id', requireAuth, async (req, res) => {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        host: { select: { id: true, name: true, age: true, bio: true, avatarColor: true } },
        members: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
        thread: { select: { id: true } },
      },
    })
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' })
      return
    }
    res.json({ activity })
  })

  app.post('/activities/:id/join', requireAuth, async (req, res) => {
    const uid = userId(req)
    try {
      const threadId = await prisma.$transaction(async (tx) => {
        const activity = await tx.activity.findUnique({
          where: { id: req.params.id },
          include: { members: true, thread: true },
        })
        if (!activity) throw new HttpError(404, 'Activity not found')
        if (activity.members.some((m) => m.userId === uid)) {
          return activity.thread?.id
        }
        if (activity.members.length >= activity.maxMembers) {
          throw new HttpError(409, 'Activity is full')
        }
        await tx.activityMember.create({ data: { activityId: activity.id, userId: uid } })
        if (activity.thread) {
          await tx.threadParticipant.create({ data: { threadId: activity.thread.id, userId: uid } })
        }
        return activity.thread?.id
      })
      res.json({ joined: true, threadId })
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message })
        return
      }
      throw error
    }
  })

  app.get('/threads', requireAuth, async (req, res) => {
    const threads = await prisma.chatThread.findMany({
      where: { participants: { some: { userId: userId(req) } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
        messages: { orderBy: { sentAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({
      threads: threads.map((t) => ({
        id: t.id,
        kind: t.kind,
        title: t.title,
        activityId: t.activityId,
        participants: t.participants.map((p) => p.user),
        lastMessage: t.messages[0] ?? null,
      })),
    })
  })

  app.get('/threads/:id', requireAuth, async (req, res) => {
    const thread = await prisma.chatThread.findUnique({
      where: { id: req.params.id },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
        messages: { orderBy: { sentAt: 'asc' } },
      },
    })
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' })
      return
    }
    if (!thread.participants.some((p) => p.userId === userId(req))) {
      res.status(403).json({ error: 'Not a participant of this thread' })
      return
    }
    res.json({
      thread: {
        id: thread.id,
        kind: thread.kind,
        title: thread.title,
        activityId: thread.activityId,
        participants: thread.participants.map((p) => p.user),
        messages: thread.messages,
      },
    })
  })

  app.post('/threads/:id/messages', requireAuth, async (req, res) => {
    const { text } = req.body ?? {}
    if (typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'text is required' })
      return
    }
    const uid = userId(req)
    const participant = await prisma.threadParticipant.findUnique({
      where: { threadId_userId: { threadId: req.params.id, userId: uid } },
    })
    if (!participant) {
      res.status(403).json({ error: 'Not a participant of this thread' })
      return
    }
    const message = await prisma.message.create({
      data: { threadId: req.params.id, senderId: uid, text: text.trim() },
    })
    res.status(201).json({ message })
  })

  return app
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}
