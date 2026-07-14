'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import type { DesktopAppId, DesktopWindowMode } from './DesktopShellContext'

type WindowPosition = {
  x: number
  y: number
}

type WindowSize = {
  height: number
  width: number
}

export type WindowResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

type DragOperation = {
  handle: HTMLElement
  moved: boolean
  offsetX: number
  offsetY: number
  pointerId: number
  startPosition: WindowPosition
  wasPositioned: boolean
}

type ResizeOperation = {
  direction: WindowResizeDirection
  handle: HTMLElement
  pointerId: number
  started: boolean
  startClientX: number
  startClientY: number
  startPosition: WindowPosition
  startSize: WindowSize
  wasPositioned: boolean
  wasSized: boolean
}

type UseDraggableWindowOptions<T extends HTMLElement> = {
  appId: DesktopAppId
  minHeight?: number
  minWidth?: number
  mode: DesktopWindowMode
  resizable?: boolean
  windowRef: RefObject<T | null>
}

const WINDOW_GUTTER = 4
const DRAG_THRESHOLD = 3
const KEYBOARD_RESIZE_STEP = 16
const RESIZE_DIRECTIONS = new Set<WindowResizeDirection>([
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
])

function isResizeDirection(value: string | undefined): value is WindowResizeDirection {
  return Boolean(value && RESIZE_DIRECTIONS.has(value as WindowResizeDirection))
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function canManipulateWindow() {
  return window.matchMedia('(min-width: 640px)').matches
}

function workArea() {
  const taskbarTop = document
    .querySelector<HTMLElement>('[data-desktop-taskbar]')
    ?.getBoundingClientRect().top

  return {
    bottom: taskbarTop ?? window.innerHeight,
    left: 0,
    right: window.innerWidth,
    top: 0,
  }
}

function clampPosition(element: HTMLElement, position: WindowPosition): WindowPosition {
  const bounds = workArea()
  const rect = element.getBoundingClientRect()
  const horizontalGutter =
    rect.width + WINDOW_GUTTER * 2 <= bounds.right - bounds.left ? WINDOW_GUTTER : 0
  const verticalGutter =
    rect.height + WINDOW_GUTTER * 2 <= bounds.bottom - bounds.top ? WINDOW_GUTTER : 0
  const minX = bounds.left + horizontalGutter
  const minY = bounds.top + verticalGutter
  const maxX = Math.max(minX, bounds.right - rect.width - horizontalGutter)
  const maxY = Math.max(minY, bounds.bottom - rect.height - verticalGutter)

  return {
    x: Math.min(Math.max(position.x, minX), maxX),
    y: Math.min(Math.max(position.y, minY), maxY),
  }
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest('button, a, input, select, textarea, [data-window-no-drag]'))
  )
}

