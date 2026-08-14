import React, { useMemo } from 'react'
import styled from 'styled-components'
import type { CreatePoolWizardState } from './createPoolWizardState'
import {
  computeEstimatedApr,
  computeHealthScore,
  computeRewardConsumptionPct,
  describeWizardCreatePoolFee,
  hasCompletePoolEstimateParams,
} from './createPoolWizardState'

const Panel = styled.aside`
  width: 280px;
  min-width: 280px;
  align-self: stretch;
  box-sizing: border-box;
  background: #181818;
  border-radius: 14px;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    margin-top: 12px;
  }
`

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-family: ${({ $pending }) => ($pending ? 'Inter, sans-serif' : 'Sora, sans-serif')};
  font-size: ${({ $pending }) => ($pending ? '12px' : '22px')};
  line-height: ${({ $pending }) => ($pending ? '16px' : '26px')};
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
    text-align: right;
  }
`

const GraphWrap = styled.div`
  height: 48px;
  border-radius: 8px;
  background: #141414;
  border: 1px solid #2a2a2a;
  padding: 6px 8px;
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
  background: linear-gradient(180deg, #f4c430 0%, #8a7020 100%);
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
  color: ${({ $ok }) => ($ok ? '#18f089' : '#F4C430')};
  background: ${({ $ok }) => ($ok ? 'rgba(24, 240, 137, 0.12)' : 'rgba(244, 196, 48, 0.12)')};
  border: 1px solid ${({ $ok }) => ($ok ? 'rgba(24, 240, 137, 0.35)' : 'rgba(244, 196, 48, 0.35)')};
`

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

type Props = {
  state: CreatePoolWizardState
  chainLabel?: string
}

export const CreatePoolWizardPreview: React.FC<Props> = ({ state, chainLabel = 'BNB' }) => {
  const apr = useMemo(() => computeEstimatedApr(state), [state])
  const aprPending = !hasCompletePoolEstimateParams(state)
  const health = useMemo(() => computeHealthScore(state), [state])
  const consumption = useMemo(() => computeRewardConsumptionPct(state), [state])
  const fee = useMemo(() => describeWizardCreatePoolFee(state), [state])
  const ready = Boolean(state.rewardToken && state.stakeToken)

  const bars = useMemo(() => {
    if (!hasCompletePoolEstimateParams(state)) return []
    const days = Math.max(6, Math.min(12, Math.round(parseNum(state.emissionDuration) / 3) || 8))
    return Array.from({ length: days }, (_, i) => {
      const t = i / (days - 1 || 1)
      const decay = 1 - t * 0.55
      return Math.max(18, Math.round(decay * 100))
    })
  }, [state])

  return (
    <Panel data-r722-wizard-preview data-ps-create-wizard-preview data-ps-create-preview-compact>
      <Block>
        <BlockTitle>Pool Preview</BlockTitle>
        <MetricRow>
          <span>Stake</span>
          <strong data-ps-preview-stake>{state.stakeToken || '—'}</strong>
        </MetricRow>
        <MetricRow>
          <span>Reward</span>
          <strong data-ps-preview-reward>{state.rewardToken || '—'}</strong>
        </MetricRow>
        <MetricRow>
          <span>Chain</span>
          <strong data-ps-preview-chain>{chainLabel}</strong>
        </MetricRow>
        <MetricRow>
          <span>Est. rewards</span>
          <strong data-ps-preview-rewards>
            {state.dailyRewards ? `${state.dailyRewards} / day` : 'Not set'}
          </strong>
        </MetricRow>
        <MetricRow>
          <span>Duration</span>
          <strong data-ps-preview-duration>
            {state.emissionDuration ? `${state.emissionDuration} days` : 'Not set'}
          </strong>
        </MetricRow>
        <MetricRow>
          <span>Fee</span>
          <strong data-ps-preview-fee>{fee.display}</strong>
        </MetricRow>
        <MetricRow>
          <span>Status</span>
          <StatusPill $ok={ready} data-ps-wizard-machine-status>
            {ready ? 'Ready' : 'Draft'}
          </StatusPill>
        </MetricRow>
      </Block>

      <Block>
        <BlockTitle>Estimated APR</BlockTitle>
        <AprValue data-ps-wizard-preview-apr $pending={aprPending}>
          {aprPending ? 'Calculated after reward configuration.' : apr}
        </AprValue>
      </Block>

      <Block>
        <BlockTitle>Emission</BlockTitle>
        {bars.length === 0 ? (
          <MetricRow>
            <span data-ps-wizard-emission-empty>Calculated after reward configuration.</span>
          </MetricRow>
        ) : (
          <GraphWrap data-ps-wizard-emission-graph>
            {bars.map((h, i) => (
              <GraphBar key={i} $h={h} />
            ))}
          </GraphWrap>
        )}
      </Block>

      <Block>
        <BlockTitle>Pool Health</BlockTitle>
        <MetricRow>
          <span>Score</span>
          <strong data-ps-wizard-health-score>
            {health == null ? 'Pending config' : `${health} / 100`}
          </strong>
        </MetricRow>
        {health != null ? (
          <HealthBar>
            <HealthFill $pct={health} data-ps-wizard-health-bar />
          </HealthBar>
        ) : null}
      </Block>

      {consumption != null ? (
        <Block>
          <BlockTitle>Reward use</BlockTitle>
          <MetricRow>
            <span>Projected</span>
            <strong data-ps-wizard-consumption-pct>{consumption}%</strong>
          </MetricRow>
        </Block>
      ) : null}
    </Panel>
  )
}

export default CreatePoolWizardPreview
