import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  DRY_RUN_FLOW_STEPS,
  MARCO_ECONOMY_NARRATIVE_DRY_RUN,
  resolveCivilizationDryRunReadModel,
} from 'lib/civilization-dry-run'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicCard,
  EconomicBadge,
  EconomicStatusSummary,
  EconomicActionGrid,
  EconomicDetailToggle,
  EconomicManifestLink,
  EconomicTimeline,
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

const CivilizationDryRunConsole: React.FC = () => {
  const model = resolveCivilizationDryRunReadModel()
  const scenario = MARCO_ECONOMY_NARRATIVE_DRY_RUN

  return (
    <EconomicPageShell>
      <EconomicHero
        title={t('Dry run page title')}
        subtitle={t('Dry run page subtitle')}
        primaryAction={{ href: '/submit', label: t('Submission cross link') }}
      />

      <EconomicStatusSummary
        items={[
          { label: t('Dry run live count'), value: String(model.liveDryRuns) },
          { label: t('Dry run no execution'), value: '✓' },
          { label: t('Dry run no persistence'), value: '✓' },
          { label: t('Dry run no registry mutation'), value: '✓' },
        ]}
      />

      <EconomicSection title={t('Dry run flow title')}>
        <EconomicTimeline
          steps={DRY_RUN_FLOW_STEPS.map((step, index) => ({
            label: step.label,
            description: step.description,
            surface: step.surface,
            index: index + 1,
          }))}
        />
      </EconomicSection>

      <EconomicSection title={t('Dry run scenario title')}>
        <EconomicCard title={scenario.label}>
          <BadgeRow>
            <EconomicBadge status={scenario.finalVerdict} />
          </BadgeRow>
          <Meta style={{ marginTop: 12 }}>
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
        </EconomicCard>
      </EconomicSection>

      <EconomicDetailToggle title="Technical details">
        <Meta>{model.disclaimer}</Meta>
        <Meta style={{ marginTop: 16, marginBottom: 12 }}>{t('Dry run cross links title')}</Meta>
        <EconomicActionGrid
          links={model.crossLinks.map((link) => ({
            label: link.label,
            href: link.route,
            external: link.route.startsWith('/registry'),
          }))}
        />
      </EconomicDetailToggle>

      <EconomicDetailToggle title="Manifest">
        <EconomicManifestLink
          manifests={[
            {
              label: t('Dry run manifest note'),
              uri: '/registry/dry-runs/civilization-dry-run.json',
            },
          ]}
        />
        <Meta style={{ marginTop: 12 }}>
          Read-only · dry run only · as of {model.asOf}
        </Meta>
      </EconomicDetailToggle>
    </EconomicPageShell>
  )
}

export default CivilizationDryRunConsole
