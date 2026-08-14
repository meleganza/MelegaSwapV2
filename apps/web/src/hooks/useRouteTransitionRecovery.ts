import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * Recover only from stale-build chunk failures. Normal slow or cancelled
 * transitions remain under Next Router control and never trigger a reload.
 */
export function useRouteTransitionRecovery() {
  const router = useRouter()

  useEffect(() => {
    const hardNav = (target: string) => {
      const recovering = Boolean(
        (window.history.state as { isRecoveringFromChunkError?: boolean } | null)?.isRecoveringFromChunkError,
      )
      if (recovering) return
      window.history.replaceState({ ...(window.history.state || {}), isRecoveringFromChunkError: true }, '')
      window.location.assign(target || window.location.pathname)
    }

    const onError = (err: Error, url: string) => {
      const name = err?.name ?? ''
      const message = String(err?.message ?? '')
      const isRecoverable =
        name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /CSS_CHUNK_LOAD_FAILED/i.test(message) ||
        /Failed to load static props/i.test(message)

      if (!isRecoverable) return
      hardNav(url || router.asPath || window.location.pathname)
    }

    router.events.on('routeChangeError', onError)
    return () => {
      router.events.off('routeChangeError', onError)
    }
  }, [router.asPath, router.events])
}
