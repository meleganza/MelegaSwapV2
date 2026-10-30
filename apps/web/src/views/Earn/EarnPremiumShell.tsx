import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { typography } from 'design-system/melega'

type EarnKind = 'farms' | 'pools'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 0 4px;
  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 16px 4px;
  }
`

const Identity = styled.div`min-width: 0;`
const Subtitle = styled.p`margin: 7px 0 0; color: #72736E; font-size: 14px; line-height: 1.4;`
const Title = styled.h1`
  margin: 0;
  color: #171817;
  font-family: ${typography.fontFamily.body};
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.04em;
`
const Protocols = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid #e5e2d9;
  border-radius: 14px;
  background: #f7f6f2;
  @media (max-width: 767px) { width: 100%; }
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid #e5e2d9;
  border-radius: 14px;
  background: #ffffff;
  @media (max-width: 767px) { margin: 0 16px; }
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

export const EarnPremiumShell: React.FC<{ kind: EarnKind; chainId?: number | null }> = ({ kind }) => {
  return <>
    <Header data-earn-premium-header>
      <Identity>
        <Title>Earn</Title>
        <Subtitle>Stake tokens, provide liquidity and earn rewards.</Subtitle>
      </Identity>
      <Protocols aria-label="Earn protocol type">
        <Link href="/farms" passHref legacyBehavior>
          <ProtocolLink $active={kind === 'farms'} aria-current={kind === 'farms' ? 'page' : undefined}>
            Pair
          </ProtocolLink>
        </Link>
        <Link href="/pools" passHref legacyBehavior>
          <ProtocolLink $active={kind === 'pools'} aria-current={kind === 'pools' ? 'page' : undefined}>
            Token
          </ProtocolLink>
        </Link>
        <Link href="/liquidity" passHref legacyBehavior>
          <ProtocolLink $active={false}>Liquidity</ProtocolLink>
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
