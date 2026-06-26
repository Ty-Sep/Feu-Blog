// =============================================================================
// GuestbookNote — a single guestbook message rendered as a sticky note.
//
// Supports edit mode and delete when the user owns this message (token match).
// Hover triggers a gentle wobble animation via framer-motion.
//
// Dependencies:
//   - StickyNote  (Phase 4A)
//   - framer-motion
// =============================================================================

'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { StickyNote } from '@/components/primitives/StickyNote'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuestbookMessage {
  id: string
  name: string
  message: string
  createdAt: string
  color: 'yellow' | 'blue' | 'pink'
}

export interface GuestbookNoteProps {
  message: GuestbookMessage
  isOwner: boolean
  onEdit: (id: string, newMessage: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  locale: string
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ---------------------------------------------------------------------------
// Wobble keyframes — gentle sway like a pinned note
// ---------------------------------------------------------------------------

const wobble = (base: number) => ({
  rotate: [
    base,
    base + 1.8,
    base - 1.3,
    base + 1.0,
    base - 0.7,
    base + 0.4,
    base,
  ],
  transition: {
    duration: 0.7,
    ease: 'easeInOut',
  },
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GuestbookNote({
  message,
  isOwner,
  onEdit,
  onDelete,
  locale,
}: GuestbookNoteProps): React.ReactElement {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(message.message)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const rotation = ((message.message.length * 7) % 5 - 2) * 1.2 // deterministic

  const handleSave = useCallback(async () => {
    if (text.trim().length < 2) return
    setSaving(true)
    try {
      await onEdit(message.id, text.trim())
      setEditing(false)
    } catch {
      // keep editing mode on error
    } finally {
      setSaving(false)
    }
  }, [text, message.id, onEdit])

  const handleCancel = useCallback(() => {
    setText(message.message)
    setEditing(false)
  }, [message.message])

  const handleDelete = useCallback(async () => {
    const label = locale === 'zh' ? '确定要删除这条留言吗？' : 'Delete this message?'
    if (!window.confirm(label)) return
    setDeleting(true)
    try {
      await onDelete(message.id)
      window.location.reload()
    } catch {
      setDeleting(false)
    }
  }, [message.id, onDelete, locale])

  return (
    <motion.div
      style={{ transform: `rotate(${rotation}deg)` }}
      whileHover={wobble(rotation)}
    >
      <StickyNote color={message.color} rotation={0}>
        <div className="min-w-[10rem] max-w-[18rem]">
          {/* Header: name + date */}
          <div className="flex items-baseline justify-between gap-[var(--space-2)] mb-[var(--space-2)]">
            <span
              className="font-title text-sm leading-tight"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--ink-primary)' }}
            >
              {message.name}
            </span>
            <time
              dateTime={message.createdAt}
              className="text-[0.625rem] flex-shrink-0"
              style={{ color: 'var(--ink-muted)' }}
            >
              {formatDate(message.createdAt, locale)}
            </time>
          </div>

          {/* Body */}
          {editing ? (
            <div className="flex flex-col gap-[var(--space-2)]">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="
                  w-full min-h-[4rem] p-[var(--space-2)]
                  text-xs leading-relaxed
                  rounded border
                  resize-y
                  bg-[var(--bg-page)]
                "
                style={{
                  color: 'var(--ink-primary)',
                  borderColor: 'var(--ink-muted)',
                  fontFamily: 'var(--font-body)',
                }}
                maxLength={2000}
                autoFocus
              />
              <div className="flex items-center gap-[var(--space-2)]">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || text.trim().length < 2}
                  className="
                    text-[0.625rem] px-[var(--space-2)] py-[var(--space-1)]
                    rounded-full
                    transition-colors
                    disabled:opacity-40
                  "
                  style={{
                    backgroundColor: 'var(--ink-primary)',
                    color: 'var(--bg-page)',
                  }}
                >
                  {saving ? '...' : locale === 'zh' ? '保存' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="text-[0.625rem]"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  {locale === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <p
              className="text-xs leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--ink-secondary)' }}
            >
              {message.message}
            </p>
          )}

          {/* ── Owner actions: edit + delete (hand-drawn icons, top-right) ── */}
          {isOwner && !editing && (
            <div className="absolute top-[var(--space-2)] right-[var(--space-2)] flex items-center gap-[var(--space-1)]">
              {/* Edit — pencil icon */}
              <button
                type="button"
                onClick={() => {
                  setText(message.message)
                  setEditing(true)
                }}
                className="p-[var(--space-1)] rounded transition-colors hover:bg-black/5"
                aria-label={locale === 'zh' ? '编辑留言' : 'Edit message'}
                style={{ color: 'var(--ink-muted)' }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M 11 2 L 14 5 L 5 14 L 2 14 L 2 11 Z" />
                  <line x1="10" y1="5" x2="12" y2="3" />
                </svg>
              </button>

              {/* Delete — hand-drawn × */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-[var(--space-1)] rounded transition-colors hover:bg-black/5 disabled:opacity-40"
                aria-label={locale === 'zh' ? '删除留言' : 'Delete message'}
                style={{ color: 'var(--ink-muted)' }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M 3.5 3 Q 7 7 10.5 11" />
                  <path d="M 10.5 3 Q 7 7 3.5 11" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </StickyNote>
    </motion.div>
  )
}
