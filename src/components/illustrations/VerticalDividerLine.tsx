// =============================================================================
// VerticalDividerLine — hand-drawn vertical wavy line for sidebar dividers.
//
// Used by TableOfContents and TocTabs to separate the sidebar from content.
// =============================================================================

import React from 'react'

export function VerticalDividerLine(): React.ReactElement {
  return (
    <svg
      className="absolute top-0 right-0 h-full w-[5px] pointer-events-none"
      viewBox="0 0 5 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2.5,0 Q0,25 2.5,50 Q5,75 2.5,100 Q0,125 2.5,150 Q5,175 2.5,200"
        fill="none"
        strokeLinecap="round"
        stroke="var(--ink-primary)"
      />
    </svg>
  )
}
