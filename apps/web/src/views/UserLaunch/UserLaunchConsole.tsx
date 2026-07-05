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
  EconomicAiLayer,
  EconomicManifestLink,
} from 'views/EconomicOS/components'
import { HumanListingCta, HumanIntentGrid } from 'views/HumanCore'
import { CREATE_INTENTS, MARCO_STAKING_INTENTS } from './create-intents'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Meta = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
`

type CapabilityGroup = 'available' | 'planned' | 'blocked'

const capabilityGroup = (status: LaunchCapabilityStatus): CapabilityGroup => {
  if (status === 'LIVE' || status === 'AVAILABLE_EXISTING_FLOW') return 'available'
  if (status === 'PLANNED') return 'planned'
  return 'blocked'
}

const GROUP_LABELS: Record<CapabilityGroup, string> = {
  available: 'Available',
  planned: 'Coming soon',
  blocked: 'Requires review',
}

const CapabilityDetail: React.FC<{ capability: LaunchCapability }> = ({ capability }) => (
  <EconomicCard title={capability.label}>
    <EconomicBadge status={capability.status} />
    <Meta style={{ marginTop: 8 }}>{capability.description}</Meta>
    {capability.existingFlowHref && (
      <Meta style={{ marginTop: 8 }}>
        <Link href={capability.existingFlowHref} style={{ color: tokens.gold }}>
          Open flow →
        </Link>
      </Meta>
    )}
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

  return (
    <EconomicPageShell>
      <EconomicHero
        title="Create"
        subtitle="What do you want to create? Pick an action — no technical setup required to start."
        primaryAction={{ href: '/submit', label: 'List your project' }}
      />

      <HumanListingCta href="/submit" />

      <EconomicSection title="What do you want to create?">
        <HumanIntentGrid intents={CREATE_INTENTS} />
      </EconomicSection>

      <EconomicSection title="Reward MARCO holders" lead="Create a staking pool for MARCO holders.">
        <HumanIntentGrid intents={MARCO_STAKING_INTENTS} />
      </EconomicSection>

      <EconomicSection title="Quick links">
        <EconomicActionGrid
          links={[
            { label: 'Add liquidity', href: '/liquidity-studio' },
            { label: 'Earn — Farms', href: '/farms' },
            { label: 'Earn — Pools', href: '/pools' },
            { label: 'Explore projects', href: '/projects' },
          ]}
        />
      </EconomicSection>

      <EconomicAiLayer title="Capability registry">
        <EconomicStatusSummary
          items={[
            { label: 'Available now', value: String(model.summary.live + model.summary.availableExistingFlow) },
            { label: 'Coming soon', value: String(model.summary.planned) },
            { label: 'Requires review', value: String(model.summary.blocked) },
          ]}
        />
        {(['available', 'planned', 'blocked'] as CapabilityGroup[]).map((group) =>
          grouped[group].length > 0 ? (
            <EconomicDetailToggle key={group} title={`${GROUP_LABELS[group]} (${grouped[group].length})`}>
              {grouped[group].map((capability) => (
                <CapabilityDetail key={capability.id} capability={capability} />
              ))}
            </EconomicDetailToggle>
          ) : null,
        )}
        <EconomicManifestLink manifests={[{ label: 'Launch manifest', uri: '/registry/launch/index.json' }]} />
        <Meta style={{ marginTop: 12 }}>Read-only · as of {model.asOf}</Meta>
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default UserLaunchConsole
