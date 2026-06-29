import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  getGroupedVisibleSurfaces,
  resolveSurfaceMapReadModel,
  SurfaceRecord,
  SurfaceStatus,
} from 'lib/surface-map'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Root = styled.div`
  min-height: 100vh;
  background: ${tokens.bg};
  color: ${tokens.text};
  font-family: ${tokens.fontBody};
  padding: 24px 24px 48px;
`

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${tokens.goldHighlight};
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const Panel = styled.section`
  background: ${tokens.surfaceGlass};
  backdrop-filter: blur(14px);
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radius};
  padding: 20px;
`

const PanelTitle = styled.h2`
  margin: 0 0 16px;
  font-family: ${tokens.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${tokens.gold};
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const SummaryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const SummaryCell = styled.div`
  padding: 10px 14px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 12px;
  color: ${tokens.textSecondary};

  strong {
    display: block;
    color: ${tokens.text};
    font-size: 18px;
    margin-bottom: 2px;
  }
`

const GroupBlock = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`

const GroupHeader = styled.div`
  margin-bottom: 12px;
`

const GroupName = styled.h3`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${tokens.goldHighlight};
`

const SurfaceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SurfaceRow = styled.div<{ $status: SurfaceStatus }>`
  border: 1px solid ${tokens.border};
  border-left: 3px solid
    ${({ $status }) =>
      $status === 'live'
        ? tokens.success
        : $status === 'read_model'
          ? tokens.gold
          : $status === 'retired'
            ? '#f87171'
            : $status === 'legacy'
              ? tokens.textSecondary
              : tokens.border};
  border-radius: ${tokens.radiusSm};
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.25);
`

const SurfaceTitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const SurfaceLabel = styled.span`
  font-family: ${tokens.fontDisplay};
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Badge = styled.span<{ $tone?: 'live' | 'read' | 'legacy' | 'retired' | 'risk' }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ $tone }) =>
      ({
        live: tokens.success,
        read: tokens.gold,
        legacy: tokens.textSecondary,
        retired: '#f87171',
        risk: '#9382ff',
      })[$tone ?? 'read']};
  color: ${({ $tone }) =>
    ({
      live: tokens.success,
      read: tokens.goldHighlight,
      legacy: tokens.textSecondary,
      retired: '#f87171',
      risk: '#9382ff',
    })[$tone ?? 'read']};
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

const Field = styled.div`
  margin-top: 8px;

  strong {
    display: block;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${tokens.gold};
    margin-bottom: 3px;
    font-family: ${tokens.fontDisplay};
  }

  p {
    margin: 0;
    font-size: 11px;
    color: ${tokens.textSecondary};
    line-height: 1.5;
  }
`

const statusTone = (status: SurfaceStatus): 'live' | 'read' | 'legacy' | 'retired' => {
  if (status === 'live') return 'live'
  if (status === 'retired') return 'retired'
  if (status === 'legacy') return 'legacy'
  return 'read'
}

const SurfaceCard: React.FC<{ surface: SurfaceRecord }> = ({ surface }) => (
  <SurfaceRow $status={surface.status}>
    <SurfaceTitleRow>
      <SurfaceLabel>{surface.label}</SurfaceLabel>
      <Badge $tone={statusTone(surface.status)}>{surface.status}</Badge>
      <Badge $tone="read">{surface.visibility}</Badge>
      {surface.executionRisk !== 'none' && (
        <Badge $tone="risk">risk: {surface.executionRisk}</Badge>
      )}
    </SurfaceTitleRow>

    <RouteLink href={surface.route}>{surface.route}</RouteLink>

    {surface.replacementRoute && (
      <Meta style={{ marginTop: 6 }}>
        {t('Surface map replacement')}:{' '}
        <Link href={surface.replacementRoute} style={{ color: tokens.gold }}>
          {surface.replacementRoute}
        </Link>
      </Meta>
    )}

    <Field>
      <strong>{t('Surface map human purpose')}</strong>
      <p>{surface.humanPurpose}</p>
    </Field>

    <Field>
      <strong>{t('Surface map agent purpose')}</strong>
      <p>{surface.agentPurpose}</p>
    </Field>

    <Field>
      <strong>{t('Surface map data source')}</strong>
      <p>{surface.dataSource}</p>
    </Field>

    {surface.manifestUri && (
      <Field>
        <strong>{t('Surface map manifest')}</strong>
        <p>
          <a href={surface.manifestUri} style={{ color: tokens.gold }}>
            {surface.manifestUri}
          </a>
        </p>
      </Field>
    )}
  </SurfaceRow>
)

const SurfaceMapConsole: React.FC = () => {
  const model = resolveSurfaceMapReadModel()
  const grouped = getGroupedVisibleSurfaces()

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Root>
        <Shell>
          <header>
            <Title>{t('Surface map page title')}</Title>
            <Subtitle>{t('Surface map page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Surface map summary title')}</PanelTitle>
            <SummaryGrid>
              <SummaryCell>
                <strong>{model.summary.total}</strong>
                {t('Surface map total surfaces')}
              </SummaryCell>
              <SummaryCell>
                <strong>{model.summary.withManifest}</strong>
                {t('Surface map with manifest')}
              </SummaryCell>
              <SummaryCell>
                <strong>{model.summary.retired}</strong>
                {t('Surface map retired')}
              </SummaryCell>
              <SummaryCell>
                <strong>{model.summary.byStatus.live ?? 0}</strong>
                {t('Surface map live on chain')}
              </SummaryCell>
            </SummaryGrid>
            <Meta style={{ marginTop: 12 }}>{model.disclaimer}</Meta>
          </Panel>

          {grouped.map(({ group, surfaces }) => (
            <Panel key={group.id}>
              <GroupBlock>
                <GroupHeader>
                  <GroupName>{group.label}</GroupName>
                  <Meta style={{ marginTop: 6 }}>{group.description}</Meta>
                  <Meta style={{ marginTop: 6 }}>
                    <strong style={{ color: tokens.gold }}>{t('Surface map agent summary')}:</strong>{' '}
                    {group.agentSummary}
                  </Meta>
                </GroupHeader>
                <SurfaceList>
                  {surfaces.map((surface) => (
                    <SurfaceCard key={surface.id} surface={surface} />
                  ))}
                </SurfaceList>
              </GroupBlock>
            </Panel>
          ))}

          <Panel>
            <PanelTitle>{t('Surface map manifest title')}</PanelTitle>
            <Meta>
              {t('Surface map manifest note')}:{' '}
              <a href="/registry/surfaces/index.json" style={{ color: tokens.gold }}>
                /registry/surfaces/index.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Pipeline cross link')}:{' '}
              <Link href="/pipeline" style={{ color: tokens.gold }}>
                /pipeline
              </Link>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Runtime cross link')}:{' '}
              <Link href="/runtime/labs" style={{ color: tokens.gold }}>
                /runtime/labs
              </Link>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Read-only · execution disabled · as of {model.asOf}
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default SurfaceMapConsole
