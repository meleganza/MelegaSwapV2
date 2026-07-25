/**
 * FARMS_MODULE_006 — Yield Advisor.
 * Desktop: portals into Module 003 reserved 424×360 slot.
 * Tablet/mobile: renders below Finished Farms (inline).
 * Does not modify Modules 001–005.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { farmsYieldAdvisor } from './farmsYieldAdvisorTokens'
import { useFarmsYieldAdvisor } from './useFarmsYieldAdvisor'
import { FarmsYieldAdvisorCard } from './FarmsYieldAdvisorCard'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Surface = styled.section`
  width: 100%;
  height: 100%;
  min-height: ${farmsYieldAdvisor.slotH};
  max-width: ${farmsYieldAdvisor.slotW};
  box-sizing: border-box;
  border-radius: ${farmsYieldAdvisor.radius};
  border: ${farmsYieldAdvisor.border};
  background: ${farmsYieldAdvisor.bg};
  box-shadow: ${farmsYieldAdvisor.shadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${typography.fontFamily.body};
  min-width: 0;

  @media (max-width: ${farmsYieldAdvisor.tabletBreak}) {
    max-width: ${farmsYieldAdvisor.mobileContent390};
    width: 100%;
    min-height: 0;
    height: auto;
    margin: 0 auto;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  height: ${farmsYieldAdvisor.headerH};
  padding: 0 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${farmsYieldAdvisor.titleSize};
  line-height: ${farmsYieldAdvisor.titleLine};
  font-weight: ${farmsYieldAdvisor.titleWeight};
  color: ${farmsYieldAdvisor.titleColor};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: ${farmsYieldAdvisor.subtitleSize};
  line-height: ${farmsYieldAdvisor.subtitleLine};
  color: ${farmsYieldAdvisor.subtitleColor};
`

const Body = styled.div`
  flex: 1;
  padding: 0 12px 12px;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: ${farmsYieldAdvisor.cardGap};
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${farmsYieldAdvisor.cardGap};
  min-width: 0;
`

const ListItem = styled.li`
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 0;
`

const Skeleton = styled.div`
  height: 64px;
  max-width: ${farmsYieldAdvisor.cardW};
  width: 100%;
  border-radius: ${farmsYieldAdvisor.cardRadius};
  border: ${farmsYieldAdvisor.cardBorder};
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

  @media (max-width: ${farmsYieldAdvisor.tabletBreak}) {
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
  const vm = useFarmsYieldAdvisor()

  return (
    <Surface
      data-testid="farms-yield-advisor-module"
      data-farms-module="006"
      data-farms-module-006="mounted"
      data-advisor-placement={placement}
      data-module-state={vm.state}
      aria-labelledby={`farms-yield-advisor-title-${placement}`}
    >
      <Header>
        <Title id={`farms-yield-advisor-title-${placement}`}>Yield Advisor</Title>
        <Subtitle>Actions based on your current farm positions.</Subtitle>
      </Header>
      <Body>
        {vm.state === 'loading' ? (
          <>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} data-testid="farms-advisor-skeleton" />
            ))}
          </>
        ) : null}

        {vm.state === 'unavailable' ? (
          <Center data-testid="farms-advisor-unavailable">
            <CenterTitle>Yield Advisor unavailable</CenterTitle>
            <CenterDesc>Farm position data could not be evaluated.</CenterDesc>
          </Center>
        ) : null}

        {vm.state === 'ready' || vm.state === 'all_clear' || vm.state === 'disconnected' ? (
          <List data-testid="farms-advisor-list">
            {vm.cards.map((card) => (
              <ListItem key={card.id}>
                <FarmsYieldAdvisorCard card={card} />
              </ListItem>
            ))}
          </List>
        ) : null}
      </Body>
      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Surface>
  )
}

export const FarmsYieldAdvisorModule: React.FC = () => {
  const [slotEl, setSlotEl] = useState<Element | null>(null)

  useEffect(() => {
    const el = document.querySelector(farmsYieldAdvisor.slotSelector)
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
      <InlineMount data-farms-advisor-inline="true">
        <AdvisorSurface placement="inline" />
      </InlineMount>
    </>
  )
}

export default FarmsYieldAdvisorModule
