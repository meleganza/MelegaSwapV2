import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveEconomicOrchestratorReadModel } from 'lib/economic-orchestrator'
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

const GraphList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const EconomicOrchestratorConsole: React.FC = () => {
  const model = resolveEconomicOrchestratorReadModel()

  return (
    <EconomicPageShell>
      <EconomicHero
        title={t('Orchestrator page title')}
        subtitle={t('Orchestrator page subtitle')}
        primaryAction={{ href: '/pipeline', label: t('Review pipeline link') }}
      />

      <EconomicStatusSummary
        items={[
          { label: t('Orchestrator state title'), status: model.constitutional.status },
          {
            label: t('Orchestrator next actions title'),
            value: String(model.nextActions.length),
          },
          {
            label: t('Orchestrator queue title'),
            value: String(model.recommendations.length),
          },
          {
            label: t('Orchestrator blocked title'),
            value: String(model.blockedReasons.length),
          },
        ]}
      />

      <EconomicSection title={t('Orchestrator state title')}>
        <EconomicCard>
          <Meta>{model.currentState.summary}</Meta>
          <Meta style={{ marginTop: 12 }}>
            {model.constitutional.canonicalAsset} on {model.constitutional.canonicalChain} ·{' '}
            <EconomicBadge status={model.constitutional.status} />
          </Meta>
        </EconomicCard>
      </EconomicSection>

      <EconomicSection title={t('Orchestrator inputs title')} columns={3}>
        {model.inputs.map((input) => (
          <EconomicCard key={input.id} title={input.label}>
            <EconomicBadge status={input.status} />
            <Meta style={{ marginTop: 8 }}>
              <Link href={input.route} style={{ color: tokens.gold }}>
                {input.route}
              </Link>
            </Meta>
            {input.notes && <Meta style={{ marginTop: 4 }}>{input.notes}</Meta>}
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicSection title={t('Orchestrator next actions title')}>
        {model.nextActions.map((recommendation) => (
          <EconomicCard key={recommendation.id} title={recommendation.currentState}>
            <BadgeRow>
              <EconomicBadge status={recommendation.priority} />
              <EconomicBadge status={recommendation.status} />
            </BadgeRow>
            <Meta style={{ marginTop: 8 }}>
              {t('Orchestrator missing')}: {recommendation.missingRequirement}
            </Meta>
            <Meta style={{ marginTop: 6 }}>{recommendation.reason}</Meta>
            <Meta style={{ marginTop: 8 }}>
              <Link href={recommendation.targetRoute} style={{ color: tokens.gold }}>
                {recommendation.targetSurface} → {recommendation.targetRoute}
              </Link>
            </Meta>
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicSection title={t('Orchestrator queue title')}>
        {model.recommendations.map((recommendation) => (
          <EconomicCard key={recommendation.id} title={recommendation.id.replace(/_/g, ' ')}>
            <BadgeRow>
              <EconomicBadge status={recommendation.priority} />
            </BadgeRow>
            <Meta style={{ marginTop: 8 }}>
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
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicDetailToggle title="Technical details">
        <Meta>{model.disclaimer}</Meta>
        <Meta style={{ marginTop: 16, marginBottom: 8 }}>{t('Orchestrator dependency title')}</Meta>
        <GraphList>
          {model.dependencyGraph.map((node) => (
            <li key={node.id}>
              <Link href={node.route} style={{ color: tokens.gold }}>
                {node.label}
              </Link>{' '}
              — <EconomicBadge status={node.status} />
              {node.dependsOn.length > 0 ? ` · depends on: ${node.dependsOn.join(', ')}` : ''}
            </li>
          ))}
        </GraphList>
        <Meta style={{ marginTop: 16, marginBottom: 8 }}>{t('Orchestrator blocked title')}</Meta>
        <GraphList>
          {model.blockedReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </GraphList>
        <Meta style={{ marginTop: 16, marginBottom: 12 }}>{t('Orchestrator cross links title')}</Meta>
        <EconomicActionGrid
          links={[
            ...model.crossLinks.map((link) => ({ label: link.label, href: link.route })),
            { label: t('Submission cross link'), href: '/submit' },
            { label: t('Review cross link'), href: '/review' },
          ]}
        />
      </EconomicDetailToggle>

      <EconomicDetailToggle title="Manifest">
        <EconomicManifestLink
          manifests={[
            { label: t('Orchestrator manifest note'), uri: '/registry/orchestrator/index.json' },
            { label: t('Intake cross link'), uri: '/registry/intake/real-event-intake.json' },
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
          Read-only · observation only · as of {model.asOf}
        </Meta>
      </EconomicDetailToggle>
    </EconomicPageShell>
  )
}

export default EconomicOrchestratorConsole
