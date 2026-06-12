import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Anthropic from '@anthropic-ai/sdk'

import { generateStoryboard, demoStoryboard } from './lib/storyboard.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000
const DEMO_MODE = !process.env.ANTHROPIC_API_KEY

const STATIC_FILES = {
  '/': { path: 'public/index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { path: 'public/index.html', type: 'text/html; charset=utf-8' },
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
    if (Buffer.concat(chunks).length > 1_000_000) {
      throw Object.assign(new Error('请求体过大'), { statusCode: 413 })
    }
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'))
}

async function handleGenerate(req, res) {
  let input
  try {
    input = await readJsonBody(req)
  } catch (err) {
    return sendJson(res, err.statusCode || 400, { error: '请求体不是有效的 JSON' })
  }

  const script = typeof input.script === 'string' ? input.script.trim() : ''
  if (!script) {
    return sendJson(res, 400, { error: '请填写剧本或故事梗概' })
  }
  const style = typeof input.style === 'string' ? input.style.trim() : ''
  const shotCount = Number.isInteger(input.shotCount) ? input.shotCount : 12

  if (DEMO_MODE) {
    return sendJson(res, 200, {
      demo: true,
      storyboard: demoStoryboard({ style, shotCount }),
    })
  }

  try {
    const storyboard = await generateStoryboard({ script, style, shotCount })
    return sendJson(res, 200, { demo: false, storyboard })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return sendJson(res, 401, { error: 'ANTHROPIC_API_KEY 无效，请检查环境变量。' })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return sendJson(res, 429, { error: '请求过于频繁，请稍后重试。' })
    }
    if (err instanceof Anthropic.APIError) {
      return sendJson(res, 502, { error: `Claude API 错误（${err.status}）：${err.message}` })
    }
    return sendJson(res, 500, { error: err.message || '生成失败，请重试。' })
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'POST' && url.pathname === '/api/generate') {
    return handleGenerate(req, res)
  }

  if (req.method === 'GET' && url.pathname === '/api/status') {
    return sendJson(res, 200, { demo: DEMO_MODE })
  }

  const file = req.method === 'GET' ? STATIC_FILES[url.pathname] : undefined
  if (file) {
    const body = await readFile(join(__dirname, file.path))
    res.writeHead(200, { 'content-type': file.type })
    return res.end(body)
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`AI 电影分镜工具运行在 http://localhost:${PORT}`)
  if (DEMO_MODE) {
    console.log('未检测到 ANTHROPIC_API_KEY，当前为演示模式（返回内置示例分镜）。')
  }
})
