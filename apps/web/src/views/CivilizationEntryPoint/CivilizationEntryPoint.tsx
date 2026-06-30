import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  ADVANCED_SURFACES,
  CORE_SURFACES,
  LEGACY_SURFACES,
  SECONDARY_SURFACES,
  resolveHomepageBlueprint,
} from 'lib/homepage-blueprint'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHeroBanner,
  EconomicHumanLayer,
  EconomicStatusSummary,
  EconomicActionCard,
  EconomicSection,
  EconomicCard,
  EconomicActionGrid,
  EconomicAiLayer,
  EconomicManifestLink,
  EconomicFooter,
} from 'views/EconomicOS/components'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const MACHINE_DISCOVERY = [
  { label: 'Surface Map', uri: '/map' },
  { label: 'Labs Economic Pipeline', uri: '/registry/pipeline/labs-economic-pipeline.json' },
  { label: 'Mainnet Readiness Gate', uri: '/registry/readiness/mainnet-gate.json' },
  { label: 'Homepage Blueprint', uri: '/registry/blueprints/homepage-entry-point.json' },
  { label: 'Homepage Manifest', uri: '/registry/homepage/index.json' },
  { label: 'Surface Index', uri: '/registry/surfaces/index.json' },
]

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const Note = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
`

const CORE_ICONS: Record<string, string> = {
  swap: '⇄',
  workspace: '◎',
  launch: '◇',
  map: '⊞',
}

const CivilizationEntryPoint: React.FC = () => {
  const blueprint = resolveHomepageBlueprint()
  const primarySurfaces = CORE_SURFACES.filter((s) => ['swap', 'workspace', 'launch'].includes(s.id))

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/json"
          href="/registry/homepage/index.json"
          title="Melega Homepage Manifest"
        />
        <link
          rel="alternate"
          type="application/json"
          href="/registry/blueprints/homepage-entry-point.json"
          title="Melega Homepage Blueprint"
        />
        <link
          rel="alternate"
          type="application/json"
          href="/registry/surfaces/index.json"
          title="Melega Surface Map"
        />
      </Head>
      <EconomicPageShell>
        <EconomicHeroBanner
          eyebrow={t('Homepage hero eyebrow')}
          title={t('Homepage hero title')}
          subtitle={t('Homepage constitutional subtitle')}
          badges={[
            { label: 'Live on BNB Chain', status: 'LIVE' },
            { label: 'Canonical Economy', status: blueprint.constitutional.status },
          ]}
        />

        <EconomicHumanLayer>
          <EconomicStatusSummary
            items={[
              { label: t('CMD asset label'), value: blueprint.constitutional.canonicalAsset },
              { label: t('CMD chain label'), value: blueprint.constitutional.canonicalChain },
              { label: t('CMD status label'), value: '', status: blueprint.constitutional.status },
              { label: 'Overall', value: '', status: 'READY' },
            ]}
          />

          <EconomicSection title={t('Homepage core actions title')}>
            <ActionRow>
              {primarySurfaces.map((surface) => (
                <EconomicActionCard
                  key={surface.id}
                  href={surface.route}
                  title={surface.label}
                  description={surface.humanPurpose}
                  actionLabel={`Open ${surface.label}`}
                  icon={CORE_ICONS[surface.id]}
                />
              ))}
            </ActionRow>
          </EconomicSection>

          <EconomicSection
            title={t('Homepage value proposition title')}
            lead={t('Homepage value proposition body')}
          >
            <EconomicCard elevated>
              {blueprint.constitutional.framing}
            </EconomicCard>
          </EconomicSection>

          <EconomicSection title={t('Homepage registry strip title')}>
            <EconomicActionGrid
              links={SECONDARY_SURFACES.map((surface) => ({
                label: surface.label,
                href: surface.route,
              }))}
            />
          </EconomicSection>
        </EconomicHumanLayer>

        <EconomicAiLayer title={t('Homepage advanced title')}>
          <EconomicActionGrid
            links={ADVANCED_SURFACES.map((surface) => ({
              label: surface.label,
              href: surface.route,
            }))}
          />
        </EconomicAiLayer>

        <EconomicAiLayer title={t('Homepage legacy title')}>
          <Note>{t('Homepage legacy note')}</Note>
          <EconomicActionGrid
            links={LEGACY_SURFACES.map((surface) => ({
              label: surface.label,
              href: surface.route,
            }))}
          />
        </EconomicAiLayer>

        <EconomicAiLayer title={t('Homepage machine discovery title')}>
          <Note>{t('Homepage machine discovery note')}</Note>
          <EconomicManifestLink manifests={MACHINE_DISCOVERY} />
        </EconomicAiLayer>

        <EconomicFooter />
      </EconomicPageShell>
    </>
  )
}

export default CivilizationEntryPoint
