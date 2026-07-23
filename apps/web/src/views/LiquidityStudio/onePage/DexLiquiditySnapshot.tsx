import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Info } from 'lucide-react'
import { useAllTokenHighLight, useProtocolDataSWR } from 'state/info/hooks'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  width: 100%;
  height: ${liqOne.snapH};
  min-height: ${liqOne.snapH};
  max-height: ${liqOne.snapH};
  margin: 0;
  padding: 0 16px;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid ${liqOne.goldBorderSoft};
  background:
    radial-gradient(circle at 88% 12%, rgba(221, 185, 47, 0.1) 0%, transparent 42%),
    ${liqOne.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${liqOne.font};

  @media (max-width: 1375px) {
    height: auto;
    min-height: 0;
    max-height: none;
  }
`

const Head = styled.div`
  flex: 0 0 ${liqOne.snapHeadH};
  height: ${liqOne.snapHeadH};
  min-height: ${liqOne.snapHeadH};
  max-height: ${liqOne.snapHeadH};
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0;
  font-size: 15px;
  line-height: 20px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Tip = styled.span`
  color: ${liqOne.muted};
  display: inline-flex;
  cursor: help;
`

const Metrics = styled.div`
  flex: 0 0 ${liqOne.snapKpiH};
  height: ${liqOne.snapKpiH};
  min-height: ${liqOne.snapKpiH};
  max-height: ${liqOne.snapKpiH};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  box-sizing: border-box;
  overflow: hidden;
`

const Metric = styled.div`
  background: rgba(21, 21, 21, 0.9);
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  padding: 10px 12px;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
`

const MetricLabel = styled.div`
  font-size: 11px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const MetricValue = styled.div`
  margin-top: 4px;
  font-size: 22px;
  line-height: 26px;
  font-weight: 700;
  color: ${liqOne.text};
`

const MetricDelta = styled.div<{ $pos?: boolean }>`
  margin-top: 2px;
  font-size: 11px;
  color: ${({ $pos }) => ($pos ? liqOne.positive : liqOne.secondary)};
`

const ChartRow = styled.div`
  flex: 0 0 ${liqOne.snapDonutH};
  height: ${liqOne.snapDonutH};
  min-height: ${liqOne.snapDonutH};
  max-height: ${liqOne.snapDonutH};
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
`

const DonutWrap = styled.div`
  width: 112px;
  height: 112px;
  border-radius: 50%;
  position: relative;
`

const DonutCenter = styled.div`
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  background: ${liqOne.card};
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: ${liqOne.text};
  line-height: 1.2;
`

const Legend = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 0 0 ${liqOne.snapLegendH};
  height: ${liqOne.snapLegendH};
  min-height: ${liqOne.snapLegendH};
  max-height: ${liqOne.snapLegendH};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
`

const AssetRow = styled.li`
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  font-size: 11px;
  color: ${liqOne.secondary};
`

const Swatch = styled.span<{ $c: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $c }) => $c};
`

const Unavailable = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 10px;
  border: 1px dashed ${liqOne.borderStrong};
  color: ${liqOne.secondary};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  margin: 8px 0 12px;
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
    <Card data-testid="liq-one-dex-snapshot" id="liq-dex-snapshot" data-pixel-snap="324">
      <Head>
        <Title>DEX Liquidity Snapshot</Title>
        <Tip title="Source: Melega info subgraph / protocol overview.">
          <Info size={14} />
        </Tip>
      </Head>

      {unavailable ? (
        <Unavailable data-testid="liq-one-dex-snapshot-unavailable">
          Liquidity data awaiting indexer. Charts unavailable — no empty placeholders.
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
              <MetricLabel>Liquidity Depth</MetricLabel>
              <MetricValue>{depthOrVolLabel ?? '—'}</MetricValue>
              {formatPct(volChange) ? (
                <MetricDelta $pos={(volChange ?? 0) >= 0}>{formatPct(volChange)} (24h)</MetricDelta>
              ) : (
                <MetricDelta>24h volume proxy</MetricDelta>
              )}
            </Metric>
          </Metrics>

          <ChartRow>
            {assets.length ? (
              <>
                <DonutWrap aria-hidden style={{ background: donutGradient }}>
                  <DonutCenter>
                    {tvlLabel}
                    <br />
                    <span style={{ color: liqOne.muted, fontWeight: 600 }}>TVL</span>
                  </DonutCenter>
                </DonutWrap>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 650, color: liqOne.text, marginBottom: 4 }}>
                    Top Liquid Assets by TVL
                  </div>
                  <Legend>
                    {assets.slice(0, 4).map((a) => (
                      <AssetRow key={a.symbol}>
                        <Swatch $c={a.color} />
                        <span style={{ color: liqOne.text, fontWeight: 650 }}>{a.symbol}</span>
                        <span>{a.pct.toFixed(1)}%</span>
                        <span>{formatUsd(a.value)}</span>
                      </AssetRow>
                    ))}
                  </Legend>
                </div>
              </>
            ) : (
              <Unavailable style={{ gridColumn: '1 / -1', margin: 0, height: '100%' }}>
                Top liquid assets unavailable until token liquidity is indexed.
              </Unavailable>
            )}
          </ChartRow>
        </>
      )}
    </Card>
  )
}

export default DexLiquiditySnapshot
