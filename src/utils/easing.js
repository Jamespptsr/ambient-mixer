/**
 * Cubic ease-in-out function for smooth animations
 * @param {number} t - Progress from 0 to 1
 * @returns {number} - Eased value from 0 to 1
 */
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Animate a value from start to end over a duration
 * @param {number} from - Starting value
 * @param {number} to - Ending value
 * @param {number} duration - Duration in milliseconds
 * @param {function} onUpdate - Callback with current value
 * @param {function} onComplete - Optional callback when animation completes
 * @returns {function} - Cancel function
 */
export function animateValue(from, to, duration, onUpdate, onComplete) {
  const startTime = performance.now()
  let animationFrame = null

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeInOutCubic(progress)
    const currentValue = from + (to - from) * easedProgress

    onUpdate(currentValue)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate)
    } else if (onComplete) {
      onComplete()
    }
  }

  animationFrame = requestAnimationFrame(animate)

  // Return cancel function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }
}

/**
 * Generate a random value within a range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random value between min and max
 */
export function randomInRange(min, max) {
  return min + Math.random() * (max - min)
}
