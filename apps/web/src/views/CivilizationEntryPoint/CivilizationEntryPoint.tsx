import React, { useMemo } from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveHomepageBlueprint } from 'lib/homepage-blueprint'
import { resolveHomepageLiveSections } from 'lib/homepage-live'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHeroBanner,
  EconomicHumanLayer,
  EconomicStatusSummary,
  EconomicActionCard,
  EconomicAiLayer,
  EconomicManifestLink,
  EconomicFooter,
} from 'views/EconomicOS/components'
import {
  HumanSwapEntryCard,
  HumanListingCta,
  HumanDynamicSection,
  HomeLiveSwaps,
} from 'views/HumanCore'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const MACHINE_DISCOVERY = [
  { label: 'Surface Map', uri: '/map' },
  { label: 'Homepage Manifest', uri: '/registry/homepage/index.json' },
  { label: 'Surface Index', uri: '/registry/surfaces/index.json' },
  { label: 'UX Constitution', uri: '/registry/design/melega-dex-ux-constitution-v1-2.json' },
]

const Ribbon = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const RibbonChip = styled(Link)`
  flex: 0 0 auto;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid ${tokens.border};
  background: ${tokens.surface};
  font-size: 13px;
  color: ${tokens.text};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.gold};
  }
`

const SwapRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 900px) {
    grid-template-columns: 1.2fr 1fr;
    align-items: stretch;
  }
`

const QuickRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const Quick = styled(Link)`
  padding: 18px 16px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  background: ${tokens.surface};
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.text};
  text-align: center;

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.gold};
  }
`

const CivilizationEntryPoint: React.FC = () => {
  const blueprint = resolveHomepageBlueprint()
  const live = useMemo(() => resolveHomepageLiveSections(), [])

  return (
    <>
      <Head>
        <link rel="alternate" type="application/json" href="/registry/homepage/index.json" title="Melega Homepage Manifest" />
        <link rel="alternate" type="application/json" href="/registry/surfaces/index.json" title="Melega Surface Map" />
      </Head>
      <EconomicPageShell>
        {live.trendingRibbon.length > 0 && (
          <Ribbon aria-label="Trending">
            {live.trendingRibbon.map((item) => (
              <RibbonChip key={item.id} href={item.href}>
                {item.label}
              </RibbonChip>
            ))}
          </Ribbon>
        )}

        <EconomicHeroBanner
          eyebrow="Melega DEX"
          title="Live economic exchange"
          subtitle="Swap, earn, create, and explore — one premium operating system for humans and machines."
          badges={[
            { label: 'Live on BNB Chain', status: 'LIVE' },
            { label: blueprint.constitutional.canonicalAsset, status: blueprint.constitutional.status },
          ]}
        />

        <EconomicHumanLayer>
          <EconomicStatusSummary
            items={[
              { label: 'Network', value: blueprint.constitutional.canonicalChain },
              { label: 'Asset', value: blueprint.constitutional.canonicalAsset },
              { label: 'Status', value: '', status: blueprint.constitutional.status },
            ]}
          />

          <SwapRow>
            <HumanSwapEntryCard />
            <HumanListingCta href="/launch" />
          </SwapRow>

          <QuickRow>
            <Quick href="/farms">Earn</Quick>
            <Quick href="/launch">Create</Quick>
            <Quick href="/projects">Explore</Quick>
            <Quick href="/workspace">My Economy</Quick>
          </QuickRow>

          <HumanDynamicSection
            title="Top farms"
            seeAllHref="/farms"
            items={live.topFarms}
            emptyMessage="No farms indexed yet. Stake LP tokens on Earn when available."
          />

          <HumanDynamicSection
            title="Staking pools"
            seeAllHref="/pools"
            items={live.topPools}
            emptyMessage="No staking pools indexed yet. Reward MARCO holders from Create when available."
          />

          <HumanDynamicSection
            title="Trending projects"
            seeAllHref="/projects"
            items={live.trendingProjects}
            emptyMessage="No projects indexed yet. Explore the registry as listings are approved."
          />

          <HumanDynamicSection
            title="Trending assets"
            seeAllHref="/assets"
            items={live.trendingAssets}
            emptyMessage="No assets indexed yet."
          />

          <HomeLiveSwaps />

          <EconomicActionCard
            href="/projects"
            title="Explore"
            description="Projects, assets, collectibles, and presence — discover the Melega civilization."
            actionLabel="Open Explore"
            icon="⊕"
          />

          <EconomicActionCard
            href="/workspace"
            title="My Economy"
            description="Your activity, positions, and projects in one calm cockpit."
            actionLabel="Open My Economy"
            icon="◎"
          />
        </EconomicHumanLayer>

        <EconomicAiLayer title="AI agent details">
          <EconomicManifestLink manifests={MACHINE_DISCOVERY} />
        </EconomicAiLayer>

        <EconomicFooter />
      </EconomicPageShell>
    </>
  )
}

export default CivilizationEntryPoint
