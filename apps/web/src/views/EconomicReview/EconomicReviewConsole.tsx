import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  resolveEconomicReviewReadModel,
  ReviewPriority,
  ReviewQueueStatus,
  ReviewerType,
} from 'lib/economic-review'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const statusColor = (status: ReviewQueueStatus) => {
  switch (status) {
    case 'approved':
      return tokens.success
    case 'queued':
    case 'under_review':
    case 'submitted':
    case 'draft':
      return tokens.gold
    case 'blocked':
    case 'rejected':
      return '#f87171'
    default:
      return tokens.textSecondary
  }
}

const priorityColor = (priority: ReviewPriority) => {
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

const reviewerColor = (reviewer: ReviewerType) => {
  switch (reviewer) {
    case 'human':
      return tokens.goldHighlight
    case 'governance':
      return tokens.gold
    case 'ai':
      return tokens.success
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`

const SummaryCard = styled.div`
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  padding: 12px;
  background: rgba(0, 0, 0, 0.25);
  text-align: center;

  strong {
    display: block;
    font-family: ${tokens.fontDisplay};
    font-size: 20px;
    color: ${tokens.goldHighlight};
    margin-bottom: 4px;
  }

  span {
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${tokens.textSecondary};
  }
`

const QueueGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`

const GroupHeader = styled.h3`
  margin: 0 0 12px;
  font-family: ${tokens.fontDisplay};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${tokens.goldHighlight};
`

const ItemCard = styled.div`
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

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 11px;

  a {
    color: ${tokens.gold};
    text-decoration: none;

    &:hover {
      color: ${tokens.goldHighlight};
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

const DecisionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const EconomicReviewConsole: React.FC = () => {
  const model = resolveEconomicReviewReadModel()

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
            <Title>{t('Review page title')}</Title>
            <Subtitle>{t('Review page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Review overview title')}</PanelTitle>
            <Meta>{model.disclaimer}</Meta>
            <Meta style={{ marginTop: 12 }}>
              {t('Review live count')}: {model.liveReviewQueue} · {t('Review persistence')}:{' '}
              {model.persistenceEnabled ? 'enabled' : 'disabled'}
            </Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Review summary title')}</PanelTitle>
            <SummaryGrid>
              <SummaryCard>
                <strong>{model.queueSummary.total}</strong>
                <span>{t('Review summary total')}</span>
              </SummaryCard>
              <SummaryCard>
                <strong>{model.queueSummary.waitingReview}</strong>
                <span>{t('Review summary waiting')}</span>
              </SummaryCard>
              <SummaryCard>
                <strong>{model.queueSummary.needsInformation}</strong>
                <span>{t('Review summary needs info')}</span>
              </SummaryCard>
              <SummaryCard>
                <strong>{model.queueSummary.blocked}</strong>
                <span>{t('Review summary blocked')}</span>
              </SummaryCard>
              <SummaryCard>
                <strong>{model.queueSummary.futureReview}</strong>
                <span>{t('Review summary future')}</span>
              </SummaryCard>
              <SummaryCard>
                <strong>{model.queueSummary.completedExamples}</strong>
                <span>{t('Review summary completed')}</span>
              </SummaryCard>
            </SummaryGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Review queue title')}</PanelTitle>
            <Meta style={{ marginBottom: 16 }}>{t('Review queue note')}</Meta>
            {model.groups.map((group) => (
              <QueueGroup key={group.id}>
                <GroupHeader>{group.label}</GroupHeader>
                <Meta style={{ marginBottom: 12 }}>{group.description}</Meta>
                {group.items.map((item) => (
                  <ItemCard key={item.queueItemId}>
                    <strong>{item.submissionCategory.replace(/_/g, ' ')}</strong>
                    <Badge $color={statusColor(item.status)} style={{ marginLeft: 8 }}>
                      {item.status}
                    </Badge>
                    <Badge $color={priorityColor(item.priority)} style={{ marginLeft: 8 }}>
                      {item.priority}
                    </Badge>
                    <Badge $color={reviewerColor(item.requiredReviewer)} style={{ marginLeft: 8 }}>
                      {item.requiredReviewer}
                    </Badge>
                    <Meta style={{ marginTop: 8 }}>
                      {t('Review type')}: <code>{item.reviewType}</code>
                    </Meta>
                    <Meta style={{ marginTop: 6 }}>
                      {t('Review required evidence')}: {item.requiredEvidence.join(', ')}
                    </Meta>
                    {item.blockingReason && (
                      <Meta style={{ marginTop: 6, color: '#f87171' }}>
                        {t('Review blocking reason')}: {item.blockingReason}
                      </Meta>
                    )}
                    <Meta style={{ marginTop: 6 }}>
                      {t('Review target registry')}: {item.targetRegistry} · {t('Review target surface')}:{' '}
                      <Link href={item.targetSurface} style={{ color: tokens.gold }}>
                        {item.targetSurface}
                      </Link>
                    </Meta>
                    <LinkRow>
                      <Link href={item.linkedSubmission}>{t('Review submission link')}</Link>
                      <Link href={item.linkedPipeline}>{t('Review pipeline link')}</Link>
                      {item.linkedOrchestratorRecommendation && (
                        <Link href={item.linkedOrchestratorRecommendation}>
                          {t('Review orchestrator link')}
                        </Link>
                      )}
                      <Link href="/workspace">{t('Review workspace link')}</Link>
                    </LinkRow>
                  </ItemCard>
                ))}
              </QueueGroup>
            ))}
          </Panel>

          <Panel>
            <PanelTitle>{t('Review decisions title')}</PanelTitle>
            <Meta style={{ marginBottom: 12 }}>{t('Review decisions note')}</Meta>
            <DecisionList>
              {model.decisionExamples.map((decision) => (
                <ItemCard key={decision.id}>
                  <strong>{decision.decision.replace(/_/g, ' ')}</strong>
                  <Badge $color={reviewerColor(decision.reviewerType)} style={{ marginLeft: 8 }}>
                    {decision.reviewerType}
                  </Badge>
                  <Meta style={{ marginTop: 8 }}>{decision.description}</Meta>
                  <Meta style={{ marginTop: 6 }}>{decision.notes}</Meta>
                </ItemCard>
              ))}
            </DecisionList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Review cross links title')}</PanelTitle>
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
              <CrossLink href="/review">{t('Review cross link')}</CrossLink>
            </CrossLinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Review manifest title')}</PanelTitle>
            <Meta>
              {t('Review manifest note')}:{' '}
              <a href="/registry/review/economic-review.json" style={{ color: tokens.gold }}>
                /registry/review/economic-review.json
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
              Read-only · no persistence · as of {model.asOf}
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default EconomicReviewConsole
