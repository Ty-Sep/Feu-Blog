// =============================================================================
// WorkspaceBoard — homepage module orchestrator.
//
// Iterates over HomepageModuleData[] and renders a HomepageModule for each
// content type, separated by SketchDivider.  Owns zero data-fetching logic —
// all data arrives via props.
//
// Dependencies:
//   - HomepageModule  (Phase 4C)
//   - SketchDivider   (Phase 4A)
//   - card-config     (Phase 2, for module title labels)
// =============================================================================

import React from 'react'

import type { Locale, HomepageModuleData } from '@/types'
import { getCardConfig } from '@/tokens/card-config'

import { HomepageModule } from '@/components/sections/HomepageModule'
import { SketchDivider } from '@/components/primitives/SketchDivider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkspaceBoardProps {
  modules: HomepageModuleData[]
  locale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkspaceBoard({
  modules,
  locale,
  className = '',
}: WorkspaceBoardProps): React.ReactElement | null {
  if (modules.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {modules.map((mod, i) => (
        <React.Fragment key={mod.type}>
          {i > 0 && <SketchDivider className="my-[var(--space-12)]" />}

          <HomepageModule
            title={getCardConfig(mod.type).label[locale]}
            cards={mod.cards}
            locale={locale}
            type={mod.type}
          />
        </React.Fragment>
      ))}
    </div>
  )
}
