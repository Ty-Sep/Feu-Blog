// =============================================================================
// LoadingContext — global loading state controller.
//
// Provides:
//   - startLoading() : start 180ms delay timer, show overlay if timeout
//   - stopLoading()  : clear timer, hide overlay immediately
//   - useLoading()   : hook to access state and methods
//
// 180ms delay is preserved: fast navigation never shows the overlay.
// =============================================================================

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoadingContextValue {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOADING_DELAY_MS = 180

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function LoadingProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const startLoading = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsLoading(true)
    }, LOADING_DELAY_MS)
  }, [])

  const stopLoading = useCallback(() => {
    clearTimeout(timerRef.current)
    setIsLoading(false)
  }, [])

  // 卸载清理
  React.useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext)
  if (!ctx) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return ctx
}