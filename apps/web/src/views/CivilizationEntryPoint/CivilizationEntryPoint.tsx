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
  EconomicHero,
  EconomicStatusSummary,
  EconomicActionGrid,
  EconomicSection,
  EconomicDetailToggle,
  EconomicManifestLink,
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

const Framing = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
  max-width: 640px;
`

const Note = styled.p`
  margin: 0 0 12px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
`

const CivilizationEntryPoint: React.FC = () => {
  const blueprint = resolveHomepageBlueprint()

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
        <EconomicHero
          title={`${blueprint.constitutional.canonicalAsset} on ${blueprint.constitutional.canonicalChain}`}
          subtitle={t('Homepage constitutional subtitle')}
        >
          <Framing>{blueprint.constitutional.framing}</Framing>
        </EconomicHero>

        <EconomicStatusSummary
          items={[
            { label: t('CMD chain label'), value: blueprint.constitutional.canonicalChain },
            { label: t('CMD asset label'), value: blueprint.constitutional.canonicalAsset },
            { label: t('CMD status label'), value: '', status: blueprint.constitutional.status },
          ]}
        />

        <EconomicSection title={t('Homepage value proposition title')} lead={t('Homepage value proposition body')}>
          {null}
        </EconomicSection>

        <EconomicSection title={t('Homepage core actions title')}>
          <EconomicActionGrid
            links={CORE_SURFACES.map((surface) => ({
              label: surface.label,
              href: surface.route,
            }))}
          />
        </EconomicSection>

        <EconomicSection title={t('Homepage registry strip title')}>
          <EconomicActionGrid
            links={SECONDARY_SURFACES.map((surface) => ({
              label: surface.label,
              href: surface.route,
            }))}
          />
        </EconomicSection>

        <EconomicDetailToggle title={t('Homepage advanced title')}>
          <EconomicActionGrid
            links={ADVANCED_SURFACES.map((surface) => ({
              label: surface.label,
              href: surface.route,
            }))}
          />
        </EconomicDetailToggle>

        <EconomicDetailToggle title={t('Homepage legacy title')}>
          <Note>{t('Homepage legacy note')}</Note>
          <EconomicActionGrid
            links={LEGACY_SURFACES.map((surface) => ({
              label: surface.label,
              href: surface.route,
            }))}
          />
        </EconomicDetailToggle>

        <EconomicDetailToggle title={t('Homepage machine discovery title')}>
          <Note>{t('Homepage machine discovery note')}</Note>
          <EconomicManifestLink manifests={MACHINE_DISCOVERY} />
        </EconomicDetailToggle>
      </EconomicPageShell>
    </>
  )
}

export default CivilizationEntryPoint
