import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Info, RefreshCw, Database } from 'lucide-react'
import useSWR from 'swr'
import { useAllTokenHighLight, useProtocolDataSWR } from 'state/info/hooks'
import { liqOne } from './onePageTokens'

type IndexerHealth = {
  status?: string
  lastIndexedBlock?: number
  lastSuccessfulSync?: string | null
  lastFailureReason?: string | null
  lastOrchestratorRun?: string | null
  eventCounts?: Record<string, number>
  generatedAt?: string
}

const Card = styled.section`
  width: ${liqOne.col};
  max-width: 100%;
  height: ${liqOne.snapH};
  min-height: ${liqOne.snapH};
  max-height: ${liqOne.snapH};
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid ${liqOne.goldBorderSoft};
  background:
    radial-gradient(circle at 88% 10%, rgba(221, 185, 47, 0.09) 0%, transparent 38%),
    radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.45) 0%, transparent 48%),
    radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 55%),
    ${liqOne.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${liqOne.font};

  @media (max-width: 1375px) {
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }
`

const Head = styled.div`
  flex: 0 0 ${liqOne.snapHeadH};
  height: ${liqOne.snapHeadH};
  min-height: ${liqOne.snapHeadH};
  max-height: ${liqOne.snapHeadH};
  padding: 0 ${liqOne.snapPadX};
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 44px;
    max-height: none;
    padding: 10px ${liqOne.snapPadX};
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Tip = styled.span`
  color: ${liqOne.muted};
  display: inline-flex;
  cursor: help;
  flex-shrink: 0;
`

const Timestamp = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: ${liqOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 46%;
`

const Kpis = styled.div`
  flex: 0 0 ${liqOne.snapKpiH};
  height: ${liqOne.snapKpiH};
  min-height: ${liqOne.snapKpiH};
  max-height: ${liqOne.snapKpiH};
  padding: 0 19px;
  display: grid;
  grid-template-columns: ${liqOne.snapKpiW} ${liqOne.snapKpiW};
  gap: 12px;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    grid-template-columns: 1fr 1fr;
    padding: 0 ${liqOne.snapPadX} 8px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const Kpi = styled.div`
  width: ${liqOne.snapKpiW};
  max-width: 100%;
  height: 76px;
  min-height: 76px;
  max-height: 76px;
  background: rgba(21, 21, 21, 0.92);
  border: 1px solid ${liqOne.borderDefault};
  border-radius: ${liqOne.controlRadius};
  padding: 10px 12px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    height: auto;
    min-height: 76px;
    max-height: none;
  }
`

const KpiLabel = styled.div`
  font-size: 11px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const KpiValue = styled.div`
  margin-top: 4px;
  font-size: 26px;
  line-height: 30px;
  font-weight: 700;
  color: ${liqOne.text};
`

const KpiHint = styled.div`
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: ${liqOne.secondary};
`

const Chart = styled.div`
  flex: 0 0 ${liqOne.snapChartH};
  height: ${liqOne.snapChartH};
  min-height: ${liqOne.snapChartH};
  max-height: ${liqOne.snapChartH};
  padding: 0 ${liqOne.snapPadX};
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 8px ${liqOne.snapPadX};
    overflow: visible;
  }
`

const DonutWrap = styled.div`
  width: 132px;
  height: 132px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
`

const DonutCenter = styled.div`
  position: absolute;
  inset: 34px;
  border-radius: 50%;
  background: ${liqOne.card};
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: ${liqOne.text};
  line-height: 1.2;
`

const Legend = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  min-width: 0;
  width: 100%;
  overflow: hidden;

  @media (max-width: 1375px) {
    overflow: visible;
  }
`

const LegendRow = styled.li`
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) 48px minmax(56px, auto);
  gap: 8px;
  align-items: center;
  height: 24px;
  min-height: 24px;
  max-height: 24px;
  font-size: 13px;
  color: ${liqOne.secondary};
  box-sizing: border-box;
  overflow: hidden;
`

const Swatch = styled.span<{ $c: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $c }) => $c};
`

