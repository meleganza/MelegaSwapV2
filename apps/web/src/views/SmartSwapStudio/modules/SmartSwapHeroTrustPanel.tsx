/**
 * SMART_SWAP_MODULE_001 — Why Smart Swap trust panel (principles only).
 * No live quotes, route data, or fee values.
 */
import React from 'react'
import styled from 'styled-components'
import { SMART_SWAP_HERO_COPY, smartSwapHero } from './smartSwapHeroTokens'

const Panel = styled.aside`
  width: ${smartSwapHero.trustBoxW};
  height: ${smartSwapHero.trustBoxH};
  max-width: 100%;
  box-sizing: border-box;
  border-radius: ${smartSwapHero.trustRadius};
  border: ${smartSwapHero.trustBorder};
  background: ${smartSwapHero.trustBg};
  padding: ${smartSwapHero.trustPad};
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 0 0 auto;

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: min(100%, ${smartSwapHero.mobileTrustW});
    height: auto;
    min-height: 0;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 750;
  color: #f7f7f7;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Row = styled.li`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  column-gap: 10px;
  align-items: start;
  min-height: 40px;
`

const Icon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${smartSwapHero.gold};
  flex: 0 0 22px;
  margin-top: 1px;

  svg {
    display: block;
  }
`

const Text = styled.div`
  min-width: 0;
`

const RowTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: #f7f7f7;
`

const RowBody = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.58);
`

function TrustIcon({ id }: { id: string }) {
  switch (id) {
    case 'route-visibility':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M2 9 L5 4 L7.5 7 L10 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'transparent-fees':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="2" y="3" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M4 6 H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )
    case 'execution-confidence':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M4 6.2 L5.5 7.6 L8.2 4.6" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'non-custodial':
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="2.5" y="5" width="7" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M4 5 V3.8 A2 2 0 0 1 8 3.8 V5" stroke="currentColor" strokeWidth="1.3" fill="none" />
        </svg>
      )
  }
}

export const SmartSwapHeroTrustPanel: React.FC = () => (
  <Panel
    data-testid="smart-swap-hero-trust"
    data-smart-swap-hero-trust
    aria-labelledby="smart-swap-hero-trust-title"
  >
    <Title id="smart-swap-hero-trust-title">{SMART_SWAP_HERO_COPY.trustTitle}</Title>
    <List>
      {SMART_SWAP_HERO_COPY.trustItems.map((item) => (
        <Row key={item.id} data-testid={`smart-swap-hero-trust-${item.id}`}>
          <Icon>
            <TrustIcon id={item.id} />
          </Icon>
          <Text>
            <RowTitle>{item.title}</RowTitle>
            <RowBody>{item.body}</RowBody>
          </Text>
        </Row>
      ))}
    </List>
  </Panel>
)

export default SmartSwapHeroTrustPanel
