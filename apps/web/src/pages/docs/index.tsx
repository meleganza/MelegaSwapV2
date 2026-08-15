import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import { MELEGA_FACTORY_BSC, MELEGA_ROUTER_BSC, MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import DocsVisual, { type DocsVisualVariant } from 'views/Docs/DocsVisual'
import {
  Eyebrow,
  HeroCopy,
  HeroLead,
  HeroTitle,
  NavLink,
  NavTitle,
  Panel,
  PanelBody,
  PanelTitle,
  PortalFooter,
  PortalHero,
  PortalInner,
  PortalPage,
  SideNav,
  StatusPill,
  StatusRow,
} from 'views/DeveloperPortal/PortalShell'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'

type Guide = {
  id: string
  title: string
  lead: string
  steps: string[]
  href: string
  visual: DocsVisualVariant
}

const GUIDES: Guide[] = [
  {
    id: 'swap',
    title: 'Swap',
    lead: 'Trade through the route presented by Smart Swap. The wallet signs the final router call; a quote is not a completed trade.',
    steps: [
      'Choose the input and output tokens.',
      'Enter the amount and review output, minimum received, impact and fees.',
      'Confirm the correct network and approve the wallet transaction.',
    ],
    href: '/swap',
    visual: 'swap',
  },
  {
    id: 'bridge',
    title: 'MARCO Bridge',
    lead: 'Move MARCO only across routes shown as available by the live bridge capability. Delivery is tracked from source to destination.',
    steps: [
      'Choose source and destination networks.',
      'Confirm destination wallet and live quote.',
      'Sign and retain the tracked delivery reference.',
    ],
    href: '/bridge',
    visual: 'bridge',
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    lead: 'Add or remove liquidity from a Factory-backed pair. My Liquidity is derived from the connected wallet and indexed pair state.',
    steps: [
      'Select an existing pair or create a market when available.',
      'Enter both token amounts.',
      'Review pool share and confirm the wallet action.',
    ],
    href: '/liquidity',
    visual: 'liquidity',
  },
  {
    id: 'farms',
    title: 'Farms',
    lead: 'Stake LP tokens in an active farm. APR, TVL, participants and duration are shown only when their source can be certified.',
    steps: [
      'Choose an active farm and verify the LP pair.',
      'Approve and stake the LP amount.',
      'Track rewards and unstake from My Farms.',
    ],
    href: '/farms',
    visual: 'farms',
  },
  {
    id: 'pools',
    title: 'Pools',
    lead: 'Stake the displayed token to earn the displayed reward token. A pool should be treated as active only when rewards are funded.',
    steps: [
      'Verify stake token, reward token and live state.',
      'Approve and stake the chosen amount.',
      'Harvest or unstake through My Pools.',
    ],
    href: '/pools',
    visual: 'pools',
  },
  {
    id: 'projects',
    title: 'Projects & Project Pages',
    lead: 'Discover registry-backed projects, inspect market facts, and open the project-specific Smart Swap configuration.',
    steps: [
      'Search or filter indexed projects.',
      'Open the Project Page and verify contract identity.',
      'Use the embedded market actions when available.',
    ],
    href: '/projects',
    visual: 'projects',
  },
  {
    id: 'boost',
    title: 'Boost Your Project',
    lead: 'Purchase eligible visibility for an indexed Project Page. Paid placement activates only after verified settlement and reconciliation.',
    steps: [
      'Detect the project and choose an eligible service target.',
      'Choose duration and executable payment rail.',
      'Complete payment and retain the activation receipt.',
    ],
    href: '/projects',
    visual: 'boost',
  },
  {
    id: 'payments',
    title: 'MARCO Pay & M-Credits',
    lead: 'MARCO Pay uses the canonical application and signed server callback. M-Credits appears only when the selected product can complete that rail.',
    steps: [
      'Review the server-owned service total.',
      'Approve the canonical MARCO Pay request.',
      'Wait for Payment Confirmed and Service Active; do not pay twice while activation is reconciling.',
    ],
    href: '/pricing-fees',
    visual: 'payments',
  },
]

const DocsGrid = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const DocsSideNav = styled(SideNav)`
  position: sticky;
  top: 148px;
  align-self: start;
  max-height: calc(100vh - 172px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;

  @media (max-width: 900px) {
    position: static;
    max-height: none;
    overflow: visible;
  }
`

const Guide = styled(Panel)`
  scroll-margin-top: 94px;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr);
  gap: 18px;
  align-items: stretch;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`

const Steps = styled.ol`
  margin: 14px 0 0;
  padding-left: 20px;
  color: ${uxRebuildColors.secondary};
  font-size: 13px;
  line-height: 1.65;
`

const Open = styled(Link)`
  margin-top: 14px;
  color: ${uxRebuildColors.gold};
  display: inline-flex;
  text-decoration: none;
  font-size: 13px;
  font-weight: 720;
`

const CodeLine = styled.code`
  overflow-wrap: anywhere;
  color: ${uxRebuildColors.text};
`

const DocsPage: NextPageWithLayout = () => (
  <>
    <PageMeta title="Docs" />
    <PortalPage data-melega-docs-page>
      <PortalInner>
        <PortalHero>
          <HeroCopy>
            <Eyebrow>◫ Melega DEX knowledge center</Eyebrow>
            <HeroTitle>Docs</HeroTitle>
            <HeroLead>Clear product guides, current execution boundaries, and honest operational states.</HeroLead>
          </HeroCopy>
          <StatusRow>
            <StatusPill $ok>Current product surfaces</StatusPill>
            <StatusPill>BSC chain {MELEGA_CHAIN_ID}</StatusPill>
          </StatusRow>
        </PortalHero>

        <DocsGrid>
          <DocsSideNav aria-label="Documentation sections" data-testid="docs-sticky-navigation">
            <NavTitle>Product guides</NavTitle>
            {GUIDES.map((guide) => (
              <NavLink key={guide.id} href={`#${guide.id}`}>
                {guide.title}
              </NavLink>
            ))}
            <NavTitle style={{ marginTop: 18 }}>Developer resources</NavTitle>
            <NavLink href="/docs/liquidity-builder">AI Liquidity Builder</NavLink>
            <NavLink href="/api-agents">API &amp; Agents</NavLink>
            <NavLink href="/devs">Embeddable widgets</NavLink>
            <NavLink href="#contracts">Contracts &amp; safety</NavLink>
          </DocsSideNav>

          <div style={{ display: 'grid', gap: 14, minWidth: 0 }}>
            {GUIDES.map((guide) => (
              <Guide key={guide.id} id={guide.id}>
                <div>
                  <PanelTitle>{guide.title}</PanelTitle>
                  <PanelBody>{guide.lead}</PanelBody>
                  <Steps>
                    {guide.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </Steps>
                  <Open href={guide.href}>Open {guide.title} →</Open>
                </div>
                <DocsVisual variant={guide.visual} />
              </Guide>
            ))}

            <Panel id="contracts" style={{ scrollMarginTop: 94 }}>
              <PanelTitle>Contracts, network &amp; safety</PanelTitle>
              <PanelBody>
                Production Melega AMM execution documented here targets BNB Smart Chain (chain id {MELEGA_CHAIN_ID}).
                Always verify the active network, token contract, router and recipient in the wallet before signing.
                Never share a seed phrase or private key.
              </PanelBody>
              <div style={{ marginTop: 14, display: 'grid', gap: 8, fontSize: 12, color: uxRebuildColors.secondary }}>
                <div>
                  Factory: <CodeLine>{MELEGA_FACTORY_BSC}</CodeLine>
                </div>
                <div>
                  Router: <CodeLine>{MELEGA_ROUTER_BSC}</CodeLine>
                </div>
              </div>
              <Open href="/audit">Open live audit &amp; telemetry →</Open>
            </Panel>
          </div>
        </DocsGrid>
        <PortalFooter />
      </PortalInner>
    </PortalPage>
  </>
)

DocsPage.chains = CHAIN_IDS

export default DocsPage
