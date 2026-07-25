/**
 * POOLS_MODULE_006 — single priority card (one action).
 */

import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolsRewardAdvisor } from './poolsRewardAdvisorTokens'
import type { PoolsAdvisorPriorityCard } from './poolsRewardAdvisorTypes'

const Card = styled.li`
  list-style: none;
  margin: 0;
  padding: ${poolsRewardAdvisor.cardPad};
  border-radius: ${poolsRewardAdvisor.cardRadius};
  border: ${poolsRewardAdvisor.cardBorder};
  background: ${poolsRewardAdvisor.cardBg};
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};
`

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`

const Icon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: ${poolsRewardAdvisor.gold};
  background: rgba(244, 196, 48, 0.14);
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
`

const Explanation = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
`

const Pool = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Action = styled.button`
  appearance: none;
  cursor: pointer;
  align-self: flex-start;
  min-height: ${poolsRewardAdvisor.touchMin};
  min-width: ${poolsRewardAdvisor.touchMin};
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  background: rgba(244, 196, 48, 0.14);
  color: ${poolsRewardAdvisor.gold};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 700;

  &:focus-visible {
    outline: ${poolsRewardAdvisor.focusRing};
    outline-offset: ${poolsRewardAdvisor.focusOffset};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const PoolsRewardAdvisorCard: React.FC<{ card: PoolsAdvisorPriorityCard }> = ({ card }) => {
  const { requestModal, setPortfolioViewMode, setPoolTab } = usePoolsRuntime()

  const onAction = () => {
    if (!card.actionEnabled) return
    if (card.modalAction && card.sourceCard) {
      requestModal(card.sourceCard, card.modalAction)
      return
    }
    if (card.actionKind === 'view_pool') {
      setPortfolioViewMode('ALL')
      setPoolTab('all')
      const el = document.querySelector('[data-ps-pool-explorer], [data-pools-module="004"]')
      if (el instanceof HTMLElement) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Card data-testid="pools-advisor-card" data-advisor-kind={card.kind}>
      <Top>
        <Icon aria-hidden="true">{card.icon}</Icon>
        <Text>
          <Title>{card.title}</Title>
          <Explanation>{card.explanation}</Explanation>
          {card.affectedPool !== '—' ? <Pool>Pool · {card.affectedPool}</Pool> : null}
        </Text>
      </Top>
      {card.actionKind !== 'none' ? (
        <Action
          type="button"
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

export default PoolsRewardAdvisorCard
