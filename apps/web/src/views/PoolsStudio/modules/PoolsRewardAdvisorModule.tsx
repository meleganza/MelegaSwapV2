/**
 * POOLS_MODULE_006 — Reward Advisor.
 * Desktop: portals into Module 003 reserved 424×360 slot.
 * Tablet/mobile: renders below Finished Pools (inline).
 * Does not modify Modules 001–005.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsRewardAdvisor } from './poolsRewardAdvisorTokens'
import { usePoolsRewardAdvisor } from './usePoolsRewardAdvisor'
import { PoolsRewardAdvisorCard } from './PoolsRewardAdvisorCard'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Surface = styled.section`
  width: 100%;
  height: 100%;
  min-height: ${poolsRewardAdvisor.slotH};
  max-width: ${poolsRewardAdvisor.slotW};
  box-sizing: border-box;
  border-radius: ${poolsRewardAdvisor.radius};
  border: ${poolsRewardAdvisor.border};
  background: ${poolsRewardAdvisor.bg};
  box-shadow: ${poolsRewardAdvisor.shadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${typography.fontFamily.body};
  min-width: 0;

  @media (max-width: ${poolsRewardAdvisor.tabletBreak}) {
    max-width: none;
    min-height: 0;
    height: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  height: ${poolsRewardAdvisor.headerH};
  padding: 0 14px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${poolsRewardAdvisor.titleSize};
  line-height: ${poolsRewardAdvisor.titleLine};
  font-weight: ${poolsRewardAdvisor.titleWeight};
  color: ${poolsRewardAdvisor.titleColor};
`

const Body = styled.div`
  flex: 1;
  padding: 0 12px 12px;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: ${poolsRewardAdvisor.cardGap};
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${poolsRewardAdvisor.cardGap};
  min-width: 0;
`

const Skeleton = styled.div`
  height: 64px;
  border-radius: ${poolsRewardAdvisor.cardRadius};
  border: ${poolsRewardAdvisor.cardBorder};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`

const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 16px 8px;
`

const CenterTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #f5f5f5;
`

const CenterDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
`

const InlineMount = styled.div`
  display: none;
  width: 100%;
  max-width: 1376px;
  margin-top: -16px;
  box-sizing: border-box;

  @media (max-width: ${poolsRewardAdvisor.tabletBreak}) {
    display: block;
  }
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

function AdvisorSurface({ placement }: { placement: 'slot' | 'inline' }) {
  const vm = usePoolsRewardAdvisor()

  return (
    <Surface
      data-testid="pools-reward-advisor-module"
      data-pools-module="006"
      data-pools-module-006="mounted"
      data-advisor-placement={placement}
      data-module-state={vm.state}
      aria-labelledby={`pools-reward-advisor-title-${placement}`}
    >
      <Header>
        <Title id={`pools-reward-advisor-title-${placement}`}>Reward Advisor</Title>
      </Header>
      <Body>
        {vm.state === 'loading' ? (
          <>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} data-testid="pools-advisor-skeleton" />
            ))}
          </>
        ) : null}

        {vm.state === 'unavailable' ? (
          <Center data-testid="pools-advisor-unavailable">
            <CenterTitle>Advisor unavailable</CenterTitle>
            <CenterDesc>Advice is not invented when sources fail.</CenterDesc>
          </Center>
        ) : null}

        {vm.state === 'ready' || vm.state === 'all_clear' || vm.state === 'disconnected' ? (
          <List data-testid="pools-advisor-list">
            {vm.cards.map((card) => (
              <PoolsRewardAdvisorCard key={card.id} card={card} />
            ))}
          </List>
        ) : null}
      </Body>
      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Surface>
  )
}

export const PoolsRewardAdvisorModule: React.FC = () => {
  const [slotEl, setSlotEl] = useState<Element | null>(null)

  useEffect(() => {
    const el = document.querySelector(poolsRewardAdvisor.slotSelector)
    setSlotEl(el)
    if (el instanceof HTMLElement) {
      el.removeAttribute('aria-hidden')
      el.style.border = 'none'
      el.style.background = 'transparent'
    }
  }, [])

  return (
    <>
      {slotEl ? createPortal(<AdvisorSurface placement="slot" />, slotEl) : null}
      <InlineMount data-pools-advisor-inline="true">
        <AdvisorSurface placement="inline" />
      </InlineMount>
    </>
  )
}

export default PoolsRewardAdvisorModule
