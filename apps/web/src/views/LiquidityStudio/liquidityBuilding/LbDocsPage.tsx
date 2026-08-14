/** Shared, lightweight shell for /docs/liquidity-builder/*. */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { DocsVisual, type DocsVisualVariant } from 'views/Docs/DocsVisual'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  uxRebuildColors,
  uxRebuildDisplayFont,
  uxRebuildFont,
  uxRebuildLayout,
  uxRebuildMotion,
  uxRebuildRadius,
} from 'design-system/melega/tokens/uxRebuild'

export const LB_DOCS_NAV: { href: string; label: string }[] = [
  { href: '/docs/liquidity-builder', label: 'Start here' },
  { href: '/docs/liquidity-builder/overview', label: 'Overview' },
  { href: '/docs/liquidity-builder/how-it-works', label: 'How it works' },
  { href: '/docs/liquidity-builder/token-reserve', label: 'Token reserve' },
  { href: '/docs/liquidity-builder/liquidity-goals', label: 'Liquidity goals' },
  { href: '/docs/liquidity-builder/strategies', label: 'Strategies' },
  { href: '/docs/liquidity-builder/execution', label: 'Execution model' },
  { href: '/docs/liquidity-builder/fees', label: 'Fees' },
  { href: '/docs/liquidity-builder/risk-safety', label: 'Risk & safety' },
  { href: '/docs/liquidity-builder/examples', label: 'Examples' },
]

const VISUAL_BY_PATH: Record<string, DocsVisualVariant> = {
  '/docs/liquidity-builder': 'hub',
  '/docs/liquidity-builder/overview': 'overview',
  '/docs/liquidity-builder/how-it-works': 'steps',
  '/docs/liquidity-builder/token-reserve': 'reserve',
  '/docs/liquidity-builder/liquidity-goals': 'goals',
  '/docs/liquidity-builder/strategies': 'strategies',
  '/docs/liquidity-builder/execution': 'execution',
  '/docs/liquidity-builder/fees': 'fees',
  '/docs/liquidity-builder/risk-safety': 'safety',
  '/docs/liquidity-builder/examples': 'examples',
}

const Root = styled.main`
  min-height: 72vh;
  padding: 28px 18px 76px;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: radial-gradient(ellipse at 10% 0%, rgba(221, 185, 47, 0.075), transparent 34rem),
    ${uxRebuildColors.pageBg};

  @media (min-width: 768px) {
    padding: 44px 24px 88px;
  }
`

const Inner = styled.div`
  display: grid;
  width: 100%;
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  gap: 24px;

  @media (min-width: 980px) {
    grid-template-columns: 224px minmax(0, 1fr);
    gap: 40px;
    align-items: start;
  }
`

const Side = styled.aside`
  min-width: 0;

  @media (min-width: 980px) {
    position: sticky;
    top: 132px;
  }
`

const SideHead = styled.div`
  display: none;

  @media (min-width: 980px) {
    display: block;
    padding: 0 10px 14px;
    border-bottom: 1px solid ${uxRebuildColors.divider};
    margin-bottom: 10px;
  }
`

const SideEyebrow = styled.div`
  margin-bottom: 5px;
  color: ${uxRebuildColors.gold};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const SideTitle = styled.div`
  font-family: ${uxRebuildDisplayFont};
  font-size: 16px;
  font-weight: 720;
`

const SideNav = styled.nav`
  display: none;

  @media (min-width: 980px) {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
`

const MobileGuideNav = styled.details`
  overflow: hidden;
  border: 1px solid rgba(221, 185, 47, 0.22);
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};

  summary {
    display: flex;
    min-height: 48px;
    cursor: pointer;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    color: ${uxRebuildColors.text};
    font-size: 12px;
    font-weight: 750;
    list-style: none;
  }

  summary::after {
    color: ${uxRebuildColors.gold};
    content: '⌄';
    font-size: 16px;
    transition: transform ${uxRebuildMotion.fast};
  }

  &[open] summary::after {
    transform: rotate(180deg);
  }

  summary::-webkit-details-marker {
    display: none;
  }

  @media (min-width: 980px) {
    display: none;
  }
`

const MobileGuideMeta = styled.span`
  margin-left: 7px;
  color: ${uxRebuildColors.muted};
  font-size: 10px;
  font-weight: 650;
