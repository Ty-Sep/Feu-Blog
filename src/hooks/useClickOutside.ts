// =============================================================================
// useClickOutside — fires a callback when a pointerdown occurs outside a ref.
// =============================================================================

import { useEffect, useRef } from 'react'

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        handlerRef.current()
      }
    }

    // Delayed registration to avoid the open-click itself triggering close
    const id = setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown)
    }, 0)

    return () => {
      clearTimeout(id)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [ref])
}
