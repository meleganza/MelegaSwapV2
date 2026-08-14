/**
 * Project Page V5 navigation / hydration performance marks.
 * Click → route → shell → market → chart → swap.
 */

export const PP_PERF_CLICK_KEY = 'melega-pp-nav-click-ts'
export const PP_PERF_ROUTE_KEY = 'melega-pp-nav-route-ts'

export type ProjectPagePerfSnapshot = {
  clickTs: number | null
  routeTs: number | null
  shellTs: number | null
  marketTs: number | null
  chartTs: number | null
  swapTs: number | null
  routeMs: number | null
  shellMs: number | null
  marketMs: number | null
  chartMs: number | null
  swapMs: number | null
}

declare global {
  interface Window {
    __MELEGA_PP_PERF__?: ProjectPagePerfSnapshot
  }
}

function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
}

function wall(): number {
  return Date.now()
}

export function markProjectNavClick(): void {
  try {
    const ts = wall()
    sessionStorage.setItem(PP_PERF_CLICK_KEY, String(ts))
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('pp-nav-click')
    }
  } catch {
    /* ignore */
  }
}

export function markProjectRouteChange(): void {
  try {
    const ts = wall()
    sessionStorage.setItem(PP_PERF_ROUTE_KEY, String(ts))
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('pp-nav-route')
    }
  } catch {
    /* ignore */
  }
}

function readClickTs(): number | null {
  try {
    const raw = sessionStorage.getItem(PP_PERF_CLICK_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function publish(partial: Partial<ProjectPagePerfSnapshot>): void {
  if (typeof window === 'undefined') return
  const prev = window.__MELEGA_PP_PERF__ ?? {
    clickTs: null,
    routeTs: null,
    shellTs: null,
    marketTs: null,
    chartTs: null,
    swapTs: null,
    routeMs: null,
    shellMs: null,
    marketMs: null,
    chartMs: null,
    swapMs: null,
  }
  const next: ProjectPagePerfSnapshot = { ...prev, ...partial }
  const click = next.clickTs
  if (click != null) {
    if (next.routeTs != null) next.routeMs = next.routeTs - click
    if (next.shellTs != null) next.shellMs = next.shellTs - click
    if (next.marketTs != null) next.marketMs = next.marketTs - click
    if (next.chartTs != null) next.chartMs = next.chartTs - click
    if (next.swapTs != null) next.swapMs = next.swapTs - click
  }
  window.__MELEGA_PP_PERF__ = next
  try {
    ;(window as unknown as { dispatchEvent: (e: Event) => void }).dispatchEvent(
      new CustomEvent('melega-pp-perf', { detail: next }),
    )
  } catch {
    /* ignore */
  }
}

/** Call once when V5 shell first commits. */
export function markProjectShellRender(): void {
  const clickTs = readClickTs()
  let routeTs: number | null = null
  try {
    const raw = sessionStorage.getItem(PP_PERF_ROUTE_KEY)
    if (raw) {
      const n = Number(raw)
      if (Number.isFinite(n)) routeTs = n
    }
  } catch {
    /* ignore */
  }
  const shellTs = wall()
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('pp-shell-render')
  }
  publish({ clickTs, routeTs, shellTs })
}

export function markProjectMarketHydrated(): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('pp-market-hydrated')
  }
  publish({ marketTs: wall(), clickTs: readClickTs() })
}

export function markProjectChartReady(): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('pp-chart-ready')
  }
  publish({ chartTs: wall(), clickTs: readClickTs() })
}

export function markProjectSwapReady(): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('pp-swap-ready')
  }
  publish({ swapTs: wall(), clickTs: readClickTs() })
}

/** Soft navigation budget guard — used by tests / browser acceptance. */
export const PROJECT_PAGE_ROUTE_BUDGET_MS = 1000
export const PROJECT_PAGE_HERO_BUDGET_MS = 2000

export function getProjectPagePerf(): ProjectPagePerfSnapshot | null {
  if (typeof window === 'undefined') return null
  return window.__MELEGA_PP_PERF__ ?? null
}

/** Idle helper used to defer economy / related islands. */
export function afterFirstPaint(cb: () => void): () => void {
  if (typeof window === 'undefined') {
    cb()
    return () => undefined
  }
  let cancelled = false
  const run = () => {
    if (!cancelled) cb()
  }
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(run, { timeout: 400 })
    return () => {
      cancelled = true
      window.cancelIdleCallback?.(id)
    }
  }
  const t = window.setTimeout(run, 0)
  return () => {
    cancelled = true
    window.clearTimeout(t)
  }
}

export { now }
