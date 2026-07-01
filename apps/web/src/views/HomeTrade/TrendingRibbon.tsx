import React from 'react'
import { MelegaTicker } from 'design-system/melega'
import { RibbonItem } from './useHomeTradeData'

const FALLBACK_ITEMS = [
  { id: 'fb-1', title: 'MARCO / BNB', subtitle: 'Indexing pair activity', meta: undefined, href: '/swap', icon: 'trend' as const },
  { id: 'fb-2', title: 'New pool', subtitle: 'Campaign pools', meta: undefined, href: '/pools', icon: 'pool' as const },
  { id: 'fb-3', title: 'Projects', subtitle: 'Discover listings', meta: undefined, href: '/projects', icon: 'project' as const },
]

export const TrendingRibbon: React.FC<{ items: RibbonItem[] }> = ({ items }) => {
  const source = items.length ? items : FALLBACK_ITEMS

  const tickerItems = source.slice(0, 8).map((item) => ({
    id: item.id,
    primary: item.title,
    secondary: item.subtitle || undefined,
    accent: item.meta,
    href: item.href,
  }))

  return <MelegaTicker items={tickerItems} />
}

export default TrendingRibbon
