/**
 * Liquidity Studio V3 — Remove Liquidity workspace (presentation).
 * Uses existing burn runtime / confirm modal — no execution changes.
 */
import React from 'react'
import styled from 'styled-components'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { formatPoolShare, formatPositionUsd } from '../modules/liquidityMyPositionsModel'
import { liqV3 } from './liquidityV3Tokens'

const Shell = styled.section`
  display: grid;
  gap: 12px;
  padding: 14px 16px;
  border-radius: ${liqV3.radius};
  border: 1px solid ${liqV3.line};
  background: linear-gradient(165deg, ${liqV3.panel2} 0%, ${liqV3.panel} 100%);
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    align-items: start;
  }
`

const Panel = styled.div`
  min-width: 0;
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

const Label = styled.span`
  color: ${liqV3.mute};
`

const Value = styled.span`
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
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
  margin-top: 8px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  border: 1px solid ${liqV3.goldLine};
  background: linear-gradient(180deg, #f2c84c 0%, #d4a017 100%);
  color: #111;
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
  } = useLiquidityRuntime()

  const deposited = formatPositionUsd(positionDetails?.usdValue)
  const share = formatPoolShare(positionDetails?.poolShare)
  const lpBal = selectedPosition?.lpBalance?.greaterThan(0)
    ? selectedPosition.lpBalance.toSignificant(6)
    : '—'

  return (
    <Shell data-testid="liquidity-v3-remove" data-liquidity-remove="v3">
      <Panel>
        <Title>Remove Liquidity</Title>
        <Sub>Choose how much LP to withdraw. Execution uses the existing remove flow.</Sub>

        <Row>
          <Label>Position</Label>
          <Value data-testid="liquidity-remove-pair">{pairLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Deposited value</Label>
          <Value data-primary-metric="deposited-value">{deposited}</Value>
        </Row>
        <Row>
          <Label>Pool share</Label>
          <Value>{share}</Value>
        </Row>
        <Row>
          <Label>LP balance</Label>
          <Value data-secondary-metric="lp-amount">{lpBal}</Value>
        </Row>

        <Percents role="group" aria-label="Remove percentage" data-testid="liquidity-remove-percents">
          {PERCENTS.map((p) => (
            <PctBtn
              key={p}
              type="button"
              $on={removePercent === p || (p === '100' && removePercent === '100')}
              onClick={() => onRemovePercent(p === '100' ? '100' : p)}
              data-testid={`liquidity-remove-pct-${p}`}
            >
              {p === '100' ? 'MAX' : `${p}%`}
            </PctBtn>
          ))}
        </Percents>

        <Cta type="button" onClick={onPrimaryAction} data-testid="liquidity-remove-cta">
          {primaryCtaLabel || 'Remove Liquidity'}
        </Cta>

        <Advanced data-testid="liquidity-remove-advanced">
          <summary>Advanced</summary>
          <div style={{ marginTop: 8 }}>Slippage: {slippageLabel}</div>
        </Advanced>
      </Panel>

      <Panel data-testid="liquidity-remove-preview">
        <Title style={{ fontSize: 14 }}>Expected receive</Title>
        <Row>
          <Label>{currencyA?.symbol || 'Token A'}</Label>
          <Value data-testid="liquidity-remove-out-a">{typedValueA || '—'}</Value>
        </Row>
        <Row>
          <Label>{currencyB?.symbol || 'Token B'}</Label>
          <Value data-testid="liquidity-remove-out-b">{typedValueB || '—'}</Value>
        </Row>
      </Panel>
    </Shell>
  )
}

export default LiquidityRemovePanel
