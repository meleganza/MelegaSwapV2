/**
 * Compact confirm dialog before switching wallet network for a farm/pool action.
 */
import React from 'react'
import styled from 'styled-components'
import { MelegaModal } from 'design-system/melega'
import { MELEGA_EXPLORE_CHAIN_LABELS } from 'components/Logo/MelegaExploreChainBadge'
import { ChainLogo } from 'components/Logo/ChainLogo'

const Body = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #f5f5f5;
  font-size: 13px;
  font-weight: 650;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.55)' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#F4C430' : '#f5f5f5')};
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.75)' : 'rgba(255,255,255,0.28)')};
  }
`

export function chainDisplayName(chainId: number): string {
  const short = MELEGA_EXPLORE_CHAIN_LABELS[chainId]
  const full: Record<number, string> = {
    56: 'BNB Smart Chain',
    97: 'BNB Smart Chain',
    8453: 'Base',
    137: 'Polygon',
    1: 'Ethereum',
    42161: 'Arbitrum',
    43114: 'Avalanche',
  }
  return full[chainId] ?? short ?? `Chain ${chainId}`
}

export const ChainSwitchConfirmDialog: React.FC<{
  open: boolean
  targetChainId: number
  productLabel?: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}> = ({ open, targetChainId, productLabel, onCancel, onConfirm, busy }) => {
  const name = chainDisplayName(targetChainId)
  const short = MELEGA_EXPLORE_CHAIN_LABELS[targetChainId] ?? name
  const body =
    productLabel?.trim() ||
    `This product is available on ${short}. Switch network?`
  return (
    <MelegaModal
      open={open}
      onClose={onCancel}
      title="Switch network to continue?"
      size="sm"
      testId="chain-switch-confirm-dialog"
      ariaLabel="Switch network to continue?"
      zIndex={10050}
    >
      <Body>{body}</Body>
      <Row>
        <ChainLogo chainId={targetChainId} />
        <span>{name}</span>
      </Row>
      <Actions>
        <Btn type="button" data-testid="chain-switch-cancel" onClick={onCancel} disabled={busy}>
          Cancel
        </Btn>
        <Btn type="button" $primary data-testid="chain-switch-confirm" onClick={onConfirm} disabled={busy}>
          {busy ? 'Switching…' : `Switch to ${MELEGA_EXPLORE_CHAIN_LABELS[targetChainId] ?? name}`}
        </Btn>
      </Actions>
    </MelegaModal>
  )
}

export default ChainSwitchConfirmDialog
