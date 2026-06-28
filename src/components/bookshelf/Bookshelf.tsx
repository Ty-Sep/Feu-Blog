// =============================================================================
// Bookshelf — 3-layer shelf with merged background image.
// Fixed viewport height, no scroll. All sizes are tunable via constants.
// =============================================================================

import React from 'react'

import type { ContentCardProps } from '@/types'
import { Shelf } from './Shelf'
import bookwallImg from '@/image/bookwall.png'

// ---------------------------------------------------------------------------
// 🔧 所有可调整参数都在这里
// ---------------------------------------------------------------------------

/** 书架容器总高度 —— 调整这个值让书架刚好占满整屏，消除滚动条 */
const CONTAINER_HEIGHT = 'calc(108vh - 140px)'

/** bookwall 背景图尺寸 —— 调整这个值直接改变背景图的长宽缩放 */
const BACKGROUND_SIZE = '108% auto'

/** 每层书架摆放的书本数量 */
const BOOKS_PER_LAYER = 9
/** 第一层书本距离书架顶部的垂直起始位置 */
const TOP_PADDING = 39
/** 两层书本之间的垂直间距 */
const LAYER_GAP = 160
/** 书本距离书架左右边缘的水平起始位置 */
const HORIZONTAL_PADDING = 82

const SHELF_OFFSET_TOP = -25

// ---------------------------------------------------------------------------
// Helper: chunk array into layers
// ---------------------------------------------------------------------------

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BookshelfProps {
  cards: ContentCardProps[]
}

export function Bookshelf({ cards }: BookshelfProps): React.ReactElement {
  const layers = chunk(cards, BOOKS_PER_LAYER)
  const displayLayers = [...layers, [], []].slice(0, 3)

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        height: CONTAINER_HEIGHT,
        marginTop: `${SHELF_OFFSET_TOP}px`,
        backgroundImage: `url(${bookwallImg.src})`,
        backgroundSize: BACKGROUND_SIZE,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
      }}
    >
      <div
        className="w-full h-full"
        style={{
          paddingTop: `${TOP_PADDING}px`,
          paddingLeft: `${HORIZONTAL_PADDING}px`,
          paddingRight: `${HORIZONTAL_PADDING}px`,
        }}
      >
        <div
          className="flex flex-col"
          style={{ gap: `${LAYER_GAP}px` }}
        >
          {displayLayers.map((layerBooks, idx) => (
            <Shelf key={idx} books={layerBooks} layerIndex={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}