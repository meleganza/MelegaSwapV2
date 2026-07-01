import React from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { tradeColors } from '../tradeTokens'

const Rail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  min-width: 0;
`

const Panel = styled.div<{ $height?: string }>`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  padding: 14px;
  box-sizing: border-box;
  min-height: 0;
  ${({ $height }) => ($height ? `height: ${$height};` : '')}
  overflow: hidden;
`

const PanelTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 800;
  color: ${tradeColors.text};
  line-height: 1.2;
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  margin-left: 8px;
  border-radius: 6px;
  background: rgba(0, 230, 118, 0.1);
  color: ${tradeColors.green};
  font-size: 11px;
  font-weight: 700;
`

const RouteEntry = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 8px;
  align-items: center;
  min-height: 58px;
  padding: 6px 0;
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
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
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

const RouteDelta = styled.div<{ $positive?: boolean; $best?: boolean }>`
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $best, $positive }) =>
    $best ? tradeColors.green : $positive ? tradeColors.green : tradeColors.red};
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
  transition: border-color 150ms ease, background 150ms ease;

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

const Indexing = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  color: ${tradeColors.muted};
  line-height: 1.4;
`

const formatBal = (value?: string) => {
  if (!value || value === '0') return '—'
  const n = parseFloat(value)
  if (!Number.isFinite(n)) return '—'
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return n.toFixed(4).replace(/\.?0+$/, '')
}

export const TradeRightRail: React.FC = () => {
  const { account } = useWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const inputBal = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)
  const outputBal = useCurrencyBalance(account ?? undefined, outputCurrency ?? undefined)

  const inputSymbol = inputCurrency?.symbol ?? 'BNB'
  const outputSymbol = outputCurrency?.symbol ?? 'MARCO'

  return (
    <Rail data-trade-right-rail>
      <Panel $height="292px" data-trade-best-route>
        <PanelTitle>
          SmartSwap Best Route
          {account && <Badge>Recommended</Badge>}
        </PanelTitle>
        {account ? (
          <>
            <RouteEntry>
              <Rank $rank={1}>1</Rank>
              <RouteMeta>
                <RouteName>BNB Chain / PancakeSwap</RouteName>
                <RouteSub>Est. Time: — · Gas: —</RouteSub>
              </RouteMeta>
              <RouteRight>
                <RouteAmount>—</RouteAmount>
                <RouteDelta $best>Indexing route</RouteDelta>
              </RouteRight>
            </RouteEntry>
            <OutlineBtn type="button">View All Routes</OutlineBtn>
          </>
        ) : (
          <Indexing>Indexing supported routes...</Indexing>
        )}
      </Panel>

      <Panel $height="172px" data-trade-your-assets>
        <PanelTitle>Your Assets</PanelTitle>
        <AssetRow>
          <AssetLeft>
            <AssetIcon>{inputSymbol.slice(0, 1)}</AssetIcon>
            <AssetName>{inputSymbol}</AssetName>
          </AssetLeft>
          <AssetRight>
            <AssetBal>{account ? formatBal(inputBal?.toExact()) : '—'}</AssetBal>
            <AssetUsd>{account ? '—' : 'Connect wallet'}</AssetUsd>
          </AssetRight>
        </AssetRow>
        <AssetRow>
          <AssetLeft>
            <AssetIcon>{outputSymbol.slice(0, 1)}</AssetIcon>
            <AssetName>{outputSymbol}</AssetName>
          </AssetLeft>
          <AssetRight>
            <AssetBal>{account ? formatBal(outputBal?.toExact()) : '—'}</AssetBal>
            <AssetUsd>{account ? '—' : 'Connect wallet'}</AssetUsd>
          </AssetRight>
        </AssetRow>
        <OutlineBtn type="button" style={{ height: 38, marginTop: 10 }}>
          Manage Assets
        </OutlineBtn>
      </Panel>

      <Panel $height="170px" data-trade-router-status>
        <PanelTitle style={{ fontSize: 12, letterSpacing: '0.06em' }}>MELEGA ROUTER STATUS</PanelTitle>
        <StatusRow>
          <StatusDot />
          <StatusText>Indexing router status...</StatusText>
        </StatusRow>
        <StatGrid>
          <StatCell>
            <StatLabel>Uptime</StatLabel>
            <StatValue>—</StatValue>
          </StatCell>
          <StatCell>
            <StatLabel>Routes</StatLabel>
            <StatValue>—</StatValue>
          </StatCell>
          <StatCell>
            <StatLabel>Chains</StatLabel>
            <StatValue>—</StatValue>
          </StatCell>
        </StatGrid>
        <OutlineBtn type="button" style={{ height: 36, marginTop: 10 }}>
          Router Analytics
        </OutlineBtn>
      </Panel>
    </Rail>
  )
}

export default TradeRightRail
