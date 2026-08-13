import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ROUTE_STATE_CACHE_TTL_MS,
  fetchMarcoBridgeRouteAuthority,
  resolveClientRouteOverrideAttempts,
  type MarcoBridgeAuthorityResult,
} from 'lib/marco-bridge-route-authority'

export type UseMarcoBridgeRouteState = {
  result: MarcoBridgeAuthorityResult | null
  loading: boolean
  refresh: () => void
  ignoredOverrideKeys: string[]
}

/**
 * Runtime hook — sole bridge availability authority for Melega DEX MARCO bridge UI.
 * Fail closed. No localStorage / query-param activation.
 */
export function useMarcoBridgeRouteState(): UseMarcoBridgeRouteState {
  const [result, setResult] = useState<MarcoBridgeAuthorityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const mounted = useRef(true)

  const ignoredOverrideKeys =
    typeof window === 'undefined'
      ? []
      : resolveClientRouteOverrideAttempts(new URLSearchParams(window.location.search)).ignored

  const refresh = useCallback(() => {
    setTick((n) => n + 1)
  }, [])

  useEffect(() => {
    mounted.current = true
    let cancelled = false

    const run = async () => {
      setLoading(true)
      const next = await fetchMarcoBridgeRouteAuthority({ forceRefresh: tick > 0 })
      if (cancelled || !mounted.current) return
      setResult(next)
      setLoading(false)
    }

    void run()

    const interval = window.setInterval(() => {
      void fetchMarcoBridgeRouteAuthority({ forceRefresh: true }).then((next) => {
        if (cancelled || !mounted.current) return
        setResult(next)
      })
    }, ROUTE_STATE_CACHE_TTL_MS)

    return () => {
      cancelled = true
      mounted.current = false
      window.clearInterval(interval)
    }
  }, [tick])

  return { result, loading, refresh, ignoredOverrideKeys }
}
