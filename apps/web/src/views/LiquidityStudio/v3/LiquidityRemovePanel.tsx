/**
 * Liquidity Studio V3 — Remove Liquidity workspace (presentation).
 * Uses existing burn runtime + MelegaModal confirm — no contract changes.
 */
import React from 'react'
import styled from 'styled-components'
import { useModal } from '@pancakeswap/uikit'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { useUserTransactionTTL } from 'state/user/hooks'
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

const AmountControl = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 76px;
  gap: 10px;
  align-items: center;
  margin-top: 12px;

  input[type='range'] {
    width: 100%;
    accent-color: ${liqV3.gold};
    cursor: pointer;
  }
`

const PercentInput = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 0 9px;
  border: 1px solid ${liqV3.line};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: ${liqV3.text};

  input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #fff;
    text-align: right;
    font: inherit;
    font-variant-numeric: tabular-nums;
  }
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

const SettingsList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 32px;
  padding: 7px 9px;
  border: 1px solid ${liqV3.line};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
`

const EditButton = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid ${liqV3.goldLine};
  background: rgba(221, 185, 47, 0.12);
  color: ${liqV3.gold};
  font-size: 12px;
  font-weight: 800;
`

const ReceiveToggle = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
`

const ReceiveButton = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 28px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid ${({ $on }) => ($on ? liqV3.goldLine : liqV3.line)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.14)' : 'rgba(255,255,255,0.02)')};
  color: ${({ $on }) => ($on ? liqV3.gold : liqV3.text)};
  font-size: 11px;
  font-weight: 750;
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
    removeActionReady,
    onRemovePercent,
    onPrimaryAction,
    primaryCtaLabel,
    slippageLabel,
    removeMinimumReceived,
    canReceiveNative,
    receiveNative,
    setReceiveNative,
    removeOutputSymbolA,
    removeOutputSymbolB,
    removeConfirmModal,
  } = useLiquidityRuntime()
  const [transactionTtl] = useUserTransactionTTL()
  const [onPresentSettings] = useModal(
    <SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />,
    true,
    false,
    'liquidity-remove-settings',
  )

  const deposited = formatPositionUsd(positionDetails?.usdValue)
  const share = formatPoolShare(positionDetails?.poolShare)
  const lpBal = selectedPosition?.lpBalance?.greaterThan(0) ? selectedPosition.lpBalance.toSignificant(6) : '—'
  const removalLabel = removePercent === '100' ? 'MAX' : `${removePercent}%`
  const hasRemovablePosition = Boolean(selectedPosition?.lpBalance?.greaterThan(0))
  const numericPercent = Number.parseFloat(removePercent)

  const handlePercentInput = (value: string) => {
    if (!/^\d{0,3}(?:\.\d{0,2})?$/.test(value)) return
    if (value === '') {
      onRemovePercent('0')
      return
    }
    const next = Number.parseFloat(value)
    if (Number.isFinite(next) && next >= 0 && next <= 100) onRemovePercent(value)
  }

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

        <AmountControl data-testid="liquidity-remove-amount-control">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Number.isFinite(numericPercent) ? numericPercent : 0}
            aria-label="Liquidity percentage to remove"
            onChange={(event) => onRemovePercent(event.currentTarget.value)}
            data-testid="liquidity-remove-slider"
          />
          <PercentInput>
            <input
              type="text"
              inputMode="decimal"
              value={removePercent}
              aria-label="Custom removal percentage"
              onChange={(event) => handlePercentInput(event.currentTarget.value)}
              data-testid="liquidity-remove-custom-percent"
            />
            <span>%</span>
          </PercentInput>
        </AmountControl>
      </Panel>

      <SummaryRail data-testid="liquidity-remove-preview" data-liquidity-preview="integrated">
        <Title style={{ fontSize: 14 }}>Expected receive</Title>
        <ExpectedGrid>
          <Row>
            <Label>{removeOutputSymbolA || currencyA?.symbol || 'Token A'}</Label>
            <Value data-testid="liquidity-remove-out-a">{typedValueA || '—'}</Value>
          </Row>
          <Row>
            <Label>{removeOutputSymbolB || currencyB?.symbol || 'Token B'}</Label>
            <Value data-testid="liquidity-remove-out-b">{typedValueB || '—'}</Value>
          </Row>
        </ExpectedGrid>

        <Advanced data-testid="liquidity-remove-advanced">
          <summary>Advanced</summary>
          <SettingsList>
            <SettingsRow>
              <span>Slippage tolerance</span>
              <Value>{slippageLabel}</Value>
            </SettingsRow>
            <SettingsRow>
              <span>Transaction deadline</span>
              <Value>{Math.round(transactionTtl / 60)} min</Value>
            </SettingsRow>
            <SettingsRow>
              <span>Minimum received</span>
              <Value>{removeMinimumReceived}</Value>
            </SettingsRow>
            {canReceiveNative ? (
              <SettingsRow data-testid="liquidity-remove-receive-native">
                <span>Receive as</span>
                <ReceiveToggle role="group" aria-label="Receive wrapped or native token">
                  <ReceiveButton type="button" $on={!receiveNative} onClick={() => setReceiveNative(false)}>
                    Wrapped
                  </ReceiveButton>
                  <ReceiveButton type="button" $on={receiveNative} onClick={() => setReceiveNative(true)}>
                    Native
                  </ReceiveButton>
                </ReceiveToggle>
              </SettingsRow>
            ) : null}
            <EditButton type="button" onClick={onPresentSettings} data-testid="liquidity-remove-settings">
              Edit slippage &amp; deadline
            </EditButton>
          </SettingsList>
        </Advanced>

        <Cta
          type="button"
          onClick={onPrimaryAction}
          disabled={!hasRemovablePosition || !removeActionReady}
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