export default function useDraggableWindow<T extends HTMLElement>({
  appId,
  minHeight = 224,
  minWidth = 352,
  mode,
  resizable = false,
  windowRef,
}: UseDraggableWindowOptions<T>) {
  const positionRef = useRef<WindowPosition | null>(null)
  const sizeRef = useRef<WindowSize | null>(null)
  const pendingPositionRef = useRef<WindowPosition | null>(null)
  const pendingSizeRef = useRef<WindowSize | null>(null)
  const dragOperationRef = useRef<DragOperation | null>(null)
  const resizeOperationRef = useRef<ResizeOperation | null>(null)
  const dragAnimationFrameRef = useRef<number | null>(null)
  const resizeAnimationFrameRef = useRef<number | null>(null)
  const lastDragAt = useRef(0)
  const [positioned, setPositioned] = useState(false)
  const [sized, setSized] = useState(false)

  const applyPosition = useCallback(
    (nextPosition: WindowPosition) => {
      const element = windowRef.current
      if (!element) return

      const position = clampPosition(element, nextPosition)
      positionRef.current = position
      element.style.setProperty('--desktop-window-x', `${Math.round(position.x)}px`)
      element.style.setProperty('--desktop-window-y', `${Math.round(position.y)}px`)
    },
    [windowRef]
  )

  const applySize = useCallback(
    (nextSize: WindowSize) => {
      const element = windowRef.current
      if (!element) return

      const bounds = workArea()
      const rect = element.getBoundingClientRect()
      const position = positionRef.current ?? { x: rect.left, y: rect.top }
      const availableWidth = Math.max(1, bounds.right - position.x - WINDOW_GUTTER)
      const availableHeight = Math.max(1, bounds.bottom - position.y - WINDOW_GUTTER)
      const effectiveMinWidth = Math.min(minWidth, availableWidth)
      const effectiveMinHeight = Math.min(minHeight, availableHeight)
      const size = {
        height: Math.min(Math.max(nextSize.height, effectiveMinHeight), availableHeight),
        width: Math.min(Math.max(nextSize.width, effectiveMinWidth), availableWidth),
      }

      sizeRef.current = size
      element.style.setProperty('--desktop-window-height', `${Math.round(size.height)}px`)
      element.style.setProperty('--desktop-window-width', `${Math.round(size.width)}px`)
    },
    [minHeight, minWidth, windowRef]
  )

  const applyResizeGeometry = useCallback(
    (nextPosition: WindowPosition, nextSize: WindowSize) => {
      const element = windowRef.current
      if (!element) return

      const position = {
        x: Math.round(nextPosition.x),
        y: Math.round(nextPosition.y),
      }
      const size = {
        height: Math.round(nextSize.height),
        width: Math.round(nextSize.width),
      }

      positionRef.current = position
      sizeRef.current = size
      element.style.setProperty('--desktop-window-x', `${position.x}px`)
      element.style.setProperty('--desktop-window-y', `${position.y}px`)
      element.style.setProperty('--desktop-window-height', `${size.height}px`)
      element.style.setProperty('--desktop-window-width', `${size.width}px`)
    },
    [windowRef]
  )

  const flushPosition = useCallback(() => {
    if (dragAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAnimationFrameRef.current)
      dragAnimationFrameRef.current = null
    }

    if (!pendingPositionRef.current) return
    applyPosition(pendingPositionRef.current)
    pendingPositionRef.current = null
  }, [applyPosition])

  const flushResize = useCallback(() => {
    if (resizeAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeAnimationFrameRef.current)
      resizeAnimationFrameRef.current = null
    }

    const nextPosition = pendingPositionRef.current
    const nextSize = pendingSizeRef.current

    if (nextPosition && nextSize) {
      applyResizeGeometry(nextPosition, nextSize)
    } else {
      if (nextPosition) applyPosition(nextPosition)
      if (nextSize) applySize(nextSize)
    }

    pendingPositionRef.current = null
    pendingSizeRef.current = null
  }, [applyPosition, applyResizeGeometry, applySize])

  const finishDrag = useCallback(
    (pointerId?: number, cancel = false) => {
      const operation = dragOperationRef.current
      if (!operation || (pointerId !== undefined && pointerId !== operation.pointerId)) return

      dragOperationRef.current = null
      if (cancel) {
        if (operation.wasPositioned) {
          pendingPositionRef.current = operation.startPosition
        } else {
          pendingPositionRef.current = null
          positionRef.current = null
          setPositioned(false)
          windowRef.current?.style.removeProperty('--desktop-window-x')
          windowRef.current?.style.removeProperty('--desktop-window-y')
          windowRef.current?.removeAttribute('data-window-positioned')
        }
      }
      flushPosition()
      if (operation.moved) lastDragAt.current = performance.now()

      document.documentElement.removeAttribute('data-desktop-window-dragging')
      windowRef.current?.removeAttribute('data-window-dragging')

      if (operation.handle.hasPointerCapture(operation.pointerId)) {
        operation.handle.releasePointerCapture(operation.pointerId)
      }
    },
    [flushPosition, windowRef]
  )

  const finishResize = useCallback(
    (pointerId?: number, cancel = false) => {
      const operation = resizeOperationRef.current
      if (!operation || (pointerId !== undefined && pointerId !== operation.pointerId)) return

      resizeOperationRef.current = null
      if (cancel) {
        if (operation.wasPositioned) {
          pendingPositionRef.current = operation.startPosition
        } else {
          pendingPositionRef.current = null
          positionRef.current = null
          setPositioned(false)
          windowRef.current?.style.removeProperty('--desktop-window-x')
          windowRef.current?.style.removeProperty('--desktop-window-y')
          windowRef.current?.removeAttribute('data-window-positioned')
        }

        if (operation.wasSized) {
          pendingSizeRef.current = operation.startSize
        } else {
          pendingSizeRef.current = null
          sizeRef.current = null
          setSized(false)
          windowRef.current?.style.removeProperty('--desktop-window-height')
          windowRef.current?.style.removeProperty('--desktop-window-width')
          windowRef.current?.removeAttribute('data-window-sized')
        }
      }

      flushResize()
      document.documentElement.removeAttribute('data-desktop-window-resizing')
      document.documentElement.removeAttribute('data-desktop-window-resize-direction')
      windowRef.current?.removeAttribute('data-window-resizing')
      windowRef.current?.removeAttribute('data-window-resize-direction')

      if (operation.handle.hasPointerCapture(operation.pointerId)) {
        operation.handle.releasePointerCapture(operation.pointerId)
      }
    },
    [flushResize, windowRef]
  )

  const detachWindow = useCallback(() => {
    const element = windowRef.current
    if (!element) return null

    const rect = element.getBoundingClientRect()
    applyPosition({ x: rect.left, y: rect.top })
    setPositioned(true)
    element.dataset.windowPositioned = 'true'
    return rect
  }, [applyPosition, windowRef])

  const onTitleBarPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        dragOperationRef.current ||
        resizeOperationRef.current ||
        mode !== 'normal' ||
        !canManipulateWindow() ||
        isInteractiveTarget(event.target) ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return
      }

      const element = windowRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      dragOperationRef.current = {
        handle: event.currentTarget,
        moved: false,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        pointerId: event.pointerId,
        startPosition: { x: rect.left, y: rect.top },
        wasPositioned: positionRef.current !== null,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [mode, windowRef]
  )

  const onTitleBarPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const operation = dragOperationRef.current
      const element = windowRef.current
      if (!operation || !element || operation.pointerId !== event.pointerId) return

      const nextPosition = {
        x: event.clientX - operation.offsetX,
        y: event.clientY - operation.offsetY,
      }

      if (!operation.moved) {
        const rect = element.getBoundingClientRect()
        const distance = Math.hypot(nextPosition.x - rect.left, nextPosition.y - rect.top)
        if (distance < DRAG_THRESHOLD) return

        operation.moved = true
        detachWindow()
        document.documentElement.dataset.desktopWindowDragging = appId
        element.dataset.windowDragging = 'true'
      }

      event.preventDefault()
      pendingPositionRef.current = nextPosition
      if (dragAnimationFrameRef.current === null) {
        dragAnimationFrameRef.current = window.requestAnimationFrame(() => {
          dragAnimationFrameRef.current = null
          if (!pendingPositionRef.current) return
          applyPosition(pendingPositionRef.current)
          pendingPositionRef.current = null
        })
      }
    },
    [appId, applyPosition, detachWindow, windowRef]
  )

  const onTitleBarPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => finishDrag(event.pointerId),
    [finishDrag]
  )

  const onTitleBarPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => finishDrag(event.pointerId, true),
    [finishDrag]
  )

  const onTitleBarLostPointerCapture = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => finishDrag(event.pointerId),
    [finishDrag]
  )

  const onResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const direction = event.currentTarget.dataset.windowResizeDirection
      if (
        !resizable ||
        !isResizeDirection(direction) ||
        dragOperationRef.current ||
        resizeOperationRef.current ||
        mode !== 'normal' ||
        !canManipulateWindow() ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return
      }

      const element = windowRef.current
      const rect = element?.getBoundingClientRect()
      if (!rect || !element) return

      resizeOperationRef.current = {
        direction,
        handle: event.currentTarget,
        pointerId: event.pointerId,
        started: false,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosition: { x: rect.left, y: rect.top },
        startSize: { height: rect.height, width: rect.width },
        wasPositioned: positionRef.current !== null,
        wasSized: sizeRef.current !== null,
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      event.preventDefault()
    },
    [mode, resizable, windowRef]
  )

  const onResizePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const operation = resizeOperationRef.current
      const element = windowRef.current
      if (!operation || !element || operation.pointerId !== event.pointerId) return

      if (!operation.started) {
        operation.started = true
        applyResizeGeometry(operation.startPosition, operation.startSize)
        setPositioned(true)
        setSized(true)
        element.dataset.windowPositioned = 'true'
        element.dataset.windowSized = 'true'
        element.dataset.windowResizing = 'true'
        element.dataset.windowResizeDirection = operation.direction
        document.documentElement.dataset.desktopWindowResizing = appId
        document.documentElement.dataset.desktopWindowResizeDirection = operation.direction
      }

      event.preventDefault()
      const bounds = workArea()
      const direction = operation.direction
      const deltaX = event.clientX - operation.startClientX
      const deltaY = event.clientY - operation.startClientY
      const startLeft = operation.startPosition.x
      const startTop = operation.startPosition.y
      const startRight = startLeft + operation.startSize.width
      const startBottom = startTop + operation.startSize.height
      const leftBound = bounds.left + WINDOW_GUTTER
      const topBound = bounds.top + WINDOW_GUTTER
      const rightBound = bounds.right - WINDOW_GUTTER
      const bottomBound = bounds.bottom - WINDOW_GUTTER
      let left = startLeft
      let top = startTop
      let right = startRight
      let bottom = startBottom

      if (direction.includes('w')) {
        const effectiveMinWidth = Math.min(minWidth, startRight - leftBound)
        left = clamp(startLeft + deltaX, leftBound, startRight - effectiveMinWidth)
      } else if (direction.includes('e')) {
        const effectiveMinWidth = Math.min(minWidth, rightBound - startLeft)
        right = clamp(startRight + deltaX, startLeft + effectiveMinWidth, rightBound)
      }

      if (direction.includes('n')) {
        const effectiveMinHeight = Math.min(minHeight, startBottom - topBound)
        top = clamp(startTop + deltaY, topBound, startBottom - effectiveMinHeight)
      } else if (direction.includes('s')) {
        const effectiveMinHeight = Math.min(minHeight, bottomBound - startTop)
        bottom = clamp(startBottom + deltaY, startTop + effectiveMinHeight, bottomBound)
      }

      pendingPositionRef.current = { x: left, y: top }
      pendingSizeRef.current = {
        height: bottom - top,
        width: right - left,
      }

      if (resizeAnimationFrameRef.current === null) {
        resizeAnimationFrameRef.current = window.requestAnimationFrame(() => {
          resizeAnimationFrameRef.current = null
          if (!pendingPositionRef.current || !pendingSizeRef.current) return
          applyResizeGeometry(pendingPositionRef.current, pendingSizeRef.current)
          pendingPositionRef.current = null
          pendingSizeRef.current = null
        })
      }
    },
    [appId, applyResizeGeometry, minHeight, minWidth, windowRef]
  )

  const onResizePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => finishResize(event.pointerId),
    [finishResize]
  )

  const onResizePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => finishResize(event.pointerId, true),
    [finishResize]
  )

  const onResizeLostPointerCapture = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => finishResize(event.pointerId),
    [finishResize]
  )

  const onResizeKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (!resizable || mode !== 'normal' || !canManipulateWindow()) return
      if (event.currentTarget.dataset.windowResizeDirection !== 'se') return
      if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) return

      const rect = detachWindow()
      const element = windowRef.current
      if (!rect || !element) return

      const step = event.shiftKey ? 4 : KEYBOARD_RESIZE_STEP
      const currentSize = sizeRef.current ?? { height: rect.height, width: rect.width }
      const nextSize = { ...currentSize }
      if (event.key === 'ArrowLeft') nextSize.width -= step
      if (event.key === 'ArrowRight') nextSize.width += step
      if (event.key === 'ArrowUp') nextSize.height -= step
      if (event.key === 'ArrowDown') nextSize.height += step

      event.preventDefault()
      applySize(nextSize)
      setSized(true)
      element.dataset.windowSized = 'true'
    },
    [applySize, detachWindow, mode, resizable, windowRef]
  )

  useEffect(() => {
    if (mode !== 'normal') {
      finishDrag()
      finishResize()
    }
  }, [finishDrag, finishResize, mode])

  useEffect(() => {
    const handleViewportChange = () => {
      const element = windowRef.current
      if (!element || mode !== 'normal' || !canManipulateWindow()) return

      if (positionRef.current) applyPosition(positionRef.current)
      if (sizeRef.current) applySize(sizeRef.current)
      if (positionRef.current) applyPosition(positionRef.current)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (dragOperationRef.current) {
        event.preventDefault()
        finishDrag(undefined, true)
      }
      if (resizeOperationRef.current) {
        event.preventDefault()
        finishResize(undefined, true)
      }
    }

    const handleWindowBlur = () => {
      finishDrag()
      finishResize()
    }
    const resizeObserver = new ResizeObserver(handleViewportChange)
    const taskbar = document.querySelector<HTMLElement>('[data-desktop-taskbar]')

    if (taskbar) resizeObserver.observe(taskbar)
    const viewportFrame = window.requestAnimationFrame(handleViewportChange)

    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('keydown', handleKeyDown)
    window.visualViewport?.addEventListener('resize', handleViewportChange)
    return () => {
      finishDrag()
      finishResize()
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('keydown', handleKeyDown)
      window.visualViewport?.removeEventListener('resize', handleViewportChange)
      resizeObserver.disconnect()
      window.cancelAnimationFrame(viewportFrame)
    }
  }, [applyPosition, applySize, finishDrag, finishResize, mode, windowRef])

  const positionStyle = {
    ...(positionRef.current
      ? {
          '--desktop-window-x': `${Math.round(positionRef.current.x)}px`,
          '--desktop-window-y': `${Math.round(positionRef.current.y)}px`,
        }
      : {}),
    ...(sizeRef.current
      ? {
          '--desktop-window-height': `${Math.round(sizeRef.current.height)}px`,
          '--desktop-window-width': `${Math.round(sizeRef.current.width)}px`,
        }
      : {}),
  } as CSSProperties

  return {
    positioned,
    positionStyle: Object.keys(positionStyle).length > 0 ? positionStyle : undefined,
    resizeHandleProps: {
      onKeyDown: onResizeKeyDown,
      onLostPointerCapture: onResizeLostPointerCapture,
      onPointerCancel: onResizePointerCancel,
      onPointerDown: onResizePointerDown,
      onPointerMove: onResizePointerMove,
      onPointerUp: onResizePointerUp,
    },
    sized,
    titleBarProps: {
      onLostPointerCapture: onTitleBarLostPointerCapture,
      onPointerCancel: onTitleBarPointerCancel,
      onPointerDown: onTitleBarPointerDown,
      onPointerMove: onTitleBarPointerMove,
      onPointerUp: onTitleBarPointerUp,
    },
    wasDraggedRecently: () => performance.now() - lastDragAt.current < 350,
  }
}
