// =============================================================================
// SearchCommand — cmdk-powered search dialog + header trigger button.
//
// A single self-contained client component that SiteShell drops in.
//
//   - Renders the magnifying-glass trigger button inline
//   - Opens a cmdk command-palette overlay on click or Ctrl+K
//   - Fuzzy-searches across title, description, and tags
//   - Groups results by content type
//   - Navigates to article on selection
//
// Dependencies:
//   - cmdk  (Command)
//   - @/lib/search-data  (SearchEntry)
// =============================================================================

'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'

import { useSearchEntries } from '@/components/search/SearchProvider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchCommandProps {
  locale: string
}

// ---------------------------------------------------------------------------
// Locale labels
// ---------------------------------------------------------------------------

const LABELS = {
  zh: { placeholder: '搜索文章...',  empty: '没有找到结果' },
  en: { placeholder: 'Search articles...', empty: 'No results found' },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchCommand({
  locale,
}: SearchCommandProps): React.ReactElement {
  const entries = useSearchEntries()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const t = locale === 'zh' ? LABELS.zh : LABELS.en

  // ── Keyboard shortcut: Ctrl+K / ⌘K ──
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    },
    [],
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  // ── Navigate on select ──
  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  // ── Close helpers ──
  const close = useCallback(() => setOpen(false), [])
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => { if (e.target === e.currentTarget) close() },
    [close],
  )

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          Trigger button — sits in the header
          ═══════════════════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={locale === 'zh' ? '搜索 (Ctrl+K)' : 'Search (Ctrl+K)'}
        title={locale === 'zh' ? '搜索 (Ctrl+K)' : 'Search (Ctrl+K)'}
        className="
          p-[var(--space-1)]
          rounded-sketch
          transition-colors duration-fade
          hover:bg-[var(--bg-card)]
          focus-visible:outline-2 focus-visible:outline-offset-2
        "
        style={{ color: 'var(--ink-muted)', outlineColor: 'var(--ink-primary)' }}
      >
        <svg
          width="18" height="18"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* ═══════════════════════════════════════════════════════════════════
          Dialog overlay
          ═══════════════════════════════════════════════════════════════════ */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={handleBackdropClick}
          onKeyDown={(e) => { if (e.key === 'Escape') close() }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--overlay-bg)' }} />

          {/* Command palette */}
          <div
            className="
              relative mx-auto mt-[15vh]
              w-full max-w-[32rem]
              rounded-sketch overflow-hidden
            "
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-note)',
              border: '1px solid var(--ink-muted)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Search">
              {/* ── Input row ── */}
              <div
                className="flex items-center border-b px-[var(--space-4)] py-[var(--space-3)]"
                style={{ borderColor: 'color-mix(in srgb, var(--ink-muted) 20%, transparent)' }}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"
                  className="mr-[var(--space-2)] flex-shrink-0"
                  style={{ color: 'var(--ink-muted)' }}
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>

                <Command.Input
                  ref={inputRef}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-body)' }}
                />

                <kbd
                  className="ml-[var(--space-2)] text-[0.625rem] px-[var(--space-1)] py-px rounded select-none"
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--ink-muted)',
                    border: '1px solid',
                    borderColor: 'color-mix(in srgb, var(--ink-muted) 25%, transparent)',
                  }}
                >Esc</kbd>
              </div>

              {/* ── Results ── */}
              <Command.List
                className="max-h-[18rem] overflow-y-auto p-[var(--space-2)]"
                style={{ scrollbarColor: 'var(--ink-muted) transparent' }}
              >
                <Command.Empty
                  className="py-[var(--space-6)] text-center text-sm"
                  style={{ color: 'var(--ink-muted)' }}
                >{t.empty}</Command.Empty>

                {Array.from(new Set(entries.map((e) => e.type))).map((type) => (
                  <Command.Group
                    key={type}
                    heading={entries.find((e) => e.type === type)?.typeLabel ?? type}
                  >
                    {entries
                      .filter((e) => e.type === type)
                      .map((entry) => (
                        <Command.Item
                          key={`${entry.type}-${entry.slug}`}
                          value={`${entry.title} ${entry.description} ${entry.tags}`}
                          onSelect={() => handleSelect(entry.href)}
                          className="
                            flex flex-col
                            px-[var(--space-3)] py-[var(--space-2)]
                            rounded cursor-pointer text-sm
                            data-[selected=true]:bg-[var(--bg-page)]
                          "
                          style={{ color: 'var(--ink-primary)' }}
                        >
                          <span className="font-medium leading-tight">{entry.title}</span>
                          {entry.description && (
                            <span
                              className="text-xs leading-relaxed mt-px line-clamp-1"
                              style={{ color: 'var(--ink-secondary)' }}
                            >{entry.description}</span>
                          )}
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* ── Footer shortcuts ── */}
              <div
                className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-2)] border-t text-[0.625rem]"
                style={{
                  borderColor: 'color-mix(in srgb, var(--ink-muted) 20%, transparent)',
                  color: 'var(--ink-muted)',
                }}
              >
                <span><Kbd>↑↓</Kbd> Navigate</span>
                <span><Kbd>Enter</Kbd> Open</span>
                <span><Kbd>Esc</Kbd> Close</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Tiny kbd helper
// ---------------------------------------------------------------------------

function Kbd({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <kbd
      className="px-[var(--space-1)] py-px rounded"
      style={{
        backgroundColor: 'var(--bg-page)',
        border: '1px solid',
        borderColor: 'color-mix(in srgb, var(--ink-muted) 25%, transparent)',
      }}
    >{children}</kbd>
  )
}
