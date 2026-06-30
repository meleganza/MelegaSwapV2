import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  getGroupedVisibleSurfaces,
  resolveSurfaceMapReadModel,
  SurfaceRecord,
} from 'lib/surface-map'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicCard,
  EconomicBadge,
  EconomicStatusSummary,
  EconomicActionGrid,
  EconomicDetailToggle,
  EconomicManifestLink,
} from 'views/EconomicOS/components'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Meta = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
`

const RouteLink = styled.a`
  font-size: 12px;
  color: ${tokens.gold};
  text-decoration: none;
  font-family: monospace;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

const SurfaceSummary: React.FC<{ surface: SurfaceRecord }> = ({ surface }) => (
  <EconomicCard title={surface.label}>
    <BadgeRow>
      <EconomicBadge status={surface.status} />
      <EconomicBadge status={surface.visibility} />
      {surface.executionRisk !== 'none' && (
        <Meta as="span" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          risk: {surface.executionRisk}
        </Meta>
      )}
    </BadgeRow>
    <RouteLink href={surface.route}>{surface.route}</RouteLink>
    <Meta style={{ marginTop: 8 }}>{surface.humanPurpose}</Meta>
    <EconomicDetailToggle title={t('Surface map agent purpose')}>
      {surface.replacementRoute && (
        <Meta>
          {t('Surface map replacement')}:{' '}
          <Link href={surface.replacementRoute} style={{ color: tokens.gold }}>
            {surface.replacementRoute}
          </Link>
        </Meta>
      )}
      <Meta style={{ marginTop: 8 }}>
        <strong style={{ color: tokens.gold, fontSize: 10, letterSpacing: '0.1em' }}>
          {t('Surface map agent purpose')}
        </strong>
        <br />
        {surface.agentPurpose}
      </Meta>
      <Meta style={{ marginTop: 8 }}>
        <strong style={{ color: tokens.gold, fontSize: 10, letterSpacing: '0.1em' }}>
          {t('Surface map data source')}
        </strong>
        <br />
        {surface.dataSource}
      </Meta>
      {surface.manifestUri && (
        <EconomicManifestLink
          manifests={[{ label: t('Surface map manifest'), uri: surface.manifestUri }]}
        />
      )}
    </EconomicDetailToggle>
  </EconomicCard>
)

const SurfaceMapConsole: React.FC = () => {
  const model = resolveSurfaceMapReadModel()
  const grouped = getGroupedVisibleSurfaces()

  return (
    <EconomicPageShell>
      <EconomicHero
        title={t('Surface map page title')}
        subtitle={t('Surface map page subtitle')}
      />

      <EconomicSection title={t('Surface map summary title')}>
        <EconomicStatusSummary
          items={[
            { label: t('Surface map total surfaces'), value: String(model.summary.total) },
            { label: t('Surface map with manifest'), value: String(model.summary.withManifest) },
            { label: t('Surface map retired'), value: String(model.summary.retired) },
            {
              label: t('Surface map live on chain'),
              value: String(model.summary.byStatus.live ?? 0),
            },
          ]}
        />
        <Meta style={{ marginTop: 12 }}>{model.disclaimer}</Meta>
      </EconomicSection>

      {grouped.map(({ group, surfaces }) => (
        <EconomicSection
          key={group.id}
          title={group.label}
          lead={group.description}
        >
          {surfaces.map((surface) => (
            <SurfaceSummary key={surface.id} surface={surface} />
          ))}
          <EconomicDetailToggle title={t('Surface map agent summary')}>
            <Meta>{group.agentSummary}</Meta>
          </EconomicDetailToggle>
        </EconomicSection>
      ))}

      <EconomicDetailToggle title={t('Surface map manifest title')}>
        <EconomicManifestLink
          manifests={[
            { label: t('Surface map manifest note'), uri: '/registry/surfaces/index.json' },
            {
              label: t('Bridge manifest note'),
              uri: '/registry/bridges/submission-review-intake.json',
            },
            {
              label: t('Dry run manifest note'),
              uri: '/registry/dry-runs/civilization-dry-run.json',
            },
          ]}
        />
        <EconomicActionGrid
          links={[
            { label: t('Pipeline cross link'), href: '/pipeline' },
            { label: t('Runtime cross link'), href: '/runtime/labs' },
            { label: t('Orchestrator cross link'), href: '/orchestrator' },
            { label: t('Submission cross link'), href: '/submit' },
            { label: t('Review cross link'), href: '/review' },
            { label: 'Dry run', href: '/dry-run' },
          ]}
        />
        <Meta style={{ marginTop: 12 }}>
          Read-only · execution disabled · as of {model.asOf}
        </Meta>
      </EconomicDetailToggle>
    </EconomicPageShell>
  )
}

export default SurfaceMapConsole
