import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveUserWorkspaceReadModel } from 'lib/user-workspace'
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

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const FutureGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const FutureChip = styled.div`
  padding: 8px 12px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 11px;
  color: ${tokens.textSecondary};
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

const UserWorkspaceConsole: React.FC = () => {
  const model = resolveUserWorkspaceReadModel()

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
            <Title>{t('Workspace page title')}</Title>
            <Subtitle>{t('Workspace page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Workspace canonical title')}</PanelTitle>
            <Meta>
              {model.constitutional.canonicalChain} · {model.constitutional.canonicalAsset} ·{' '}
              <LiveDot>{model.constitutional.status}</LiveDot>
            </Meta>
            <Meta style={{ marginTop: 8 }}>{model.disclaimer}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Workspace sections title')}</PanelTitle>
            <SectionGrid>
              {model.sections.map((section) => (
                <SectionCard key={section.id}>
                  <SectionHeader>
                    <div>
                      <SectionName>{section.label}</SectionName>
                      <Meta style={{ marginTop: 4 }}>{section.description}</Meta>
                    </div>
                    <Link href={section.moduleHref} passHref legacyBehavior>
                      <ModuleLink>{t('Workspace open module')} →</ModuleLink>
                    </Link>
                  </SectionHeader>

                  {section.hasActivity ? (
                    <ItemList>
                      {section.items.map((item) => (
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
                    </ItemList>
                  ) : (
                    <EmptyState>{section.emptyMessage}</EmptyState>
                  )}
                </SectionCard>
              ))}
            </SectionGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Workspace future title')}</PanelTitle>
            <FutureGrid>
              {model.futureSurfaces.map((surface) => (
                <FutureChip key={surface.id}>
                  <strong>{surface.label}</strong> · {surface.status}
                  <div style={{ opacity: 0.75, marginTop: 4 }}>{surface.notes}</div>
                </FutureChip>
              ))}
            </FutureGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Workspace manifest title')}</PanelTitle>
            <Meta>
              {t('Workspace manifest note')}:{' '}
              <a href="/registry/workspace/index.json" style={{ color: tokens.gold }}>
                /registry/workspace/index.json
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
              {t('Identity cross link')}:{' '}
              <Link href="/identity" style={{ color: tokens.gold }}>
                /identity
              </Link>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Surface map cross link')}:{' '}
              <Link href="/map" style={{ color: tokens.gold }}>
                /map
              </Link>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Orchestrator cross link')}:{' '}
              <Link href="/orchestrator" style={{ color: tokens.gold }}>
                /orchestrator
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

export default UserWorkspaceConsole
