import React from 'react'
import { MelegaTicker } from 'design-system/melega'
import { RibbonItem } from './useHomeTradeData'

export const TrendingRibbon: React.FC<{ items: RibbonItem[] }> = ({ items }) => {
  if (!items.length) return null

  const tickerItems = items.slice(0, 6).map((item) => ({
    id: item.id,
    primary: item.title,
    secondary: item.subtitle || undefined,
    accent: item.meta,
    href: item.href,
  }))

  return <MelegaTicker label="⚡ Trending" items={tickerItems} margin="3" />
}

export default TrendingRibbon
