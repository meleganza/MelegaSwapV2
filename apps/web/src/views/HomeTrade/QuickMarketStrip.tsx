import React from 'react'
import styled from 'styled-components'
import { MelegaStatCard } from 'design-system/melega'
import { RUNTIME_LOADING_LABEL, RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { MarketCard } from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const Strip = styled.div`
  margin-top: 0;
`

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    display: grid;
  }
`

const CardSlot = styled.div`
  min-width: 0;
`

const MobileScroll = styled.div`
  display: flex;
  gap: ${homeTradeLayout.columnGap};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    display: none;
  }
`

const UnavailableCard = styled.div`
  padding: 20px 22px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0b0b0b;
  font-size: 14px;
  line-height: 1.45;
  color: #9e9e9e;
`

export interface QuickMarketStripProps {
  cards: MarketCard[]
  isIndexing?: boolean
  unavailableReason?: string
}

export const QuickMarketStrip: React.FC<QuickMarketStripProps> = ({
  cards,
  isIndexing = false,
  unavailableReason,
}) => {
  const displayCards = cards.slice(0, 4)

  if (displayCards.length === 0) {
    const statusLabel = isIndexing ? RUNTIME_LOADING_LABEL : RUNTIME_UNAVAILABLE_LABEL
    const reason = isIndexing
      ? 'Farm, pool, and subgraph metrics loading'
      : unavailableReason ?? 'No indexed farm APR, pool TVL, or swap volume in current window'
    return (
      <Strip data-home-market-strip>
        <UnavailableCard data-home-market-unavailable>
          <strong style={{ color: '#fff' }}>{statusLabel}</strong>
          <div style={{ marginTop: 6 }}>Reason: {reason}</div>
        </UnavailableCard>
      </Strip>
    )
  }

  return (
    <Strip data-home-market-strip>
      <DesktopGrid>
        {displayCards.map((card) => (
          <CardSlot key={card.id}>
            <MelegaStatCard
              label={card.label}
              value={card.value}
              meta={card.meta}
              metaPositive={card.meta?.includes('%') || card.meta?.includes('+')}
              href={card.href}
            />
          </CardSlot>
        ))}
      </DesktopGrid>
      <MobileScroll>
        {displayCards.map((card) => (
          <MelegaStatCard
            key={card.id}
            label={card.label}
            value={card.value}
            meta={card.meta}
            metaPositive={card.meta?.includes('%') || card.meta?.includes('+')}
            href={card.href}
          />
        ))}
      </MobileScroll>
    </Strip>
  )
}

export default QuickMarketStrip
