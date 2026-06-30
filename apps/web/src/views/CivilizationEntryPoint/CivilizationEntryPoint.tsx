import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  ADVANCED_SURFACES,
  CORE_SURFACES,
  LEGACY_SURFACES,
  SECONDARY_SURFACES,
  resolveHomepageBlueprint,
} from 'lib/homepage-blueprint'
import { HomepageSurfaceSlot } from 'lib/homepage-blueprint/homepage-blueprint-types'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const MACHINE_DISCOVERY = [
  { label: 'Surface Map', uri: '/map' },
  { label: 'Labs Economic Pipeline', uri: '/registry/pipeline/labs-economic-pipeline.json' },
  { label: 'Mainnet Readiness Gate', uri: '/registry/readiness/mainnet-gate.json' },
  { label: 'Homepage Blueprint', uri: '/registry/blueprints/homepage-entry-point.json' },
  { label: 'Homepage Manifest', uri: '/registry/homepage/index.json' },
  { label: 'Surface Index', uri: '/registry/surfaces/index.json' },
]

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

const ConstitutionalBanner = styled.section`
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(0, 0, 0, 0.6) 100%);
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radius};
  padding: 24px;
`

const LiveBadge = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  color: ${tokens.success};
  border: 1px solid rgba(34, 197, 94, 0.35);
  margin-bottom: 12px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${tokens.goldHighlight};
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  font-size: 14px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
  max-width: 720px;
`

const Panel = styled.section`
  background: ${tokens.surfaceGlass};
  backdrop-filter: blur(14px);
  border: 1px solid ${tokens.border};
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

const CoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const AdvancedGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const CoreCard = styled(Link)`
  display: flex;
  flex-direction: column;
  min-height: 132px;
  padding: 18px;
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radius};
  background: rgba(0, 0, 0, 0.45);
  text-decoration: none;
  color: inherit;
  transition: border-color ${tokens.transition}, transform ${tokens.transition};

  &:hover {
    border-color: ${tokens.gold};
    transform: translateY(-2px);
  }

  strong {
    font-family: ${tokens.fontDisplay};
    font-size: 13px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.goldHighlight};
    margin-bottom: 8px;
  }

  span {
    font-size: 12px;
    color: ${tokens.textSecondary};
    line-height: 1.5;
    flex: 1;
  }

  em {
    margin-top: 12px;
    font-size: 11px;
    color: ${tokens.gold};
    font-style: normal;
    letter-spacing: 0.06em;
  }
`

const StripLink = styled(Link)`
  display: block;
  padding: 12px 14px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  background: rgba(0, 0, 0, 0.25);
  text-decoration: none;
  color: inherit;
  transition: border-color ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
  }

  strong {
    display: block;
    font-size: 12px;
    color: ${tokens.text};
    margin-bottom: 4px;
  }

  span {
    font-size: 11px;
    color: ${tokens.textSecondary};
    line-height: 1.45;
  }
`

const AdvancedLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 11px;
  color: ${tokens.textSecondary};
  text-decoration: none;
  transition: border-color ${tokens.transition}, color ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.text};
  }
`

const Badge = styled.span<{ $variant?: 'warning' | 'preview' | 'legacy' }>`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  color: ${({ $variant }) =>
    $variant === 'warning' ? tokens.goldHighlight : tokens.textSecondary};
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'warning' ? 'rgba(255, 200, 66, 0.4)' : tokens.border};
`

const LegacyFooter = styled.footer`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding-top: 8px;
  border-top: 1px solid ${tokens.border};
`

const LegacyLink = styled(Link)`
  font-size: 11px;
  color: ${tokens.textSecondary};
  text-decoration: none;

  &:hover {
    color: ${tokens.gold};
  }
`

const ManifestList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ManifestItem = styled.li`
  font-size: 12px;
  color: ${tokens.textSecondary};

  a {
    color: ${tokens.gold};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  code {
    font-size: 11px;
    color: ${tokens.text};
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const surfaceBadge = (surface: HomepageSurfaceSlot) => {
  if (surface.id === 'execution') return <Badge $variant="warning">{t('Homepage execution badge')}</Badge>
  if (surface.id === 'activation') return <Badge $variant="preview">{t('Homepage preview badge')}</Badge>
  return null
}

const CivilizationEntryPoint: React.FC = () => {
  const blueprint = resolveHomepageBlueprint()

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
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
      <Root>
        <Shell>
          <ConstitutionalBanner>
            <LiveBadge>{blueprint.constitutional.status}</LiveBadge>
            <Title>
              {blueprint.constitutional.canonicalAsset} on {blueprint.constitutional.canonicalChain}
            </Title>
            <Subtitle>{t('Homepage constitutional subtitle')}</Subtitle>
            <Meta style={{ marginTop: 12 }}>{blueprint.constitutional.framing}</Meta>
          </ConstitutionalBanner>

          <Panel>
            <PanelTitle>{t('Homepage value proposition title')}</PanelTitle>
            <Subtitle style={{ margin: 0 }}>{t('Homepage value proposition body')}</Subtitle>
          </Panel>

          <Panel>
            <PanelTitle>{t('Homepage core actions title')}</PanelTitle>
            <CoreGrid>
              {CORE_SURFACES.map((surface) => (
                <CoreCard key={surface.id} href={surface.route}>
                  <strong>{surface.label}</strong>
                  <span>{surface.humanPurpose}</span>
                  <em>{surface.route} →</em>
                </CoreCard>
              ))}
            </CoreGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Homepage registry strip title')}</PanelTitle>
            <LinkGrid>
              {SECONDARY_SURFACES.map((surface) => (
                <StripLink key={surface.id} href={surface.route}>
                  <strong>{surface.label}</strong>
                  <span>{surface.humanPurpose}</span>
                </StripLink>
              ))}
            </LinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Homepage advanced title')}</PanelTitle>
            <AdvancedGrid>
              {ADVANCED_SURFACES.map((surface) => (
                <AdvancedLink key={surface.id} href={surface.route}>
                  {surface.label}
                  {surfaceBadge(surface)}
                </AdvancedLink>
              ))}
            </AdvancedGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Homepage legacy title')}</PanelTitle>
            <Meta style={{ marginBottom: 12 }}>{t('Homepage legacy note')}</Meta>
            <LegacyFooter>
              {LEGACY_SURFACES.map((surface) => (
                <LegacyLink key={surface.id} href={surface.route}>
                  {surface.label}
                </LegacyLink>
              ))}
            </LegacyFooter>
          </Panel>

          <Panel>
            <PanelTitle>{t('Homepage machine discovery title')}</PanelTitle>
            <Meta style={{ marginBottom: 12 }}>{t('Homepage machine discovery note')}</Meta>
            <ManifestList>
              {MACHINE_DISCOVERY.map((entry) => (
                <ManifestItem key={entry.uri}>
                  {entry.label}:{' '}
                  {entry.uri.startsWith('/registry') ? (
                    <a href={entry.uri}>
                      <code>{entry.uri}</code>
                    </a>
                  ) : (
                    <Link href={entry.uri}>
                      <code>{entry.uri}</code>
                    </Link>
                  )}
                </ManifestItem>
              ))}
            </ManifestList>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default CivilizationEntryPoint
