import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  resolveEconomicIdentityReadModel,
  ResolveEconomicIdentityOptions,
  IdentityArchetype,
} from 'lib/economic-identity'
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

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`

const Badge = styled.span<{ $tone?: 'neutral' | 'live' | 'planned' }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'live' ? tokens.success : $tone === 'planned' ? tokens.gold : tokens.border};
  color: ${({ $tone }) =>
    $tone === 'live' ? tokens.success : $tone === 'planned' ? tokens.goldHighlight : tokens.textSecondary};
`

const ArchetypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
`

const ArchetypeCard = styled.div<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? tokens.borderGold : tokens.border)};
  border-left: 3px solid ${({ $active }) => ($active ? tokens.gold : tokens.border)};
  border-radius: ${tokens.radiusSm};
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
`

const ScoreRing = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;

  strong {
    font-family: ${tokens.fontDisplay};
    font-size: 36px;
    color: ${tokens.goldHighlight};
    letter-spacing: 0.06em;
  }
`

const SectionGrid = styled.div`
  display: grid;
  gap: 16px;
`

const SectionCard = styled.div`
  border: 1px solid ${tokens.border};
  border-left: 3px solid ${tokens.gold};
  border-radius: ${tokens.radiusSm};
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
`

const SectionName = styled.div`
  font-family: ${tokens.fontDisplay};
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const ModuleLink = styled.a`
  font-size: 11px;
  color: ${tokens.gold};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

const ItemList = styled.ul`
  margin: 12px 0 0;
  padding-left: 18px;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;

  li {
    margin-bottom: 6px;
  }
`

const EmptyState = styled.p`
  margin: 12px 0 0;
  font-size: 12px;
  color: ${tokens.textSecondary};
  font-style: italic;
`

const CrossLinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;

  a {
    color: ${tokens.gold};
    text-decoration: none;
    padding: 6px 10px;
    border: 1px solid ${tokens.borderGold};
    border-radius: ${tokens.radiusSm};

    &:hover {
      color: ${tokens.goldHighlight};
    }
  }
`

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${tokens.success};
  font-weight: 600;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${tokens.success};
  }
`

const archetypeLabel = (id: IdentityArchetype): string =>
  id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

interface EconomicIdentityConsoleProps {
  options?: ResolveEconomicIdentityOptions
}

const EconomicIdentityConsole: React.FC<EconomicIdentityConsoleProps> = ({ options }) => {
  const model = resolveEconomicIdentityReadModel(options)

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
            <Title>{t('Identity page title')}</Title>
            <Subtitle>{t('Identity page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Identity framing title')}</PanelTitle>
            <BadgeRow>
              <Badge>{t('Identity not social')}</Badge>
              <Badge>{t('Identity not kyc')}</Badge>
              <Badge>{t('Identity not account')}</Badge>
              <Badge $tone="live">{t('Identity read only')}</Badge>
            </BadgeRow>
            <Meta style={{ marginTop: 12 }}>{model.disclaimer}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Identity wallet title')}</PanelTitle>
            <Badge $tone={model.wallet.status === 'wallet_not_connected' ? 'neutral' : 'planned'}>
              {model.wallet.status}
            </Badge>
            {model.wallet.address && (
              <Meta style={{ marginTop: 8, fontFamily: 'monospace' }}>{model.wallet.address}</Meta>
            )}
            <Meta style={{ marginTop: 8 }}>{model.wallet.notes}</Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Identity placeholder route')}:{' '}
              <Link href="/identity/placeholder" style={{ color: tokens.gold }}>
                /identity/placeholder
              </Link>
            </Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Identity archetypes title')}</PanelTitle>
            <Meta style={{ marginBottom: 12 }}>
              {t('Identity primary archetype')}: <strong>{archetypeLabel(model.primaryArchetype)}</strong>
            </Meta>
            <ArchetypeGrid>
              {model.archetypes.map((archetype) => (
                <ArchetypeCard key={archetype.id} $active={archetype.id === model.primaryArchetype}>
                  <SectionName>{archetype.label}</SectionName>
                  <Meta style={{ marginTop: 6 }}>{archetype.description}</Meta>
                  <Badge $tone={archetype.status === 'indexed' ? 'live' : 'planned'} style={{ marginTop: 8 }}>
                    {archetype.status}
                  </Badge>
                </ArchetypeCard>
              ))}
            </ArchetypeGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Identity agent readiness title')}</PanelTitle>
            <ScoreRing>
              <strong>{model.agentReadiness.score}</strong>
              <Meta>
                / {model.agentReadiness.maxScore} · {model.agentReadiness.label.replace(/_/g, ' ')} ·{' '}
                {t('Identity illustrative score')}
              </Meta>
            </ScoreRing>
            <ItemList>
              {model.agentReadiness.dimensions.map((dimension) => (
                <li key={dimension.id}>
                  {dimension.label} · {dimension.status} · +{Math.round(dimension.contribution * 100)}%
                </li>
              ))}
            </ItemList>
            <Meta style={{ marginTop: 8 }}>{model.agentReadiness.notes}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Identity surfaces title')}</PanelTitle>
            <Meta>
              {model.constitutional.canonicalChain} · {model.constitutional.canonicalAsset} ·{' '}
              <LiveDot>{model.constitutional.status}</LiveDot>
            </Meta>
            <SectionGrid style={{ marginTop: 16 }}>
              {model.sections
                .filter((section) => !['identity_role', 'wallet'].includes(section.id))
                .map((section) => (
                  <SectionCard key={section.id}>
                    <SectionHeader>
                      <div>
                        <SectionName>{section.label}</SectionName>
                        <Meta style={{ marginTop: 4 }}>{section.description}</Meta>
                      </div>
                      <Link href={section.moduleHref} passHref legacyBehavior>
                        <ModuleLink>{t('Identity open module')} →</ModuleLink>
                      </Link>
                    </SectionHeader>
                    {section.items.length > 0 ? (
                      <ItemList>
                        {section.items.slice(0, 6).map((item) => (
                          <li key={item.id}>
                            {item.href ? (
                              <Link href={item.href} style={{ color: tokens.gold }}>
                                {item.label}
                              </Link>
                            ) : (
                              item.label
                            )}
                            {item.status ? ` · ${item.status}` : ''}
                            {item.notes ? ` — ${item.notes}` : ''}
                          </li>
                        ))}
                        {section.items.length > 6 && (
                          <li>… {section.items.length - 6} more indexed</li>
                        )}
                      </ItemList>
                    ) : (
                      <EmptyState>{section.emptyMessage}</EmptyState>
                    )}
                  </SectionCard>
                ))}
            </SectionGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Identity cross links title')}</PanelTitle>
            <CrossLinkRow>
              <Link href={model.crossLinks.workspace}>Workspace</Link>
              <Link href={model.crossLinks.launch}>Launch</Link>
              <Link href={model.crossLinks.collectibles}>Collectibles</Link>
              <Link href={model.crossLinks.presence}>Presence</Link>
              <Link href={model.crossLinks.activation}>Activation</Link>
              <Link href={model.crossLinks.execution}>Execution</Link>
              <Link href="/map">Surface Map</Link>
              <Link href={model.crossLinks.graph}>Graph</Link>
              <Link href={model.crossLinks.query}>Query</Link>
            </CrossLinkRow>
          </Panel>

          <Panel>
            <PanelTitle>{t('Identity manifest title')}</PanelTitle>
            <Meta>
              {t('Identity manifest note')}:{' '}
              <a href="/registry/identity/index.json" style={{ color: tokens.gold }}>
                /registry/identity/index.json
              </a>
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

export default EconomicIdentityConsole
