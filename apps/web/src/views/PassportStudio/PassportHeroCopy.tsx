import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'

const Region = styled.div`
  position: relative;
  z-index: 1;
  width: ${passportOne.heroLeftW};
  height: 304px;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 40px;

  @media (max-width: 1199px) {
    width: 100%;
    height: auto;
    padding-top: 0;
  }
`

const Content = styled.div`
  width: 548px;
  max-width: 100%;
  min-width: 0;

  @media (max-width: 1199px) {
    width: 100%;
  }
`

const Eyebrow = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 14px;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${passportOne.gold};
`

const Headline = styled.h1`
  margin: 14px 0 0;
  max-width: 520px;
  font-size: 44px;
  line-height: 48px;
  font-weight: 760;
  letter-spacing: -0.025em;
  color: ${passportOne.text};

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 39px;
  }
`

const Line = styled.span`
  display: block;
`

const Gold = styled.span`
  color: ${passportOne.gold};
`

const Support = styled.p`
  margin: 16px 0 0;
  max-width: 500px;
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
  color: ${passportOne.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Actions = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  @media (max-width: 767px) {
    gap: 10px;
  }
`

const focusRing = `
  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Primary = styled(Link)`
  width: ${passportOne.heroPrimaryCtaW};
  height: ${passportOne.heroCtaH};
  box-sizing: border-box;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: linear-gradient(180deg, #e8ca57 0%, #ddb92f 100%);
  color: #090909;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  ${focusRing}

  @media (max-width: 767px) {
    width: 204px;
  }
`

const Secondary = styled.button`
  width: ${passportOne.heroSecondaryCtaW};
  height: ${passportOne.heroCtaH};
  box-sizing: border-box;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: ${passportOne.text};
  font-size: 13px;
  line-height: 18px;
  font-weight: 650;
  cursor: pointer;
  font-family: inherit;
  ${focusRing}

  @media (max-width: 767px) {
    width: 130px;
  }
`

export const PassportHeroCopy: React.FC<{ onLearnMore: () => void }> = ({ onLearnMore }) => (
  <Region data-testid="passport-hero-copy" data-passport-hero-left>
    <Content>
      <Eyebrow data-testid="passport-hero-eyebrow">MARCO PASSPORT</Eyebrow>
      <Headline data-testid="passport-hero-headline">
        <Line>Your identity.</Line>
        <Line>Your assets.</Line>
        <Line>
          <Gold>Your ecosystem.</Gold>
        </Line>
      </Headline>
      <Support data-testid="passport-hero-support">
        Manage your identity, M-Credits, external wallets, projects and ecosystem activity from one
        place.
      </Support>
      <Actions data-testid="passport-hero-actions" role="group" aria-label="Passport hero actions">
        <Primary href="/" data-testid="passport-hero-cta-primary">
          Explore the Ecosystem
        </Primary>
        <Secondary type="button" onClick={onLearnMore} data-testid="passport-hero-cta-secondary">
          Learn More
        </Secondary>
      </Actions>
    </Content>
  </Region>
)

export default PassportHeroCopy
