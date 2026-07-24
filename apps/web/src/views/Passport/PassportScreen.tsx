import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { PageMeta } from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CommandCenterScreen from 'views/CommandCenter/CommandCenterScreen'
import { PassportHeroIdentityModule } from 'views/PassportStudio/PassportHeroIdentityModule'
import { passportOne } from 'views/PassportStudio/passportTokens'

const Root = styled.div`
  color: ${passportOne.text};
  font-family: ${passportOne.font};
  background: ${passportOne.pageBg};
  min-width: 0;
  overflow-x: hidden;
  padding-bottom: ${passportOne.pageBottomPad};
`

const Content = styled.div`
  /*
   * App shell <main> already supplies horizontal page padding (32px @ ≥1024).
   * Fill to 1376 so Module 001 can measure 1376×360 with 32px side margins.
   */
  max-width: ${passportOne.contentMax};
  width: 100%;
  margin: ${passportOne.topAfterTrending} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${passportOne.moduleGap};

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    margin-top: 16px;
    /* Shell pads ~12px; add 4px → ~16px page inset (358 @ 390) */
    padding: 0 4px calc(72px + env(safe-area-inset-bottom, 0px) + 24px);
  }
`

const GuestBridge = styled.div`
  width: 100%;
  max-width: ${passportOne.contentMax};
  box-sizing: border-box;
  border-radius: ${passportOne.radius};
  border: 1px solid ${passportOne.border};
  background: ${passportOne.card};
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`

const GuestNote = styled.p`
  margin: 0;
  flex: 1 1 220px;
  font-size: 13px;
  line-height: 19px;
  color: ${passportOne.secondary};
`

const Ghost = styled(Link)`
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const NextAnchor = styled.div`
  width: 100%;
  height: 0;
  overflow: hidden;
`

/**
 * MARCO Passport — shared identity and account layer (not a crypto wallet).
 * MODULE 001: Hero + Identity Card.
 * Connected: Command Center portfolio orchestration preserved below Module 001.
 * Disconnected: guest bridge with Connect (outside Hero — global shell also owns connect).
 */
export const PassportScreen: React.FC = () => {
  const { address } = useAccount()

  return (
    <Root
      data-passport-screen
      data-ux-rebuild-passport
      data-passport-connected={address ? 'true' : 'false'}
      data-passport-architecture="000"
      data-passport-module-001="mounted"
    >
      <PageMeta />
      <Content data-testid="passport-page-content">
        <PassportHeroIdentityModule />
        <NextAnchor id="passport-module-next" data-testid="passport-module-next" aria-hidden="true" />
        {address ? (
          <CommandCenterScreen />
        ) : (
          <GuestBridge data-testid="passport-guest-bridge">
            <GuestNote>
              Connect your external wallet to view portfolio positions and activity. MARCO Passport is
              not a crypto wallet — your external wallet remains the signing authority. M-Credits remain
              a separate service-payment account.
            </GuestNote>
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
            <Ghost href="/">Explore Home</Ghost>
            <Ghost href="/list">List a Project</Ghost>
          </GuestBridge>
        )}
      </Content>
    </Root>
  )
}

export default PassportScreen
