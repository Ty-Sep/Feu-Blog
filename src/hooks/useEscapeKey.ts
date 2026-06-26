// =============================================================================
// useEscapeKey — fires a callback when Escape is pressed.
// =============================================================================

import { useEffect, useRef } from 'react'

export function useEscapeKey(handler: () => void): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handlerRef.current()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
