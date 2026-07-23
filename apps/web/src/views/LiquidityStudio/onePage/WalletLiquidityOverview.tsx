import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { selectLiquidityPortfolioPositions } from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  width: 100%;
  height: ${liqOne.overviewH};
  min-height: ${liqOne.overviewH};
  max-height: ${liqOne.overviewH};
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: ${liqOne.card};
  border: 1px solid ${liqOne.border};
  border-radius: 14px;
  overflow: hidden;
  font-family: ${liqOne.font};

  @media (max-width: 1100px) {
    height: auto;
    min-height: 0;
    max-height: none;
  }
`

const Title = styled.h2`
  margin: 0;
  padding: 10px 16px 0;
  font-size: 15px;
  line-height: 20px;
  font-weight: 700;
  color: ${liqOne.text};
  height: 30px;
  box-sizing: border-box;
`

const Grid = styled.div`
  height: calc(${liqOne.overviewH} - 30px);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1100px) {
    height: auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    display: flex;
    overflow-x: auto;
    & > * {
      flex: 0 0 min(220px, 78vw);
    }
  }
`

const Block = styled.div`
  min-width: 0;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  border-right: 1px solid ${liqOne.borderDefault};
  overflow: hidden;

  &:last-child {
    border-right: none;
  }

  @media (max-width: 1100px) {
    height: auto;
    border-right: none;
    border-bottom: 1px solid ${liqOne.borderDefault};
  }
`

const Label = styled.div`
  font-size: 11px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const Value = styled.div`
  margin-top: 8px;
  font-size: 20px;
  line-height: 24px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Sub = styled.div`
  margin-top: 6px;
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

export const WalletLiquidityOverview: React.FC<Props> = ({ lbProgramCount = 0 }) => {
  const { isConnected } = useAccount()
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
        ? p.underlyingAssets.map((a) => a.token?.symbol || a.token?.address?.slice(0, 6) || 'Token')
        : (p.title || 'LP')
            .split(/[/\-]/)
            .map((s) => s.trim())
            .filter(Boolean)
      const symbols = assets.length ? assets : ['LP']
      const weight = parseUsd(p.currentValueUsd) ?? 1
      for (const s of symbols) {
        weights.set(s, (weights.get(s) ?? 0) + weight / symbols.length)
      }
    }
    const entries = [...weights.entries()].sort((a, b) => b[1] - a[1])
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1
    return entries.slice(0, 4).map(([symbol, v]) => ({ symbol, pct: (v / total) * 100 }))
  }, [positions])

  const totalLp = useMemo(() => {
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
    <Card data-testid="liq-one-overview" data-pixel-overview="150">
      <Title>Your Liquidity Overview</Title>
      <Grid>
        <Block>
          <Label>Total LP Value</Label>
          <Value>
            {!isConnected ? '—' : totalLp != null ? `$${totalLp.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
          </Value>
          <Sub>{!isConnected ? 'Connect wallet' : totalLp == null ? 'Value unavailable' : 'Wallet LP estimate'}</Sub>
        </Block>
        <Block>
          <Label>Holdings Breakdown</Label>
          <Donut style={{ background: donut }} aria-hidden />
          <Sub>
            {holdings.length
              ? holdings.map((h) => h.symbol).join(' · ')
              : isConnected
                ? 'No holdings indexed'
                : 'Connect wallet'}
          </Sub>
        </Block>
        <Block>
          <Label>Active Positions</Label>
          <Value>{isConnected ? String(activeManual) : '—'}</Value>
          <Sub>Total Positions: {isConnected ? String(totalPositions) : '—'}</Sub>
        </Block>
        <Block>
          <Label>Networks</Label>
          <Value>{isConnected ? '1' : '—'}</Value>
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
