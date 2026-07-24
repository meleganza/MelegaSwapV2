import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { PageMeta } from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CommandCenterScreen from 'views/CommandCenter/CommandCenterScreen'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildLayout,
} from 'design-system/melega/tokens/uxRebuild'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  min-width: 0;
`

const Intro = styled.div`
  width: calc(100% - 64px);
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  padding: 24px 0 8px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    width: 100%;
    padding: 16px 16px 8px;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 40px;
  line-height: 46px;
  font-weight: 750;

  @media (max-width: 767px) {
    font-size: 30px;
    line-height: 36px;
  }
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: 640px;
  font-size: 15px;
  line-height: 23px;
  color: ${uxRebuildColors.secondary};
`

const Actions = styled.div`
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`

const Ghost = styled(Link)`
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid ${uxRebuildColors.borderStrong};
  background: ${uxRebuildColors.card};
  color: ${uxRebuildColors.text};
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`

const Note = styled.p`
  margin: 14px 0 0;
  font-size: 12px;
  color: ${uxRebuildColors.muted};
`

/**
 * MARCO Passport — shared identity and account layer (not a crypto wallet).
 * Connected: reuses Command Center portfolio orchestration until MODULE_001+ cutover.
 * Disconnected: truthful benefits + connect CTA.
 * Architecture lock: PASSPORT_ARCHITECTURE_000 (PassportStudio tokens + ownership map).
 */
export const PassportScreen: React.FC = () => {
  const { address } = useAccount()

  if (address) {
    return (
      <Root
        data-passport-screen
        data-ux-rebuild-passport
        data-passport-connected="true"
        data-passport-architecture="000"
      >
        <Intro>
          <Title>MARCO Passport</Title>
          <Subtitle>Your identity and portfolio hub. External wallet remains the signing authority.</Subtitle>
          <Actions>
            <Ghost href="/list">List New Project</Ghost>
          </Actions>
        </Intro>
        <CommandCenterScreen />
      </Root>
    )
  }

  return (
    <Root
      data-passport-screen
      data-ux-rebuild-passport
      data-passport-connected="false"
      data-passport-architecture="000"
    >
      <PageMeta />
      <Intro>
        <Title>MARCO Passport</Title>
        <Subtitle>
          Connect your external wallet to view portfolio positions, controlled projects, and activity.
          Passport is not a crypto wallet — it is your Melega identity and portfolio hub.
        </Subtitle>
        <Actions>
          <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
          <Ghost href="/">Explore Home</Ghost>
          <Ghost href="/list">List a Project</Ghost>
        </Actions>
        <Note>Public discovery remains available on Home, Farms, and Pools without Passport activation.</Note>
      </Intro>
    </Root>
  )
}

export default PassportScreen
