import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveEconomicSubmissionReadModel } from 'lib/economic-submission'
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

const GateList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const FieldList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const EconomicSubmissionConsole: React.FC = () => {
  const model = resolveEconomicSubmissionReadModel()

  return (
    <EconomicPageShell>
      <EconomicHero
        title={t('Submission page title')}
        subtitle={t('Submission page subtitle')}
        primaryAction={{ href: '/submit', label: t('Submission cross link') }}
      />

      <EconomicStatusSummary
        items={[
          { label: t('Submission live count'), value: String(model.liveSubmissionsIndexed) },
          {
            label: t('Submission persistence'),
            status: model.persistenceEnabled ? 'ready' : 'blocked',
          },
          {
            label: t('Submission categories title'),
            value: String(model.categories.length),
          },
          {
            label: t('Submission examples title'),
            value: String(model.schemaExamples.length),
          },
        ]}
      />

      <EconomicSection title={t('Submission review gates title')}>
        <EconomicCard>
          <GateList>
            {model.reviewGates.map((gate) => (
              <li key={gate.id}>
                <EconomicBadge status={gate.status} /> — {gate.description}
              </li>
            ))}
          </GateList>
        </EconomicCard>
      </EconomicSection>

      <EconomicSection title={t('Submission examples title')} lead={t('Submission examples note')}>
        {model.schemaExamples.map((submission) => (
          <EconomicCard key={submission.submissionId} title={submission.category.replace(/_/g, ' ')}>
            <BadgeRow>
              <EconomicBadge status={submission.validationStatus} />
              <EconomicBadge status={submission.reviewStatus} />
            </BadgeRow>
            <Meta style={{ marginTop: 8 }}>{submission.nextAction}</Meta>
            <Meta style={{ marginTop: 6 }}>
              {t('Submission missing fields')}: {submission.missingFields.join(', ')}
            </Meta>
            <Meta style={{ marginTop: 6 }}>
              {t('Submission human review')}: {submission.humanReviewerAction}
            </Meta>
            <Meta style={{ marginTop: 4 }}>
              {t('Submission ai review')}: {submission.aiReviewerAction}
            </Meta>
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicAiLayer title={TECHNICAL_DETAILS_TITLE}>
        <Meta>{model.disclaimer}</Meta>
        <Meta style={{ marginTop: 16, marginBottom: 12 }}>{t('Submission categories title')}</Meta>
        {model.categories.map((category) => (
          <EconomicCard key={category.id} title={category.label}>
            <BadgeRow>
              <EconomicBadge status={category.defaultSafety} />
            </BadgeRow>
            <Meta style={{ marginTop: 8 }}>{category.description}</Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Submission target surface')}:{' '}
              <Link href={category.targetSurface} style={{ color: tokens.gold }}>
                {category.targetSurface}
              </Link>
              {' · '}
              {t('Submission target registry')}: {category.targetRegistry}
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Submission intake family')}: <code>{category.resultingEventIntakeFamily}</code>
              {' → '}
              {category.resultingRegistryTarget}
            </Meta>
            <FieldList>
              <li>
                <strong style={{ color: tokens.gold }}>{t('Submission required fields')}</strong>:{' '}
                {category.requiredFields.map((field) => field.label).join(', ')}
              </li>
              {category.optionalFields.length > 0 && (
                <li>
                  <strong style={{ color: tokens.gold }}>{t('Submission optional fields')}</strong>:{' '}
                  {category.optionalFields.map((field) => field.label).join(', ')}
                </li>
              )}
            </FieldList>
          </EconomicCard>
        ))}
        <Meta style={{ marginTop: 16, marginBottom: 12 }}>{t('Submission cross links title')}</Meta>
        <EconomicActionGrid
          links={[
            ...model.crossLinks.map((link) => ({
              label: link.label,
              href: link.route,
              external: link.route.startsWith('/registry'),
            })),
            { label: t('Submission cross link'), href: '/submit' },
            { label: t('Review cross link'), href: '/review' },
          ]}
        />
      </EconomicAiLayer>

      <EconomicAiLayer title={MANIFEST_TITLE}>
        <EconomicManifestLink
          manifests={[
            {
              label: t('Submission manifest note'),
              uri: '/registry/submission/economic-submission.json',
            },
            {
              label: t('Bridge manifest note'),
              uri: '/registry/bridges/submission-review-intake.json',
            },
            {
              label: t('Decision events manifest note'),
              uri: '/registry/review/decision-events.json',
            },
          ]}
        />
        <Meta style={{ marginTop: 8 }}>
          Read-only · no persistence · as of {model.asOf}
        </Meta>
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default EconomicSubmissionConsole
