import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveLabsEconomicPipelineReadModel, PipelineStageStatus } from 'lib/labs-economic-pipeline'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const statusColor = (status: PipelineStageStatus) => {
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

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
`

const TimelineRow = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 16px;
  position: relative;

  &:not(:last-child) {
    padding-bottom: 20px;
  }
`

const TimelineRail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`

const TimelineDot = styled.div<{ $status: PipelineStageStatus }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $status }) => statusColor($status)};
  border: 2px solid ${tokens.bg};
  box-shadow: 0 0 0 1px ${({ $status }) => statusColor($status)};
  flex-shrink: 0;
  margin-top: 18px;
`

const TimelineLine = styled.div`
  width: 2px;
  flex: 1;
  min-height: 24px;
  background: ${tokens.border};
  margin-top: 4px;
`

const StageCard = styled.div<{ $status: PipelineStageStatus }>`
  border: 1px solid ${tokens.border};
  border-left: 3px solid ${({ $status }) => statusColor($status)};
  border-radius: ${tokens.radiusSm};
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
`

const StageHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`

const StageName = styled.strong`
  font-family: ${tokens.fontDisplay};
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const StatusBadge = styled.span<{ $status: PipelineStageStatus }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  color: ${({ $status }) => statusColor($status)};
  border: 1px solid ${({ $status }) => statusColor($status)}55;
`

const Field = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;

  strong {
    display: block;
    color: ${tokens.gold};
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  ul {
    margin: 4px 0 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 4px;
  }
`

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;

  a {
    font-size: 11px;
    color: ${tokens.gold};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
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
  transition: border-color ${tokens.transition}, color ${tokens.transition};

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

const ReasonNote = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  color: ${tokens.goldHighlight};
  line-height: 1.5;
`

const LabsEconomicPipelineConsole: React.FC = () => {
  const model = resolveLabsEconomicPipelineReadModel()
  const pipeline = model.pipelines[0]

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
            <Title>{t('Pipeline page title')}</Title>
            <Subtitle>{t('Pipeline page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Pipeline summary title')}</PanelTitle>
            <SummaryGrid>
              <SummaryCell>
                <strong>{pipeline.readiness.total}</strong>
                {t('Pipeline stages total')}
              </SummaryCell>
              <SummaryCell>
                <strong>{pipeline.readiness.ready}</strong>
                {t('Pipeline stages ready')}
              </SummaryCell>
              <SummaryCell>
                <strong>{pipeline.readiness.waiting}</strong>
                {t('Pipeline stages waiting')}
              </SummaryCell>
              <SummaryCell>
                <strong>{pipeline.readiness.planned}</strong>
                {t('Pipeline stages planned')}
              </SummaryCell>
              <SummaryCell>
                <strong>{pipeline.readiness.notIndexed}</strong>
                {t('Pipeline stages not indexed')}
              </SummaryCell>
            </SummaryGrid>
            <Meta style={{ marginTop: 12 }}>{model.disclaimer}</Meta>
            <Meta style={{ marginTop: 8 }}>
              {pipeline.label} · {model.constitutional.canonicalAsset} on {model.constitutional.canonicalChain} ·{' '}
              {model.constitutional.status}
            </Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Pipeline timeline title')}</PanelTitle>
            <Meta style={{ marginBottom: 16 }}>{pipeline.description}</Meta>
            <Timeline>
              {pipeline.stages.map((stage, index) => (
                <TimelineRow key={stage.id}>
                  <TimelineRail>
                    <TimelineDot $status={stage.status} />
                    {index < pipeline.stages.length - 1 && <TimelineLine />}
                  </TimelineRail>
                  <StageCard $status={stage.status}>
                    <StageHeader>
                      <StageName>{stage.label}</StageName>
                      <StatusBadge $status={stage.status}>{stage.status.replace('_', ' ')}</StatusBadge>
                    </StageHeader>
                    <Field>
                      <strong>{t('Pipeline purpose')}</strong>
                      {stage.purpose}
                    </Field>
                    <Field>
                      <strong>{t('Pipeline human action')}</strong>
                      {stage.humanAction}
                    </Field>
                    <Field>
                      <strong>{t('Pipeline agent action')}</strong>
                      {stage.agentAction}
                    </Field>
                    <Field>
                      <strong>{t('Pipeline required inputs')}</strong>
                      <ul>
                        {stage.requiredInputs.map((input) => (
                          <li key={input.id}>
                            {input.label}
                            {input.required ? ' *' : ''}
                            {input.indexed ? ` · ${t('Pipeline indexed')}` : ` · ${t('Pipeline not indexed')}`}
                            {input.notes ? ` — ${input.notes}` : ''}
                          </li>
                        ))}
                      </ul>
                    </Field>
                    {stage.dependencies.length > 0 && (
                      <Field>
                        <strong>{t('Pipeline dependencies')}</strong>
                        <ul>
                          {stage.dependencies.map((dependency) => (
                            <li key={dependency.stageId}>
                              {dependency.label}
                              {dependency.required ? ' *' : ` (${t('Pipeline optional')})`}
                            </li>
                          ))}
                        </ul>
                      </Field>
                    )}
                    <Field>
                      <strong>{t('Pipeline output artifact')}</strong>
                      <code style={{ fontSize: 11 }}>{stage.outputArtifact}</code>
                    </Field>
                    {stage.blockedReason && <ReasonNote>{stage.blockedReason}</ReasonNote>}
                    {stage.plannedReason && <ReasonNote>{stage.plannedReason}</ReasonNote>}
                    <LinkRow>
                      <Link href={stage.linkedSurface}>
                        {t('Pipeline linked surface')}: {stage.linkedSurface}
                      </Link>
                      {stage.manifestUri && (
                        <a href={stage.manifestUri}>
                          {t('Pipeline manifest')}: {stage.manifestUri}
                        </a>
                      )}
                    </LinkRow>
                  </StageCard>
                </TimelineRow>
              ))}
            </Timeline>
          </Panel>

          <Panel>
            <PanelTitle>{t('Pipeline cross links title')}</PanelTitle>
            <CrossLinkGrid>
              {model.crossLinks.map((link) => (
                <CrossLink key={link.route} href={link.route}>
                  {link.label}
                </CrossLink>
              ))}
            </CrossLinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Pipeline manifest title')}</PanelTitle>
            <Meta>
              {t('Pipeline manifest note')}:{' '}
              <a href="/registry/pipeline/labs-economic-pipeline.json" style={{ color: tokens.gold }}>
                /registry/pipeline/labs-economic-pipeline.json
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

export default LabsEconomicPipelineConsole