`

const MobileGuideLinks = styled.nav`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  padding: 10px;
  border-top: 1px solid ${uxRebuildColors.divider};
`

const MobileGuideLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  min-height: 38px;
  align-items: center;
  padding: 0 10px;
  border-radius: ${uxRebuildRadius.input};
  color: ${({ $active }) => ($active ? uxRebuildColors.text : uxRebuildColors.secondary)};
  background: ${({ $active }) => ($active ? 'rgba(221,185,47,0.09)' : 'transparent')};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 750 : 620)};
  text-decoration: none;
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(221,185,47,0.28)' : uxRebuildColors.border)};
  border-radius: ${uxRebuildRadius.input};
  color: ${({ $active }) => ($active ? uxRebuildColors.text : uxRebuildColors.secondary)};
  background: ${({ $active }) => ($active ? 'rgba(221,185,47,0.09)' : uxRebuildColors.card)};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 760 : 630)};
  text-decoration: none;
  transition: color ${uxRebuildMotion.fast}, border-color ${uxRebuildMotion.fast}, background ${uxRebuildMotion.fast};

  &:hover {
    border-color: rgba(221, 185, 47, 0.38);
    color: ${uxRebuildColors.text};
  }

  @media (min-width: 980px) {
    border-color: transparent;
    background: ${({ $active }) => ($active ? 'rgba(221,185,47,0.09)' : 'transparent')};
  }
`

const Main = styled.div`
  min-width: 0;
  max-width: 980px;
`

const Crumb = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-bottom: 18px;
  color: ${uxRebuildColors.muted};
  font-size: 12px;

  a {
    color: ${uxRebuildColors.secondary};
    text-decoration: none;
  }

  a:hover {
    color: ${uxRebuildColors.gold};
  }
`

const HeroGrid = styled.header`
  display: grid;
  gap: 22px;
  align-items: center;
  margin-bottom: 28px;

  @media (min-width: 760px) {
    grid-template-columns: minmax(0, 0.92fr) minmax(300px, 1.08fr);
  }
`

const HeroCopy = styled.div`
  min-width: 0;
`

const Eyebrow = styled.div`
  margin-bottom: 9px;
  color: ${uxRebuildColors.gold};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`

const H1 = styled.h1`
  margin: 0 0 12px;
  font-family: ${uxRebuildDisplayFont};
  font-size: clamp(30px, 4.4vw, 48px);
  line-height: 1.02;
  font-weight: 720;
  letter-spacing: -0.035em;
`

const Lead = styled.p`
  max-width: 600px;
  margin: 0;
  color: ${uxRebuildColors.bodySoft};
  font-size: 15px;
  line-height: 1.62;
`

const GuideIndex = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 12px;
  margin: -4px 0 18px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  background: rgba(13, 15, 17, 0.72);
`

const GuideIndexLabel = styled.span`
  align-self: center;
  padding: 0 5px;
  color: ${uxRebuildColors.muted};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const GuideIndexLink = styled.a`
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 0 10px;
  border-radius: ${uxRebuildRadius.pill};
  color: ${uxRebuildColors.secondary};
  background: rgba(255, 255, 255, 0.035);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;

  &:hover {
    color: ${uxRebuildColors.text};
    background: rgba(221, 185, 47, 0.09);
  }
`

const Section = styled.section`
  scroll-margin-top: 132px;
  padding: 22px 22px 20px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  margin-bottom: 10px;
  background: linear-gradient(145deg, rgba(20, 23, 26, 0.84), rgba(11, 13, 15, 0.94));
`

const H2 = styled.h2`
  margin: 0 0 9px;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildDisplayFont};
  font-size: 18px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.015em;
`

const Body = styled.div`
  max-width: 760px;
  color: ${uxRebuildColors.secondary};
  font-size: 14px;
  line-height: 1.67;

  p {
    margin: 0 0 11px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul,
  ol {
    margin: 0;
    padding-left: 19px;
  }

  li {
    margin-bottom: 7px;
  }

  li:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${uxRebuildColors.text};
    font-weight: 720;
  }
