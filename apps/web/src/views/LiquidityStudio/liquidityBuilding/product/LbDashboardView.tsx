import React, { useMemo } from 'react'
import styled from 'styled-components'
import {
  Copy,
  ExternalLink,
  PauseCircle,
  ShieldAlert,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { LiquidityBuildingCardState } from '../useLiquidityBuildingCard'
import { LB_UX, translateActivityReason } from '../uxCopy'
import { lb } from './lbProductTokens'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 20px;
`

const Summary = styled.section`
  grid-column: span 12;
  min-height: 126px;
  padding: 22px;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.04), ${lb.card});
  box-sizing: border-box;
`

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
`

const SummaryTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  font-weight: 600;
  color: ${lb.text};
`

const SummarySub = styled.p`
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: ${lb.muted};
`

const ManageBtn = styled.button`
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 0;
  background: ${lb.gold};
  color: ${lb.ink};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const Safety = styled.section<{ $danger?: boolean }>`
  grid-column: span 12;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid
    ${({ $danger }) => ($danger ? 'rgba(239,68,68,0.34)' : 'rgba(245,158,11,0.34)')};
  background: ${({ $danger }) =>
    $danger ? 'rgba(239,68,68,0.055)' : 'rgba(245,158,11,0.055)'};
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 12px;
  align-items: center;
`

const Metric = styled.div`
  grid-column: span 2;
  min-height: 112px;
  padding: 16px;
  border-radius: 16px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;

  @media (max-width: 1279px) {
    grid-column: span 4;
  }

  @media (max-width: 768px) {
    grid-column: span 6;
  }

  @media (max-width: 390px) {
    grid-column: span 12;
  }
`

const MetricLabel = styled.div`
  font-size: 9px;
  line-height: 13px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${lb.muted6};
`

const MetricValue = styled.div`
  margin-top: 12px;
  font-size: 20px;
  line-height: 26px;
  font-weight: 600;
  color: ${lb.text};
`

const MetricUnit = styled.div`
  margin-top: 3px;
  font-size: 10px;
  line-height: 14px;
  color: ${lb.muted9};
`

const ChartCard = styled.section`
  grid-column: span 8;
  min-height: 330px;
  padding: 20px;
  border-radius: 18px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;

  @media (max-width: 1279px) {
    grid-column: span 12;
  }

  @media (max-width: 390px) {
    min-height: 280px;
  }
`

const DetailsCard = styled.section`
  grid-column: span 4;
  min-height: 330px;
  padding: 20px;
  border-radius: 18px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;

  @media (max-width: 1279px) {
    grid-column: span 12;
  }
`

const HalfCard = styled.section`
  grid-column: span 6;
  min-height: 220px;
  padding: 20px;
  border-radius: 18px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-column: span 12;
  }
`

const CardTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${lb.text};
`

const DetailRow = styled.div`
  min-height: 38px;
  padding: 9px 0;
  border-bottom: 1px solid #242424;
  display: flex;
  justify-content: space-between;
  gap: 14px;
`

const DetailLabel = styled.span`
  font-size: 10px;
  color: ${lb.muted5};
`

const DetailValue = styled.span`
  max-width: 210px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 600;
  color: #d4d4d4;
  text-align: right;
  overflow-wrap: anywhere;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const Empty = styled.div`
  padding: 24px 12px;
  font-size: 12px;
  line-height: 18px;
  color: ${lb.muted};
  text-align: center;
`

