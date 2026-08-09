/**
 * Remove Liquidity confirmation — MelegaModal V3 (presentation + lifecycle).
 * Execution callback is provided by liquidityRuntime (existing router remove path).
 */
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { MelegaModal } from 'design-system/melega'
import {
  MelegaModalFooter,
  MelegaModalFooterActions,
} from 'design-system/melega/components/Modal'
import { chainDisplayName } from 'components/ChainSwitchConfirmDialog'
import { liqV3 } from './liquidityV3Tokens'

export type RemoveTxLifecycle =
  | 'review'
  | 'preparing'
  | 'waiting_wallet'
  | 'submitted'
  | 'confirmed'
  | 'failed'

const Body = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  font-size: 13px;
`

const Label = styled.span`
  color: ${liqV3.mute};
  font-weight: 650;
`

const Value = styled.span`
  color: #fff;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  text-align: right;
`

const Section = styled.div`
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid ${liqV3.line};
  display: grid;
  gap: 8px;
`

const Status = styled.div<{ $tone?: 'ok' | 'warn' | 'bad' | 'mute' }>`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok'
        ? 'rgba(109,220,140,0.35)'
        : $tone === 'bad'
          ? 'rgba(248,113,113,0.4)'
          : $tone === 'warn'
            ? 'rgba(251,191,36,0.35)'
            : liqV3.line};
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'ok' ? '#6ddc8c' : $tone === 'bad' ? '#f87171' : $tone === 'warn' ? '#fbbf24' : liqV3.text};
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'transparent' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) =>
    $primary ? 'linear-gradient(180deg, #F2C84C 0%, #D4A017 100%)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const LIFE_LABEL: Record<RemoveTxLifecycle, string> = {
  review: 'Review withdrawal',
  preparing: 'Preparing transaction…',
  waiting_wallet: 'Waiting wallet confirmation…',
  submitted: 'Submitted — waiting for confirmation…',
  confirmed: 'Confirmed',
  failed: 'Failed',
}

function lifeTone(phase: RemoveTxLifecycle): 'ok' | 'warn' | 'bad' | 'mute' {
  if (phase === 'confirmed') return 'ok'
  if (phase === 'failed') return 'bad'
  if (phase === 'waiting_wallet' || phase === 'preparing' || phase === 'submitted') return 'warn'
  return 'mute'
}

export const LiquidityRemoveConfirmModal: React.FC<{
  open: boolean
  onClose: () => void
  onConfirm: () => void
  pairLabel: string
  chainId?: number
  removePercent: string
  tokenASymbol?: string
  tokenBSymbol?: string
  amountA?: string
  amountB?: string
  minimumReceived?: string
  priceImpact?: string
  slippageLabel: string
  lifecycle: RemoveTxLifecycle
  errorMessage?: string
  txHash?: string
  canConfirm: boolean
}> = ({
  open,
  onClose,
  onConfirm,
  pairLabel,
  chainId,
  removePercent,
  tokenASymbol,
  tokenBSymbol,
  amountA,
  amountB,
  minimumReceived,
  priceImpact,
  slippageLabel,
  lifecycle,
  errorMessage,
  txHash,
  canConfirm,
}) => {
  const removalLabel = removePercent === '100' ? 'MAX' : `${removePercent}%`
  const busy = lifecycle === 'preparing' || lifecycle === 'waiting_wallet' || lifecycle === 'submitted'
  const done = lifecycle === 'confirmed' || lifecycle === 'failed'

  const steps = useMemo(
    () => [
      {
        id: 'review',
        label: 'Review',
        done: lifecycle !== 'review',
        active: lifecycle === 'review',
      },
      {
        id: 'wallet',
        label: 'Wallet',
        done: ['submitted', 'confirmed'].includes(lifecycle),
        active: lifecycle === 'preparing' || lifecycle === 'waiting_wallet',
      },
      {
        id: 'confirm',
        label: 'Confirmed',
        done: lifecycle === 'confirmed',
        active: lifecycle === 'submitted' || lifecycle === 'confirmed',
      },
    ],
    [lifecycle],
  )

  return (
    <MelegaModal
      open={open}
      onClose={onClose}
      title="Remove Liquidity"
      subtitle="Review your liquidity withdrawal"
      size="md"
      steps={steps}
      testId="liquidity-remove-confirm-modal"
      ariaLabel="Remove Liquidity"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      zIndex={10040}
      footer={
        <MelegaModalFooter>
          <MelegaModalFooterActions>
            <Btn type="button" data-testid="liquidity-remove-confirm-cancel" onClick={onClose} disabled={busy}>
              {done ? 'Close' : 'Cancel'}
            </Btn>
            {!done ? (
              <Btn
                type="button"
                $primary
                data-testid="liquidity-remove-confirm-submit"
                onClick={onConfirm}
                disabled={!canConfirm || busy}
              >
                {busy ? LIFE_LABEL[lifecycle] : 'Confirm Withdrawal'}
              </Btn>
            ) : null}
          </MelegaModalFooterActions>
        </MelegaModalFooter>
      }
    >
      <Body data-testid="liquidity-remove-confirm-body" data-remove-lifecycle={lifecycle}>
        <Row>
          <Label>Position</Label>
          <Value data-testid="liquidity-remove-confirm-pair">{pairLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Network</Label>
          <Value data-testid="liquidity-remove-confirm-chain">
            {chainId != null ? chainDisplayName(chainId) : '—'}
          </Value>
        </Row>
        <Row>
          <Label>Removal</Label>
          <Value data-testid="liquidity-remove-confirm-pct">{removalLabel}</Value>
        </Row>

        <Section>
          <Row>
            <Label>Receive</Label>
            <Value />
          </Row>
          <Row>
            <Label>{tokenASymbol || 'Token A'}</Label>
            <Value data-testid="liquidity-remove-confirm-out-a">{amountA || '—'}</Value>
          </Row>
          <Row>
            <Label>{tokenBSymbol || 'Token B'}</Label>
            <Value data-testid="liquidity-remove-confirm-out-b">{amountB || '—'}</Value>
          </Row>
        </Section>

        <Section>
          <Row>
            <Label>Minimum received</Label>
            <Value data-testid="liquidity-remove-confirm-min">{minimumReceived || '—'}</Value>
          </Row>
          <Row>
            <Label>Price impact</Label>
            <Value data-testid="liquidity-remove-confirm-impact">{priceImpact || '—'}</Value>
          </Row>
          <Row>
            <Label>Slippage</Label>
            <Value data-testid="liquidity-remove-confirm-slippage">{slippageLabel}</Value>
          </Row>
        </Section>

        {lifecycle !== 'review' ? (
          <Status $tone={lifeTone(lifecycle)} data-testid="liquidity-remove-confirm-status">
            {lifecycle === 'failed' && errorMessage ? errorMessage : LIFE_LABEL[lifecycle]}
            {txHash ? (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
                Tx: {txHash.slice(0, 10)}…{txHash.slice(-6)}
              </div>
            ) : null}
          </Status>
        ) : null}
      </Body>
    </MelegaModal>
  )
}

export default LiquidityRemoveConfirmModal
