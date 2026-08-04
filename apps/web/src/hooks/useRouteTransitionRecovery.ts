import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * Recover from Next.js client-side ChunkLoadError / routeChangeError so
 * header navigation never leaves a stale page mounted behind a new URL.
 */
export function useRouteTransitionRecovery() {
  const router = useRouter()

  useEffect(() => {
    const onError = (err: Error) => {
      const name = err?.name ?? ''
      const message = String(err?.message ?? '')
      const isChunk =
        name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /CSS_CHUNK_LOAD_FAILED/i.test(message)
      if (!isChunk) return

      const recovering = Boolean((window.history.state as { isRecoveringFromChunkError?: boolean } | null)?.isRecoveringFromChunkError)
      if (recovering) return

      window.history.replaceState(
        { ...(window.history.state || {}), isRecoveringFromChunkError: true },
        '',
      )
      window.location.reload()
    }

    router.events.on('routeChangeError', onError)
    return () => {
      router.events.off('routeChangeError', onError)
    }
  }, [router.events])
}
