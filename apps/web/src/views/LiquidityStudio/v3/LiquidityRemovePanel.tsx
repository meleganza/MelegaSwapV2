/**
 * Liquidity Studio V3 — Remove Liquidity workspace (presentation).
 * Uses existing burn runtime + MelegaModal confirm — no contract changes.
 */
import React from 'react'
import styled from 'styled-components'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { formatPoolShare, formatPositionUsd } from '../modules/liquidityMyPositionsModel'
import { liqV3 } from './liquidityV3Tokens'

const Shell = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.65fr);
  gap: 16px;
  padding: 14px 16px;
  border-radius: ${liqV3.radius};
  border: 1px solid ${liqV3.line};
  background: linear-gradient(165deg, ${liqV3.panel2} 0%, ${liqV3.panel} 100%);
  min-width: 0;

  align-items: stretch;

  @media (max-width: 959px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.div`
  min-width: 0;
`

const SummaryRail = styled(Panel)`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  border-left: 1px solid ${liqV3.line};

  @media (max-width: 959px) {
    padding: 14px 0 0;
    border-left: 0;
    border-top: 1px solid ${liqV3.line};
  }
`

const PositionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Title = styled.h2`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
`

const Sub = styled.p`
  margin: 0 0 12px;
  font-size: 12px;
  color: ${liqV3.mute};
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid ${liqV3.line};
  font-size: 13px;
`

const Metric = styled.div`
  min-width: 0;
  padding: 9px 10px;
  border-radius: 9px;
  border: 1px solid ${liqV3.line};
  background: rgba(255, 255, 255, 0.02);
`

const Label = styled.span`
  color: ${liqV3.mute};
`

const Value = styled.span`
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
`

const MetricValue = styled(Value)`
  display: block;
  margin-top: 4px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Percents = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
`

const PctBtn = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 32px;
  min-width: 52px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 750;
  border: 1px solid ${({ $on }) => ($on ? liqV3.goldLine : liqV3.line)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.14)' : 'rgba(255,255,255,0.03)')};
  color: ${({ $on }) => ($on ? liqV3.gold : liqV3.text)};
`

const Cta = styled.button`
  appearance: none;
  cursor: pointer;
  width: 100%;
  min-height: 42px;
  margin-top: auto;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  border: 1px solid ${liqV3.goldLine};
  background: linear-gradient(180deg, #f2c84c 0%, #d4a017 100%);
  color: #111;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
`

const Advanced = styled.details`
  margin-top: 10px;
  font-size: 12px;
  color: ${liqV3.mute};
  summary {
    cursor: pointer;
    font-weight: 700;
    color: ${liqV3.text};
  }
`

const ExpectedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 10px 0 12px;

  ${Row} {
    flex-direction: column;
    padding: 9px 10px;
    border: 1px solid ${liqV3.line};
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.02);
  }

  ${Value} {
    text-align: left;
  }
`

const PERCENTS = ['25', '50', '75', '100'] as const

export const LiquidityRemovePanel: React.FC = () => {
  const {
    pairLabel,
    selectedPosition,
    positionDetails,
    typedValueA,
    typedValueB,
    currencyA,
    currencyB,
    removePercent,
    onRemovePercent,
    onPrimaryAction,
    primaryCtaLabel,
    slippageLabel,
    removeConfirmModal,
  } = useLiquidityRuntime()

  const deposited = formatPositionUsd(positionDetails?.usdValue)
  const share = formatPoolShare(positionDetails?.poolShare)
  const lpBal = selectedPosition?.lpBalance?.greaterThan(0) ? selectedPosition.lpBalance.toSignificant(6) : '—'
  const removalLabel = removePercent === '100' ? 'MAX' : `${removePercent}%`
  const hasRemovablePosition = Boolean(selectedPosition?.lpBalance?.greaterThan(0))

  return (
    <Shell
      data-testid="liquidity-v3-remove"
      data-liquidity-remove="v3"
      data-liquidity-remove-geometry="single-card-horizontal"
      data-remove-percent={removePercent}
    >
      <Panel>
        <Title>Remove Liquidity</Title>
        <Sub>Choose how much LP to withdraw. Confirm opens the Melega withdrawal review.</Sub>

        <PositionGrid data-testid="liquidity-remove-position-grid">
          <Metric>
            <Label>Position</Label>
            <MetricValue data-testid="liquidity-remove-pair">{pairLabel || '—'}</MetricValue>
          </Metric>
          <Metric>
            <Label>Deposited value</Label>
            <MetricValue data-primary-metric="deposited-value">{deposited}</MetricValue>
          </Metric>
          <Metric>
            <Label>Pool share</Label>
            <MetricValue>{share}</MetricValue>
          </Metric>
          <Metric>
            <Label>LP balance</Label>
            <MetricValue data-secondary-metric="lp-amount">{lpBal}</MetricValue>
          </Metric>
          <Metric>
            <Label>LP removed</Label>
            <MetricValue data-testid="liquidity-remove-lp-pct">{removalLabel}</MetricValue>
          </Metric>
        </PositionGrid>

        <Percents role="group" aria-label="Remove percentage" data-testid="liquidity-remove-percents">
          {PERCENTS.map((p) => (
            <PctBtn
              key={p}
              type="button"
              $on={removePercent === p}
              aria-pressed={removePercent === p}
              onClick={() => onRemovePercent(p)}
              data-testid={`liquidity-remove-pct-${p}`}
            >
              {p === '100' ? 'MAX' : `${p}%`}
            </PctBtn>
          ))}
        </Percents>
      </Panel>

      <SummaryRail data-testid="liquidity-remove-preview" data-liquidity-preview="integrated">
        <Title style={{ fontSize: 14 }}>Expected receive</Title>
        <ExpectedGrid>
          <Row>
            <Label>{currencyA?.symbol || 'Token A'}</Label>
            <Value data-testid="liquidity-remove-out-a">{typedValueA || '—'}</Value>
          </Row>
          <Row>
            <Label>{currencyB?.symbol || 'Token B'}</Label>
            <Value data-testid="liquidity-remove-out-b">{typedValueB || '—'}</Value>
          </Row>
        </ExpectedGrid>

        <Advanced data-testid="liquidity-remove-advanced">
          <summary>Advanced</summary>
          <div style={{ marginTop: 8 }}>Slippage: {slippageLabel}</div>
        </Advanced>

        <Cta
          type="button"
          onClick={onPrimaryAction}
          disabled={!hasRemovablePosition}
          data-testid="liquidity-remove-cta"
        >
          {hasRemovablePosition ? primaryCtaLabel || 'Remove Liquidity' : 'Select a position to remove'}
        </Cta>
      </SummaryRail>

      {removeConfirmModal}
    </Shell>
  )
}

export default LiquidityRemovePanel
