// =============================================================================
// GuestbookLayout — large kraft-paper book with sticky-note messages.
//
// Phase 10.5 redesign:
//   - Near-fullscreen open book with spine, ruled lines, page-stack texture
//   - Tall pencil on the right side (matches book height, realistic)
//   - Click pencil → modal form overlay
//   - Sticky notes with hover wobble + owner edit/delete actions
//
// Dependencies:
//   - SiteShell, GuestbookNote, GuestbookForm, Title
//   - framer-motion (via GuestbookNote)
// =============================================================================

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import type { Locale } from '@/lib/types'
import { SiteShell } from '@/components/layouts/SiteShell'
import { Title } from '@/components/typography/Title'
import { GuestbookNote } from '@/components/guestbook/GuestbookNote'
import { GuestbookForm } from '@/components/guestbook/GuestbookForm'
import type { GuestbookMessage } from '@/components/guestbook/GuestbookNote'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuestbookLayoutProps {
  locale: Locale
  messages: GuestbookMessage[]
  className?: string
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS: Record<Locale, { title: string; empty: string }> = {
  zh: { title: '留言板', empty: '还没有留言，来做第一个写下留言的人吧 ✎' },
  en: { title: 'Guestbook', empty: 'No messages yet. Be the first to leave one ✎' },
}

// ---------------------------------------------------------------------------
// localStorage helpers (client-only)
// ---------------------------------------------------------------------------

function getOwnedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('gb_my_ids') ?? '[]') as string[]
  } catch {
    return []
  }
}

function addOwnedId(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getOwnedIds()
    if (!ids.includes(id)) {
      ids.push(id)
      localStorage.setItem('gb_my_ids', JSON.stringify(ids))
    }
  } catch { /* noop */ }
}

