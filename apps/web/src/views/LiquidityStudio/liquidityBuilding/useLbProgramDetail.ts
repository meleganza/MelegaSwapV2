/**
 * Fetch single program detail (+ events) for portfolio detail view.
 */
import { useCallback, useEffect, useState } from 'react'
import type { LbIndexedEvent, LbProgramApiRow } from 'lib/liquidity-builder-indexer/types'

export type LbProgramDetailState = {
  loading: boolean
  error: string | null
  program: LbProgramApiRow | null
  events: LbIndexedEvent[]
  deepLink: string | null
  refetch: () => void
}

export function useLbProgramDetail(address: string | null | undefined): LbProgramDetailState {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [program, setProgram] = useState<LbProgramApiRow | null>(null)
  const [events, setEvents] = useState<LbIndexedEvent[]>([])
  const [deepLink, setDeepLink] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!address) {
      setProgram(null)
      setEvents([])
      setDeepLink(null)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const res = await fetch(`/api/liquidity-program/${address}`)
        const json = (await res.json()) as {
          ok?: boolean
          reason?: string
          program?: LbProgramApiRow
          events?: LbIndexedEvent[]
          deepLink?: string
        }
        if (cancelled) return
        if (!res.ok || !json.ok || !json.program) {
          setProgram(null)
          setEvents([])
          setDeepLink(null)
          setError(json.reason ?? 'PROGRAM_NOT_FOUND')
          return
        }
        setProgram(json.program)
        setEvents(Array.isArray(json.events) ? json.events : [])
        setDeepLink(json.deepLink ?? null)
      } catch {
        if (!cancelled) {
          setProgram(null)
          setEvents([])
          setError('PROGRAM_DETAIL_FETCH_FAILED')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [address, tick])

  return { loading, error, program, events, deepLink, refetch }
}
