import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { getNativeYieldChainState } from 'config/nativeYieldPolicy'

type EarnKind = 'farms' | 'pools'

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border: 1px solid #e5e2d9;
  border-radius: 20px;
  background: #ffffff;
  @media (max-width: 767px) {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
    padding: 18px 16px;
    border-radius: 0 0 20px 20px;
  }
`

const Identity = styled.div`min-width: 0;`
const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(244, 196, 48, 0.12);
  color: #171817;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`
const Title = styled.h1`
  margin: 8px 0 2px;
  color: #171817;
  font-family: ${typography.fontFamily.body};
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1;
  letter-spacing: -0.04em;
`
const Support = styled.p`
  margin: 0;
  color: #72736e;
  font-size: 13px;
`
const SafetyNotice = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(166, 57, 57, 0.28);
  border-radius: 12px;
  background: rgba(166, 57, 57, 0.07);
  color: #3d3e3a;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.45;
`
const Protocols = styled.nav`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border: 1px solid #e5e2d9;
  border-radius: 14px;
  background: #f7f6f2;
`
const ProtocolLink = styled.a<{ $active: boolean }>`
  min-width: 112px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active }) => ($active ? '#171817' : '#72736e')} !important;
  background: ${({ $active }) => ($active ? '#fff2bd' : 'transparent')};
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  @media (max-width: 767px) { min-width: 0; }
`
const JumpNav = styled.nav`
  position: sticky;
  top: 72px;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid #e5e2d9;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  @media (max-width: 767px) { top: 54px; margin: 0 12px; }
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

export const EarnSection = styled.section`
  min-width: 0;
  scroll-margin-top: 142px;
`

export const EarnPremiumShell: React.FC<{ kind: EarnKind; chainId?: number | null }> = ({ kind, chainId }) => {
  const terminated = getNativeYieldChainState(chainId) === 'terminated'
  return <>
    <Header data-earn-premium-header>
      <Identity>
        <Eyebrow>{terminated ? 'Terminated · exits only' : 'BNB Chain · Active'}</Eyebrow>
        <Title>Earn</Title>
        <Support>Verified opportunities and your on-chain positions.</Support>
        {terminated ? (
          <SafetyNotice data-testid="native-yield-terminated-notice">
            New farm and pool entries are closed on this network. Existing positions remain readable and exits,
            claims and emergency withdrawals stay available where the contracts permit them.
          </SafetyNotice>
        ) : null}
      </Identity>
      <Protocols aria-label="Earn protocol type">
        <Link href="/farms" passHref legacyBehavior>
          <ProtocolLink $active={kind === 'farms'} aria-current={kind === 'farms' ? 'page' : undefined}>
            Liquidity farms
          </ProtocolLink>
        </Link>
        <Link href="/pools" passHref legacyBehavior>
          <ProtocolLink $active={kind === 'pools'} aria-current={kind === 'pools' ? 'page' : undefined}>
            Staking pools
          </ProtocolLink>
        </Link>
      </Protocols>
    </Header>
    <JumpNav aria-label="Earn sections">
      <JumpLink href="#opportunities">Opportunities</JumpLink>
      <JumpLink href="#positions">My positions</JumpLink>
      <JumpLink href="#terminated">Terminated</JumpLink>
    </JumpNav>
  </>
}

export default EarnPremiumShell