function removeOwnedId(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getOwnedIds().filter((i) => i !== id)
    localStorage.setItem('gb_my_ids', JSON.stringify(ids))
  } catch { /* noop */ }
}

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('gb_token') ?? ''
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GuestbookLayout({
  locale,
  messages,
  className = '',
}: GuestbookLayoutProps): React.ReactElement {
  const t = LABELS[locale]
  const [formOpen, setFormOpen] = useState(false)
  const [ownedIds, setOwnedIds] = useState<string[]>([])
  // Hydration-safe: read localStorage only on the client
  useEffect(() => {
    setOwnedIds(getOwnedIds())
  }, [])

  // ── Submit handler (POST) ──
  const handleSubmit = useCallback(
    async (data: { name: string; message: string; token: string }): Promise<boolean> => {
      try {
        const res = await fetch('/api/guestbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) return false
        const result = (await res.json()) as { ok: boolean; id?: string }
        if (result.id) {
          addOwnedId(result.id)
          setOwnedIds(getOwnedIds())
        }
        window.location.reload()
        return true
      } catch {
        return false
      }
    },
    [],
  )

  // ── Edit handler (PATCH) ──
  const handleEdit = useCallback(
    async (id: string, newMessage: string): Promise<void> => {
      const token = getToken()
      const res = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token, message: newMessage }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Edit failed')
      }
    },
    [],
  )

  // ── Delete handler (DELETE) ──
  const handleDelete = useCallback(async (id: string): Promise<void> => {
    const token = getToken()
    const res = await fetch('/api/guestbook', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token }),
    })
    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      throw new Error(data.error ?? 'Delete failed')
    }
    removeOwnedId(id)
    setOwnedIds(getOwnedIds())
  }, [])

  // ── Close modal ──
  const handleCloseForm = useCallback(() => setFormOpen(false), [])

  return (
    <SiteShell locale={locale} className={className}>
      {/* ── Book + Pencil container ── */}
      <div className="relative w-full max-w-5xl mx-auto mt-[var(--space-6)] mb-[var(--space-12)]">
        <div className="relative pr-10 sm:pr-12">
          {/* ══════════════════════════════════════════════════════
              Kraft Paper Book
              ══════════════════════════════════════════════════════ */}
          <div
            className="relative rounded-r-sm min-h-[75vh] p-[var(--space-6)] sm:p-[var(--space-10)]"
            style={{
              // Kraft paper gradient (warm browns)
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 34px,
                  rgba(139, 119, 80, 0.05) 34px,
                  rgba(139, 119, 80, 0.05) 35px
                ),
                linear-gradient(
                  145deg,
                  #f6e8c9 0%,
                  #f1dcb8 18%,
                  #f5e6c8 35%,
                  #efd9aa 55%,
                  #f5e6c8 75%,
                  #e9d6a2 100%
                )
              `,
              // Left spine + depth shadow
              boxShadow: `
                inset 14px 0 36px rgba(139, 119, 80, 0.06),
                inset 0 0 120px rgba(139, 119, 80, 0.04),
                5px 8px 24px rgba(0, 0, 0, 0.13)
              `,
              border: '1px solid rgba(139, 119, 80, 0.10)',
              borderLeft: '5px solid rgba(139, 119, 80, 0.16)',
            }}
          >
            {/* Book corner fold — top-right */}
            <div
              className="absolute top-0 right-0 w-10 h-10 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(139,119,80,0.06) 50%, rgba(139,119,80,0.10) 80%, rgba(139,119,80,0.06) 100%)',
                borderRadius: '0 2px 0 0',
              }}
            />

            {/* Title */}
            <Title as="h1" className="mb-[var(--space-8)]">
              <svg
                className="inline-block w-5 h-5 mr-[var(--space-2)] -mt-0.5 align-middle"
                viewBox="0 0 20 20" fill="none" aria-hidden="true"
              >
                <rect x="2" y="3" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M 5 7 L 15 7" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 5 10 L 12 10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 5 13 L 10 13" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              {t.title}
            </Title>

            {/* Messages grid */}
            {messages.length === 0 ? (
              <p
                className="text-sm italic mt-[var(--space-12)] text-center"
                style={{ color: 'var(--ink-muted)' }}
              >
                {t.empty}
              </p>
            ) : (
              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                  gap-[var(--space-4)] sm:gap-[var(--space-5)]
                  items-start
                "
              >
                {messages.map((msg) => (
                  <GuestbookNote
                    key={msg.id}
                    message={msg}
                    isOwner={ownedIds.includes(msg.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    locale={locale}
                  />
                ))}
              </div>
            )}

            {/* Page-stack bottom edge */}
            <div
              className="absolute -bottom-[6px] left-1 right-1 h-[10px] rounded-b-sm pointer-events-none -z-10"
              style={{
                background: 'linear-gradient(to bottom, rgba(139,119,80,0.10), rgba(139,119,80,0.03) 50%, transparent)',
              }}
            />
          </div>

          {/* ══════════════════════════════════════════════════════
              Tall Pencil (right side, matches book height)
              ══════════════════════════════════════════════════════ */}
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="
              absolute right-0 top-6 bottom-6 w-7 sm:w-8
              flex flex-col items-center
              cursor-pointer
              transition-transform duration-300
              hover:rotate-[3deg] hover:scale-[1.03]
              focus-visible:outline-2 focus-visible:outline-offset-4
            "
            style={{
              transform: 'rotate(1.2deg)',
              transformOrigin: 'center center',
              outlineColor: 'var(--ink-primary)',
            }}
            aria-label={locale === 'zh' ? '写留言' : 'Write a message'}
          >
            {/* Eraser — soft pink, rounded top */}
            <div
              className="w-6 sm:w-7 h-6 sm:h-7 rounded-t-sm flex-shrink-0"
              style={{ background: '#e8a0a0' }}
            />

            {/* Ferrule — silver band with crimp lines */}
            <div
              className="w-6 sm:w-7 h-[10px] flex flex-col flex-shrink-0"
              style={{ background: '#c8c8c8' }}
            >
              <div className="flex-1" style={{ borderBottom: '1px solid #aaa' }} />
              <div className="flex-1" style={{ borderBottom: '1px solid #bbb' }} />
            </div>

            {/* Body — yellow, flexible height with facet gradient */}
            <div
              className="flex-1 w-6 sm:w-7 relative overflow-hidden min-h-[60px]"
              style={{
                background: 'linear-gradient(90deg, #f4c542 0%, #ebba35 22%, #f4c542 48%, #ebba35 78%, #f4c542 100%)',
              }}
            >
              {/* Subtle "No.2" text running down the pencil */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className="text-[5px] sm:text-[6px] tracking-[0.15em]"
                  style={{
                    writingMode: 'vertical-rl',
                    color: 'rgba(0,0,0,0.10)',
                    fontFamily: 'var(--font-title)',
                  }}
                >
                  No.2
                </span>
              </div>
            </div>

            {/* Wood cone — beige triangle */}
            <div
              className="w-0 h-0 flex-shrink-0"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '16px solid #d4a574',
              }}
            />

            {/* Lead tip — dark gray */}
            <div
              className="w-0 h-0 flex-shrink-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '5px solid #444',
              }}
            />
          </button>

          {/* Page-stack beneath the pencil side */}
          <div
            className="absolute right-[-2px] top-0 bottom-0 w-[3px] pointer-events-none -z-10 rounded-r-sm"
            style={{
              background: 'linear-gradient(to right, rgba(139,119,80,0.08), rgba(139,119,80,0.02))',
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          Form Modal (appears on pencil click)
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-4)]"
            style={{ backgroundColor: 'rgba(60, 45, 25, 0.35)' }}
            onClick={handleCloseForm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <GuestbookForm
                locale={locale}
                onSubmit={handleSubmit}
                onClose={handleCloseForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteShell>
  )
}
