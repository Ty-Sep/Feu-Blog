// =============================================================================
// LangTemplate — pure fade page transition (stable render version).
// Fixed: text shift / jitter caused by scrollbar toggle & font rendering switch.
// =============================================================================

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

// ---------------------------------------------------------------------------
// Variants — pure fade, no transform
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
}

const pageTransition = {
  duration: 0.4,
  ease: 'easeOut' as const,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LangTemplate({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const pathname = usePathname()

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          style={{
            position: 'absolute',
            inset: 0,
            willChange: 'opacity',
            // 修复1：强制提升为GPU合成层，稳定渲染，避免图层切换抖动
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            // 修复2：统一字体抗锯齿模式，全程灰度渲染
            // 避免 opacity 变化时，亚像素渲染开关导致的文字跳变
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}