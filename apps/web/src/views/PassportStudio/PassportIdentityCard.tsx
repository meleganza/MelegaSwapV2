import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PassportHeroIdentityViewModel } from './passportHeroIdentityTypes'
import { PassportVerificationBadge } from './PassportVerificationBadge'
import { PassportIdentityMetadata } from './PassportIdentityMetadata'

const Region = styled.div`
  position: relative;
  z-index: 1;
  width: ${passportOne.heroRightW};
  height: 304px;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1199px) {
    width: 100%;
    height: auto;
    justify-content: center;
  }
`

const Card = styled.article`
  position: relative;
  width: ${passportOne.identityCardW};
  height: ${passportOne.identityCardH};
  box-sizing: border-box;
  border-radius: ${passportOne.identityCardRadius};
  overflow: hidden;
  padding: 24px;
  background: linear-gradient(
    135deg,
    rgba(20, 21, 21, 0.99) 0%,
    rgba(12, 13, 14, 0.99) 58%,
    rgba(18, 16, 11, 0.99) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 22px 54px rgba(0, 0, 0, 0.38),
    0 0 34px rgba(221, 185, 47, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.055);

  @media (max-width: 1199px) {
    width: min(680px, 100%);
    max-width: 680px;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: 244px;
    border-radius: 16px;
    padding: 18px;
  }
`

const Decor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`

const Globe = styled.div`
  position: absolute;
  right: 70px;
  top: -28px;
  width: 330px;
  height: 330px;
  opacity: 0.1;

  @media (max-width: 767px) {
    right: -55px;
    top: -10px;
    width: 235px;
    height: 235px;
  }
`

const MicroPattern = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: repeating-linear-gradient(
    -32deg,
    rgba(255, 255, 255, 0.08) 0,
    rgba(255, 255, 255, 0.08) 1px,
    transparent 1px,
    transparent 10px
  );
`

const BadgeGlow = styled.div`
  position: absolute;
  right: 8px;
  top: 4px;
  width: 140px;
  height: 70px;
  background: radial-gradient(ellipse at 70% 40%, rgba(221, 185, 47, 0.16) 0%, transparent 70%);
  opacity: 0.9;
`

const Watermark = styled.div`
  position: absolute;
  right: 18px;
  bottom: 14px;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.14em;
  color: ${passportOne.gold};
  opacity: 0.1;
`

const Content = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 44px;
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const LogoTile = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(221, 185, 47, 0.35);
  background: linear-gradient(160deg, rgba(221, 185, 47, 0.22), rgba(20, 20, 20, 0.9));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${passportOne.gold};
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
`

const BrandText = styled.div`
  min-width: 0;
`

const BrandTitle = styled.div`
  font-size: 13px;
  line-height: 16px;
  font-weight: 750;
  color: ${passportOne.text};
`

const BrandSub = styled.div`
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: ${passportOne.gold};
`

const IdentityBlock = styled.div`
  margin-top: 20px;
  max-width: 310px;
  min-width: 0;

  @media (max-width: 767px) {
    margin-top: 14px;
    max-width: 100%;
  }
`

const DisplayName = styled.div`
  font-size: 30px;
  line-height: 36px;
  font-weight: 760;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 767px) {
    font-size: 24px;
    line-height: 30px;
  }
`

const Handle = styled.div`
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: ${passportOne.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MetaWrap = styled.div`
  margin-top: 22px;

  @media (max-width: 767px) {
    margin-top: 14px;
  }
`

const Bottom = styled.div`
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 0;
`

const WalletMeta = styled.div`
  min-width: 0;
`

const BottomLabel = styled.div`
  font-size: 10px;
  line-height: 13px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const BottomValue = styled.div`
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
`

const Action = styled(Link)`
  width: 128px;
  height: 36px;
  box-sizing: border-box;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: ${passportOne.text};
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

function GlobeSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 330 330" fill="none" aria-hidden="true">
      <circle cx="165" cy="165" r="118" stroke="#DDB92F" strokeWidth="1.2" />
      <ellipse cx="165" cy="165" rx="118" ry="48" stroke="#DDB92F" strokeWidth="0.9" />
      <ellipse cx="165" cy="165" rx="48" ry="118" stroke="#DDB92F" strokeWidth="0.9" />
      <path d="M47 165h236M165 47v236" stroke="#DDB92F" strokeWidth="0.8" />
      <circle cx="165" cy="165" r="78" stroke="#F5F5F5" strokeWidth="0.6" opacity="0.55" />
    </svg>
  )
}

export const PassportIdentityCard: React.FC<{ identity: PassportHeroIdentityViewModel }> = ({
  identity,
}) => (
  <Region data-testid="passport-identity-region" data-passport-hero-right>
    <Card data-testid="passport-identity-card" aria-label="MARCO Passport identity card">
      <Decor aria-hidden="true">
        <MicroPattern />
        <BadgeGlow />
        <Globe>
          <GlobeSvg />
        </Globe>
        <Watermark>MARCO</Watermark>
      </Decor>
      <Content>
        <TopRow>
          <Brand>
            <LogoTile aria-hidden="true">M</LogoTile>
            <BrandText>
              <BrandTitle>MARCO</BrandTitle>
              <BrandSub>PASSPORT</BrandSub>
            </BrandText>
          </Brand>
          <PassportVerificationBadge
            state={identity.verificationState}
            label={identity.verificationLabel}
          />
        </TopRow>

        <IdentityBlock>
          <DisplayName data-testid="passport-display-name" title={identity.displayName}>
            {identity.displayName}
          </DisplayName>
          <Handle data-testid="passport-handle">{identity.handleDisplay}</Handle>
        </IdentityBlock>

        <MetaWrap>
          <PassportIdentityMetadata
            memberSince={identity.memberSince}
            accountType={identity.accountType}
          />
        </MetaWrap>

        <Bottom>
          <WalletMeta>
            <BottomLabel>Connected Wallets</BottomLabel>
            <BottomValue data-testid="passport-wallet-count">{identity.connectedWalletsLabel}</BottomValue>
          </WalletMeta>
          {identity.primaryIdentityAction ? (
            <Action
              href={identity.primaryIdentityAction.href}
              data-testid="passport-identity-action"
              data-action-kind={identity.primaryIdentityAction.kind}
            >
              {identity.primaryIdentityAction.label}
            </Action>
          ) : null}
        </Bottom>
      </Content>
    </Card>
  </Region>
)

export default PassportIdentityCard
