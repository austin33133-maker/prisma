import { randomBytes } from 'node:crypto'
import { NextFunction, Request, Response } from 'express'

import { prisma } from './db'

export interface AuthedRequest extends Request {
  userId: string
}

export function newToken(): string {
  return randomBytes(32).toString('hex')
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }
  const record = await prisma.authToken.findUnique({ where: { token } })
  if (!record) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }
  ;(req as AuthedRequest).userId = record.userId
  next()
}
