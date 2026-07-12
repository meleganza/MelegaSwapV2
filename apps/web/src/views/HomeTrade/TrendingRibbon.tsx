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
      (items ?? []).slice(0, displayLimit).map((item) => {
        const slug = item.id.replace(/^trade-asset-/, '').replace(/^indexed-asset-/, '')
        const asset = avatarBySlug[slug]
        if (!asset) return item
        return {
          ...item,
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
      label="Trending on Melega DEX"
      items={enrichedItems}
      marqueeMinItems={useMarquee ? 6 : Number.MAX_SAFE_INTEGER}
      emptyPrimary={
        trendingEmpty ? 'Market ranking temporarily unavailable' : undefined
      }
    />
  )
}

export default TrendingRibbon
