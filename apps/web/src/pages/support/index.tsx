/**
 * Support — factual contact destinations (no fabricated ticketing infrastructure).
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import { uxRebuildColors, uxRebuildFont, uxRebuildLayout, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { MELEGA_FOOTER_SOCIALS } from 'views/HomeTrade/melegaDexFooterLinks'

const Page = styled.main`
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  padding: 32px 20px 64px;
  font-family: ${uxRebuildFont};
  color: ${uxRebuildColors.text};
`

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
`

const Lead = styled.p`
  margin: 0 0 24px;
  color: ${uxRebuildColors.muted};
  max-width: 640px;
  line-height: 1.5;
`

const Card = styled.section`
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  padding: 18px;
  margin-bottom: 14px;
`

const CardTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 750;
`

const Body = styled.p`
  margin: 0 0 12px;
  color: ${uxRebuildColors.muted};
  line-height: 1.5;
  font-size: 14px;
`

const Cta = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-weight: 750;
  text-decoration: none;
`

const QuietLink = styled(Link)`
  color: ${uxRebuildColors.gold};
  font-weight: 650;
`

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${uxRebuildColors.muted};
  font-size: 14px;
  line-height: 1.6;
`

const SupportPage: React.FC = () => {
  const telegram = MELEGA_FOOTER_SOCIALS.find((s) => s.id === 'telegram-community')
  const announcements = MELEGA_FOOTER_SOCIALS.find((s) => s.id === 'telegram-announcements')

  return (
    <>
      <PageMeta title="Support" />
      <Page data-testid="melega-support-page">
        <Title>Support</Title>
        <Lead>
          Melega DEX community support. There is no automated ticketing portal in this product surface — use the
          community channels below for help, and Docs / LIVE AI-AUDIT for operational truth.
        </Lead>

        <Card>
          <CardTitle>Community</CardTitle>
          <Body>Primary support channel for product questions and wallet troubleshooting.</Body>
          {telegram ? (
            <Cta href={telegram.href} target="_blank" rel="noopener noreferrer">
              Open Telegram Community
            </Cta>
          ) : null}
        </Card>

        <Card>
          <CardTitle>Announcements</CardTitle>
          <Body>Official product announcements (read-only channel).</Body>
          {announcements ? (
            <Cta href={announcements.href} target="_blank" rel="noopener noreferrer">
              Open Telegram Announcements
            </Cta>
          ) : null}
        </Card>

        <Card>
          <CardTitle>Self-serve</CardTitle>
          <List>
            <li>
              <QuietLink href="/docs">Docs</QuietLink> — product surfaces, fees, wallet safety, troubleshooting
            </li>
            <li>
              <QuietLink href="/audit">LIVE AI-AUDIT</QuietLink> — measured indexer / contract transparency
            </li>
            <li>
              <QuietLink href="/status">Status</QuietLink> — runtime status surface when available
            </li>
          </List>
        </Card>
      </Page>
    </>
  )
}

SupportPage.chains = CHAIN_IDS

export default SupportPage