`

const Details = styled.details`
  scroll-margin-top: 132px;
  padding: 18px 20px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  margin-bottom: 10px;
  background: ${uxRebuildColors.card};

  summary {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: space-between;
    color: ${uxRebuildColors.text};
    font-size: 14px;
    font-weight: 730;
    list-style: none;
  }

  summary::after {
    color: ${uxRebuildColors.gold};
    content: '+';
    font-size: 18px;
    font-weight: 500;
  }

  &[open] summary::after {
    content: '−';
  }

  summary::-webkit-details-marker {
    display: none;
  }
`

const DetailsBody = styled(Body)`
  padding-top: 12px;
`

const HubGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 18px;

  @media (min-width: 620px) {
    grid-template-columns: 1fr 1fr;
  }
`

const HubCard = styled(Link)`
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 11px;
  min-height: 112px;
  align-items: start;
  padding: 17px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  color: inherit;
  background: ${uxRebuildColors.card};
  text-decoration: none;
  transition: transform ${uxRebuildMotion.standard}, border-color ${uxRebuildMotion.standard},
    background ${uxRebuildMotion.standard};

  &:hover {
    border-color: rgba(221, 185, 47, 0.4);
    background: ${uxRebuildColors.cardElevated};
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const HubCardIndex = styled.span`
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(221, 185, 47, 0.2);
  border-radius: 10px;
  color: ${uxRebuildColors.gold};
  background: rgba(221, 185, 47, 0.07);
  font-size: 10px;
  font-weight: 800;
`

const HubCardTitle = styled.div`
  margin: 1px 0 5px;
  color: ${uxRebuildColors.text};
  font-size: 14px;
  font-weight: 750;
`

const HubCardBody = styled.div`
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  line-height: 1.5;
`

const HubCardArrow = styled.span`
  color: ${uxRebuildColors.gold};
  font-size: 16px;
