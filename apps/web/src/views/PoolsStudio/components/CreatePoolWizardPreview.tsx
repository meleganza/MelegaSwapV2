import React, { useMemo } from 'react'
import styled from 'styled-components'
import type { CreatePoolWizardState } from './createPoolWizardState'
import { computeEstimatedApr, hasCompletePoolEstimateParams } from './createPoolWizardState'

const Panel = styled.aside`
  width: 320px;
  min-width: 320px;
  align-self: stretch;
  box-sizing: border-box;
  background: #181818;
  border-radius: 18px;
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    margin-top: 18px;
  }
`

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

const BlockTitle = styled.span`
  font-family: Inter, sans-serif;
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #707070;
`

const AprValue = styled.span<{ $pending?: boolean }>`
  font-family: ${({ $pending }) => ($pending ? 'Inter, sans-serif' : 'Orbitron, sans-serif')};
  font-size: ${({ $pending }) => ($pending ? '14px' : '28px')};
  line-height: ${({ $pending }) => ($pending ? '20px' : '32px')};
  font-weight: ${({ $pending }) => ($pending ? 600 : 700)};
  color: ${({ $pending }) => ($pending ? '#b0b0b0' : '#18f089')};
`

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 16px;
  color: #b0b0b0;

  strong {
    color: #f2f2f2;
    font-weight: 700;
  }
`

const GraphWrap = styled.div`
  height: 72px;
  border-radius: 10px;
  background: #141414;
  border: 1px solid #2a2a2a;
  padding: 8px 10px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  gap: 3px;
`

const GraphBar = styled.div<{ $h: number }>`
  flex: 1;
  min-width: 0;
  height: ${({ $h }) => $h}%;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, #d4af37 0%, #8a7020 100%);
  transition: height 180ms ease;
`

const HealthBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: #2a2a2a;
  overflow: hidden;
`

const HealthFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: inherit;
  background: linear-gradient(90deg, #18f089 0%, #0fb86a 100%);
  transition: width 180ms ease;
`

const DonutRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Donut = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: conic-gradient(#d4af37 var(--pct), #2a2a2a 0);
  display: grid;
  place-items: center;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #181818;
  }
`

const StatusPill = styled.span<{ $ok?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $ok }) => ($ok ? '#18f089' : '#d4af37')};
  background: ${({ $ok }) => ($ok ? 'rgba(24, 240, 137, 0.12)' : 'rgba(212, 175, 55, 0.12)')};
  border: 1px solid ${({ $ok }) => ($ok ? 'rgba(24, 240, 137, 0.35)' : 'rgba(212, 175, 55, 0.35)')};
`

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function computeApr(state: CreatePoolWizardState): string {
  return computeEstimatedApr(state)
}

function computeHealth(state: CreatePoolWizardState): number {
  let score = 72
  if (state.autoCompound === 'Enabled') score += 8
  if (state.lockType === 'Fixed') score += 6
  if (parseNum(state.withdrawalFee) === 0) score += 4
  if (state.poolType === 'Official') score += 5
  return Math.min(98, Math.max(42, score))
}

function computeConsumptionPct(state: CreatePoolWizardState): number {
  const budget = parseNum(state.rewardBudget)
  const daily = parseNum(state.dailyRewards)
  const days = parseNum(state.emissionDuration)
  if (budget <= 0) return 34
  const projected = daily * (days || 30)
  return Math.min(96, Math.max(8, Math.round((projected / budget) * 100)))
}

type Props = {
  state: CreatePoolWizardState
}

export const CreatePoolWizardPreview: React.FC<Props> = ({ state }) => {
  const apr = useMemo(() => computeApr(state), [state])
  const aprPending = !hasCompletePoolEstimateParams(state)
  const health = useMemo(() => computeHealth(state), [state])
  const consumption = useMemo(() => computeConsumptionPct(state), [state])

  const bars = useMemo(() => {
    const days = Math.max(6, Math.min(12, Math.round(parseNum(state.emissionDuration) / 3) || 8))
    return Array.from({ length: days }, (_, i) => {
      const t = i / (days - 1 || 1)
      const decay = 1 - t * 0.55
      return Math.max(18, Math.round(decay * 100))
    })
  }, [state.emissionDuration])

  return (
    <Panel data-r722-wizard-preview data-ps-create-wizard-preview>
      <Block>
        <BlockTitle>Estimated APR</BlockTitle>
        <AprValue data-ps-wizard-preview-apr $pending={aprPending}>
          {apr}
        </AprValue>
      </Block>

      <Block>
        <BlockTitle>Emission Graph</BlockTitle>
        <GraphWrap data-ps-wizard-emission-graph>
          {bars.map((h, i) => (
            <GraphBar key={i} $h={h} />
          ))}
        </GraphWrap>
      </Block>

      <Block>
        <BlockTitle>Pool Health</BlockTitle>
        <MetricRow>
          <span>Score</span>
          <strong data-ps-wizard-health-score>{health} / 100</strong>
        </MetricRow>
        <HealthBar>
          <HealthFill $pct={health} data-ps-wizard-health-bar />
        </HealthBar>
      </Block>

      <Block>
        <BlockTitle>Reward Consumption</BlockTitle>
        <DonutRow>
          <Donut style={{ ['--pct' as string]: `${consumption}%` }} data-ps-wizard-consumption-donut />
          <MetricRow style={{ flex: 1 }}>
            <span>Projected use</span>
            <strong data-ps-wizard-consumption-pct>{consumption}%</strong>
          </MetricRow>
        </DonutRow>
      </Block>

      <Block>
        <BlockTitle>Lock Summary</BlockTitle>
        <MetricRow>
          <span>Type</span>
          <strong>{state.lockType || '—'}</strong>
        </MetricRow>
        <MetricRow>
          <span>Period</span>
          <strong>{state.lockPeriod || '—'}</strong>
        </MetricRow>
        <MetricRow>
          <span>Cooldown</span>
          <strong>{state.cooldown || '—'}</strong>
        </MetricRow>
      </Block>

      <Block>
        <BlockTitle>Machine Status</BlockTitle>
        <StatusPill $ok={Boolean(state.rewardToken && state.stakeToken)} data-ps-wizard-machine-status>
          {state.rewardToken && state.stakeToken ? 'Ready' : 'Draft'}
        </StatusPill>
      </Block>
    </Panel>
  )
}

export default CreatePoolWizardPreview
