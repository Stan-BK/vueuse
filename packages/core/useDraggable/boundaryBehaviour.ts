import type { Ref, UnwrapRef } from 'vue'
import type { UseDraggableOptions } from '.'
import type { Position } from '../types'
import { computed } from 'vue'

type ContainerElement = UseDraggableOptions['containerElement']
export type ContainerElemInstance = Exclude<UnwrapRef<ContainerElement>, Function | null | undefined>
type Axis = UseDraggableOptions['axis']
type Rect = ReturnType<Element['getBoundingClientRect']>

export type BoundaryBehaviorType = 'fixed' | 'damping'
export interface BoundaryBehaviorHandler {
  triggerMoveBehavior: (args: {
    container: ContainerElemInstance
    targetRect: Rect
    position: Position
    axis: Axis
  }) => Position
  triggerEndBehavior: (args: {
    container: ContainerElemInstance
    target: ContainerElemInstance
    position: Position
  }) => Position | void
}

const dampingHandler: BoundaryBehaviorHandler = {
  triggerMoveBehavior: ({
    container,
    targetRect,
    position,
    axis,
  }) => {
    let { x, y } = position
    if (axis === 'x') {
      const min = 0
      const max = container.scrollWidth - targetRect!.width
      x = damping(min, max, x, targetRect.width)
    }
    if (axis === 'y') {
      const min = 0
      const max = container.scrollHeight - targetRect!.height
      y = damping(min, max, y, targetRect.height)
    }

    return {
      x,
      y,
    }
  },
  triggerEndBehavior: ({
    container,
    target,
    position,
  }) => {
    let { x, y } = position
    let isOverBoundary = false
    const targetRect = target.getBoundingClientRect()
    const maxX = container.scrollWidth - targetRect.width
    const maxY = container.scrollHeight - targetRect.height

    if (x < 0 || x > maxX) {
      x = x < 0 ? 0 : maxX
      isOverBoundary = true
    }
    if (y < 0 || y > maxY) {
      y = y < 0 ? 0 : maxY
      isOverBoundary = true
    }

    if (isOverBoundary)
      setupDampingTransition(target)

    return {
      x,
      y,
    }
  },
}

const fixedHandler: BoundaryBehaviorHandler = {
  triggerMoveBehavior: ({
    container,
    targetRect,
    position,
    axis,
  }) => {
    let { x, y } = position
    if (axis === 'x' || axis === 'both') {
      x = Math.min(Math.max(0, x), container.scrollWidth - targetRect!.width)
    }
    if (axis === 'y' || axis === 'both') {
      y = Math.min(Math.max(0, y), container.scrollHeight - targetRect!.height)
    }

    return {
      x,
      y,
    }
  },
  triggerEndBehavior: () => void 0,
}

export function getBehaviorHandler(behavior: Ref<BoundaryBehaviorType>) {
  return computed(() => ({
    fixed: fixedHandler,
    damping: dampingHandler,
  })[behavior.value!])
}

function damping(
  min: number,
  max: number,
  value: number,
  width: number = 100,
) {
  if (value < min)
    return min - Math.min(width, Math.abs(min - value) / 3)
  if (value > max)
    return max + Math.min(width, Math.abs(value - max) / 3)
  return value
}

function setupDampingTransition(target: HTMLElement | SVGElement) {
  const transitionStyle = getComputedStyle(target).getPropertyValue('transition')
  const dampingTransition = ', left .1s, top .1s'
  target.style.transition = transitionStyle === 'none' ? dampingTransition : transitionStyle + dampingTransition

  target.addEventListener('transitionend', () => {
    target.style.transition = transitionStyle
  }, { once: true })
}
