import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveEconomicReviewReadModel } from 'lib/economic-review'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicCard,
  EconomicBadge,
  EconomicStatusSummary,
  EconomicActionGrid,
  EconomicAiLayer,
  TECHNICAL_DETAILS_TITLE,
  MANIFEST_TITLE,
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
  gap: 8px;
  align-items: center;
`

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;

  a {
    color: ${tokens.gold};
    text-decoration: none;

    &:hover {
      color: ${tokens.goldHighlight};
    }
  }
`

const EconomicReviewConsole: React.FC = () => {
  const model = resolveEconomicReviewReadModel()

  return (
    <EconomicPageShell>
      <EconomicHero
        title={t('Review page title')}
        subtitle={t('Review page subtitle')}
        primaryAction={{ href: '/submit', label: t('Submission cross link') }}
      />

      <EconomicStatusSummary
        items={[
          { label: t('Review summary total'), value: String(model.queueSummary.total) },
          { label: t('Review summary waiting'), value: String(model.queueSummary.waitingReview) },
          {
            label: t('Review summary needs info'),
            value: String(model.queueSummary.needsInformation),
          },
          { label: t('Review summary blocked'), value: String(model.queueSummary.blocked) },
        ]}
      />

      <EconomicSection title={t('Review queue title')} lead={t('Review queue note')}>
        {model.groups.map((group) => (
          <EconomicCard key={group.id} title={group.label}>
            <Meta>{group.description}</Meta>
            {group.items.map((item) => (
              <div key={item.queueItemId} style={{ marginTop: 16 }}>
                <BadgeRow>
                  <strong style={{ color: tokens.text }}>
                    {item.submissionCategory.replace(/_/g, ' ')}
                  </strong>
                  <EconomicBadge status={item.status} />
                  <EconomicBadge status={item.priority} />
                  <EconomicBadge status={item.requiredReviewer} />
                </BadgeRow>
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
              </div>
            ))}
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicAiLayer title={TECHNICAL_DETAILS_TITLE}>
        <Meta>{model.disclaimer}</Meta>
        <Meta style={{ marginTop: 12 }}>
          {t('Review live count')}: {model.liveReviewQueue} · {t('Review persistence')}:{' '}
          {model.persistenceEnabled ? 'enabled' : 'disabled'}
        </Meta>
        <Meta style={{ marginTop: 16, marginBottom: 8 }}>{t('Review decisions title')}</Meta>
        <Meta style={{ marginBottom: 12 }}>{t('Review decisions note')}</Meta>
        {model.decisionExamples.map((decision) => (
          <EconomicCard key={decision.id} title={decision.decision.replace(/_/g, ' ')}>
            <BadgeRow>
              <EconomicBadge status={decision.reviewerType} />
            </BadgeRow>
            <Meta style={{ marginTop: 8 }}>{decision.description}</Meta>
            <Meta style={{ marginTop: 6 }}>{decision.notes}</Meta>
          </EconomicCard>
        ))}
        <Meta style={{ marginTop: 16, marginBottom: 12 }}>{t('Review cross links title')}</Meta>
        <EconomicActionGrid
          links={[
            ...model.crossLinks.map((link) => ({
              label: link.label,
              href: link.route,
              external: link.route.startsWith('/registry'),
            })),
            { label: t('Review cross link'), href: '/review' },
          ]}
        />
      </EconomicAiLayer>

      <EconomicAiLayer title={MANIFEST_TITLE}>
        <EconomicManifestLink
          manifests={[
            { label: t('Review manifest note'), uri: '/registry/review/economic-review.json' },
            {
              label: t('Bridge manifest note'),
              uri: '/registry/bridges/submission-review-intake.json',
            },
            {
              label: t('Decision events manifest note'),
              uri: '/registry/review/decision-events.json',
            },
            {
              label: t('Dry run manifest note'),
              uri: '/registry/dry-runs/civilization-dry-run.json',
            },
          ]}
        />
        <Meta style={{ marginTop: 8 }}>
          <Link href="/dry-run" style={{ color: tokens.gold }}>
            /dry-run
          </Link>
        </Meta>
        <Meta style={{ marginTop: 8 }}>
          Read-only · no persistence · as of {model.asOf}
        </Meta>
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default EconomicReviewConsole
