import type { MouseEvent } from 'react'

/**
 * Next 13 can accept a client navigation while the initial route graph is
 * still hydrating, change the URL, then leave the old page visible. During
 * that short window a native navigation is faster and, most importantly,
 * deterministic. Once the document is complete all links remain soft Next
 * transitions with prefetch.
 */
export function preserveEarlyNavigation(event: MouseEvent<HTMLElement>, href: string): boolean {
  if (typeof document === 'undefined') return false

  const appHydrated = document.documentElement.dataset.melegaHydrated === 'true'
  if (document.readyState === 'complete' && appHydrated) return false

  event.preventDefault()
  window.location.assign(href)
  return true
}