const ChartAwaiting = styled.div`
  grid-column: 1 / -1;
  height: 132px;
  max-height: 132px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
  color: ${liqOne.secondary};
  box-sizing: border-box;
  overflow: hidden;
`

const AwaitTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${liqOne.text};
`

const AwaitMeta = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${liqOne.muted};
`

const Footer = styled.div`
  flex: 0 0 ${liqOne.snapFooterH};
  height: ${liqOne.snapFooterH};
  min-height: ${liqOne.snapFooterH};
  max-height: ${liqOne.snapFooterH};
  padding: 0 ${liqOne.snapPadX};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  border-top: 1px solid ${liqOne.borderDefault};

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    grid-template-columns: 1fr;
    padding: 10px ${liqOne.snapPadX} 12px;
    overflow: visible;
  }
`

const FootBlock = styled.div`
  min-width: 0;
  overflow: hidden;
`

const FootLabel = styled.div`
  font-size: 11px;
  font-weight: 650;
  color: ${liqOne.muted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const FootValue = styled.div`
  margin-top: 4px;
  font-size: 14px;
  font-weight: 700;
  color: ${liqOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RefreshBtn = styled.button`
  appearance: none;
  margin-top: 4px;
  height: 24px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${liqOne.goldBorder};
  background: rgba(221, 185, 47, 0.1);
  color: ${liqOne.gold};
  font-size: 11px;
  font-weight: 700;
  font-family: ${liqOne.font};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`

const COLORS = ['#DDB92F', '#16D977', '#5B8CFF', '#F4B942']

function formatUsd(n: number | undefined | null): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

function formatTimeLabel(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchIndexerHealth(): Promise<IndexerHealth> {
  const res = await fetch('/api/indexer/health/')
  if (!res.ok) throw new Error(`indexer health ${res.status}`)
  return res.json()
}

export const DexLiquiditySnapshot: React.FC = () => {
  const protocol = useProtocolDataSWR()
  const highlight = useAllTokenHighLight()
  const {
    data: health,
    mutate,
    isValidating,
    error: healthError,
  } = useSWR<IndexerHealth>('liq-dex-snapshot-indexer-health', fetchIndexerHealth, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  })

  const tvl = protocol?.liquidityUSD
  const vol24 = protocol?.volumeUSD
  const tvlLabel = formatUsd(tvl)
  const volLabel = formatUsd(vol24)

  const assets = useMemo(() => {
    const rows = (highlight ?? [])
      .filter((t) => t && typeof t.liquidityUSD === 'number' && t.liquidityUSD > 0 && (t.symbol || t.name))
      .sort((a, b) => (b.liquidityUSD ?? 0) - (a.liquidityUSD ?? 0))
    const total = rows.reduce((s, t) => s + (t.liquidityUSD ?? 0), 0)
    if (!total) return [] as { symbol: string; pct: number; value: number; color: string }[]
    return rows.slice(0, 4).map((t, i) => ({
      symbol: String(t.symbol || t.name),
      pct: ((t.liquidityUSD ?? 0) / total) * 100,
      value: t.liquidityUSD ?? 0,
      color: COLORS[i % COLORS.length],
    }))
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

  const lastBlock =
    health?.lastIndexedBlock != null && health.lastIndexedBlock > 0 ? String(health.lastIndexedBlock) : '—'
  const lastSync = formatTimeLabel(health?.lastSuccessfulSync)
  const lastAttempt = formatTimeLabel(health?.lastOrchestratorRun || health?.lastSuccessfulSync)
  const sourceTs = formatTimeLabel(health?.lastSuccessfulSync)

  const indexedPools = useMemo(() => {
    const mint = health?.eventCounts?.Mint
    const burn = health?.eventCounts?.Burn
    const pairCreated = health?.eventCounts?.PairCreated
    if (typeof pairCreated === 'number' && pairCreated > 0) return String(pairCreated)
    // No fabricated pool count from mint/burn alone
    void mint
    void burn
    return '—'
  }, [health])

  const indexedTokens = useMemo(() => {
    if (assets.length > 0) return String(highlight.filter((t) => t?.liquidityUSD && t.liquidityUSD > 0).length || assets.length)
    return '—'
  }, [assets.length, highlight])

  const hasChart = assets.length > 0

  const onRefresh = useCallback(() => {
    void mutate()
  }, [mutate])

  const refreshLabel = isValidating ? 'Refreshing…' : 'Refresh'

  return (
    <Card data-testid="liq-one-dex-snapshot" id="liq-dex-snapshot" data-pixel-snap="324">
      <Head data-testid="liq-snap-header" data-pixel-snap-header="44">
        <Title>DEX Liquidity Snapshot</Title>
        <Tip title="Source: Melega protocol overview / indexer. No fabricated TVL or volume.">
          <Info size={14} />
        </Tip>
        <Timestamp data-testid="liq-snap-timestamp">
          {sourceTs !== '—' ? `Updated ${sourceTs}` : healthError ? 'Indexer unreachable' : 'Awaiting sync'}
        </Timestamp>
      </Head>

      <Kpis data-testid="liq-snap-kpis" data-pixel-snap-kpis="76">
        <Kpi data-testid="liq-snap-kpi-tvl">
          <KpiLabel>DEX TVL</KpiLabel>
          <KpiValue>{tvlLabel ?? '—'}</KpiValue>
          <KpiHint>{tvlLabel ? 'Indexed' : 'Awaiting Indexer'}</KpiHint>
        </Kpi>
        <Kpi data-testid="liq-snap-kpi-volume">
          <KpiLabel>24H Volume</KpiLabel>
          <KpiValue>{volLabel ?? '—'}</KpiValue>
          <KpiHint>{volLabel ? 'Indexed' : 'Awaiting Indexer'}</KpiHint>
        </Kpi>
      </Kpis>

      <Chart data-testid="liq-snap-chart" data-pixel-snap-chart="132">
        {hasChart ? (
          <>
            <DonutWrap aria-hidden style={{ background: donutGradient }} data-testid="liq-snap-donut">
              <DonutCenter>
                {tvlLabel ?? '—'}
                <br />
                <span style={{ color: liqOne.muted, fontWeight: 600, fontSize: 11 }}>TVL</span>
              </DonutCenter>
            </DonutWrap>
            <Legend data-testid="liq-snap-legend">
              {assets.map((a) => (
                <LegendRow key={a.symbol}>
                  <Swatch $c={a.color} />
                  <span style={{ color: liqOne.text, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.symbol}
                  </span>
                  <span>{a.pct.toFixed(1)}%</span>
                  <span>{formatUsd(a.value) ?? '—'}</span>
                </LegendRow>
              ))}
            </Legend>
          </>
        ) : (
          <ChartAwaiting data-testid="liq-one-dex-snapshot-unavailable">
            <Database size={18} color={liqOne.gold} strokeWidth={1.75} aria-hidden />
            <AwaitTitle>Awaiting Indexer</AwaitTitle>
            <AwaitMeta>Last Indexed Block {lastBlock}</AwaitMeta>
            <AwaitMeta>Last Attempt {lastAttempt}</AwaitMeta>
            <RefreshBtn type="button" onClick={onRefresh} data-testid="liq-snap-refresh">
              <RefreshCw size={11} />
              {refreshLabel}
            </RefreshBtn>
          </ChartAwaiting>
        )}
      </Chart>

      <Footer data-testid="liq-snap-footer" data-pixel-snap-footer="72">
        <FootBlock>
          <FootLabel>Indexed Pools</FootLabel>
          <FootValue>{indexedPools}</FootValue>
        </FootBlock>
        <FootBlock>
          <FootLabel>Indexed Tokens</FootLabel>
          <FootValue>{indexedTokens}</FootValue>
        </FootBlock>
        <FootBlock>
          <FootLabel>Last Sync</FootLabel>
          <FootValue title={lastSync}>{lastSync}</FootValue>
        </FootBlock>
      </Footer>
    </Card>
  )
}

export default DexLiquiditySnapshot
