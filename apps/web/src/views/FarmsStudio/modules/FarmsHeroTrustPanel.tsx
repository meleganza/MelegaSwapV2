/**
 * FARMS_MODULE_001 — Why Farm trust panel (factual copy only).
 */
import React from 'react'
import styled from 'styled-components'
import { FARMS_HERO_COPY, farmsHero } from './farmsHeroTokens'

const Panel = styled.aside`
  width: ${farmsHero.trustBoxW};
  height: ${farmsHero.trustBoxH};
  max-width: 100%;
  box-sizing: border-box;
  border-radius: ${farmsHero.trustRadius};
  border: ${farmsHero.trustBorder};
  background: ${farmsHero.trustBg};
  padding: ${farmsHero.trustPad};
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 0 0 auto;

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: min(100%, ${farmsHero.mobileTrustW});
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
  color: ${farmsHero.gold};
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
    case 'lp-yield':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="4.2" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <circle cx="7.8" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.3" fill="none" />
        </svg>
      )
    case 'rewards':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <path d="M6 3.6v4.8M4.2 6h3.6" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      )
    case 'management':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M2.2 6h7.6M7.2 3.4L9.8 6 7.2 8.6" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      )
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M6 1.4L2.4 3.1v2.7c0 2.2 1.6 3.7 3.6 4.2 2-.5 3.6-2 3.6-4.2V3.1L6 1.4z"
            fill="currentColor"
          />
        </svg>
      )
  }
}

export const FarmsHeroTrustPanel: React.FC = () => (
  <Panel data-testid="farms-hero-trust" aria-labelledby="farms-hero-trust-title">
    <Title id="farms-hero-trust-title">{FARMS_HERO_COPY.trustTitle}</Title>
    <List>
      {FARMS_HERO_COPY.trustItems.map((item) => (
        <Row key={item.id}>
          <Icon aria-hidden="true">
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

export default FarmsHeroTrustPanel
