/**
 * Simple in-memory sliding-window rate limiter for Control Center private APIs.
 */

const globalKey = '__melega_pp012_control_center_rate__'

interface WindowState {
  timestamps: number[]
}

function getRoot(): Map<string, WindowState> {
  const g = globalThis as typeof globalThis & { [globalKey]?: Map<string, WindowState> }
  if (!g[globalKey]) g[globalKey] = new Map()
  return g[globalKey]!
}

export function checkRateLimit(input: {
  key: string
  limit: number
  windowMs: number
  now?: number
}): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = input.now ?? Date.now()
  const root = getRoot()
  const state = root.get(input.key) ?? { timestamps: [] }
  const cutoff = now - input.windowMs
  state.timestamps = state.timestamps.filter((t) => t > cutoff)
  if (state.timestamps.length >= input.limit) {
    const oldest = state.timestamps[0] ?? now
    root.set(input.key, state)
    return { allowed: false, retryAfterMs: Math.max(0, oldest + input.windowMs - now) }
  }
  state.timestamps.push(now)
  root.set(input.key, state)
  return { allowed: true }
}

export function resetRateLimitForTests(): void {
  getRoot().clear()
}
