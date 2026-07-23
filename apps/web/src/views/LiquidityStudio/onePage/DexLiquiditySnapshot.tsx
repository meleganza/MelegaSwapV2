import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Info } from 'lucide-react'
import { useAllTokenHighLight, useProtocolDataSWR } from 'state/info/hooks'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  margin-top: 12px;
  min-height: 286px;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid ${liqOne.goldBorderSoft};
  background:
    radial-gradient(circle at 88% 12%, rgba(221, 185, 47, 0.1) 0%, transparent 42%),
    radial-gradient(circle at 12% 88%, rgba(221, 185, 47, 0.05) 0%, transparent 40%),
    ${liqOne.card};
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Tip = styled.span`
  color: ${liqOne.muted};
  display: inline-flex;
  cursor: help;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`

const Metric = styled.div`
  background: rgba(21, 21, 21, 0.9);
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  padding: 12px;
  min-width: 0;
`

const MetricLabel = styled.div`
  font-size: 11px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const MetricValue = styled.div`
  margin-top: 6px;
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
  color: ${liqOne.text};
  letter-spacing: -0.02em;
`

const MetricDelta = styled.div<{ $pos?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ $pos }) => ($pos ? liqOne.positive : liqOne.secondary)};
`

const Bottom = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 14px;
  align-items: center;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`

const DonutWrap = styled.div`
  width: 112px;
  height: 112px;
  position: relative;
`

const AssetList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const AssetRow = styled.li`
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: ${liqOne.secondary};
`

const Swatch = styled.span<{ $c: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $c }) => $c};
`

const Unavailable = styled.div`
  margin-top: 8px;
  padding: 14px;
  border-radius: 10px;
  border: 1px dashed ${liqOne.borderStrong};
  color: ${liqOne.secondary};
  font-size: 13px;
  line-height: 20px;
`

const SectionLabel = styled.div`
  grid-column: 1 / -1;
  font-size: 12px;
  font-weight: 650;
  color: ${liqOne.text};
  margin-bottom: 2px;
`

const COLORS = ['#DDB92F', '#16D977', '#5B8CFF', '#F4B942', '#A8A8A8']

function formatUsd(n: number | undefined | null): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

function formatPct(n: number | undefined | null): string | null {
  if (n == null || !Number.isFinite(n)) return null
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

/**
 * DEX Liquidity Snapshot — real indexer / protocol data only.
 * Never fabricates TVL, sparklines, or asset shares.
 */
export const DexLiquiditySnapshot: React.FC = () => {
  const protocol = useProtocolDataSWR()
  const highlight = useAllTokenHighLight()

  const tvl = protocol?.liquidityUSD
  const vol24 = protocol?.volumeUSD
  const tvlChange = protocol?.liquidityUSDChange
  const volChange = protocol?.volumeUSDChange

  const assets = useMemo(() => {
    const rows = (highlight ?? [])
      .filter((t) => t && typeof t.liquidityUSD === 'number' && t.liquidityUSD > 0)
      .sort((a, b) => (b.liquidityUSD ?? 0) - (a.liquidityUSD ?? 0))
    const total = rows.reduce((s, t) => s + (t.liquidityUSD ?? 0), 0)
    if (!total) return [] as { symbol: string; pct: number; value: number; color: string }[]
    const top = rows.slice(0, 4)
    const topSum = top.reduce((s, t) => s + (t.liquidityUSD ?? 0), 0)
    const mapped = top.map((t, i) => ({
      symbol: t.symbol || t.name || 'Token',
      pct: ((t.liquidityUSD ?? 0) / total) * 100,
      value: t.liquidityUSD ?? 0,
      color: COLORS[i % COLORS.length],
    }))
    if (total - topSum > 0) {
      mapped.push({
        symbol: 'Others',
        pct: ((total - topSum) / total) * 100,
        value: total - topSum,
        color: COLORS[4],
      })
    }
    return mapped
  }, [highlight])

  const donutGradient = useMemo(() => {
    if (!assets.length) return 'conic-gradient(#2A2A2A 0deg 360deg)'
    let cursor = 0
    const parts = assets.map((a) => {
      const start = cursor
      cursor += (a.pct / 100) * 360
      return `${a.color} ${start}deg ${cursor}deg`
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [assets])

  const tvlLabel = formatUsd(tvl)
  const depthOrVolLabel = formatUsd(vol24)
  const unavailable = !tvlLabel && !depthOrVolLabel

  return (
    <Card data-testid="liq-one-dex-snapshot" id="liq-dex-snapshot">
      <Head>
        <Title>DEX Liquidity Snapshot</Title>
        <Tip
          title={
            unavailable
              ? 'Source: Melega info subgraph / protocol overview. Liquidity data awaiting indexer.'
              : 'Source: Melega info subgraph protocol overview. Values refresh with indexed blocks.'
          }
        >
          <Info size={14} />
        </Tip>
      </Head>

      {unavailable ? (
        <Unavailable data-testid="liq-one-dex-snapshot-unavailable">
          Liquidity data awaiting indexer.
          <br />
          Blocker: protocol overview TVL/volume not available from the certified info subgraph.
        </Unavailable>
      ) : (
        <>
          <Metrics>
            <Metric>
              <MetricLabel>DEX TVL</MetricLabel>
              <MetricValue>{tvlLabel ?? '—'}</MetricValue>
              {formatPct(tvlChange) ? (
                <MetricDelta $pos={(tvlChange ?? 0) >= 0}>{formatPct(tvlChange)} (24h)</MetricDelta>
              ) : (
                <MetricDelta>Trend unavailable</MetricDelta>
              )}
            </Metric>
            <Metric>
              <MetricLabel>24H Volume</MetricLabel>
              <MetricValue>{depthOrVolLabel ?? '—'}</MetricValue>
              {formatPct(volChange) ? (
                <MetricDelta $pos={(volChange ?? 0) >= 0}>{formatPct(volChange)} (24h)</MetricDelta>
              ) : (
                <MetricDelta>Trend unavailable</MetricDelta>
              )}
            </Metric>
          </Metrics>

          <Bottom>
            <SectionLabel>Top Liquid Assets by TVL</SectionLabel>
            {assets.length ? (
              <>
                <DonutWrap aria-hidden style={{ background: donutGradient, borderRadius: '50%' }} />
                <AssetList>
                  {assets.map((a) => (
                    <AssetRow key={a.symbol}>
                      <Swatch $c={a.color} />
                      <span style={{ color: liqOne.text, fontWeight: 650 }}>{a.symbol}</span>
                      <span>{a.pct.toFixed(1)}%</span>
                      <span>{formatUsd(a.value)}</span>
                    </AssetRow>
                  ))}
                </AssetList>
              </>
            ) : (
              <Unavailable style={{ gridColumn: '1 / -1', marginTop: 0 }}>
                Top liquid assets unavailable until token liquidity is indexed.
              </Unavailable>
            )}
          </Bottom>
        </>
      )}
    </Card>
  )
}

export default DexLiquiditySnapshot
