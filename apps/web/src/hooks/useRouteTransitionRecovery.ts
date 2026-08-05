import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * Recover from Next.js client-side route failures so header navigation
 * never leaves a stale page mounted behind a new URL.
 *
 * Handles ChunkLoadError and Abort/fetch failures for route components.
 * Falls back to a hard navigation to the intended URL when available.
 */
export function useRouteTransitionRecovery() {
  const router = useRouter()

  useEffect(() => {
    let pendingUrl: string | null = null

    const onStart = (url: string) => {
      pendingUrl = url
    }

    const onComplete = () => {
      pendingUrl = null
    }

    const onError = (err: Error) => {
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

      const recovering = Boolean(
        (window.history.state as { isRecoveringFromChunkError?: boolean } | null)?.isRecoveringFromChunkError,
      )
      if (recovering) return

      const target = pendingUrl || router.asPath || window.location.pathname
      window.history.replaceState(
        { ...(window.history.state || {}), isRecoveringFromChunkError: true },
        '',
      )

      // Hard navigate so the destination page always mounts (no stale Home).
      if (target && target !== window.location.pathname + window.location.search) {
        window.location.assign(target)
        return
      }
      window.location.reload()
    }

    router.events.on('routeChangeStart', onStart)
    router.events.on('routeChangeComplete', onComplete)
    router.events.on('hashChangeComplete', onComplete)
    router.events.on('routeChangeError', onError)
    return () => {
      router.events.off('routeChangeStart', onStart)
      router.events.off('routeChangeComplete', onComplete)
      router.events.off('hashChangeComplete', onComplete)
      router.events.off('routeChangeError', onError)
    }
  }, [router.asPath, router.events])
}
