import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ArrowUpRight, FileText, Headphones, Megaphone, Send, ShieldCheck } from 'lucide-react'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import { uxRebuildColors, uxRebuildFont, uxRebuildLayout, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { MELEGA_FOOTER_SOCIALS } from 'views/HomeTrade/melegaDexFooterLinks'

const Page = styled.main`
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  padding: 38px 20px 72px;
  font-family: ${uxRebuildFont};
  color: ${uxRebuildColors.text};

  @media (min-width: 768px) {
    padding: 52px 32px 88px;
  }
`

const Hero = styled.header`
  position: relative;
  display: grid;
  gap: 20px;
  overflow: hidden;
  margin-bottom: 28px;
  padding: 24px;
  border: 1px solid rgba(255, 202, 35, 0.2);
  border-radius: ${uxRebuildRadius.card};
  background:
    radial-gradient(circle at 88% 22%, rgba(255, 202, 35, 0.13), transparent 28%),
    linear-gradient(125deg, rgba(255, 202, 35, 0.06), rgba(255, 255, 255, 0.012) 56%);

  &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    right: -110px;
    top: -185px;
    border: 1px solid rgba(255, 202, 35, 0.2);
    border-radius: 50%;
    pointer-events: none;
  }

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    min-height: 190px;
    padding: 34px 38px;
  }
`

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 760;
  letter-spacing: -0.045em;
`

const Lead = styled.p`
  margin: 12px 0 0;
  color: ${uxRebuildColors.muted};
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.5;
`

const Statuses = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 40px;
  padding: 0 15px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: 999px;
  background: rgba(10, 11, 12, 0.76);
  color: rgba(255, 255, 255, 0.86);
  font-size: 13px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #46dc77;
    box-shadow: 0 0 12px rgba(70, 220, 119, 0.5);
  }
`

const Grid = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Card = styled.article`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  min-height: 166px;
  padding: 22px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.028), rgba(255, 255, 255, 0.01));

  @media (min-width: 640px) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    padding: 26px;
  }
`

const IconDisc = styled.div`
  display: grid;
  place-items: center;
  width: 66px;
  height: 66px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: ${uxRebuildColors.gold};
  background: rgba(0, 0, 0, 0.28);

  &.telegram {
    color: #29a9ea;
  }
`

const CardCopy = styled.div`
  min-width: 0;
`

const CardTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 760;
`

const Body = styled.p`
  margin: 0;
  max-width: 34ch;
  color: ${uxRebuildColors.muted};
  font-size: 14px;
  line-height: 1.55;
`

const SubLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 11px;

  a {
    color: ${uxRebuildColors.gold};
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
  }
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 11px;

  span {
    padding: 4px 8px;
    border: 1px solid ${uxRebuildColors.border};
    border-radius: 7px;
    color: ${uxRebuildColors.muted};
    font-size: 11px;
  }
`

const actionStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 15px;
  border: 1px solid rgba(255, 202, 35, 0.65);
  border-radius: 10px;
  background: rgba(255, 202, 35, 0.06);
  color: #ffd54a;
  font-size: 13px;
  font-weight: 760;
  text-decoration: none;
  white-space: nowrap;
`

const ExternalAction = styled.a`
  ${actionStyles}

  @media (max-width: 639px) {
    grid-column: 1 / -1;
  }
`

const InternalAction = styled(Link)`
  ${actionStyles}

  @media (max-width: 639px) {
    grid-column: 1 / -1;
  }
`

const Safety = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 17px 20px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;

  svg,
  strong {
    color: ${uxRebuildColors.gold};
  }
`

const SupportPage = () => {
  const telegram = MELEGA_FOOTER_SOCIALS.find((social) => social.id === 'telegram-community')
  const announcements = MELEGA_FOOTER_SOCIALS.find((social) => social.id === 'telegram-announcements')

  return (
    <>
      <PageMeta title="Support" />
      <Page data-testid="melega-support-page">
        <Hero>
          <div>
            <Eyebrow>
              <Headphones size={17} aria-hidden /> Melega DEX Support
            </Eyebrow>
            <Title>Support</Title>
            <Lead>Fast answers. Trusted channels. Clear next steps.</Lead>
          </div>
          <Statuses aria-label="Support availability">
            <Status>Community online</Status>
            <Status>Docs available</Status>
          </Statuses>
        </Hero>

        <Grid>
          <Card>
            <IconDisc className="telegram"><Send size={30} aria-hidden /></IconDisc>
            <CardCopy>
              <CardTitle>Community Support</CardTitle>
              <Body>Get help from the Melega community in our official Telegram group.</Body>
            </CardCopy>
            {telegram ? (
              <ExternalAction href={telegram.href} target="_blank" rel="noopener noreferrer">
                Open Community <ArrowUpRight size={16} aria-hidden />
              </ExternalAction>
            ) : null}
          </Card>

          <Card>
            <IconDisc><Megaphone size={30} aria-hidden /></IconDisc>
            <CardCopy>
              <CardTitle>Official Announcements</CardTitle>
              <Body>Stay informed with the latest updates, releases, and security notices.</Body>
            </CardCopy>
            {announcements ? (
              <ExternalAction href={announcements.href} target="_blank" rel="noopener noreferrer">
                View Announcements <ArrowUpRight size={16} aria-hidden />
              </ExternalAction>
            ) : null}
          </Card>

          <Card>
            <IconDisc><FileText size={30} aria-hidden /></IconDisc>
            <CardCopy>
              <CardTitle>Self-serve Help</CardTitle>
              <Body>Find answers, system status, and real-time audit reports.</Body>
              <SubLinks>
                <Link href="/docs">Docs ↗</Link>
                <Link href="/status">Status ↗</Link>
                <Link href="/audit">Live AI-Audit ↗</Link>
              </SubLinks>
            </CardCopy>
            <InternalAction href="/docs">Browse Docs <ArrowUpRight size={16} aria-hidden /></InternalAction>
          </Card>

          <Card>
            <IconDisc><ShieldCheck size={30} aria-hidden /></IconDisc>
            <CardCopy>
              <CardTitle>Wallet &amp; Transaction Help</CardTitle>
              <Body>Troubleshoot common wallet and transaction issues.</Body>
              <Chips><span>Wallet</span><span>Network</span><span>Transaction hash</span></Chips>
            </CardCopy>
            <InternalAction href="/docs">Troubleshoot <ArrowUpRight size={16} aria-hidden /></InternalAction>
          </Card>
        </Grid>

        <Safety>
          <ShieldCheck size={19} aria-hidden />
          <span>Never share your seed phrase. Melega support will <strong>never</strong> ask for private keys.</span>
        </Safety>
      </Page>
    </>
  )
}

SupportPage.chains = CHAIN_IDS

export default SupportPage
