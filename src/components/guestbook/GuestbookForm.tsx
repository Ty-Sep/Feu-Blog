// =============================================================================
// GuestbookForm — message writing form (no trigger button).
//
// The trigger (tall pencil) is rendered by GuestbookLayout.  This component
// is the form only — name, message, submit.  Uses localStorage for a
// persistent anonymous token so users can later edit/delete their own messages.
//
// Dependencies: none
// =============================================================================

'use client'

import React, { useState, useCallback, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuestbookFormProps {
  locale: string
  onSubmit: (data: { name: string; message: string; token: string }) => Promise<boolean>
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Token management (localStorage)
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'gb_token'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GuestbookForm({
  locale,
  onSubmit,
  onClose,
}: GuestbookFormProps): React.ReactElement {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Restore saved name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gb_name')
    if (saved) setName(saved)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      if (name.trim().length < 2) {
        setError(locale === 'zh' ? '昵称至少2个字符' : 'Name must be at least 2 characters')
        return
      }
      if (message.trim().length < 2) {
        setError(locale === 'zh' ? '留言至少2个字符' : 'Message must be at least 2 characters')
        return
      }

      setSending(true)
      try {
        const token = getToken()
        const ok = await onSubmit({ name: name.trim(), message: message.trim(), token })
        if (ok) {
          localStorage.setItem('gb_name', name.trim())
          setMessage('')
          setSuccess(true)
          setTimeout(() => {
            setSuccess(false)
            onClose()
          }, 1200)
        } else {
          setError(locale === 'zh' ? '发送失败，请重试' : 'Failed to send, please retry')
        }
      } catch {
        setError(locale === 'zh' ? '网络错误' : 'Network error')
      } finally {
        setSending(false)
      }
    },
    [name, message, locale, onSubmit, onClose],
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="
        p-[var(--space-6)]
        rounded
        border border-dashed
        max-w-md w-full
      "
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--ink-muted)',
        boxShadow: 'var(--shadow-note)',
      }}
    >
      {/* Name input */}
      <label className="block mb-[var(--space-4)]">
        <span className="text-xs mb-[var(--space-1)] block" style={{ color: 'var(--ink-secondary)' }}>
          {locale === 'zh' ? '昵称' : 'Name'}
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          required
          className="
            w-full px-[var(--space-2)] py-[var(--space-1)]
            text-sm rounded
            border bg-transparent
          "
          style={{
            color: 'var(--ink-primary)',
            borderColor: 'color-mix(in srgb, var(--ink-muted) 30%, transparent)',
            fontFamily: 'var(--font-body)',
          }}
        />
      </label>

      {/* Message textarea */}
      <label className="block mb-[var(--space-4)]">
        <span className="text-xs mb-[var(--space-1)] block" style={{ color: 'var(--ink-secondary)' }}>
          {locale === 'zh' ? '留言' : 'Message'}
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={4}
          required
          className="
            w-full px-[var(--space-2)] py-[var(--space-1)]
            text-sm rounded
            border bg-transparent
            resize-y
          "
          style={{
            color: 'var(--ink-primary)',
            borderColor: 'color-mix(in srgb, var(--ink-muted) 30%, transparent)',
            fontFamily: 'var(--font-body)',
          }}
        />
        <span className="text-[0.625rem] mt-px block text-right" style={{ color: 'var(--ink-muted)' }}>
          {message.length}/2000
        </span>
      </label>

      {/* Honeypot (hidden from humans) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
      />

      {/* Error / Success */}
      {error && (
        <p className="text-xs mb-[var(--space-3)]" style={{ color: 'var(--sticky-pink)' }}>{error}</p>
      )}
      {success && (
        <p className="text-xs mb-[var(--space-3)]" style={{ color: 'var(--accent-lab)' }}>
          {locale === 'zh' ? '留言成功！' : 'Message sent!'}
        </p>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-[var(--space-3)]">
        <button
          type="submit"
          disabled={sending}
          className="
            text-xs px-[var(--space-4)] py-[var(--space-1)]
            rounded-full
            transition-opacity
            disabled:opacity-50
          "
          style={{
            backgroundColor: 'var(--ink-primary)',
            color: 'var(--bg-page)',
          }}
        >
          {sending
            ? '...'
            : locale === 'zh'
              ? '贴到墙上'
              : 'Post'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs"
          style={{ color: 'var(--ink-muted)' }}
        >
          {locale === 'zh' ? '收起' : 'Close'}
        </button>
      </div>
    </form>
  )
}
