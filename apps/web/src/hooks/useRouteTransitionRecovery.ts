import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * Recover from Next.js client-side route failures so header navigation
 * never leaves a stale page mounted behind a new URL.
 *
 * Handles ChunkLoadError and Abort/fetch failures for route components.
 * Also hard-navigates when a soft transition stalls (URL changed / pending
 * but destination never completed).
 */
export function useRouteTransitionRecovery() {
  const router = useRouter()

  useEffect(() => {
    let pendingUrl: string | null = null
    let stallTimer: number | null = null

    const clearStall = () => {
      if (stallTimer != null) {
        window.clearTimeout(stallTimer)
        stallTimer = null
      }
    }

    const hardNav = (target: string) => {
      const recovering = Boolean(
        (window.history.state as { isRecoveringFromChunkError?: boolean } | null)?.isRecoveringFromChunkError,
      )
      if (recovering) return
      window.history.replaceState(
        { ...(window.history.state || {}), isRecoveringFromChunkError: true },
        '',
      )
      if (target) {
        window.location.assign(target)
        return
      }
      window.location.reload()
    }

    const onStart = (url: string) => {
      pendingUrl = url
      clearStall()
      stallTimer = window.setTimeout(() => {
        const target = pendingUrl || router.asPath || window.location.pathname
        // Soft transition stalled — force a real page mount.
        hardNav(target)
      }, 2000)
    }

    const onComplete = () => {
      pendingUrl = null
      clearStall()
    }

    const onError = (err: Error) => {
      clearStall()
      const name = err?.name ?? ''
      const message = String(err?.message ?? '')
      const isRecoverable =
        name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /CSS_CHUNK_LOAD_FAILED/i.test(message) ||
        /Abort fetching component for route/i.test(message) ||
        /Failed to load static props/i.test(message) ||
        /Route Cancelled/i.test(message)

      if (!isRecoverable) return

      const target = pendingUrl || router.asPath || window.location.pathname
      hardNav(target)
    }

    router.events.on('routeChangeStart', onStart)
    router.events.on('routeChangeComplete', onComplete)
    router.events.on('hashChangeComplete', onComplete)
    router.events.on('routeChangeError', onError)
    return () => {
      clearStall()
      router.events.off('routeChangeStart', onStart)
      router.events.off('routeChangeComplete', onComplete)
      router.events.off('hashChangeComplete', onComplete)
      router.events.off('routeChangeError', onError)
    }
  }, [router.asPath, router.events])
}