`

const PageNavigation = styled.nav`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 24px;
`

const PageNavigationLink = styled(Link)<{ $next?: boolean }>`
  display: flex;
  min-height: 68px;
  flex-direction: column;
  align-items: ${({ $next }) => ($next ? 'flex-end' : 'flex-start')};
  justify-content: center;
  padding: 12px 15px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  color: ${uxRebuildColors.text};
  background: ${uxRebuildColors.card};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;

  span {
    margin-bottom: 3px;
    color: ${uxRebuildColors.muted};
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  &:hover {
    border-color: rgba(221, 185, 47, 0.35);
  }
`

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 18px;
`

const Cta = styled(Link)`
  display: inline-flex;
  height: 42px;
  align-items: center;
  padding: 0 16px;
  border: 1px solid ${uxRebuildColors.gold};
  border-radius: ${uxRebuildRadius.button};
  color: #090a0b;
  background: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    background: ${uxRebuildColors.goldHover};
  }
`

const CtaGhost = styled(Link)`
  display: inline-flex;
  height: 42px;
  align-items: center;
  padding: 0 16px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.button};
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    border-color: ${uxRebuildColors.borderStrong};
    color: ${uxRebuildColors.text};
  }
`

export type LbDocsSection = {
  title: string
  body: React.ReactNode
  expandable?: boolean
  defaultOpen?: boolean
  summary?: string
}

type Props = {
  title: string
  lead: string
  path: string
  body?: string
  sections?: LbDocsSection[]
  hubCards?: { href: string; title: string; body: string }[]
  showHeroEyebrow?: boolean
  children?: React.ReactNode
}

function anchorFromTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function LbDocsPage({ title, lead, path, body, sections, hubCards, showHeroEyebrow = false, children }: Props) {
  const currentIndex = LB_DOCS_NAV.findIndex((item) => item.href === path)
  const previous = currentIndex > 0 ? LB_DOCS_NAV[currentIndex - 1] : null
  const next = currentIndex >= 0 && currentIndex < LB_DOCS_NAV.length - 1 ? LB_DOCS_NAV[currentIndex + 1] : null

  return (
    <Root data-melega-lb-docs data-path={path} data-testid="lb-docs-page">
      <PageMeta title={`${title} · AI Liquidity Builder Docs`} />
      <Inner>
        <Side>
          <SideHead>
            <SideEyebrow>Knowledge center</SideEyebrow>
            <SideTitle>Liquidity Builder</SideTitle>
          </SideHead>
          <MobileGuideNav>
            <summary>
              <span>
                {LB_DOCS_NAV[currentIndex]?.label || title}
                <MobileGuideMeta>
                  {Math.max(currentIndex, 0) + 1}/{LB_DOCS_NAV.length}
                </MobileGuideMeta>
              </span>
            </summary>
            <MobileGuideLinks aria-label="Liquidity Builder mobile docs">
              {LB_DOCS_NAV.map((item) => (
                <MobileGuideLink
                  key={item.href}
                  href={item.href}
                  $active={path === item.href}
                  aria-current={path === item.href ? 'page' : undefined}
                >
                  {item.label}
                </MobileGuideLink>
              ))}
            </MobileGuideLinks>
          </MobileGuideNav>
          <SideNav data-testid="lb-docs-nav" aria-label="Liquidity Builder docs">
            {LB_DOCS_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                $active={path === item.href}
                aria-current={path === item.href ? 'page' : undefined}
                data-testid={`lb-docs-nav-${item.href.split('/').pop() || 'hub'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </SideNav>
        </Side>

        <Main>
          <Crumb data-testid="lb-docs-crumb" aria-label="Breadcrumb">
            <Link href="/docs">Docs</Link>
            <span aria-hidden>›</span>
            <Link href="/docs/liquidity-builder">Liquidity Builder</Link>
            {path !== '/docs/liquidity-builder' ? (
              <>
                <span aria-hidden>›</span>
                <span>{title}</span>
              </>
            ) : null}
          </Crumb>

          <HeroGrid>
            <HeroCopy>
              <Eyebrow>
                {showHeroEyebrow ? 'Founder knowledge center' : `Guide ${Math.max(currentIndex, 1)} of 9`}
              </Eyebrow>
              <H1 data-testid="lb-docs-title">{title}</H1>
              <Lead data-testid="lb-docs-lead">{lead}</Lead>
              <CtaRow>
                <Cta href="/liquidity-studio?view=building" data-testid="lb-docs-open-builder">
                  Open Liquidity Builder
                </Cta>
                <CtaGhost href="/docs" data-testid="lb-docs-all-docs">
                  All Docs
                </CtaGhost>
              </CtaRow>
            </HeroCopy>
            <DocsVisual variant={VISUAL_BY_PATH[path] || 'hub'} />
          </HeroGrid>

          {sections && sections.length > 1 ? (
            <GuideIndex aria-label="On this page">
              <GuideIndexLabel>On this page</GuideIndexLabel>
              {sections.map((section) => (
                <GuideIndexLink key={section.title} href={`#${anchorFromTitle(section.title)}`}>
                  {section.title.replace(/^\d+\.\s*/, '')}
                </GuideIndexLink>
              ))}
            </GuideIndex>
          ) : null}

          {hubCards ? (
            <HubGrid data-testid="lb-docs-hub-grid">
              {hubCards.map((card, index) => (
                <HubCard key={card.href} href={card.href} data-testid="lb-docs-hub-card">
                  <HubCardIndex>{String(index + 1).padStart(2, '0')}</HubCardIndex>
                  <div>
                    <HubCardTitle>{card.title}</HubCardTitle>
                    <HubCardBody>{card.body}</HubCardBody>
                  </div>
                  <HubCardArrow aria-hidden>↗</HubCardArrow>
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

          {sections?.map((section) => {
            const id = anchorFromTitle(section.title)
            return section.expandable ? (
              <Details key={section.title} id={id} open={section.defaultOpen} data-testid="lb-docs-expandable">
                <summary>{section.summary || section.title}</summary>
                <DetailsBody>{section.body}</DetailsBody>
              </Details>
            ) : (
              <Section key={section.title} id={id} data-testid="lb-docs-section">
                <H2>{section.title}</H2>
                <Body>{section.body}</Body>
              </Section>
            )
          })}

          {children}

          {previous || next ? (
            <PageNavigation aria-label="Documentation pagination">
              {previous ? (
                <PageNavigationLink href={previous.href}>
                  <span>← Previous</span>
                  {previous.label}
                </PageNavigationLink>
              ) : (
                <span />
              )}
              {next ? (
                <PageNavigationLink href={next.href} $next>
                  <span>Next →</span>
                  {next.label}
                </PageNavigationLink>
              ) : (
                <span />
              )}
            </PageNavigation>
          ) : null}
        </Main>
      </Inner>
    </Root>
  )
}

LbDocsPage.chains = CHAIN_IDS
