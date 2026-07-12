import React, { useMemo } from 'react'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaTicker } from 'design-system/melega'
import useDexTrendingTicker from './useDexTrendingTicker'

export const TrendingRibbon: React.FC = () => {
  const { items, indexedRibbonAssets, unavailableReason, useMarquee } = useDexTrendingTicker()

  const avatarBySlug = useMemo(
    () => Object.fromEntries(indexedRibbonAssets.map((asset) => [asset.slug, asset])),
    [indexedRibbonAssets],
  )

  const enrichedItems = useMemo(
    () =>
      (items ?? []).map((item) => {
        const slug = item.id.replace(/^trade-asset-/, '').replace(/^indexed-asset-/, '')
        const asset = avatarBySlug[slug]
        if (!asset) return item
        return {
          ...item,
          icon: (
            <MelegaTokenAvatar
              name={asset.displayName}
              symbol={asset.symbol}
              size={16}
              address={asset.address}
              chainId={asset.chainId}
              radius="circle"
            />
          ),
        }
      }),
    [items, avatarBySlug],
  )

  return (
    <MelegaTicker
      label="Trending on Melega DEX"
      items={enrichedItems}
      marqueeMinItems={useMarquee ? 6 : Number.MAX_SAFE_INTEGER}
      emptyPrimary="No live market activity"
      emptySecondary={unavailableReason ? `Reason: ${unavailableReason}` : undefined}
    />
  )
}

export default TrendingRibbon
