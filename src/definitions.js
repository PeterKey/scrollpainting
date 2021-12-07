export const SCROLL_EASE_OUT_DURATION = 600
export const SCROLL_EASE_IN_DURATION = 300
export const MAX_SCROLL_SPEED = 150

export const DEAD_AREA_CENTER = 100

export const easeOutQuad = (t) => t * (2 - t)
export const easeInQuad = (t) => t * t
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

export function easeTime(
  start,
  duration,
  now,
  easingFunction,
  reverse = false,
) {
  const elapsedTime = now - start
  if (elapsedTime > duration) return false
  const ease = easingFunction(elapsedTime / duration)
  return reverse ? 1.0 - ease : ease
}
