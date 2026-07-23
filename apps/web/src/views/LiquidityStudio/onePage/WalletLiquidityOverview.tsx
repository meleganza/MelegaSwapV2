import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { selectLiquidityPortfolioPositions } from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  width: 100%;
  margin-top: ${liqOne.sectionGap};
  padding: 14px 16px;
  box-sizing: border-box;
  background: ${liqOne.card};
  border: 1px solid ${liqOne.border};
  border-radius: 14px;
`

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 10px;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;

    & > * {
      flex: 0 0 min(220px, 78vw);
      scroll-snap-align: start;
    }
  }
`

const Block = styled.div`
  min-width: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${liqOne.elevated};
  border: 1px solid ${liqOne.borderDefault};
`

const Label = styled.div`
  font-size: 11px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const Value = styled.div`
  margin-top: 6px;
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Sub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${liqOne.secondary};
`

const Donut = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-top: 8px;
`

type Props = {
  lbProgramCount?: number
}

function parseUsd(raw: string | null | undefined): number | null {
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Wallet liquidity overview — Total LP Value is the user's aggregate LP estimate.
 * Never fabricates USD, fees, or holdings when sources are unavailable.
 */
export const WalletLiquidityOverview: React.FC<Props> = ({ lbProgramCount = 0 }) => {
  const { address, isConnected } = useAccount()
  const { liquidityWalletPortfolio } = useLiquidityRuntime()
  const positions = useMemo(
    () => selectLiquidityPortfolioPositions(liquidityWalletPortfolio),
    [liquidityWalletPortfolio],
  )

  const activeManual = positions.length
  const totalPositions = activeManual + Math.max(0, lbProgramCount)

  const holdings = useMemo(() => {
    const weights = new Map<string, number>()
    for (const p of positions) {
      const assets = p.underlyingAssets?.length
        ? p.underlyingAssets.map(
            (a) => a.token?.symbol || a.token?.address?.slice(0, 6) || 'Token',
          )
        : (p.title || 'LP').split(/[/\-]/).map((s) => s.trim()).filter(Boolean)
      const symbols = assets.length ? assets : ['LP']
      const weight = parseUsd(p.currentValueUsd) ?? 1
      for (const s of symbols) {
        weights.set(s, (weights.get(s) ?? 0) + weight / symbols.length)
      }
    }
    const entries = [...weights.entries()].sort((a, b) => b[1] - a[1])
    const total = entries.reduce((s, [, v]) => s + v, 0)
    if (!total) return [] as { symbol: string; pct: number }[]
    const top = entries.slice(0, 3)
    const topSum = top.reduce((s, [, v]) => s + v, 0)
    const mapped = top.map(([symbol, v]) => ({ symbol, pct: (v / total) * 100 }))
    if (total - topSum > 0.01) mapped.push({ symbol: 'Others', pct: ((total - topSum) / total) * 100 })
    return mapped
  }, [positions])

  const totalLpUsd = useMemo(() => {
    let sum = 0
    let any = false
    for (const p of positions) {
      const v = parseUsd(p.currentValueUsd)
      if (v != null) {
        sum += v
        any = true
      }
    }
    return any ? sum : null
  }, [positions])

  const donut = useMemo(() => {
    if (!holdings.length) return 'conic-gradient(#2A2A2A 0deg 360deg)'
    const colors = ['#DDB92F', '#16D977', '#5B8CFF', '#A8A8A8']
    let cursor = 0
    const parts = holdings.map((h, i) => {
      const start = cursor
      cursor += (h.pct / 100) * 360
      return `${colors[i % colors.length]} ${start}deg ${cursor}deg`
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [holdings])

  return (
    <Card data-testid="liq-one-wallet-overview" id="liq-wallet-overview">
      <Title>Your Liquidity Overview</Title>
      <Grid>
        <Block>
          <Label>Total LP Value</Label>
          <Value>
            {!isConnected || !address
              ? '—'
              : totalLpUsd != null
                ? `$${totalLpUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : '—'}
          </Value>
          <Sub>
            {!isConnected
              ? 'Connect wallet'
              : totalLpUsd != null
                ? 'Wallet LP estimate'
                : 'USD valuation unavailable'}
          </Sub>
        </Block>
        <Block>
          <Label>Holdings Breakdown</Label>
          {holdings.length ? (
            <>
              <Donut style={{ background: donut }} aria-hidden />
              <Sub>{holdings.map((h) => `${h.symbol} ${h.pct.toFixed(0)}%`).join(' · ')}</Sub>
            </>
          ) : (
            <Value>—</Value>
          )}
        </Block>
        <Block>
          <Label>Active Positions</Label>
          <Value>{isConnected ? String(activeManual) : '—'}</Value>
          <Sub>Total Positions: {isConnected ? String(totalPositions) : '—'}</Sub>
        </Block>
        <Block>
          <Label>Networks</Label>
          <Value>{isConnected && activeManual + lbProgramCount > 0 ? '1' : isConnected ? '0' : '—'}</Value>
          <Sub>BNB Smart Chain</Sub>
        </Block>
        <Block>
          <Label>Unclaimed Fees</Label>
          <Value>—</Value>
          <Sub>Fee accrual unavailable</Sub>
        </Block>
      </Grid>
    </Card>
  )
}

export default WalletLiquidityOverview
