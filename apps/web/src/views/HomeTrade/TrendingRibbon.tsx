import React, { useMemo } from 'react'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaTicker } from 'design-system/melega'
import useDexTrendingTicker from './useDexTrendingTicker'
import { useTrendingDisplayLimit } from './useTrendingDisplayLimit'

export const TrendingRibbon: React.FC = () => {
  const { items, indexedRibbonAssets, useMarquee, trendingEmpty } = useDexTrendingTicker()
  const displayLimit = useTrendingDisplayLimit()

  const avatarBySlug = useMemo(
    () => Object.fromEntries(indexedRibbonAssets.map((asset) => [asset.slug, asset])),
    [indexedRibbonAssets],
  )

  const enrichedItems = useMemo(
    () =>
      (items ?? []).slice(0, Math.min(displayLimit, 10)).map((item) => {
        const slug = item.id.replace(/^trade-asset-/, '').replace(/^indexed-asset-/, '')
        const asset = avatarBySlug[slug]
        const href = asset?.address
          ? `/swap?outputCurrency=${asset.address}`
          : slug
            ? `/@${slug}`
            : undefined
        const base = {
          ...item,
          secondary: undefined,
          href,
        }
        if (!asset) return base
        return {
          ...base,
          icon: (
            <MelegaTokenAvatar
              name={asset.displayName}
              symbol={asset.symbol}
              size={22}
              address={asset.address}
              chainId={asset.chainId}
              radius="circle"
            />
          ),
        }
      }),
    [items, avatarBySlug, displayLimit],
  )

  return (
    <MelegaTicker
      label="🔥 TRENDING"
      items={enrichedItems}
      marqueeMinItems={useMarquee ? 2 : Number.MAX_SAFE_INTEGER}
      emptyPrimary={trendingEmpty ? 'Market activity unavailable' : undefined}
    />
  )
}

export default TrendingRibbon