const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1.4fr 1fr 0.9fr 1fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #242424;
  font-size: 11px;
  color: ${lb.muted2};

  @media (max-width: 390px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`

const GhostBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${lb.border};
  background: transparent;
  color: ${lb.muted2};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
`

function fmt(v: string | null | undefined): string {
  if (v == null || v === '') return '—'
  return v
}

function shorten(addr?: string | null) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function humanAction(kind: string, title: string): string {
  if (title) return title
  switch (kind) {
    case 'EXECUTION_COMPLETED':
      return 'Execution completed'
    case 'EXECUTION_SKIPPED':
      return 'Execution skipped'
    case 'WAITING':
      return 'Decision evaluated'
    default:
      return 'Decision evaluated'
  }
}

export function LbDashboardView({ card }: { card: LiquidityBuildingCardState }) {
  const snap = card.programSnapshot
  const symbol = card.draft.tokenSymbol || snap.tokenSymbol || null
  const pair =
    card.pairDetection.available && symbol
      ? `${symbol}/${card.pairDetection.quoteSymbol}`
      : snap.pairLabel

  const chartPoints = useMemo(() => {
    // Only real cumulative observations — never invent a curve.
    return card.liquiditySeries
  }, [card.liquiditySeries])

  const metrics = [
    { label: 'Initial Budget', value: fmt(snap.initialBudgetLabel), unit: symbol ?? '' },
    { label: 'Remaining Budget', value: fmt(card.metrics.budgetRemainingLabel ?? snap.remainingBudgetLabel), unit: symbol ?? '', testId: 'lb-metric-budget' },
    { label: 'Tokens Sold', value: fmt(snap.tokensSoldLabel), unit: symbol ?? '' },
    { label: 'Tokens Matched', value: fmt(snap.tokensMatchedLabel), unit: symbol ?? '' },
    { label: 'Gross Quote Acquired', value: fmt(snap.grossQuoteLabel), unit: card.pairDetection.quoteSymbol ?? 'quote' },
    {
      label: 'Liquidity Built',
      value: fmt(card.metrics.liquidityBuiltLabel ?? snap.liquidityBuiltLabel),
      unit: 'pool liquidity',
      testId: 'lb-metric-liquidity',
    },
  ]

  const paused = card.status === 'PAUSED'
  const safety = card.status === 'SAFETY_PAUSED'

  return (
    <Grid data-testid="lb-active-dashboard" data-status={card.status}>
      {(paused || safety) && (
        <Safety $danger={safety} data-testid="lb-safety-banner">
          {safety ? (
            <ShieldAlert size={22} color={lb.danger} aria-hidden />
          ) : (
            <PauseCircle size={22} color={lb.warn} aria-hidden />
          )}
          <div>
            <SummaryTitle style={{ fontSize: 16 }}>
              {safety ? 'Safety Pause Active' : 'Program Paused'}
            </SummaryTitle>
            <SummarySub>
              {card.programReason
                ? translateActivityReason(card.programReason)
                : safety
                  ? 'Automatic protections paused further Liquidity Building executions.'
                  : 'Program is paused. No new Liquidity Building executions will run until resumed.'}
            </SummarySub>
          </div>
          <GhostBtn type="button" onClick={card.openManage}>
            Review Program
          </GhostBtn>
        </Safety>
      )}

      <Summary>
        <SummaryRow>
          <div>
            <SummaryTitle>Program Active</SummaryTitle>
            <SummarySub>
              {symbol && pair
                ? `${symbol} reserve is building liquidity into ${pair}.`
                : LB_UX.activeHero}
            </SummarySub>
          </div>
          <ManageBtn type="button" data-testid="lb-primary-cta" onClick={card.openManage}>
            Manage Program
          </ManageBtn>
        </SummaryRow>
      </Summary>

      {metrics.map((m) => (
        <Metric key={m.label}>
          <MetricLabel>{m.label}</MetricLabel>
          <MetricValue data-testid={m.testId}>{m.value}</MetricValue>
          {m.unit ? <MetricUnit>{m.unit}</MetricUnit> : null}
        </Metric>
      ))}

      <ChartCard data-testid="lb-liquidity-chart">
        <CardTitle>Liquidity Built Over Time</CardTitle>
        {chartPoints.length === 0 ? (
          <Empty data-testid="lb-chart-empty">No completed Liquidity Building executions yet.</Empty>
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={chartPoints}>
                <defs>
                  <linearGradient id="lbBuiltFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(244,196,48,0.08)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#242424" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6F6F6F', fontSize: 10 }}
                  axisLine={{ stroke: '#242424' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6F6F6F', fontSize: 10 }}
                  axisLine={{ stroke: '#242424' }}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0D0D0D',
                    border: '1px solid #2A2A2A',
                    borderRadius: 10,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                    fontSize: 11,
                  }}
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke={lb.gold}
                  strokeWidth={2}
                  fill="url(#lbBuiltFill)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <DetailsCard>
        <CardTitle>Program Details</CardTitle>
        {(
          [
            ['Token', symbol || '—'],
            ['Pair', pair || '—'],
            [
              'Strategy',
              card.draft.strategy === 'FULL_AI' ? 'Full AI' : card.draft.strategy === 'DYNAMIC_RANGE' ? 'Dynamic Range' : '—',
            ],
            ['Decision Frequency', card.decisionFrequencyLabel || '—'],
            ['LP Owner', shorten(snap.lpOwner) !== '—' ? shorten(snap.lpOwner) : LB_UX.lpOwnedByOwner],
            ['Program Address', snap.programAddress ? shorten(snap.programAddress) : '—'],
            ['Success Fee', '5%'],
            ['Last Decision', snap.lastDecisionLabel || '—'],
            ['Next Decision', snap.nextDecisionLabel || '—'],
          ] as const
        ).map(([label, value]) => (
          <DetailRow key={label}>
            <DetailLabel>{label}</DetailLabel>
            <DetailValue>
              {value}
              {label === 'Program Address' && snap.programAddress ? (
                <button
                  type="button"
                  aria-label="Copy program address"
                  style={{ border: 0, background: 'transparent', color: lb.muted5, cursor: 'pointer', padding: 0 }}
                  onClick={() => navigator.clipboard?.writeText(snap.programAddress!)}
                >
                  <Copy size={13} />
                </button>
              ) : null}
            </DetailValue>
          </DetailRow>
        ))}
      </DetailsCard>

      <HalfCard>
        <CardTitle>Program Accounting</CardTitle>
        {(
          [
            ['Gross Quote Acquired', fmt(snap.grossQuoteLabel)],
            ['Melega Success Fee', fmt(snap.feePaidLabel)],
            ['Net Quote Added', fmt(snap.netQuoteLabel)],
            ['Tokens Matched', fmt(snap.tokensMatchedLabel)],
            ['LP Tokens Received', fmt(card.metrics.lpPositionLabel ?? snap.lpMintedLabel)],
          ] as const
        ).map(([label, value]) => (
          <DetailRow key={label}>
            <DetailLabel>{label}</DetailLabel>
            <DetailValue>{value}</DetailValue>
          </DetailRow>
        ))}
        <DetailRow>
          <DetailLabel style={{ maxWidth: '100%' }}>
            Gross quote − success fee = net quote added
          </DetailLabel>
          <DetailValue />
        </DetailRow>
      </HalfCard>

      <HalfCard>
        <CardTitle>Recent Activity</CardTitle>
        {card.activity.length === 0 ? (
          <Empty data-testid="lb-activity-empty">No Liquidity Building activity yet.</Empty>
        ) : (
          <div data-testid="lb-activity-list">
            <ActivityRow style={{ color: lb.muted6, fontWeight: 700 }}>
              <span>Time</span>
              <span>Action</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Transaction</span>
            </ActivityRow>
            {card.activity.slice(0, 5).map((item) => (
              <ActivityRow key={item.id}>
                <span>{item.at ? new Date(item.at).toLocaleString() : '—'}</span>
                <span>{humanAction(item.kind, item.title)}</span>
                <span>{item.liquidityAdded || item.quoteAcquired || item.tokenSold || '—'}</span>
                <span>{item.kind === 'EXECUTION_COMPLETED' ? 'Completed' : item.kind === 'EXECUTION_SKIPPED' ? 'Skipped' : 'Evaluated'}</span>
                <span>
                  {item.id.startsWith('0x') ? (
                    <a
                      href={`https://bscscan.com/tx/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: lb.gold, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {shorten(item.id)}
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </ActivityRow>
            ))}
          </div>
        )}
      </HalfCard>
    </Grid>
  )
}
