/**
 * FARMS_MODULE_006 — Yield Advisor card (390×64 desktop).
 */

import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsYieldAdvisor } from './farmsYieldAdvisorTokens'
import type { FarmsAdvisorPriorityCard } from './farmsYieldAdvisorTypes'

const Card = styled.article`
  width: 100%;
  max-width: ${farmsYieldAdvisor.cardW};
  height: ${farmsYieldAdvisor.cardH};
  box-sizing: border-box;
  padding: ${farmsYieldAdvisor.cardPad};
  border-radius: ${farmsYieldAdvisor.cardRadius};
  border: ${farmsYieldAdvisor.cardBorder};
  background: ${farmsYieldAdvisor.cardBg};
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${farmsYieldAdvisor.tabletBreak}) {
    max-width: none;
  }
`

const Icon = styled.span<{ $danger?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $danger }) => ($danger ? '#FF8A65' : farmsYieldAdvisor.gold)};
  background: ${({ $danger }) => ($danger ? 'rgba(255,138,101,0.14)' : 'rgba(244,196,48,0.14)')};
`

const Text = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 13px;
  line-height: 17px;
  font-weight: 750;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Reason = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Action = styled.button<{ $danger?: boolean }>`
  appearance: none;
  cursor: pointer;
  flex-shrink: 0;
  min-height: ${farmsYieldAdvisor.touchMin};
  min-width: ${farmsYieldAdvisor.touchMin};
  height: 36px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid
    ${({ $danger }) => ($danger ? 'rgba(255,138,101,0.45)' : 'rgba(244,196,48,0.4)')};
  background: ${({ $danger }) => ($danger ? 'rgba(255,138,101,0.14)' : 'rgba(244,196,48,0.14)')};
  color: ${({ $danger }) => ($danger ? '#FF8A65' : farmsYieldAdvisor.gold)};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 700;

  &:focus-visible {
    outline: ${farmsYieldAdvisor.focusRing};
    outline-offset: ${farmsYieldAdvisor.focusOffset};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const FarmsYieldAdvisorCard: React.FC<{ card: FarmsAdvisorPriorityCard }> = ({ card }) => {
  const { requestModal } = useFarmsRuntime()
  const danger = card.kind === 'emergency_withdraw'

  const onAction = () => {
    if (!card.actionEnabled || !card.modalAction || !card.sourceCard) return
    requestModal(card.sourceCard, card.modalAction)
  }

  return (
    <Card data-testid="farms-advisor-card" data-advisor-kind={card.kind}>
      <Icon $danger={danger} aria-hidden="true">
        {card.icon}
      </Icon>
      <Text>
        <Title>{card.title}</Title>
        <Reason>{card.reason}</Reason>
      </Text>
      {card.actionKind !== 'none' ? (
        <Action
          type="button"
          $danger={danger}
          disabled={!card.actionEnabled}
          aria-label={card.accessibleName}
          onClick={onAction}
        >
          {card.actionLabel}
        </Action>
      ) : null}
    </Card>
  )
}

export default FarmsYieldAdvisorCard
