import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  resolveUserLaunchReadModel,
  LaunchCapability,
  LaunchCapabilityStatus,
} from 'lib/user-launch'
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

const Field = styled.div`
  margin-top: 10px;

  strong {
    display: block;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.gold};
    margin-bottom: 4px;
  }

  p,
  ul {
    margin: 0;
    font-size: 12px;
    color: ${tokens.textSecondary};
    line-height: 1.5;
  }

  ul {
    padding-left: 16px;
  }
`

const LinkRow = styled.div`
  margin-top: 10px;
  font-size: 12px;

  a {
    color: ${tokens.gold};
    text-decoration: none;
    margin-right: 12px;

    &:hover {
      color: ${tokens.goldHighlight};
    }
  }
`

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${tokens.success};
  font-weight: 600;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${tokens.success};
  }
`

type CapabilityGroup = 'available' | 'planned' | 'blocked'

const capabilityGroup = (status: LaunchCapabilityStatus): CapabilityGroup => {
  if (status === 'LIVE' || status === 'AVAILABLE_EXISTING_FLOW') return 'available'
  if (status === 'PLANNED') return 'planned'
  return 'blocked'
}

const GROUP_LABELS: Record<CapabilityGroup, string> = {
  available: 'Available',
  planned: 'Planned',
  blocked: 'Blocked',
}

const CapabilityDetail: React.FC<{ capability: LaunchCapability }> = ({ capability }) => (
  <EconomicCard title={capability.label}>
    <EconomicBadge status={capability.status} />
    <Meta style={{ marginTop: 8 }}>{capability.description}</Meta>

    <Field>
      <strong>{t('Launch availability')}</strong>
      <p>{capability.availability}</p>
    </Field>

    <Field>
      <strong>{t('Launch required inputs')}</strong>
      <ul>
        {capability.requiredInputs.map((input) => (
          <li key={input.id}>
            {input.label}
            {input.required ? ' *' : ''}
            {input.notes ? ` — ${input.notes}` : ''}
          </li>
        ))}
      </ul>
    </Field>

    <Field>
      <strong>{t('Launch wallet requirement')}</strong>
      <p>{capability.walletRequirement}</p>
    </Field>

    <Field>
      <strong>{t('Launch chain support')}</strong>
      <p>
        {capability.chainSupport.chains.join(' · ')} — {capability.chainSupport.notes}
      </p>
    </Field>

    <Field>
      <strong>{t('Launch contract dependency')}</strong>
      <p>
        {capability.contractDependency.label}: {capability.contractDependency.reference} (
        {capability.contractDependency.status})
      </p>
    </Field>

    <Field>
      <strong>{t('Launch execution dependency')}</strong>
      <p>
        {capability.executionDependency.label}: {capability.executionDependency.reference} (
        {capability.executionDependency.status})
      </p>
    </Field>

    {capability.warnings.length > 0 && (
      <Field>
        <strong>{t('Launch warnings')}</strong>
        <ul>
          {capability.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </Field>
    )}

    {(capability.existingFlowHref || capability.registryHref) && (
      <LinkRow>
        {capability.existingFlowHref && (
          <Link href={capability.existingFlowHref}>
            {t('Launch open existing flow')}: {capability.existingFlowHref}
          </Link>
        )}
        {capability.registryHref && (
          <Link href={capability.registryHref}>
            {t('Launch registry link')}: {capability.registryHref}
          </Link>
        )}
      </LinkRow>
    )}

    <Meta style={{ marginTop: 8, opacity: 0.7 }}>{capability.machineManifest}</Meta>
  </EconomicCard>
)

const UserLaunchConsole: React.FC = () => {
  const model = resolveUserLaunchReadModel()

  const grouped: Record<CapabilityGroup, LaunchCapability[]> = {
    available: [],
    planned: [],
    blocked: [],
  }
  model.capabilities.forEach((capability) => {
    grouped[capabilityGroup(capability.status)].push(capability)
  })

  const groupSummaries: { group: CapabilityGroup; count: number }[] = [
    { group: 'available', count: model.summary.live + model.summary.availableExistingFlow },
    { group: 'planned', count: model.summary.planned },
    { group: 'blocked', count: model.summary.blocked },
  ]

  return (
    <EconomicPageShell>
      <EconomicHero title={t('Launch page title')} subtitle={t('Launch page subtitle')} />

      <EconomicSection title={t('Launch canonical title')}>
        <EconomicCard>
          <Meta>
            {model.constitutional.canonicalChain} · {model.constitutional.canonicalAsset} ·{' '}
            <LiveDot>{model.constitutional.status}</LiveDot>
          </Meta>
          <Meta style={{ marginTop: 8 }}>{model.disclaimer}</Meta>
        </EconomicCard>
      </EconomicSection>

      <EconomicSection title={t('Launch summary title')}>
        <EconomicStatusSummary
          items={[
            { label: t('Launch total capabilities'), value: String(model.summary.total) },
            { label: t('Launch available now'), value: String(model.summary.live + model.summary.availableExistingFlow) },
            { label: t('Launch planned'), value: String(model.summary.planned) },
            { label: t('Launch blocked'), value: String(model.summary.blocked) },
          ]}
        />
      </EconomicSection>

      <EconomicSection title={t('Launch capabilities title')} columns={3}>
        {groupSummaries.map(({ group, count }) => (
          <EconomicCard key={group} title={GROUP_LABELS[group]} footer={`${count} capabilities`}>
            <Meta>
              {grouped[group].map((c) => c.label).join(' · ') || '—'}
            </Meta>
          </EconomicCard>
        ))}
      </EconomicSection>

      {(['available', 'planned', 'blocked'] as CapabilityGroup[]).map((group) =>
        grouped[group].length > 0 ? (
          <EconomicDetailToggle
            key={group}
            title={`${GROUP_LABELS[group]} (${grouped[group].length})`}
          >
            {grouped[group].map((capability) => (
              <CapabilityDetail key={capability.id} capability={capability} />
            ))}
          </EconomicDetailToggle>
        ) : null,
      )}

      <EconomicSection title={t('Launch future surfaces title')} lead={t('Launch future surfaces note')}>
        <EconomicActionGrid
          links={[
            { label: 'Labs / Activation', href: '/new-project' },
            { label: t('Pipeline cross link'), href: '/pipeline' },
            { label: t('Runtime cross link'), href: '/runtime/labs' },
            { label: t('Orchestrator cross link'), href: '/orchestrator' },
            { label: t('Submission cross link'), href: '/submit' },
            { label: 'Economic Presence', href: '/presence' },
            { label: 'Execution', href: '/execution' },
            { label: 'Economic Identity', href: '/identity' },
            { label: 'Surface Map', href: '/map' },
            { label: 'Graph', href: '/graph' },
            { label: 'Query', href: '/query' },
          ]}
        />
      </EconomicSection>

      <EconomicDetailToggle title={t('Launch manifest title')}>
        <EconomicManifestLink
          manifests={[{ label: t('Launch manifest note'), uri: '/registry/launch/index.json' }]}
        />
        <Meta style={{ marginTop: 12 }}>
          Read-only · execution disabled · as of {model.asOf}
        </Meta>
      </EconomicDetailToggle>
    </EconomicPageShell>
  )
}

export default UserLaunchConsole
