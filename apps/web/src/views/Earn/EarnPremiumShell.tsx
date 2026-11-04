import React from 'react'
import Link from 'next/link'
import styled, { createGlobalStyle } from 'styled-components'
import { typography } from 'design-system/melega'

type EarnKind = 'farms' | 'pools'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding: 10px 0 4px;
  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
    padding: 12px 0 4px;
  }
`

const Identity = styled.div`min-width: 0;`
const Subtitle = styled.p`margin: 7px 0 0; color: #72736E; font-size: 14px; line-height: 1.4;`
const Title = styled.h1`
  margin: 0;
  color: #171817;
  font-family: ${typography.fontFamily.body};
  font-size: 40px;
  line-height: 1;
  letter-spacing: -0.04em;
`
const Protocols = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  width: 100%;
  @media (max-width: 767px) { width: 100%; gap: 8px; padding: 0; }
`
const ProtocolLink = styled.a<{ $active: boolean }>`
  min-width: 112px;
  min-height: 82px;
  padding: 34px 12px 8px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ $active }) => ($active ? '#171817' : '#72736e')} !important;
  background: ${({ $active }) => ($active ? '#FFF7D7' : '#FFFFFF')};
  border: 1px solid ${({ $active }) => ($active ? '#F3C928' : '#E5E2D9')};
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  strong { color: #171817; font-size: 15px; line-height: 1.15; }
  small { color: #72736E; font-size: 11px; font-weight: 500; margin-top: 5px; }
  .earn-type-icon { color: #171817; font-size: 25px; line-height: 1; margin-bottom: 8px; }
  @media (max-width: 767px) { min-width: 0; }
`
const JumpNav = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 0;
  border-radius: 14px;
  background: #ffffff;
  @media (max-width: 767px) { margin: 12px 0 0; }
`
const JumpLink = styled.a`
  min-width: 0;
  min-height: 44px;
  padding: 0 10px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #5f605c;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  &:hover, &:focus-visible { color: #171817; background: #fff2bd; }
`


const EarnTypeIcon = styled.svg`
  width: 34px;
  height: 34px;
  fill: none;
  stroke: #171817;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
`

/* R035B: rows apply to the farm and pool opportunity cards rendered under the Earn shell. */
const EarnRowsStyle = createGlobalStyle`
  [data-farms-studio-screen] [data-testid='farms-explore-card'],
  [data-pools-studio-screen] [data-testid='pools-explore-card'] {
    /* marker */
  }
  /* ---- R035B: approved Earn Pearl mockup — compact opportunity rows (presentation only) ---- */
  [data-earn-row] {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto auto !important;
    grid-template-areas: 'head metrics action' !important;
    align-items: center !important;
    gap: 10px !important;
    min-height: 0 !important;
    padding: 12px 14px !important;
    border-radius: 16px !important;
    border: 1px solid #EFEDE6 !important;
    background: #FFFFFF !important;
    box-shadow: none !important;
  }
  [data-earn-row] > [data-farm-row-head] {
    grid-area: head;
    min-width: 0;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 2px !important;
    padding: 0 !important;
    border: 0 !important;
  }
  [data-earn-row] [data-earn-row-badges] {
    display: flex !important;
    flex-wrap: wrap;
    gap: 4px !important;
    margin-left: 0 !important;
    transform: scale(0.85);
    transform-origin: left center;
    max-width: 100%;
  }
  [data-earn-row] > [data-truth-pipeline] {
    grid-area: metrics;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(56px, auto)) !important;
    gap: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
  }
  [data-earn-row] > [data-truth-pipeline] > :not([data-metric]) {
    display: none !important;
  }
  [data-earn-row] [data-metric] {
    padding: 0 10px !important;
    border: 0 !important;
    border-left: 1px solid #EFEDE6 !important;
    background: transparent !important;
    text-align: left;
  }
  [data-earn-row] [data-metric] > :first-child {
    font-size: 11px !important;
    color: #8E8F89 !important;
    text-transform: none !important;
  }
  [data-earn-row] [data-metric] > :last-child {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #171817 !important;
  }
  [data-earn-row] [data-farm-wallet-line],
  [data-earn-row] [data-testid='farms-explore-activity-spark'],
  [data-earn-row] [data-testid='farms-explore-view-farm'],
  [data-earn-row] [data-testid='farms-explore-view-lp'],
  [data-earn-row] [data-testid='pools-explore-view-pool'],
  [data-earn-row] [data-truth-pipeline] + div:not([data-earn-row-actions]) {
    display: none !important;
  }
  [data-earn-row] [data-earn-row-actions] {
    grid-area: action;
    display: flex !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
  }
  /* Disconnected: wallet connection lives in the header; rows stay compact. */
  [data-earn-row] [data-earn-row-actions] > :not(button) {
    display: none !important;
  }
  [data-earn-row] [data-testid='farms-explore-stake'],
  [data-earn-row] [data-testid='pools-explore-stake'] {
    height: 34px !important;
    min-height: 34px !important;
    padding: 0 14px !important;
    border-radius: 999px !important;
    font-size: 13px !important;
  }
  @media (max-width: 420px) {
    [data-earn-row] {
      grid-template-columns: minmax(0, 1fr) auto !important;
      grid-template-areas: 'head metrics' 'action action' !important;
    }
    [data-earn-row] [data-earn-row-actions] {
      justify-content: flex-end;
    }
  }
`

export const EarnSection = styled.section`
  min-width: 0;
  scroll-margin-top: 142px;
`

export const EarnPremiumShell: React.FC<{ kind: EarnKind; chainId?: number | null }> = ({ kind }) => {
  return <>
    <EarnRowsStyle />
    <Header data-earn-premium-header>
      <Identity>
        <Title>Earn</Title>
        <Subtitle>Stake tokens, provide liquidity and earn rewards.</Subtitle>
      </Identity>
      <Protocols aria-label="Earn protocol type">
        <Link href="/pools" passHref legacyBehavior>
          <ProtocolLink $active={kind === 'pools'} aria-current={kind === 'pools' ? 'page' : undefined}>
            <EarnTypeIcon viewBox="0 0 24 24" aria-hidden>
              <ellipse cx="12" cy="6" rx="7" ry="2.6" />
              <path d="M5 6v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 10v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4M5 14v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4" />
            </EarnTypeIcon>
            <strong>Token</strong>
            <small>Stake one token</small>
          </ProtocolLink>
        </Link>
        <Link href="/farms" passHref legacyBehavior>
          <ProtocolLink $active={kind === 'farms'} aria-current={kind === 'farms' ? 'page' : undefined}>
            <EarnTypeIcon viewBox="0 0 24 24" aria-hidden>
              <circle cx="8.5" cy="12" r="5.5" />
              <circle cx="15.5" cy="12" r="5.5" />
            </EarnTypeIcon>
            <strong>Pair</strong>
            <small>Stake LP tokens</small>
          </ProtocolLink>
        </Link>
        <Link href="/liquidity" passHref legacyBehavior>
          <ProtocolLink $active={false}>
            <EarnTypeIcon viewBox="0 0 24 24" aria-hidden>
              <path d="M12 3c3 4.2 6 7.3 6 10.5a6 6 0 11-12 0C6 10.3 9 7.2 12 3z" />
            </EarnTypeIcon>
            <strong>Liquidity</strong>
            <small>Add or remove</small>
          </ProtocolLink>
        </Link>
      </Protocols>
    </Header>
    <JumpNav aria-label="Earn sections">
      <JumpLink href="#opportunities">Opportunities</JumpLink>
      <JumpLink href="#positions">My positions</JumpLink>
      <JumpLink href="#terminated">Finished</JumpLink>
    </JumpNav>
  </>
}

export default EarnPremiumShell
