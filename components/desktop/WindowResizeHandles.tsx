import type { ComponentPropsWithoutRef } from 'react'
import type { WindowResizeDirection } from './useDraggableWindow'

const RESIZE_DIRECTIONS: WindowResizeDirection[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

type ResizeHandleEvents = Pick<
  ComponentPropsWithoutRef<'button'>,
  | 'onKeyDown'
  | 'onLostPointerCapture'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
>

type WindowResizeHandlesProps = {
  accessibleName: string
  handleProps: ResizeHandleEvents
}

export default function WindowResizeHandles({
  accessibleName,
  handleProps,
}: WindowResizeHandlesProps) {
  return RESIZE_DIRECTIONS.map((direction) => {
    const keyboardHandle = direction === 'se'

    return (
      <button
        key={direction}
        type="button"
        className={[
          'desktop-window-resize-handle',
          keyboardHandle ? 'desktop-window-resize-grip' : null,
        ]
          .filter(Boolean)
          .join(' ')}
        data-window-no-drag
        data-window-resize-direction={direction}
        aria-hidden={keyboardHandle ? undefined : true}
        aria-label={keyboardHandle ? accessibleName : undefined}
        tabIndex={keyboardHandle ? 0 : -1}
        title={keyboardHandle ? 'Drag an edge or use arrow keys to resize' : undefined}
        {...handleProps}
      />
    )
  })
}
