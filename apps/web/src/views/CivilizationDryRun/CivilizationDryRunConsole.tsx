import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  DRY_RUN_FLOW_STEPS,
  MARCO_ECONOMY_NARRATIVE_DRY_RUN,
  resolveCivilizationDryRunReadModel,
  DryRunVerdict,
} from 'lib/civilization-dry-run'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const verdictColor = (verdict: DryRunVerdict) => {
  switch (verdict) {
    case 'pass':
      return tokens.success
    case 'partial':
      return tokens.gold
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

const FlowList = styled.ol`
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.7;
`

const Card = styled.div`
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
  margin-bottom: 12px;

  strong {
    font-family: ${tokens.fontDisplay};
    color: ${tokens.goldHighlight};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
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

const CivilizationDryRunConsole: React.FC = () => {
  const model = resolveCivilizationDryRunReadModel()
  const scenario = MARCO_ECONOMY_NARRATIVE_DRY_RUN

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
            <Title>{t('Dry run page title')}</Title>
            <Subtitle>{t('Dry run page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Dry run overview title')}</PanelTitle>
            <Meta>{model.disclaimer}</Meta>
            <Meta style={{ marginTop: 12 }}>
              {t('Dry run live count')}: {model.liveDryRuns} · {t('Dry run no execution')}: ✓ ·{' '}
              {t('Dry run no persistence')}: ✓ · {t('Dry run no registry mutation')}: ✓
            </Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Dry run flow title')}</PanelTitle>
            <FlowList>
              {DRY_RUN_FLOW_STEPS.map((step) => (
                <li key={step.id}>
                  <strong style={{ color: tokens.gold }}>{step.label}</strong> —{' '}
                  <Link href={step.surface} style={{ color: tokens.gold }}>
                    {step.surface}
                  </Link>
                  : {step.description}
                </li>
              ))}
            </FlowList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Dry run scenario title')}</PanelTitle>
            <Card>
              <strong>{scenario.label}</strong>
              <Badge $color={verdictColor(scenario.finalVerdict)} style={{ marginLeft: 8 }}>
                {scenario.finalVerdict}
              </Badge>
              <Meta style={{ marginTop: 8 }}>
                <strong style={{ color: tokens.gold }}>{t('Dry run narrative title')}</strong>:{' '}
                {scenario.narrative.title}
              </Meta>
              <Meta style={{ marginTop: 6 }}>{scenario.narrative.summary}</Meta>
              <Meta style={{ marginTop: 8 }}>
                {t('Dry run submission category')}: {scenario.submission.submissionCategory}
              </Meta>
              <Meta style={{ marginTop: 6 }}>
                {t('Dry run review group')}: {scenario.review.reviewQueueGroup} ·{' '}
                {t('Dry run decision event')}: {scenario.decisionEvent.decisionEventType}
              </Meta>
              <Meta style={{ marginTop: 6 }}>
                {t('Dry run intake family')}: {scenario.intake.intakeEventFamily}
              </Meta>
              <Meta style={{ marginTop: 6 }}>
                {t('Dry run pipeline effect')}: {scenario.pipelineEffects[0].effect}
              </Meta>
              <Meta style={{ marginTop: 6 }}>
                {t('Dry run runtime effect')}: {scenario.runtimeEffect.effect}
              </Meta>
              <Meta style={{ marginTop: 6 }}>
                {t('Dry run orchestrator effect')}: {scenario.orchestratorEffect.effect}
              </Meta>
              <Meta style={{ marginTop: 6 }}>
                {t('Dry run workspace effect')}: {scenario.workspaceEffect.effect}
              </Meta>
              <Meta style={{ marginTop: 8, color: tokens.goldHighlight }}>
                {t('Dry run verdict')}: {scenario.verdictSummary}
              </Meta>
            </Card>
          </Panel>

          <Panel>
            <PanelTitle>{t('Dry run cross links title')}</PanelTitle>
            <CrossLinkGrid>
              {model.crossLinks.map((link) =>
                link.route.startsWith('/registry') ? (
                  <a
                    key={link.route}
                    href={link.route}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${tokens.border}`,
                      borderRadius: tokens.radiusSm,
                      fontSize: 11,
                      color: tokens.textSecondary,
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <CrossLink key={link.route} href={link.route}>
                    {link.label}
                  </CrossLink>
                ),
              )}
            </CrossLinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Dry run manifest title')}</PanelTitle>
            <Meta>
              {t('Dry run manifest note')}:{' '}
              <a href="/registry/dry-runs/civilization-dry-run.json" style={{ color: tokens.gold }}>
                /registry/dry-runs/civilization-dry-run.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Read-only · dry run only · as of {model.asOf}
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default CivilizationDryRunConsole
