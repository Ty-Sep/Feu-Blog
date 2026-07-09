// =============================================================================
// Bookshelf — 3-layer shelf with merged background + decorative figures.
// Fixed viewport height, no scroll. All sizes are tunable via constants.
// =============================================================================

import React from 'react'

import type { ContentCardProps } from '@/types'
import { Shelf } from './Shelf'
import bookwallImg from '@/image/bookwall.png'
import bookmanImg from '@/image/bookman.png'
import catImg from '@/image/cat.png'

// ---------------------------------------------------------------------------
// 🔧 所有可调整参数都在这里
// ---------------------------------------------------------------------------

/** 整个书架容器的垂直偏移：负值向上移，正值向下移 */
const SHELF_OFFSET_TOP = -25

/** 整个书架（背景+书本）的水平偏移：正值向右移，负值向左移 */
const SHELF_OFFSET_X = 40

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

// ---------------------------------------------------------------------------
// 🔧 左侧装饰图（bookman.png）参数
// ---------------------------------------------------------------------------

/** 装饰图宽度（px），高度会按图片比例自动缩放 */
const BOOKMAN_WIDTH = 120
/** 水平位置：距离组件左边缘的距离，正值向右移 */
const BOOKMAN_OFFSET_LEFT = -6
/** 垂直位置：距离组件底部的距离，正值向上移，负值向下移 */
const BOOKMAN_OFFSET_BOTTOM = 36

// ---------------------------------------------------------------------------
// 🔧 顶部装饰图（cat.png）参数
// ---------------------------------------------------------------------------

/** 猫咪图片宽度（px），高度会按图片比例自动缩放 */
const CAT_WIDTH = 130
/** 水平位置：距离组件左边缘的距离，正值向右移，负值向左移 */
const CAT_OFFSET_LEFT = 120
/** 垂直位置：距离容器顶部的距离，正值向下移，负值向上移 */
const CAT_OFFSET_TOP = -50

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
      className="w-full overflow-x-hidden relative"
      style={{
        height: CONTAINER_HEIGHT,
        marginTop: `${SHELF_OFFSET_TOP}px`,
        backgroundImage: `url(${bookwallImg.src})`,
        backgroundSize: BACKGROUND_SIZE,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `calc(50% + ${SHELF_OFFSET_X}px) top`,
      }}
    >
      {/* 顶部猫咪装饰图 */}
      <img
        src={catImg.src}
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          width: `${CAT_WIDTH}px`,
          left: `${CAT_OFFSET_LEFT}px`,
          top: `${CAT_OFFSET_TOP}px`,
          zIndex: 3,
        }}
      />

      {/* 左侧装饰人物图 */}
      <img
        src={bookmanImg.src}
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          width: `${BOOKMAN_WIDTH}px`,
          left: `${BOOKMAN_OFFSET_LEFT}px`,
          bottom: `${BOOKMAN_OFFSET_BOTTOM}px`,
          zIndex: 2,
        }}
      />

      {/* 书架内容区 —— 与背景图同步偏移，保持对齐 */}
      <div
        className="w-full h-full"
        style={{
          paddingTop: `${TOP_PADDING}px`,
          paddingLeft: `${HORIZONTAL_PADDING + SHELF_OFFSET_X}px`,
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