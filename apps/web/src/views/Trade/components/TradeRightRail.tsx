import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import {
  MOCK_ASSETS,
  MOCK_ROUTE_ENTRIES,
  MOCK_ROUTER_STATUS,
  MOCK_WATCHLIST,
  TRADE_MOCK_LABEL,
} from '../tradeMockData'
import { tradeColors, tradeLayout } from '../tradeTokens'
import TradeWatchlist from './TradeWatchlist'

const Rail = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.rightRailGap};
  width: 100%;
  min-width: 0;
  height: 100%;
`

const Panel = styled.div`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: ${tradeLayout.rightRailRadius};
  padding: ${tradeLayout.rightRailPadding};
  box-sizing: border-box;
  overflow: hidden;
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
`

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: ${tradeColors.text};
  line-height: 1.2;
`

const MockCaption = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${tradeColors.muted};
`

const SampleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(212, 175, 55, 0.1);
  color: ${tradeColors.gold};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const RouteEntry = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 8px;
  align-items: center;
  min-height: 54px;
  padding: 4px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 160ms ease;

  &:first-of-type {
    border-top: none;
  }

  &:hover {
    transform: translateX(2px);
  }
`

const Rank = styled.span<{ $rank?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  color: ${({ $rank }) => ($rank === 1 ? tradeColors.goldBright : '#6b8cff')};
  background: ${({ $rank }) =>
    $rank === 1 ? 'rgba(244, 197, 66, 0.12)' : 'rgba(107, 140, 255, 0.1)'};
`

const RouteMeta = styled.div`
  min-width: 0;
`

const RouteName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RouteSub = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: ${tradeColors.muted};
`

const RouteRight = styled.div`
  text-align: right;
  min-width: 0;
`

const RouteAmount = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
`

const RouteDelta = styled.div<{ $best?: boolean }>`
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $best }) => ($best ? tradeColors.green : tradeColors.muted)};
`

const OutlineBtn = styled.button`
  width: 100%;
  height: 40px;
  margin-top: 8px;
  border-radius: 10px;
  border: 1px solid ${tradeColors.gold};
  background: transparent;
  color: ${tradeColors.gold};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, transform 120ms ease;

  &:hover {
    background: rgba(212, 175, 55, 0.08);
  }

  &:active {
    transform: scale(0.99);
  }
`

const AssetRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 44px;
`

const AssetLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const AssetIcon = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #171717;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: ${tradeColors.goldBright};
`

const AssetName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
`

const AssetRight = styled.div`
  text-align: right;
`

const AssetBal = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
`

const AssetUsd = styled.div`
  font-size: 11px;
  color: ${tradeColors.muted};
`

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${tradeColors.green};
`

const StatusText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${tradeColors.green};
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`

const StatCell = styled.div`
  min-width: 0;
`

const StatLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  color: ${tradeColors.muted};
`

const StatValue = styled.div`
  margin-top: 2px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
`

export const TradeRightRail: React.FC = () => (
  <Rail data-trade-right-rail>
    <Panel data-trade-best-route>
      <PanelHead>
        <PanelTitle>SmartSwap Best Route</PanelTitle>
        <SampleBadge>Sample route</SampleBadge>
      </PanelHead>
      {MOCK_ROUTE_ENTRIES.map((entry) => (
        <RouteEntry key={entry.rank}>
          <Rank $rank={entry.rank}>{entry.rank}</Rank>
          <RouteMeta>
            <RouteName>
              {entry.chain} · {entry.source}
            </RouteName>
            <RouteSub>
              Gas: {entry.gas} · {entry.time}
            </RouteSub>
          </RouteMeta>
          <RouteRight>
            <RouteAmount>{entry.amount}</RouteAmount>
            <RouteDelta $best={entry.best}>{entry.delta}</RouteDelta>
          </RouteRight>
        </RouteEntry>
      ))}
      <OutlineBtn type="button">View All Routes</OutlineBtn>
    </Panel>

    <Panel data-trade-your-assets>
      <PanelHead>
        <PanelTitle>Your Assets</PanelTitle>
        <MockCaption>{TRADE_MOCK_LABEL}</MockCaption>
      </PanelHead>
      {MOCK_ASSETS.map((asset) => (
        <AssetRow key={asset.symbol}>
          <AssetLeft>
            <AssetIcon>{asset.symbol.slice(0, 1)}</AssetIcon>
            <AssetName>{asset.symbol}</AssetName>
          </AssetLeft>
          <AssetRight>
            <AssetBal>{asset.balance}</AssetBal>
            <AssetUsd>{asset.usd}</AssetUsd>
          </AssetRight>
        </AssetRow>
      ))}
      <OutlineBtn type="button" style={{ height: 38, marginTop: 10 }}>
        Manage Assets
      </OutlineBtn>
    </Panel>

    <Panel data-trade-router-status>
      <PanelHead>
        <PanelTitle style={{ fontSize: 12, letterSpacing: '0.06em' }}>MELEGA ROUTER STATUS</PanelTitle>
        <MockCaption>{TRADE_MOCK_LABEL}</MockCaption>
      </PanelHead>
      <StatusRow>
        <StatusDot />
        <StatusText>{MOCK_ROUTER_STATUS.status}</StatusText>
      </StatusRow>
      <StatGrid>
        <StatCell>
          <StatLabel>Uptime</StatLabel>
          <StatValue>{MOCK_ROUTER_STATUS.uptime}</StatValue>
        </StatCell>
        <StatCell>
          <StatLabel>Routes</StatLabel>
          <StatValue>{MOCK_ROUTER_STATUS.routes}</StatValue>
        </StatCell>
        <StatCell>
          <StatLabel>Chains</StatLabel>
          <StatValue>{MOCK_ROUTER_STATUS.chains}</StatValue>
        </StatCell>
      </StatGrid>
      <OutlineBtn type="button" style={{ height: 36, marginTop: 10 }}>
        Router Analytics
      </OutlineBtn>
    </Panel>

    <TradeWatchlist pairs={MOCK_WATCHLIST} />
  </Rail>
)

export default TradeRightRail
