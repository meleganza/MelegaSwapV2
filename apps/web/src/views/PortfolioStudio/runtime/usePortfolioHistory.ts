import { useEffect, useMemo, useState } from 'react'

export type PortfolioHistoryPoint = {
  at: number
  portfolioUsd: number
  rewardsUsd: number
}

const MAX_POINTS = 360
const MIN_SAMPLE_GAP_MS = 60_000

function storageKey(wallet: string, chainId: number | null): string {
  return `melega:portfolio-history:v1:${chainId ?? 'unknown'}:${wallet.toLowerCase()}`
}

function readPoints(key: string): PortfolioHistoryPoint[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]') as PortfolioHistoryPoint[]
    return parsed
      .filter(
        (point) =>
          Number.isFinite(point?.at) && Number.isFinite(point?.portfolioUsd) && Number.isFinite(point?.rewardsUsd),
      )
      .slice(-MAX_POINTS)
  } catch {
    return []
  }
}

export function usePortfolioHistory(args: {
  wallet: string | null
  chainId: number | null
  portfolioUsd: number | null
  rewardsUsd: number
}) {
  const key = useMemo(() => (args.wallet ? storageKey(args.wallet, args.chainId) : null), [args.wallet, args.chainId])
  const [points, setPoints] = useState<PortfolioHistoryPoint[]>([])

  useEffect(() => {
    if (!key || args.portfolioUsd == null || typeof window === 'undefined') {
      setPoints([])
      return
    }
    const previous = readPoints(key)
    const last = previous[previous.length - 1]
    const now = Date.now()
    const valueChanged = !last || last.portfolioUsd !== args.portfolioUsd || last.rewardsUsd !== args.rewardsUsd
    const sampleDue = !last || now - last.at >= MIN_SAMPLE_GAP_MS
    const next =
      valueChanged || sampleDue
        ? [...previous, { at: now, portfolioUsd: args.portfolioUsd, rewardsUsd: args.rewardsUsd }].slice(-MAX_POINTS)
        : previous
    try {
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // The current live snapshot remains usable when browser storage is unavailable.
    }
    setPoints(next)
  }, [key, args.portfolioUsd, args.rewardsUsd])

  return points
}
