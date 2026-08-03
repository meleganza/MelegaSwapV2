/**
 * Fetch owner LB program inventory from portfolio API foundation.
 */
import { useCallback, useEffect, useState } from 'react'
import type { LbProgramApiRow } from 'lib/liquidity-builder-indexer/types'

export type LbOwnerProgramsState = {
  loading: boolean
  error: string | null
  wallet: string | null
  programs: LbProgramApiRow[]
  refetch: () => void
}

export function useLbOwnerPrograms(wallet: string | null | undefined): LbOwnerProgramsState {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [programs, setPrograms] = useState<LbProgramApiRow[]>([])
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!wallet) {
      setPrograms([])
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const res = await fetch(`/api/liquidity-programs/${wallet}`)
        const json = (await res.json()) as {
          ok?: boolean
          reason?: string
          programs?: LbProgramApiRow[]
        }
        if (cancelled) return
        if (!res.ok || !json.ok) {
          setPrograms([])
          setError(json.reason ?? 'INVENTORY_UNAVAILABLE')
          return
        }
        setPrograms(Array.isArray(json.programs) ? json.programs : [])
      } catch {
        if (!cancelled) {
          setPrograms([])
          setError('INVENTORY_FETCH_FAILED')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wallet, tick])

  return {
    loading,
    error,
    wallet: wallet ?? null,
    programs,
    refetch,
  }
}
