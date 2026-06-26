// =============================================================================
// useClickOutside — fires a callback when a click occurs outside a ref.
// 从 pointerdown 改为 click，避免和纸飞机 click 事件产生时序竞态
// =============================================================================

import { useEffect, useRef } from 'react'

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        handlerRef.current()
      }
    }

    // 延迟注册，避免打开弹窗的点击直接触发关闭
    const id = setTimeout(() => {
      document.addEventListener('click', onClick)
    }, 0)

    return () => {
      clearTimeout(id)
      document.removeEventListener('click', onClick)
    }
  }, [ref])
}