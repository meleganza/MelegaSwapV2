import React, { useState } from 'react'
import styled from 'styled-components'
import type { LiquidityBuildingCardState } from '../useLiquidityBuildingCard'
import { LB_UX } from '../uxCopy'
import { LbConfirmDialog } from './LbConfirmDialog'
import { lb } from './lbProductTokens'

const Shell = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Card = styled.section`
  padding: 22px;
  border-radius: 18px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;
`

const Danger = styled.section`
  margin-top: 8px;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(239, 68, 68, 0.28);
  background: rgba(239, 68, 68, 0.025);
`

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: ${lb.text};
`

const DangerTitle = styled(Title)`
  color: ${lb.danger};
`

const Row = styled.div`
  min-height: 38px;
  padding: 8px 0;
  border-bottom: 1px solid #242424;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
`

const Label = styled.span`
  color: ${lb.muted5};
`

const Value = styled.span`
  color: #d4d4d4;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  overflow-wrap: anywhere;
`

const FixedNote = styled.span`
  display: inline-block;
  margin-left: 8px;
  font-size: 9px;
  font-weight: 700;
  color: ${lb.muted5};
  text-transform: uppercase;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
`

const Btn = styled.button<{ $variant?: 'gold' | 'warn' | 'danger' | 'ghost' }>`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: ${lb.font};
  ${({ $variant }) => {
    if ($variant === 'warn')
      return `border:1px solid rgba(245,158,11,0.38);background:transparent;color:${lb.warn};`
    if ($variant === 'danger')
      return `border:1px solid rgba(239,68,68,0.45);background:rgba(239,68,68,0.08);color:${lb.danger};`
    if ($variant === 'ghost')
      return `border:1px solid ${lb.border};background:transparent;color:${lb.muted2};`
    return `border:0;background:${lb.gold};color:${lb.ink};`
  }}
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Hint = styled.p`
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 16px;
  color: ${lb.muted3};
`

