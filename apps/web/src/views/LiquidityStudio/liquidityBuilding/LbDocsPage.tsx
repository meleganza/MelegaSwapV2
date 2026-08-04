/**
 * Shared shell for /docs/liquidity-builder/* knowledge center.
 * Founder-facing education — no contract / fee / Treasury changes.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildLayout,
  uxRebuildRadius,
} from 'design-system/melega/tokens/uxRebuild'
import { PageNextAction } from 'views/shared/journeys/PageNextAction'

export const LB_DOCS_NAV: { href: string; label: string }[] = [
  { href: '/docs/liquidity-builder', label: 'Overview hub' },
  { href: '/docs/liquidity-builder/overview', label: 'Overview' },
  { href: '/docs/liquidity-builder/how-it-works', label: 'How it Works' },
  { href: '/docs/liquidity-builder/token-reserve', label: 'Token Reserve' },
  { href: '/docs/liquidity-builder/liquidity-goals', label: 'Liquidity Goals' },
  { href: '/docs/liquidity-builder/strategies', label: 'Strategies' },
  { href: '/docs/liquidity-builder/execution', label: 'Execution Model' },
  { href: '/docs/liquidity-builder/fees', label: 'Fees' },
  { href: '/docs/liquidity-builder/risk-safety', label: 'Risk & Safety' },
  { href: '/docs/liquidity-builder/examples', label: 'Examples' },
]

const Root = styled.main`
  min-height: 70vh;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background:
    radial-gradient(ellipse at 12% 0%, rgba(221, 185, 47, 0.08), transparent 42%),
    ${uxRebuildColors.pageBg};
  padding: 28px 18px 64px;

  @media (min-width: 768px) {
    padding: 40px 24px 72px;
  }
`

const Inner = styled.div`
  width: 100%;
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  display: grid;
  gap: 20px;

  @media (min-width: 960px) {
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }
`

const SideNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;

  @media (min-width: 960px) {
    flex-direction: column;
    position: sticky;
    top: 88px;
    gap: 4px;
  }
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: inline-block;
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 750 : 600)};
  color: ${({ $active }) => ($active ? uxRebuildColors.gold : uxRebuildColors.secondary)};
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? 'rgba(221,185,47,0.1)' : 'transparent')};

  &:hover {
    color: ${uxRebuildColors.gold};
  }
`

const Main = styled.div`
  min-width: 0;
`

const Crumb = styled.nav`
  font-size: 13px;
  color: ${uxRebuildColors.muted};
  margin-bottom: 14px;

  a {
    color: ${uxRebuildColors.gold};
    text-decoration: none;
  }
`

const Hero = styled.header`
  margin-bottom: 18px;
`

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${uxRebuildColors.gold};
  margin-bottom: 6px;
`

const H1 = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1.15;
  font-weight: 800;
`

const Lead = styled.p`
  margin: 0;
  max-width: 680px;
  font-size: 15px;
  line-height: 1.55;
  color: ${uxRebuildColors.bodySoft};
`

const Section = styled.section`
  padding: 16px 18px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  margin-bottom: 10px;
`

const H2 = styled.h2`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
`

const Body = styled.div`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${uxRebuildColors.secondary};

  p {
    margin: 0 0 10px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul,
  ol {
    margin: 0 0 10px;
    padding-left: 18px;
  }

  li {
    margin-bottom: 4px;
  }

  strong {
    color: ${uxRebuildColors.text};
    font-weight: 700;
  }
`

const Details = styled.details`
  padding: 14px 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  margin-bottom: 10px;

  summary {
    cursor: pointer;
    font-size: 14px;
    font-weight: 750;
    color: ${uxRebuildColors.gold};
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }
`

const DetailsBody = styled.div`
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: ${uxRebuildColors.secondary};
`

const HubGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`

const HubCard = styled(Link)`
  display: block;
  padding: 14px 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  text-decoration: none;
  color: inherit;
  min-height: 88px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: rgba(221, 185, 47, 0.45);
  }
`

const HubCardTitle = styled.div`
  font-size: 14px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
  margin-bottom: 4px;
`

const HubCardBody = styled.div`
  font-size: 13px;
  line-height: 1.45;
  color: ${uxRebuildColors.secondary};
`

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`

const Cta = styled(Link)`
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${uxRebuildColors.gold};
  background: rgba(221, 185, 47, 0.12);
  color: ${uxRebuildColors.text};
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
`

const CtaGhost = styled(Link)`
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${uxRebuildColors.border};
  color: ${uxRebuildColors.secondary};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
`

export type LbDocsSection = {
  title: string
  body: React.ReactNode
  expandable?: boolean
  defaultOpen?: boolean
  /** Visible summary label when expandable (defaults to title). */
  summary?: string
}

