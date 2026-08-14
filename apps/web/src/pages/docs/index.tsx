/**
 * Melega DEX documentation — factual product descriptions (presentation only).
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import { MELEGA_FACTORY_BSC, MELEGA_ROUTER_BSC, MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { uxRebuildColors, uxRebuildFont, uxRebuildLayout, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

type DocSection = {
  id: string
  title: string
  body: string
  href?: string
}

const SECTIONS: DocSection[] = [
  {
    id: 'home',
    title: 'Home',
    href: '/',
    body: 'The Home surface combines Instant Swap and Smart Swap in one terminal, plus live market modules (KPIs, featured projects, trending, farms, pools, listings) when indexer and registry data are available. Missing metrics show as unavailable rather than invented values.',
  },
  {
    id: 'instant-swap',
    title: 'Instant Swap',
    href: '/swap',
    body: 'Classic AMM swap against Melega Factory pairs on the active chain. Quotes and execution use the on-page swap terminal; wallet connection and network selection are required before a transaction can be submitted.',
  },
  {
    id: 'smart-swap',
    title: 'Smart Swap',
    href: '/trade',
    body: 'Smart Swap is the assisted routing mode in the same Home/Trade terminal. It prepares a swap preview and execution handoff; it does not guarantee better prices or outcomes than Instant Swap.',
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    href: '/liquidity',
    body: 'Add or remove liquidity for Melega AMM pairs. Liquidity Studio and related surfaces read Factory-indexed pairs and wallet balances; creating a new pair still depends on on-chain Factory state.',
  },
  {
    id: 'ai-liquidity-builder',
    title: 'AI Liquidity Builder',
    href: '/docs/liquidity-builder',
    body: 'Knowledge center for AI Liquidity Builder — automatically grow and optimize your token liquidity. Product surface: /liquidity-studio. Guides under /docs/liquidity-builder/.',
  },
  {
    id: 'lb-overview',
    title: 'LB Overview',
    href: '/docs/liquidity-builder/overview',
    body: 'Founder overview of Token to Grow, Create Market Against, Token Reserve, goals, and strategies.',
  },
  {
    id: 'lb-how-it-works',
    title: 'LB How it Works',
    href: '/docs/liquidity-builder/how-it-works',
    body: 'Seven steps from choosing a token to activating a program and monitoring the portfolio.',
  },
  {
    id: 'lb-token-reserve',
    title: 'Token Reserve',
    href: '/docs/liquidity-builder/token-reserve',
    body: 'Token Reserve is the project-token amount deposited into Liquidity Builder. It is not a WBNB budget. Create Market Against stays separate.',
  },
  {
    id: 'lb-liquidity-goals',
    title: 'Liquidity Goals',
    href: '/docs/liquidity-builder/liquidity-goals',
    body: 'Steady Growth, Deeper Market, and Launch Support — founder goals with plain-language tooltips.',
  },
  {
    id: 'lb-strategies',
    title: 'Liquidity Strategies',
    href: '/docs/liquidity-builder/strategies',
    body: 'Conservative, Balanced, AI Optimized, and Aggressive presets map to existing on-chain strategy modes without changing fee economics.',
  },
  {
    id: 'lb-execution',
    title: 'Program Execution',
    href: '/docs/liquidity-builder/execution',
    body: 'Activation creates a program, deposits Token Reserve, and enables market-driven growth steps under your chosen strategy and check frequency.',
  },
  {
    id: 'lb-fees',
    title: 'Liquidity Builder Fees',
    href: '/docs/liquidity-builder/fees',
    body: '10% protocol fee path: Program → FeeSink → FeeReceiver → MELEGA TREASURY. No Treasury Runtime.',
  },
  {
    id: 'lb-risk-safety',
    title: 'LB Risk & Safety',
    href: '/docs/liquidity-builder/risk-safety',
    body: 'Liquidity does not guarantee price. Strategies optimize execution. Pause and safety controls.',
  },
  {
    id: 'lb-examples',
    title: 'LB Examples',
    href: '/docs/liquidity-builder/examples',
    body: 'New token launch and existing multi-market project setups.',
  },
  {
    id: 'farms',
    title: 'Farms',
    href: '/farms',
    body: 'Farms surface MasterChef / MasterBuilder staking positions where inventory and APR/TVL can be hydrated from live sources. Rows without certified metrics remain unavailable.',
  },
  {
    id: 'pools',
    title: 'Pools',
    href: '/pools',
    body: 'Pools lists staking and Factory AMM inventory. Classification and cards are driven by registry/indexer data; empty or incomplete rows are shown honestly.',
  },
  {
    id: 'list',
    title: 'List',
    href: '/list',
    body: 'List is the project onboarding / listing studio. Submissions and profiles follow registry workflows; listing does not imply endorsement or audit coverage.',
  },
  {
    id: 'project-pages',
    title: 'Project Pages',
    href: '/projects',
    body: 'Project Pages (`/@slug`) present registry-backed identity, markets, and readiness signals for indexed projects. Civilization readiness scores are informational, not safety ratings.',
  },
  {
    id: 'passport',
    title: 'Passport',
    href: 'https://marco.melega.ai',
    body: 'Passport is the Melega identity and portfolio hub (Marco). It is a separate product surface from the DEX wallet connection used for swaps and liquidity.',
  },
  {
    id: 'wallet',
    title: 'Wallet connection',
    body: 'Connect a supported browser wallet through the app wallet modal. The DEX never custodially holds private keys. Always confirm the active chain (BSC mainnet for production Melega AMM) before signing.',
  },
  {
    id: 'slippage',
    title: 'Slippage',
    body: 'Slippage tolerance is set in swap settings. Higher tolerance increases fill chance in volatile markets and also increases worst-case price impact. There is no guaranteed fill price beyond the minimum you accept in the transaction.',
  },
  {
    id: 'fees',
    title: 'Fees',
    href: '/pricing-fees',
    body: 'Swaps and liquidity actions incur AMM trading fees and network (gas) fees. See Pricing & Fees for the published fee surface. Fee schedules can change; on-chain parameters and the live UI are the source of truth for a given transaction.',
  },
  {
    id: 'risks',
    title: 'Risks',
    body: 'DeFi involves smart-contract, market, oracle, and operational risk. Tokens may be illiquid or malicious. Always verify contract addresses on a block explorer. This documentation is not investment advice and is not a substitute for independent due diligence or a formal smart-contract audit.',
  },
  {
    id: 'contracts',
    title: 'Contract addresses',
    href: '/audit',
    body: `Primary Melega AMM contracts on BSC (chain id ${MELEGA_CHAIN_ID}): Factory ${MELEGA_FACTORY_BSC}; Router ${MELEGA_ROUTER_BSC}. Addresses are presented for verification only — see the Audit / telemetry page for explorer links and additional core contracts from the indexer constants.`,
  },
  {
    id: 'networks',
    title: 'Supported networks',
    body: 'Production Melega AMM liquidity and indexing described here target BNB Smart Chain (BSC, chain id 56). Other chains in the wallet selector, if present, do not imply Melega Factory/Router parity unless explicitly documented for that chain.',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    href: '/support',
    body: 'Wallet will not connect: unlock the extension, approve the site, and confirm BSC (56). Wrong network: use the network switcher before signing. Quote stuck or unavailable: refresh price, check pair liquidity, and raise slippage only if you accept worse fill. Metrics show — / unavailable: indexer or subgraph has no factual value — do not treat empty as zero. Activate unavailable in AI Liquidity Builder: program contracts or activation gates are not ready; entered setup is retained. Token search opens behind chrome: use the latest shell build (modal layer above TOP MOVERS). For community help see Support.',
  },
]

const Root = styled.div`
  min-height: 70vh;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  padding: 40px 24px 64px;
`

const Inner = styled.div`
  width: 100%;
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Side = styled.nav`
  position: sticky;
  top: 88px;
  padding: 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};

  @media (max-width: 900px) {
    position: static;
  }
`

const SideTitle = styled.div`
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${uxRebuildColors.gold};
  margin-bottom: 12px;
`

const SideLink = styled.a`
  display: block;
  font-size: 13px;
  line-height: 20px;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;
  padding: 4px 0;

  &:hover {
    color: ${uxRebuildColors.gold};
  }
`

const Main = styled.div`
  min-width: 0;
`

const H1 = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
`

const Lead = styled.p`
  margin: 0 0 24px;
  color: ${uxRebuildColors.bodySoft};
  line-height: 1.55;
  max-width: 720px;
`

const Card = styled.section`
  margin-bottom: 12px;
  padding: 18px 18px 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
`

const H2 = styled.h2`
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 750;
`

const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: ${uxRebuildColors.secondary};
`

const Meta = styled.div`
  margin-top: 10px;
  font-size: 12px;
`

const MetaLink = styled(Link)`
  color: ${uxRebuildColors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ExternalMeta = styled.a`
  color: ${uxRebuildColors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Note = styled.p`
  margin: 20px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: ${uxRebuildColors.muted};
`

const DocsPage: React.FC = () => (
  <Root data-melega-docs-page>
    <PageMeta title="Docs" />
    <Inner>
      <Side aria-label="Documentation sections">
        <SideTitle>Contents</SideTitle>
        {SECTIONS.map((s) => (
          <SideLink key={s.id} href={`#${s.id}`}>
            {s.title}
          </SideLink>
        ))}
      </Side>
      <Main>
        <H1>Melega DEX Docs</H1>
        <Lead>
          Factual descriptions of current Melega DEX product surfaces. This page describes how the app behaves today —
          it does not promise future features, audit outcomes, or investment returns.
        </Lead>
        {SECTIONS.map((s) => (
          <Card key={s.id} id={s.id}>
            <H2>{s.title}</H2>
            <Body>{s.body}</Body>
            {s.href ? (
              <Meta>
                {s.href.startsWith('http') ? (
                  <ExternalMeta href={s.href} target="_blank" rel="noopener noreferrer">
                    Open {s.title} →
                  </ExternalMeta>
                ) : (
                  <MetaLink href={s.href}>Open {s.title} →</MetaLink>
                )}
              </Meta>
            ) : null}
          </Card>
        ))}
        <Card id="contract-addresses-table">
          <H2>Contract address reference</H2>
          <Body>
            Factory: <code>{MELEGA_FACTORY_BSC}</code>
            <br />
            Router: <code>{MELEGA_ROUTER_BSC}</code>
          </Body>
        </Card>
        <Note>
          Factory and Router addresses above are for presentation and verification. Always confirm on BscScan before
          interacting. Formal smart-contract audit status: see <MetaLink href="/audit">/audit</MetaLink>.
        </Note>
      </Main>
    </Inner>
  </Root>
)

DocsPage.chains = CHAIN_IDS

export default DocsPage
