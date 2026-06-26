// =============================================================================
// Guestbook API — GET / POST / PATCH / DELETE
//
// Stores messages in data/guestbook.json.  No database required.
//
//   GET    → returns all messages sorted by date desc
//   POST   → creates a new message
//   PATCH  → edits an existing message (token-based ownership)
//   DELETE → deletes an existing message (token-based ownership)
//
// Rate limit: 3 POST per IP per hour.  Honeypot anti-spam.
// =============================================================================

import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuestbookMessage {
  id: string
  name: string
  message: string
  createdAt: string
  color: 'yellow' | 'blue' | 'pink'
  token: string
}

// ---------------------------------------------------------------------------
// Path
// ---------------------------------------------------------------------------

const DATA_PATH = join(process.cwd(), 'data', 'guestbook.json')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readMessages(): Promise<GuestbookMessage[]> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8')
    return JSON.parse(raw) as GuestbookMessage[]
  } catch {
    return []
  }
}

async function writeMessages(msgs: GuestbookMessage[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(msgs, null, 2), 'utf-8')
}

// Simple in-memory rate limiter (clears on server restart)
const rateMap = new Map<string, number[]>()

function checkRate(ip: string): boolean {
  const now = Date.now()
  const window = now - 3600_000 // 1 hour
  const timestamps = (rateMap.get(ip) ?? []).filter((t) => t > window)
  rateMap.set(ip, timestamps)
  return timestamps.length < 3
}

function recordHit(ip: string): void {
  const timestamps = rateMap.get(ip) ?? []
  timestamps.push(Date.now())
  rateMap.set(ip, timestamps)
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  const messages = await readMessages()
  // Return sorted by date descending; strip token for security
  const safe = messages
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ id, name, message, createdAt, color }) => ({
      id, name, message, createdAt, color,
    }))
  return NextResponse.json(safe)
}

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again later.' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const message = String(body.message ?? '').trim()
  const token = String(body.token ?? '').trim()
  const honeypot = String(body.website ?? '')

  // Honeypot — bots fill this hidden field
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true }) // silently succeed
  }

  if (!name || name.length < 2 || name.length > 32) {
    return NextResponse.json({ error: 'Name must be 2–32 characters' }, { status: 400 })
  }
  if (!message || message.length < 2 || message.length > 2000) {
    return NextResponse.json({ error: 'Message must be 2–2000 characters' }, { status: 400 })
  }

  const colors: Array<'yellow' | 'blue' | 'pink'> = ['yellow', 'blue', 'pink']
  const messages = await readMessages()

  const entry: GuestbookMessage = {
    id: randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
    color: colors[messages.length % 3]!,
    token,
  }

  messages.push(entry)
  await writeMessages(messages)
  recordHit(ip)

  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 })
}

// ---------------------------------------------------------------------------
// PATCH — edit own message (token-based)
// ---------------------------------------------------------------------------

export async function PATCH(request: Request): Promise<NextResponse> {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const id = String(body.id ?? '')
  const token = String(body.token ?? '')
  const newMessage = String(body.message ?? '').trim()

  if (!id || !token) {
    return NextResponse.json({ error: 'id and token required' }, { status: 400 })
  }
  if (!newMessage || newMessage.length < 2 || newMessage.length > 2000) {
    return NextResponse.json({ error: 'Message must be 2–2000 characters' }, { status: 400 })
  }

  const messages = await readMessages()
  const idx = messages.findIndex((m) => m.id === id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }
  if (messages[idx]!.token !== token) {
    return NextResponse.json({ error: 'Not authorized to edit this message' }, { status: 403 })
  }

  messages[idx]!.message = newMessage
  await writeMessages(messages)

  return NextResponse.json({ ok: true })
}

// ---------------------------------------------------------------------------
// DELETE — delete own message (token-based)
// ---------------------------------------------------------------------------

export async function DELETE(request: Request): Promise<NextResponse> {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const id = String(body.id ?? '')
  const token = String(body.token ?? '')

  if (!id || !token) {
    return NextResponse.json({ error: 'id and token required' }, { status: 400 })
  }

  const messages = await readMessages()
  const idx = messages.findIndex((m) => m.id === id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }
  if (messages[idx]!.token !== token) {
    return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 })
  }

  messages.splice(idx, 1)
  await writeMessages(messages)

  return NextResponse.json({ ok: true })
}
