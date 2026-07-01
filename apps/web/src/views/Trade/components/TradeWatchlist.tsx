import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { tradeColors, tradeLayout } from '../tradeTokens'
import TradeMelegaIsologo from './TradeMelegaIsologo'

export interface WatchlistPair {
  id: string
  pair: string
  href: string
}

const Shell = styled.div`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: ${tradeLayout.rightRailRadius};
  padding: ${tradeLayout.rightRailPadding};
  box-sizing: border-box;
`

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
`

const Item = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 42px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #111111;
  text-decoration: none;
  transition: border-color 150ms ease, background 150ms ease, transform 120ms ease;

  & + & {
    margin-top: 6px;
  }

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    background: rgba(212, 175, 55, 0.04);
  }

  &:active {
    transform: scale(0.99);
  }
`

const PairLeft = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const TokenIcon = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #171717;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: ${tradeColors.goldBright};
  flex-shrink: 0;
`

const Pair = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.span`
  font-size: 12px;
  color: #8a8a8a;
  flex-shrink: 0;
`

export interface TradeWatchlistProps {
  pairs: readonly WatchlistPair[]
}

export const TradeWatchlist: React.FC<TradeWatchlistProps> = ({ pairs }) => (
  <Shell data-trade-watchlist>
    <Title>Watchlist</Title>
    <List>
      {pairs.map((item) => {
        const [base] = item.pair.split('/')
        const baseTrim = base?.trim() ?? ''
        const isMarco = /marco/i.test(baseTrim)
        return (
          <Item key={item.id} href={item.href}>
            <PairLeft>
              {isMarco ? <TradeMelegaIsologo size={22} /> : <TokenIcon>{baseTrim.slice(0, 1) || '?'}</TokenIcon>}
              <Pair>{item.pair}</Pair>
            </PairLeft>
            <Meta>Trade →</Meta>
          </Item>
        )
      })}
    </List>
  </Shell>
)

export default TradeWatchlist
