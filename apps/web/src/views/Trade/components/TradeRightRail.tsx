import React, { useState } from 'react'
import styled from 'styled-components'
import { tradeColors, tradeLayout } from '../tradeTokens'
import { useTradeRuntime } from '../tradeRuntime/TradeRuntimeContext'
import TradeWatchlist from './TradeWatchlist'
import TradeMelegaIsologo from './TradeMelegaIsologo'

const Rail = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.rightRailGap};
  width: 100%;
  min-width: 0;
  height: 100%;
`

const TopPanels = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.rightRailGap};
  flex-shrink: 0;
`

const WatchlistSlot = styled.div`
  margin-top: auto;
  flex-shrink: 0;

  @media (max-width: 1099px) {
    margin-top: 0;
  }
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

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(34, 197, 94, 0.1);
  color: ${tradeColors.green};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const EmptyLine = styled.p`
  margin: 0;
  padding: 8px 0;
  font-size: 12px;
  color: ${tradeColors.muted};
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

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`

const StatusDot = styled.span<{ $tone?: 'ok' | 'warn' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $tone }) =>
    $tone === 'warn' ? tradeColors.gold : $tone === 'error' ? tradeColors.red : tradeColors.green};
`

const StatusText = styled.span<{ $tone?: 'ok' | 'warn' | 'error' }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $tone }) =>
    $tone === 'warn' ? tradeColors.gold : $tone === 'error' ? tradeColors.red : tradeColors.green};
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

const MachineToggle = styled.button`
  margin-top: 8px;
  width: 100%;
  border: none;
  background: transparent;
  color: ${tradeColors.muted};
  font-size: 10px;
  text-align: left;
  cursor: pointer;
  padding: 0;
`

const MachinePre = styled.pre`
  margin: 6px 0 0;
  padding: 8px;
  border-radius: 8px;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 9px;
  line-height: 1.35;
  color: ${tradeColors.muted};
  max-height: 160px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

export const TradeRightRail: React.FC = () => {
  const { routeEntries, assets, routerStatus, watchlistHrefs, machine, phase } = useTradeRuntime()
  const [machineOpen, setMachineOpen] = useState(false)

  return (
    <Rail data-trade-right-rail>
      <TopPanels>
        <Panel data-trade-best-route>
          <PanelHead>
            <PanelTitle>SmartSwap Best Route</PanelTitle>
            <LiveBadge>Live</LiveBadge>
          </PanelHead>
          {phase === 'routing' && <EmptyLine>Routing…</EmptyLine>}
          {phase !== 'routing' && routeEntries.length === 0 && (
            <EmptyLine>Enter amount to compare routes</EmptyLine>
          )}
          {routeEntries.map((entry) => (
            <RouteEntry key={entry.rank}>
              <Rank $rank={entry.rank}>{entry.rank}</Rank>
              <RouteMeta>
                <RouteName>
                  {entry.chain} · {entry.source}
                </RouteName>
                <RouteSub>
                  Gas: {entry.gas ?? '—'} · {entry.time ?? '—'}
                </RouteSub>
              </RouteMeta>
              <RouteRight>
                <RouteAmount>{entry.amount}</RouteAmount>
                <RouteDelta $best={entry.best}>{entry.delta}</RouteDelta>
              </RouteRight>
            </RouteEntry>
          ))}
          <OutlineBtn type="button" disabled title="Coming soon">
            View All Routes
          </OutlineBtn>
        </Panel>

        <Panel data-trade-your-assets>
          <PanelHead>
            <PanelTitle>Your Assets</PanelTitle>
            <LiveBadge>Live</LiveBadge>
          </PanelHead>
          {!assets.length && <EmptyLine>Connect wallet to view balances</EmptyLine>}
          {assets.map((asset) => (
            <AssetRow key={asset.symbol}>
              <AssetLeft>
                {asset.symbol === 'MARCO' ? (
                  <TradeMelegaIsologo size={22} />
                ) : (
                  <AssetIcon>{asset.symbol.slice(0, 1)}</AssetIcon>
                )}
                <AssetName>{asset.symbol}</AssetName>
              </AssetLeft>
              <AssetRight>
                <AssetBal>{asset.balance}</AssetBal>
              </AssetRight>
            </AssetRow>
          ))}
          <OutlineBtn type="button" disabled title="Coming soon" style={{ height: 38, marginTop: 10 }}>
            Manage Assets
          </OutlineBtn>
        </Panel>

        <Panel data-trade-router-status>
          <PanelHead>
            <PanelTitle style={{ fontSize: 12, letterSpacing: '0.06em' }}>MELEGA ROUTER STATUS</PanelTitle>
            <LiveBadge>Live</LiveBadge>
          </PanelHead>
          <StatusRow>
            <StatusDot $tone={routerStatus.statusTone} />
            <StatusText $tone={routerStatus.statusTone}>{routerStatus.status}</StatusText>
          </StatusRow>
          <StatGrid>
            <StatCell>
              <StatLabel>Quote</StatLabel>
              <StatValue>{routerStatus.uptime}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>Hops</StatLabel>
              <StatValue>{routerStatus.routes}</StatValue>
            </StatCell>
            <StatCell>
              <StatLabel>Chains</StatLabel>
              <StatValue>{routerStatus.chains}</StatValue>
            </StatCell>
          </StatGrid>
          <OutlineBtn type="button" disabled title="Coming soon" style={{ height: 36, marginTop: 10 }}>
            Router Analytics
          </OutlineBtn>
          <MachineToggle type="button" onClick={() => setMachineOpen((v) => !v)}>
            {machineOpen ? 'Hide' : 'Show'} machine-readable runtime
          </MachineToggle>
          {machineOpen && (
            <MachinePre data-trade-machine-json>{JSON.stringify(machine, null, 2)}</MachinePre>
          )}
        </Panel>
      </TopPanels>

      <WatchlistSlot>
        <TradeWatchlist pairs={watchlistHrefs} emptyLabel="No watchlist tokens saved" />
      </WatchlistSlot>
    </Rail>
  )
}

export default TradeRightRail
