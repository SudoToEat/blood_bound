import { useRef, useEffect, RefObject } from 'react'

// 触摸手势类型
export type TouchGesture = 'tap' | 'longPress' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown' | 'doubleTap'

// 触摸配置选项
interface TouchOptions {
  onTap?: (e: TouchEvent) => void
  onLongPress?: (e: TouchEvent) => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', e: TouchEvent) => void
  onDoubleTap?: (e: TouchEvent) => void
  longPressDuration?: number // 长按触发时间（毫秒）
  swipeThreshold?: number // 滑动触发的最小距离（像素）
  doubleTapDelay?: number // 双击的最大间隔时间（毫秒）
  preventDefault?: boolean // 是否阻止默认行为
}

/**
 * 触摸手势 Hook
 * 用于处理移动端的各种触摸手势
 */
export function useTouch(ref: RefObject<HTMLElement>, options: TouchOptions = {}) {
  const {
    onTap,
    onLongPress,
    onSwipe,
    onDoubleTap,
    longPressDuration = 500,
    swipeThreshold = 50,
    doubleTapDelay = 300,
    preventDefault = false
  } = options

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTapTime = useRef<number>(0)
  const isSwiping = useRef(false)
  const longPressTriggered = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }

      isSwiping.current = false
      longPressTriggered.current = false

      // 设置长按计时器
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          longPressTriggered.current = true
          onLongPress(e)
        }, longPressDuration)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y

      // 如果移动距离超过阈值，取消长按
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
      }

      // 标记为正在滑动
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        isSwiping.current = true
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // 清除长按计时器
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const deltaTime = Date.now() - touchStart.current.time

      // 判断是否为滑动手势
      if (onSwipe && isSwiping.current) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 水平滑动
          if (Math.abs(deltaX) > swipeThreshold) {
            onSwipe(deltaX > 0 ? 'right' : 'left', e)
          }
        } else {
          // 垂直滑动
          if (Math.abs(deltaY) > swipeThreshold) {
            onSwipe(deltaY > 0 ? 'down' : 'up', e)
          }
        }
      }

      // 判断是否为点击或双击
      if (!isSwiping.current && !longPressTriggered.current && deltaTime < 300) {
        const now = Date.now()
        const timeSinceLastTap = now - lastTapTime.current

        if (onDoubleTap && timeSinceLastTap < doubleTapDelay) {
          // 双击
          onDoubleTap(e)
          lastTapTime.current = 0 // 重置，防止连续触发
        } else {
          // 单击
          if (onTap) {
            onTap(e)
          }
          lastTapTime.current = now
        }
      }

      touchStart.current = null
      isSwiping.current = false
      longPressTriggered.current = false
    }

    const handleTouchCancel = () => {
      // 清除长按计时器
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      touchStart.current = null
      isSwiping.current = false
      longPressTriggered.current = false
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [
    onTap,
    onLongPress,
    onSwipe,
    onDoubleTap,
    longPressDuration,
    swipeThreshold,
    doubleTapDelay,
    preventDefault
  ])
}

/**
 * 防误触 Hook
 * 延迟执行回调，只在确认不是误触后才执行
 */
export function useDebounceTouch(
  ref: RefObject<HTMLElement>,
  callback: (e: TouchEvent) => void,
  delay: number = 200
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchEnd = (e: TouchEvent) => {
      // 清除之前的计时器
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // 设置新的计时器
      timerRef.current = setTimeout(() => {
        callback(e)
      }, delay)
    }

    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchend', handleTouchEnd)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [callback, delay])
}
