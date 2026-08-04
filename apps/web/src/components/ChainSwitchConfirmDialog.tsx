/**
 * Compact confirm dialog before switching wallet network for a farm/pool action.
 */
import React from 'react'
import styled from 'styled-components'
import { MELEGA_EXPLORE_CHAIN_LABELS } from 'components/Logo/MelegaExploreChainBadge'
import { ChainLogo } from 'components/Logo/ChainLogo'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(0, 0, 0, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Panel = styled.div`
  width: min(420px, 100%);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #121212;
  padding: 18px 18px 16px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 750;
  color: #f5f5f5;
`

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
}> = ({ open, targetChainId, productLabel = 'This position', onCancel, onConfirm, busy }) => {
  if (!open) return null
  const name = chainDisplayName(targetChainId)
  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby="chain-switch-title"
      data-testid="chain-switch-confirm-dialog"
      onClick={onCancel}
    >
      <Panel onClick={(e) => e.stopPropagation()}>
        <Title id="chain-switch-title">Switch network to continue?</Title>
        <Body>
          {productLabel} is on {name}. Switch network to continue?
        </Body>
        <Row>
          <ChainLogo chainId={targetChainId} />
          <span>{name}</span>
        </Row>
        <Actions>
          <Btn type="button" data-testid="chain-switch-cancel" onClick={onCancel} disabled={busy}>
            Cancel
          </Btn>
          <Btn
            type="button"
            $primary
            data-testid="chain-switch-confirm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Switching…' : `Switch to ${MELEGA_EXPLORE_CHAIN_LABELS[targetChainId] ?? name}`}
          </Btn>
        </Actions>
      </Panel>
    </Overlay>
  )
}

export default ChainSwitchConfirmDialog
