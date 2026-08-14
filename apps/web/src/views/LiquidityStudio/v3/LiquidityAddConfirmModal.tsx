/**
 * Add Liquidity confirmation — MelegaModal V3 (presentation + lifecycle).
 * Execution callback is existing mint `onAdd` (unchanged).
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
import type { RemoveTxLifecycle } from './LiquidityRemoveConfirmModal'

export type AddTxLifecycle = RemoveTxLifecycle

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
  border: 1px solid ${({ $primary }) => ($primary ? 'transparent' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) => ($primary ? liqV3.gold : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const LIFE_LABEL: Record<AddTxLifecycle, string> = {
  review: 'Review deposit',
  preparing: 'Preparing transaction…',
  waiting_wallet: 'Waiting wallet confirmation…',
  submitted: 'Submitted — waiting for confirmation…',
  confirmed: 'Confirmed',
  failed: 'Failed',
}

function lifeTone(phase: AddTxLifecycle): 'ok' | 'warn' | 'bad' | 'mute' {
  if (phase === 'confirmed') return 'ok'
  if (phase === 'failed') return 'bad'
  if (phase === 'waiting_wallet' || phase === 'preparing' || phase === 'submitted') return 'warn'
  return 'mute'
}

export const LiquidityAddConfirmModal: React.FC<{
  open: boolean
  onClose: () => void
  onConfirm: () => void
  pairLabel: string
  chainId?: number
  tokenASymbol?: string
  tokenBSymbol?: string
  amountA?: string
  amountB?: string
  lpMinted?: string
  poolShare?: string
  slippageLabel: string
  noLiquidity?: boolean
  lifecycle: AddTxLifecycle
  errorMessage?: string
  txHash?: string
  canConfirm: boolean
}> = ({
  open,
  onClose,
  onConfirm,
  pairLabel,
  chainId,
  tokenASymbol,
  tokenBSymbol,
  amountA,
  amountB,
  lpMinted,
  poolShare,
  slippageLabel,
  noLiquidity,
  lifecycle,
  errorMessage,
  txHash,
  canConfirm,
}) => {
  const busy = lifecycle === 'preparing' || lifecycle === 'waiting_wallet' || lifecycle === 'submitted'
  const done = lifecycle === 'confirmed' || lifecycle === 'failed'

  const steps = useMemo(
    () => [
      { id: 'review', label: 'Review', done: lifecycle !== 'review', active: lifecycle === 'review' },
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
      title="Add Liquidity"
      subtitle={noLiquidity ? 'You are creating a new trading pair' : 'Review your liquidity deposit'}
      size="md"
      steps={steps}
      testId="liquidity-add-confirm-modal"
      ariaLabel="Add Liquidity"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      zIndex={10040}
      footer={
        <MelegaModalFooter>
          <MelegaModalFooterActions>
            <Btn type="button" data-testid="liquidity-add-confirm-cancel" onClick={onClose} disabled={busy}>
              {done ? 'Close' : 'Cancel'}
            </Btn>
            {!done ? (
              <Btn
                type="button"
                $primary
                data-testid="liquidity-add-confirm-submit"
                onClick={onConfirm}
                disabled={!canConfirm || busy}
              >
                {busy ? LIFE_LABEL[lifecycle] : 'Confirm Deposit'}
              </Btn>
            ) : null}
          </MelegaModalFooterActions>
        </MelegaModalFooter>
      }
    >
      <Body data-testid="liquidity-add-confirm-body" data-add-lifecycle={lifecycle}>
        <Row>
          <Label>Position</Label>
          <Value data-testid="liquidity-add-confirm-pair">{pairLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Network</Label>
          <Value>{chainId != null ? chainDisplayName(chainId) : '—'}</Value>
        </Row>

        <Section>
          <Row>
            <Label>Deposit</Label>
            <Value />
          </Row>
          <Row>
            <Label>{tokenASymbol || 'Token A'}</Label>
            <Value data-testid="liquidity-add-confirm-out-a">{amountA || '—'}</Value>
          </Row>
          <Row>
            <Label>{tokenBSymbol || 'Token B'}</Label>
            <Value data-testid="liquidity-add-confirm-out-b">{amountB || '—'}</Value>
          </Row>
        </Section>

        <Section>
          <Row>
            <Label>LP tokens</Label>
            <Value data-testid="liquidity-add-confirm-lp">{lpMinted || '—'}</Value>
          </Row>
          <Row>
            <Label>Pool share</Label>
            <Value>{poolShare || '—'}</Value>
          </Row>
          <Row>
            <Label>Slippage</Label>
            <Value>{slippageLabel}</Value>
          </Row>
        </Section>

        {lifecycle !== 'review' ? (
          <Status $tone={lifeTone(lifecycle)} data-testid="liquidity-add-confirm-status">
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

export default LiquidityAddConfirmModal
