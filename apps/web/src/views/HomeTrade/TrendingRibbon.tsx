import React, { useMemo, useRef } from 'react'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaTicker } from 'design-system/melega/components/Ticker'
import { extractAddressFromHref } from 'lib/trending/topMoversSharedSnapshot'
import useDexTrendingTicker from './useDexTrendingTicker'
import { useTrendingDisplayLimit } from './useTrendingDisplayLimit'
import { useTopMoversSnapshot } from './TopMoversSnapshotContext'

export const TrendingRibbon: React.FC = () => {
  const { items, useMarquee, trendingEmpty, isLoading } = useDexTrendingTicker()
  const { snapshot, rankedAssets } = useTopMoversSnapshot()
  const displayLimit = useTrendingDisplayLimit()
  const iconCacheRef = useRef(new Map<string, React.ReactNode>())

  const avatarByAddress = useMemo(() => {
    const map = new Map<string, (typeof rankedAssets)[number]>()
    for (const asset of rankedAssets) {
      if (asset.address) map.set(asset.address.toLowerCase(), asset)
    }
    return map
  }, [rankedAssets])

  const iconByAddress = useMemo(() => {
    const next = new Map<string, React.ReactNode>()
    for (const asset of rankedAssets) {
      if (!asset.address) continue
      const key = `${asset.chainId}:${asset.address.toLowerCase()}:${asset.symbol}`
      const cached = iconCacheRef.current.get(key)
      next.set(
        asset.address.toLowerCase(),
        cached ?? (
          <MelegaTokenAvatar
            name={asset.displayName}
            symbol={asset.symbol}
            size={22}
            address={asset.address}
            chainId={asset.chainId}
            radius="circle"
          />
        ),
      )
      if (!cached) iconCacheRef.current.set(key, next.get(asset.address.toLowerCase())!)
    }
    return next
  }, [rankedAssets])

  const enrichedItems = useMemo(
    () =>
      (items ?? []).slice(0, displayLimit).map((item) => {
        // Identity comes only from the shared snapshot item — never rematch by live rank index.
        const address = extractAddressFromHref(item.href)
        const asset = address ? avatarByAddress.get(address) : undefined
        const base = {
          ...item,
          secondary: undefined,
          href: item.href,
        }
        if (!asset || !address) return base
        return {
          ...base,
          icon: iconByAddress.get(address),
        }
      }),
    [items, avatarByAddress, displayLimit, iconByAddress],
  )

  return (
    <div style={{ width: '100%', minWidth: 0 }} data-top-movers-snapshot-id={snapshot.snapshotId} data-top-movers-surface="ticker">
      <MelegaTicker
        label="TOP MOVERS"
        items={enrichedItems}
        marqueeMinItems={useMarquee ? 2 : Number.MAX_SAFE_INTEGER}
        emptyPrimary={
          isLoading
            ? 'Indexing market activity…'
            : trendingEmpty
              ? 'No verified 24h movers yet'
              : undefined
        }
      />
    </div>
  )
}

export default TrendingRibbon
