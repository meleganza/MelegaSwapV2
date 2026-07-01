import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { colors } from 'design-system/melega'

const WATCHLIST_KEY = 'melega-trade-watchlist'

const Shell = styled.div`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px 20px;
`

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textPrimary};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Item = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #111111;
  text-decoration: none;
  transition: border-color 150ms ease, background 150ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    background: rgba(212, 175, 55, 0.04);
  }
`

const Pair = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
`

const Meta = styled.span`
  font-size: 12px;
  color: #8a8a8a;
`

const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8a8a8a;
  line-height: 1.45;
`

const DEFAULT_PAIRS = [
  { id: 'bnb-marco', label: 'BNB / MARCO', href: '/trade?inputCurrency=BNB&outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b' },
  { id: 'bnb-usdt', label: 'BNB / USDT', href: '/trade?inputCurrency=BNB&outputCurrency=0x55d398326f99059fF775485246999027B3197955' },
]

export interface TradeWatchlistProps {
  currentPair?: string
}

export const TradeWatchlist: React.FC<TradeWatchlistProps> = ({ currentPair }) => {
  const [pairs, setPairs] = useState(DEFAULT_PAIRS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) setPairs(parsed)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const addCurrent = useCallback(() => {
    if (!currentPair) return
    setPairs((prev) => {
      if (prev.some((p) => p.label === currentPair)) return prev
      const next = [{ id: currentPair.toLowerCase().replace(/\s+/g, '-'), label: currentPair, href: '/trade' }, ...prev].slice(0, 6)
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [currentPair])

  useEffect(() => {
    addCurrent()
  }, [addCurrent])

  return (
    <Shell data-trade-watchlist>
      <Title>Watchlist</Title>
      {pairs.length === 0 ? (
        <Empty>Favourite pairs appear here after you trade.</Empty>
      ) : (
        <List>
          {pairs.map((pair) => (
            <Item key={pair.id} href={pair.href}>
              <Pair>{pair.label}</Pair>
              <Meta>Trade →</Meta>
            </Item>
          ))}
        </List>
      )}
    </Shell>
  )
}

export default TradeWatchlist
