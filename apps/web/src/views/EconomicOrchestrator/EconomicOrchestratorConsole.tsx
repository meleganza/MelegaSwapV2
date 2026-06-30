import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  resolveEconomicOrchestratorReadModel,
  OrchestratorStatus,
  RecommendationPriority,
} from 'lib/economic-orchestrator'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const statusColor = (status: OrchestratorStatus) => {
  switch (status) {
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

const priorityColor = (priority: RecommendationPriority) => {
  switch (priority) {
    case 'critical':
      return '#f87171'
    case 'high':
      return tokens.goldHighlight
    case 'normal':
      return tokens.gold
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

const Badge = styled.span<{ $color: string }>`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => `${$color}55`};
`

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const InputCell = styled.div`
  padding: 12px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 12px;
  color: ${tokens.textSecondary};

  strong {
    display: block;
    color: ${tokens.text};
    margin-bottom: 6px;
  }
`

const RecList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const RecCard = styled.div`
  border: 1px solid ${tokens.border};
  border-left: 3px solid ${tokens.borderGold};
  border-radius: ${tokens.radiusSm};
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;

  strong {
    color: ${tokens.goldHighlight};
    font-family: ${tokens.fontDisplay};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`

const GraphList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
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

const EconomicOrchestratorConsole: React.FC = () => {
  const model = resolveEconomicOrchestratorReadModel()

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
            <Title>{t('Orchestrator page title')}</Title>
            <Subtitle>{t('Orchestrator page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Orchestrator state title')}</PanelTitle>
            <Meta>{model.currentState.summary}</Meta>
            <Meta style={{ marginTop: 12 }}>
              {model.constitutional.canonicalAsset} on {model.constitutional.canonicalChain} ·{' '}
              {model.constitutional.status}
            </Meta>
            <Meta style={{ marginTop: 8 }}>{model.disclaimer}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator inputs title')}</PanelTitle>
            <InputGrid>
              {model.inputs.map((input) => (
                <InputCell key={input.id}>
                  <strong>{input.label}</strong>
                  <Badge $color={statusColor(input.status)}>{input.status}</Badge>
                  <Meta style={{ marginTop: 8 }}>
                    <Link href={input.route} style={{ color: tokens.gold }}>
                      {input.route}
                    </Link>
                  </Meta>
                  {input.notes && <Meta style={{ marginTop: 4 }}>{input.notes}</Meta>}
                </InputCell>
              ))}
            </InputGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator next actions title')}</PanelTitle>
            <RecList>
              {model.nextActions.map((recommendation) => (
                <RecCard key={recommendation.id}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{recommendation.currentState}</strong>
                    <Badge $color={priorityColor(recommendation.priority)} style={{ marginLeft: 8 }}>
                      {recommendation.priority}
                    </Badge>
                    <Badge $color={statusColor(recommendation.status)} style={{ marginLeft: 8 }}>
                      {recommendation.status}
                    </Badge>
                  </div>
                  <Meta>
                    {t('Orchestrator missing')}: {recommendation.missingRequirement}
                  </Meta>
                  <Meta style={{ marginTop: 6 }}>{recommendation.reason}</Meta>
                  <Meta style={{ marginTop: 8 }}>
                    <Link href={recommendation.targetRoute} style={{ color: tokens.gold }}>
                      {recommendation.targetSurface} → {recommendation.targetRoute}
                    </Link>
                  </Meta>
                </RecCard>
              ))}
            </RecList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator queue title')}</PanelTitle>
            <RecList>
              {model.recommendations.map((recommendation) => (
                <RecCard key={recommendation.id}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{recommendation.id.replace(/_/g, ' ')}</strong>
                    <Badge $color={priorityColor(recommendation.priority)} style={{ marginLeft: 8 }}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <Meta>
                    <strong style={{ color: tokens.gold }}>{t('Orchestrator human action')}</strong>{' '}
                    {recommendation.humanAction}
                  </Meta>
                  <Meta style={{ marginTop: 6 }}>
                    <strong style={{ color: tokens.gold }}>{t('Orchestrator ai action')}</strong>{' '}
                    {recommendation.aiAction}
                  </Meta>
                  {recommendation.blockingDependencies.length > 0 && (
                    <Meta style={{ marginTop: 6 }}>
                      {t('Orchestrator blocking')}: {recommendation.blockingDependencies.join(', ')}
                    </Meta>
                  )}
                  {recommendation.futureDependency && (
                    <Meta style={{ marginTop: 4 }}>
                      {t('Orchestrator future')}: {recommendation.futureDependency}
                    </Meta>
                  )}
                </RecCard>
              ))}
            </RecList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator dependency title')}</PanelTitle>
            <GraphList>
              {model.dependencyGraph.map((node) => (
                <li key={node.id}>
                  <Link href={node.route} style={{ color: tokens.gold }}>
                    {node.label}
                  </Link>{' '}
                  — {node.status}
                  {node.dependsOn.length > 0 ? ` · depends on: ${node.dependsOn.join(', ')}` : ''}
                </li>
              ))}
            </GraphList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator blocked title')}</PanelTitle>
            <GraphList>
              {model.blockedReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </GraphList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator cross links title')}</PanelTitle>
            <CrossLinkGrid>
              {model.crossLinks.map((link) => (
                <CrossLink key={link.route} href={link.route}>
                  {link.label}
                </CrossLink>
              ))}
              <CrossLink href="/submit">{t('Submission cross link')}</CrossLink>
              <CrossLink href="/review">{t('Review cross link')}</CrossLink>
            </CrossLinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Orchestrator manifest title')}</PanelTitle>
            <Meta>
              {t('Orchestrator manifest note')}:{' '}
              <a href="/registry/orchestrator/index.json" style={{ color: tokens.gold }}>
                /registry/orchestrator/index.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Intake cross link')}:{' '}
              <a href="/registry/intake/real-event-intake.json" style={{ color: tokens.gold }}>
                /registry/intake/real-event-intake.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Bridge manifest note')}:{' '}
              <a href="/registry/bridges/submission-review-intake.json" style={{ color: tokens.gold }}>
                /registry/bridges/submission-review-intake.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Decision events manifest note')}:{' '}
              <a href="/registry/review/decision-events.json" style={{ color: tokens.gold }}>
                /registry/review/decision-events.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Dry run manifest note')}:{' '}
              <a href="/registry/dry-runs/civilization-dry-run.json" style={{ color: tokens.gold }}>
                /registry/dry-runs/civilization-dry-run.json
              </a>
              {' · '}
              <Link href="/dry-run" style={{ color: tokens.gold }}>
                /dry-run
              </Link>
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

export default EconomicOrchestratorConsole
