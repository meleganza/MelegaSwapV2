import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveLabsRuntimeReadModel, RuntimeStatus } from 'lib/labs-runtime'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const statusColor = (status: RuntimeStatus) => {
  switch (status) {
    case 'connected':
    case 'ready':
      return tokens.success
    case 'waiting':
      return tokens.gold
    case 'planned':
      return tokens.goldHighlight
    case 'blocked':
      return '#f87171'
    default:
      return tokens.textSecondary
  }
}

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

const StatusBadge = styled.span<{ $status: RuntimeStatus }>`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  color: ${({ $status }) => statusColor($status)};
  border: 1px solid ${({ $status }) => statusColor($status)}55;
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

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const EventCard = styled.div`
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;

  strong {
    font-family: ${tokens.fontDisplay};
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${tokens.goldHighlight};
  }

  ul {
    margin: 8px 0 0;
    padding-left: 18px;
  }
`

const SyncGrid = styled.div`
  display: grid;
  gap: 10px;
`

const SyncRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const ActionList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;

  li {
    margin-bottom: 8px;
  }
`

const CrossLinkGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const CrossLink = styled(Link)`
  padding: 8px 12px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 11px;
  color: ${tokens.textSecondary};
  text-decoration: none;

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.text};
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const EmptyNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${tokens.textSecondary};
  font-style: italic;
`

const LabsRuntimeConsole: React.FC = () => {
  const model = resolveLabsRuntimeReadModel()

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
            <Title>{t('Runtime page title')}</Title>
            <Subtitle>{t('Runtime page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Runtime connection title')}</PanelTitle>
            <StatusBadge $status={model.session.connectionStatus}>
              {model.labsConnected ? t('Runtime connected') : t('Runtime waiting')}
            </StatusBadge>
            <Meta style={{ marginTop: 12 }}>
              {t('Runtime endpoint')}: <code>{model.session.labsEndpoint}</code>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Runtime last observed')}: {model.lastObserved ?? t('Runtime never observed')}
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Runtime last event')}: {model.lastEvent ?? t('Runtime no events')}
            </Meta>
            <Meta style={{ marginTop: 12 }}>{model.disclaimer}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime narratives title')}</PanelTitle>
            {model.observedNarratives.length === 0 ? (
              <EmptyNote>{t('Runtime no narratives')}</EmptyNote>
            ) : (
              model.observedNarratives.map((narrative) => (
                <Meta key={narrative.id}>
                  {narrative.title} · {narrative.status}
                </Meta>
              ))
            )}
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime events title')}</PanelTitle>
            <Meta style={{ marginBottom: 12 }}>{t('Runtime events note')}</Meta>
            {model.recentEvents.length === 0 ? (
              <EmptyNote>{t('Runtime no observed events')}</EmptyNote>
            ) : null}
            <EventList>
              {model.eventDefinitions.map((definition) => (
                <EventCard key={definition.id}>
                  <strong>{definition.label}</strong>
                  <Meta style={{ marginTop: 6 }}>{definition.description}</Meta>
                  <ul>
                    {definition.mapsTo.map((target) => (
                      <li key={`${definition.id}-${target.kind}-${target.id}`}>
                        {target.label} →{' '}
                        <Link href={target.route} style={{ color: tokens.gold }}>
                          {target.route}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </EventCard>
              ))}
            </EventList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime pipeline sync title')}</PanelTitle>
            <SyncGrid>
              {model.pipelineState.map((stage) => (
                <SyncRow key={stage.stageId}>
                  <span>
                    <strong style={{ color: tokens.text }}>{stage.stageLabel}</strong>
                    {stage.notes && (
                      <Meta style={{ marginTop: 4 }}>{stage.notes}</Meta>
                    )}
                  </span>
                  <StatusBadge $status={stage.pipelineStatus}>{stage.pipelineStatus}</StatusBadge>
                  <StatusBadge $status={stage.syncStatus}>
                    {t('Runtime sync')}: {stage.syncStatus}
                  </StatusBadge>
                </SyncRow>
              ))}
            </SyncGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime pending title')}</PanelTitle>
            <ActionList>
              {model.pendingRequirements.map((req) => (
                <li key={req.id}>
                  {req.label} — <StatusBadge $status={req.status}>{req.status}</StatusBadge>
                  {req.notes ? ` — ${req.notes}` : ''}
                </li>
              ))}
            </ActionList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime blocked title')}</PanelTitle>
            <ActionList>
              {model.blockedReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ActionList>
            <Meta style={{ marginTop: 16 }}>{t('Runtime future title')}</Meta>
            <ActionList style={{ marginTop: 8 }}>
              {model.futureActions.map((action) => (
                <li key={action.id}>
                  {action.label}
                  {action.route && (
                    <>
                      {' '}
                      →{' '}
                      <Link href={action.route} style={{ color: tokens.gold }}>
                        {action.route}
                      </Link>
                    </>
                  )}
                  {action.reason ? ` — ${action.reason}` : ''}
                </li>
              ))}
            </ActionList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime cross links title')}</PanelTitle>
            <CrossLinkGrid>
              {model.crossLinks.map((link) => (
                <CrossLink key={link.route} href={link.route}>
                  {link.label}
                </CrossLink>
              ))}
            </CrossLinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Runtime manifest title')}</PanelTitle>
            <Meta>
              {t('Runtime manifest note')}:{' '}
              <a href="/registry/runtime/labs-runtime.json" style={{ color: tokens.gold }}>
                /registry/runtime/labs-runtime.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Read-only · observation only · as of {model.asOf}
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default LabsRuntimeConsole
