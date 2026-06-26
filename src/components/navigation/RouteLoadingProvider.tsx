// =============================================================================
// RouteLoadingProvider — renders loading overlay and auto-stops on navigation end.
//
// Responsibilities:
//   - Consume global loading state from LoadingContext
//   - Auto-call stopLoading() when pathname changes (navigation complete)
//   - Skip initial mount
//   - Render SmartRouteLoading overlay
// =============================================================================

'use client'

import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from './LoadingContext'
import SmartRouteLoading from './SmartRouteLoading'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouteLoadingProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const pathname = usePathname()
  const { isLoading, stopLoading } = useLoading()
  const isFirstMount = useRef(true)

  // -------------------------------------------------------------------------
  // Navigation complete → stop loading immediately
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    stopLoading()
  }, [pathname, stopLoading])

  return (
    <>
      {children}
      <SmartRouteLoading isLoading={isLoading} />
    </>
  )
}