type Props = {
  title: string
  lead: string
  path: string
  /** Single body paragraph (legacy) or rich sections */
  body?: string
  sections?: LbDocsSection[]
  hubCards?: { href: string; title: string; body: string }[]
  showHeroEyebrow?: boolean
  children?: React.ReactNode
}

export function LbDocsPage({
  title,
  lead,
  path,
  body,
  sections,
  hubCards,
  showHeroEyebrow = false,
  children,
}: Props) {
  return (
    <Root data-melega-lb-docs data-path={path} data-testid="lb-docs-page">
      <PageMeta title={`${title} · AI Liquidity Builder Docs`} />
      <Inner>
        <SideNav data-testid="lb-docs-nav" aria-label="Liquidity Builder docs">
          {LB_DOCS_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              $active={path === item.href}
              data-testid={`lb-docs-nav-${item.href.split('/').pop() || 'hub'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </SideNav>

        <Main>
          <PageNextAction
            testId="lb-docs-next"
            here="Learn how Liquidity Builder works"
            nextLabel="Create New Program"
            nextHref="/liquidity-studio?view=building"
            secondaryLabel="Open Portfolio"
            secondaryHref="/liquidity-studio?view=building"
          />
          <Crumb data-testid="lb-docs-crumb">
            <Link href="/docs">Docs</Link>
            {' / '}
            <Link href="/docs/liquidity-builder">AI Liquidity Builder</Link>
            {path !== '/docs/liquidity-builder' ? (
              <>
                {' / '}                {title}
              </>
            ) : null}
          </Crumb>

          <Hero>
            {showHeroEyebrow ? <Eyebrow>Knowledge Center</Eyebrow> : null}
            <H1 data-testid="lb-docs-title">{title}</H1>
            <Lead data-testid="lb-docs-lead">{lead}</Lead>
          </Hero>

          {hubCards ? (
            <HubGrid data-testid="lb-docs-hub-grid">
              {hubCards.map((card) => (
                <HubCard key={card.href} href={card.href} data-testid="lb-docs-hub-card">
                  <HubCardTitle>{card.title}</HubCardTitle>
                  <HubCardBody>{card.body}</HubCardBody>
                </HubCard>
              ))}
            </HubGrid>
          ) : null}

          {body ? (
            <Section>
              <Body>
                <p>{body}</p>
              </Body>
            </Section>
          ) : null}

          {sections?.map((section) =>
            section.expandable ? (
              <Details key={section.title} open={section.defaultOpen} data-testid="lb-docs-expandable">
                <summary>{section.summary || section.title}</summary>
                <DetailsBody>{section.body}</DetailsBody>
              </Details>
            ) : (
              <Section key={section.title} data-testid="lb-docs-section">
                <H2>{section.title}</H2>
                <Body>{section.body}</Body>
              </Section>
            ),
          )}

          {children}

          <CtaRow>
            <Cta href="/liquidity-studio?view=building" data-testid="lb-docs-open-builder">
              Open Liquidity Builder
            </Cta>
            <CtaGhost href="/docs" data-testid="lb-docs-all-docs">
              All Melega Docs
            </CtaGhost>
          </CtaRow>
        </Main>
      </Inner>
    </Root>
  )
}

LbDocsPage.chains = CHAIN_IDS
