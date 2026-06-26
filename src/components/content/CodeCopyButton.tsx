// =============================================================================
// CodeCopyButton — Client Component.
//
// Renders a copy button that reads the text content of the nearest ancestor
// <pre> element and writes it to the clipboard.  Uses DOM traversal to avoid
// hydration mismatches from server-generated IDs.
//
// Upgrade path (Phase 4):
//   - Swap inline SVGs for lucide-react <Copy /> / <Check />
//   - Add framer-motion AnimatePresence for copy-state transition
// =============================================================================

'use client'

import { useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Inline icons (zero-dependency — swap for lucide-react in Phase 4)
// ---------------------------------------------------------------------------

function CopyIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CodeCopyButton(): React.ReactElement {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const container = (event.target as HTMLElement).closest(
        '.notebook-code-block',
      )
      const pre = container?.querySelector('pre')
      if (pre?.textContent) {
        navigator.clipboard.writeText(pre.textContent).catch(() => {
          // Silently ignore clipboard errors (e.g. insecure context).
        })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    },
    [],
  )

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs transition-colors"
      style={{ color: 'var(--ink-muted)' }}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
