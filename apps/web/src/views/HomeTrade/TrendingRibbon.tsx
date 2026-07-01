import React from 'react'
import { MelegaTicker } from 'design-system/melega'
import useLiveMarketsTicker from './useLiveMarketsTicker'

export const TrendingRibbon: React.FC = () => {
  const liveItems = useLiveMarketsTicker()

  if (!liveItems.length) return null

  return <MelegaTicker label="Live Markets" items={liveItems} />
}

export default TrendingRibbon
