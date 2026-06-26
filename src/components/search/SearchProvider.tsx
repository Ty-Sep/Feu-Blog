// =============================================================================
// SearchProvider — React Context for search data.
//
// Wraps the [lang] layout so that SearchCommand (rendered deep inside
// SiteShell) can read the pre-computed search index without prop-drilling
// through every layout.
//
// Dependencies:
//   - @/lib/search-data  (SearchEntry type)
// =============================================================================

'use client'

import React, { createContext, useContext } from 'react'
import type { SearchEntry } from '@/lib/search-data'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SearchContext = createContext<SearchEntry[]>([])

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSearchEntries(): SearchEntry[] {
  return useContext(SearchContext)
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface SearchProviderProps {
  entries: SearchEntry[]
  children: React.ReactNode
}

export function SearchProvider({
  entries,
  children,
}: SearchProviderProps): React.ReactElement {
  return (
    <SearchContext.Provider value={entries}>
      {children}
    </SearchContext.Provider>
  )
}
