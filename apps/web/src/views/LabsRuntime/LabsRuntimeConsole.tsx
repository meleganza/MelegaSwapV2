import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveLabsRuntimeReadModel } from 'lib/labs-runtime'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicCard,
  EconomicBadge,
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

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;

  li {
    margin-bottom: 8px;
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
  background: ${tokens.surface};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const LabsRuntimeConsole: React.FC = () => {
  const model = resolveLabsRuntimeReadModel()

  return (
    <EconomicPageShell>
      <EconomicHero title={t('Runtime page title')} subtitle={t('Runtime page subtitle')} />

      <EconomicSection title={t('Runtime connection title')}>
        <EconomicCard>
          <BadgeRow>
            <EconomicBadge status={model.session.connectionStatus} />
            <span style={{ fontSize: 12, color: tokens.textSecondary }}>
              {model.labsConnected ? t('Runtime connected') : t('Runtime waiting')}
            </span>
          </BadgeRow>
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
        </EconomicCard>
      </EconomicSection>

      <EconomicSection title={t('Runtime narratives title')}>
        {model.observedNarratives.length === 0 ? (
          <Meta style={{ fontStyle: 'italic' }}>{t('Runtime no narratives')}</Meta>
        ) : (
          model.observedNarratives.map((narrative) => (
            <EconomicCard key={narrative.id} title={narrative.title}>
              <EconomicBadge status={narrative.status} />
            </EconomicCard>
          ))
        )}
      </EconomicSection>

      <EconomicSection title={t('Runtime events title')} lead={t('Runtime events note')}>
        {model.recentEvents.length === 0 && (
          <Meta style={{ fontStyle: 'italic' }}>{t('Runtime no observed events')}</Meta>
        )}
        <EconomicDetailToggle title={t('Runtime events title')}>
          {model.eventDefinitions.map((definition) => (
            <EconomicCard key={definition.id} title={definition.label}>
              <Meta>{definition.description}</Meta>
              <List>
                {definition.mapsTo.map((target) => (
                  <li key={`${definition.id}-${target.kind}-${target.id}`}>
                    {target.label} →{' '}
                    <Link href={target.route} style={{ color: tokens.gold }}>
                      {target.route}
                    </Link>
                  </li>
                ))}
              </List>
            </EconomicCard>
          ))}
        </EconomicDetailToggle>
      </EconomicSection>

      <EconomicSection title={t('Runtime pipeline sync title')}>
        <SyncGrid>
          {model.pipelineState.map((stage) => (
            <SyncRow key={stage.stageId}>
              <span>
                <strong style={{ color: tokens.text }}>{stage.stageLabel}</strong>
                {stage.notes && <Meta style={{ marginTop: 4 }}>{stage.notes}</Meta>}
              </span>
              <EconomicBadge status={stage.pipelineStatus} />
              <EconomicBadge status={stage.syncStatus} />
            </SyncRow>
          ))}
        </SyncGrid>
      </EconomicSection>

      <EconomicSection title={t('Runtime pending title')}>
        <List>
          {model.pendingRequirements.map((req) => (
            <li key={req.id}>
              {req.label} — <EconomicBadge status={req.status} />
              {req.notes ? ` — ${req.notes}` : ''}
            </li>
          ))}
        </List>
      </EconomicSection>

      <EconomicSection title={t('Runtime blocked title')}>
        <List>
          {model.blockedReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </List>
        <EconomicDetailToggle title={t('Runtime future title')}>
          <List>
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
          </List>
        </EconomicDetailToggle>
      </EconomicSection>

      <EconomicSection title={t('Runtime cross links title')}>
        <EconomicActionGrid
          links={model.crossLinks.map((link) => ({ label: link.label, href: link.route }))}
        />
      </EconomicSection>

      <EconomicDetailToggle title={t('Runtime manifest title')}>
        <EconomicManifestLink
          manifests={[
            { label: t('Runtime manifest note'), uri: '/registry/runtime/labs-runtime.json' },
            { label: t('Intake cross link'), uri: '/registry/intake/real-event-intake.json' },
          ]}
        />
        <Meta style={{ marginTop: 12 }}>
          Read-only · observation only · as of {model.asOf}
        </Meta>
      </EconomicDetailToggle>
    </EconomicPageShell>
  )
}

export default LabsRuntimeConsole
