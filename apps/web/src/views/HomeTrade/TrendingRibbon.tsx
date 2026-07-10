import React, { useMemo } from 'react'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaTicker } from 'design-system/melega'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import useDexTrendingTicker from './useDexTrendingTicker'

export const TrendingRibbon: React.FC = () => {
  const { items, indexedRibbonAssets, unavailableReason } = useDexTrendingTicker()

  const avatarBySlug = useMemo(
    () => Object.fromEntries(indexedRibbonAssets.map((asset) => [asset.slug, asset])),
    [indexedRibbonAssets],
  )

  const enrichedItems = useMemo(
    () =>
      (items ?? []).map((item) => {
        const slug = item.id.replace('indexed-asset-', '')
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
      emptyPrimary={RUNTIME_UNAVAILABLE_LABEL}
      emptySecondary={unavailableReason ? `Reason: ${unavailableReason}` : undefined}
    />
  )
}

export default TrendingRibbon