function shorten(addr?: string | null) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function LbManageView({ card }: { card: LiquidityBuildingCardState }) {
  const [confirm, setConfirm] = useState<null | 'pause' | 'resume' | 'stop'>(null)
  const snap = card.programSnapshot
  const canMutate = card.mutateGate.ok && card.programSource === 'ON_CHAIN'
  const actions = new Set(card.manageActions)

  return (
    <Shell data-testid="lb-manage-panel">
      <Card>
        <Title>Program summary</Title>
        {(
          [
            ['State', card.status],
            ['Token', card.draft.tokenSymbol || snap.tokenSymbol || '—'],
            ['Pair', snap.pairLabel || '—'],
            ['Remaining Budget', snap.remainingBudgetLabel || card.metrics.budgetRemainingLabel || '—'],
            ['Strategy', card.draft.strategy === 'FULL_AI' ? 'Full AI' : 'Dynamic Range'],
            ['Decision Frequency', card.decisionFrequencyLabel],
            ['Program Address', snap.programAddress ? shorten(snap.programAddress) : '—'],
          ] as const
        ).map(([k, v]) => (
          <Row key={k}>
            <Label>{k}</Label>
            <Value>{v}</Value>
          </Row>
        ))}
      </Card>

      <Card>
        <Title>Strategy settings</Title>
        <Row>
          <Label>
            Strategy <FixedNote>Fixed after activation</FixedNote>
          </Label>
          <Value>{card.draft.strategy === 'FULL_AI' ? 'Full AI' : 'Dynamic Range'}</Value>
        </Row>
        <Row>
          <Label>
            Decision Frequency <FixedNote>Fixed after activation</FixedNote>
          </Label>
          <Value>{card.decisionFrequencyLabel}</Value>
        </Row>
        <Hint>Immutable fields cannot be edited after activation. Use Review Changes only when the deployed program supports updates.</Hint>
        <Actions>
          <Btn type="button" disabled data-testid="lb-manage-CHANGE_STRATEGY" title="Not supported for this program state">
            Review Changes
          </Btn>
        </Actions>
      </Card>

      <Card>
        <Title>Budget management</Title>
        <Row>
          <Label>Initial Budget</Label>
          <Value>{snap.initialBudgetLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Remaining Budget</Label>
          <Value>{snap.remainingBudgetLabel || card.metrics.budgetRemainingLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>In-flight Amount</Label>
          <Value>{snap.inFlightLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Available to Add</Label>
          <Value>{snap.availableToAddLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Deposited Token</Label>
          <Value>{card.draft.tokenSymbol || snap.tokenSymbol || '—'}</Value>
        </Row>
        <Hint>Funds currently assigned to an in-flight execution cannot be withdrawn.</Hint>
        <Actions>
          <Btn
            type="button"
            data-testid="lb-manage-ADD_BUDGET"
            disabled={!actions.has('ADD_BUDGET') || !canMutate}
            title={!canMutate ? 'Not available until production activation' : undefined}
          >
            Add Budget
          </Btn>
        </Actions>
      </Card>

      <Card>
        <Title>Program controls</Title>
        <Actions>
          {actions.has('PAUSE') ? (
            <Btn
              type="button"
              $variant="warn"
              data-testid="lb-manage-PAUSE"
              disabled={!canMutate}
              onClick={() => setConfirm('pause')}
            >
              Pause Program
            </Btn>
          ) : null}
          {actions.has('RESUME') ? (
            <Btn
              type="button"
              data-testid="lb-manage-RESUME"
              disabled={!canMutate}
              onClick={() => setConfirm('resume')}
            >
              Resume Program
            </Btn>
          ) : null}
        </Actions>
        {!canMutate ? (
          <Hint>Pause and resume require a live on-chain program and production activation.</Hint>
        ) : null}
      </Card>

      <Card>
        <Title>LP Ownership</Title>
        <Row>
          <Label>LP owner</Label>
          <Value>{snap.lpOwner ? shorten(snap.lpOwner) : LB_UX.lpOwnedByOwner}</Value>
        </Row>
        <Row>
          <Label>LP recipient</Label>
          <Value>{snap.lpRecipient ? shorten(snap.lpRecipient) : '—'}</Value>
        </Row>
        <Row>
          <Label>LP token balance</Label>
          <Value>{card.metrics.lpPositionLabel || snap.lpMintedLabel || '—'}</Value>
        </Row>
        <Row>
          <Label>Lock status</Label>
          <Value>Unlocked</Value>
        </Row>
        <Row>
          <Label>Unlock date</Label>
          <Value>Not Yet Created</Value>
        </Row>
      </Card>

      {actions.has('STOP') ? (
        <Danger data-testid="lb-danger-zone">
          <DangerTitle>Danger Zone</DangerTitle>
          <Hint style={{ marginTop: 0 }}>
            Stopping prevents future Liquidity Building executions. Existing LP ownership and completed
            accounting remain unchanged.
          </Hint>
          <Actions>
            <Btn
              type="button"
              $variant="danger"
              data-testid="lb-manage-STOP"
              disabled={!canMutate}
              onClick={() => setConfirm('stop')}
            >
              Stop Program
            </Btn>
          </Actions>
        </Danger>
      ) : null}

      <Actions>
        <Btn type="button" $variant="ghost" onClick={card.closeManage}>
          Back to Dashboard
        </Btn>
      </Actions>

      {confirm ? (
        <LbConfirmDialog
          title={
            confirm === 'pause'
              ? 'Pause Program'
              : confirm === 'resume'
                ? 'Resume Program'
                : 'Stop Program'
          }
          body={
            confirm === 'stop'
              ? 'Stopping prevents future Liquidity Building executions. This does not invent a withdrawal.'
              : confirm === 'pause'
                ? 'Paused programs do not run new Liquidity Building executions until resumed.'
                : 'Resume only if you intend to allow future Liquidity Building executions again.'
          }
          confirmLabel={
            confirm === 'pause' ? 'Confirm Pause' : confirm === 'resume' ? 'Confirm Resume' : 'Confirm Stop'
          }
          danger={confirm === 'stop'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === 'pause') card.pause()
            if (confirm === 'resume') card.resume()
            if (confirm === 'stop') card.stop()
            setConfirm(null)
          }}
        />
      ) : null}
    </Shell>
  )
}
