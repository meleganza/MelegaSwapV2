/**
 * Wave 04 Continuation — Passport rebuilt from zero.
 * Compact, identity-first. No Command Center. No duplicated widget stacks.
 */
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { PageMeta } from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { usePassportHeroIdentity } from 'views/PassportStudio/usePassportHeroIdentity'
import { usePassportPortfolioOverview } from 'views/PassportStudio/usePassportPortfolioOverview'
import { passportOne } from 'views/PassportStudio/passportTokens'

const Root = styled.div`
  color: ${passportOne.text};
  font-family: ${passportOne.font};
  background: ${passportOne.pageBg};
  min-width: 0;
  overflow-x: hidden;
  padding-bottom: 48px;
`

const Content = styled.div`
  max-width: 720px;
  width: 100%;
  margin: 20px auto 0;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 4px;

  @media (max-width: 767px) {
    margin-top: 12px;
    padding: 0 4px calc(72px + env(safe-area-inset-bottom, 0px));
  }
`

const IdentityCard = styled.section`
  border-radius: 16px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background:
    radial-gradient(ellipse 70% 50% at 15% 0%, rgba(244, 196, 48, 0.14), transparent 55%),
    linear-gradient(165deg, #16140f 0%, #0e0e0e 100%);
  padding: 18px 18px 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
`

const Titles = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const H1 = styled.h1`
  margin: 0;
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 750;
  letter-spacing: -0.02em;
  color: #f5f5f5;
`

const Sub = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: #a8a8a8;
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #c8c8c8;
  word-break: break-all;
`

const Strip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const Metric = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(18, 18, 18, 0.96);
  padding: 12px;
  min-width: 0;
`

const MetricLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8f8f8f;
  margin-bottom: 4px;
`

const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Ghost = styled(Link)`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #f0f0f0;
  font-size: 13px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Panel = styled.section`
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #121212;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 750;
  color: #f0f0f0;
`

const PanelBody = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: #a0a0a0;
`

function shorten(addr?: string | null) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export const PassportScreen: React.FC = () => {
  const { address } = useAccount()
  const identity = usePassportHeroIdentity()
  const portfolio = usePassportPortfolioOverview()

  const displayName = identity?.displayName || (address ? 'Passport holder' : 'MARCO Passport')
  const cryptoKpi = portfolio.kpis.find((k) => k.id === 'crypto')
  const projectsKpi = portfolio.kpis.find((k) => k.id === 'projects')

  return (
    <Root
      data-passport-screen
      data-ux-rebuild-passport
      data-passport-connected={address ? 'true' : 'false'}
      data-passport-architecture="wave-04-continuation"
      data-passport-command-center="removed"
    >
      <PageMeta />
      <Content data-testid="passport-page-content">
        <IdentityCard data-testid="passport-identity-card">
          <MelegaLogoSvg size={56} />
          <Titles>
            <H1>{displayName}</H1>
            <Sub>Identity layer for Melega — not a crypto wallet.</Sub>
            <Mono>{address ? shorten(address) : 'Wallet disconnected'}</Mono>
          </Titles>
        </IdentityCard>

        <Strip data-testid="passport-identity-metrics">
          <Metric>
            <MetricLabel>Portfolio</MetricLabel>
            <MetricValue>{address ? portfolio.totalValueDisplay : '—'}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Crypto</MetricLabel>
            <MetricValue>{address ? cryptoKpi?.value ?? '—' : '—'}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Projects</MetricLabel>
            <MetricValue>{address ? projectsKpi?.value ?? '—' : '—'}</MetricValue>
          </Metric>
        </Strip>

        {!address ? (
          <Panel data-testid="passport-guest-bridge">
            <PanelTitle>Connect to unlock your Passport</PanelTitle>
            <PanelBody>
              Connect an external wallet to view factual positions. Passport never holds keys —
              your wallet remains the signing authority. M-Credits stay a separate service account.
            </PanelBody>
            <Actions>
              <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
              <Ghost href="/">Home</Ghost>
              <Ghost href="/list">List a Project</Ghost>
            </Actions>
          </Panel>
        ) : (
          <Panel data-testid="passport-connected-panel">
            <PanelTitle>Quick links</PanelTitle>
            <PanelBody>Jump to live Melega surfaces tied to this identity.</PanelBody>
            <Actions>
              <Ghost href="/farms">Farms</Ghost>
              <Ghost href="/pools">Pools</Ghost>
              <Ghost href="/liquidity">Liquidity</Ghost>
              <Ghost href="/list">List / Claim</Ghost>
              <Ghost href="/projects">Projects</Ghost>
            </Actions>
          </Panel>
        )}
      </Content>
    </Root>
  )
}

export default PassportScreen
