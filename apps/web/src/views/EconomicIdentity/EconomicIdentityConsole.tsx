import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  resolveEconomicIdentityReadModel,
  ResolveEconomicIdentityOptions,
  IdentityArchetype,
} from 'lib/economic-identity'
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
`

const FramingChip = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${tokens.border};
  color: ${tokens.textSecondary};
  background: rgba(0, 0, 0, 0.2);
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
`

const ModuleLink = styled.a`
  font-size: 12px;
  color: ${tokens.gold};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

const ItemList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.5;

  li {
    margin-bottom: 6px;
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

const archetypeLabel = (id: IdentityArchetype): string =>
  id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

interface EconomicIdentityConsoleProps {
  options?: ResolveEconomicIdentityOptions
}

const EconomicIdentityConsole: React.FC<EconomicIdentityConsoleProps> = ({ options }) => {
  const model = resolveEconomicIdentityReadModel(options)

  return (
    <EconomicPageShell>
      <EconomicHero title={t('Identity page title')} subtitle={t('Identity page subtitle')} />

      <EconomicSection title={t('Identity framing title')}>
        <EconomicCard>
          <BadgeRow>
            <FramingChip>{t('Identity not social')}</FramingChip>
            <FramingChip>{t('Identity not kyc')}</FramingChip>
            <FramingChip>{t('Identity not account')}</FramingChip>
            <FramingChip style={{ borderColor: tokens.success, color: tokens.success }}>
              {t('Identity read only')}
            </FramingChip>
          </BadgeRow>
          <Meta style={{ marginTop: 12 }}>{model.disclaimer}</Meta>
        </EconomicCard>
      </EconomicSection>

      <EconomicSection title={t('Identity wallet title')}>
        <EconomicCard>
          <EconomicBadge status={model.wallet.status} />
          {model.wallet.address && (
            <Meta style={{ marginTop: 8, fontFamily: 'monospace' }}>{model.wallet.address}</Meta>
          )}
          <Meta style={{ marginTop: 8 }}>{model.wallet.notes}</Meta>
          <Meta style={{ marginTop: 8 }}>
            {t('Identity placeholder route')}:{' '}
            <Link href="/identity/placeholder" style={{ color: tokens.gold }}>
              /identity/placeholder
            </Link>
          </Meta>
        </EconomicCard>
      </EconomicSection>

      <EconomicSection
        title={t('Identity archetypes title')}
        lead={`${t('Identity primary archetype')}: ${archetypeLabel(model.primaryArchetype)}`}
        columns={2}
      >
        {model.archetypes.map((archetype) => (
          <EconomicCard
            key={archetype.id}
            title={archetype.label}
            footer={archetype.id === model.primaryArchetype ? 'Primary' : undefined}
          >
            <Meta>{archetype.description}</Meta>
            <div style={{ marginTop: 8 }}>
              <EconomicBadge status={archetype.status} />
            </div>
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicSection title={t('Identity agent readiness title')}>
        <EconomicStatusSummary
          items={[
            {
              label: model.agentReadiness.label.replace(/_/g, ' '),
              value: `${model.agentReadiness.score} / ${model.agentReadiness.maxScore}`,
            },
            { label: t('Identity illustrative score'), value: String(model.agentReadiness.score) },
          ]}
        />
        <EconomicAiLayer title="Dimension breakdown">
          <ItemList>
            {model.agentReadiness.dimensions.map((dimension) => (
              <li key={dimension.id}>
                {dimension.label} · {dimension.status} · +{Math.round(dimension.contribution * 100)}%
              </li>
            ))}
          </ItemList>
          <Meta style={{ marginTop: 8 }}>{model.agentReadiness.notes}</Meta>
        </EconomicAiLayer>
      </EconomicSection>

      <EconomicSection title={t('Identity surfaces title')}>
        <Meta>
          {model.constitutional.canonicalChain} · {model.constitutional.canonicalAsset} ·{' '}
          <LiveDot>{model.constitutional.status}</LiveDot>
        </Meta>
        {model.sections
          .filter((section) => !['identity_role', 'wallet'].includes(section.id))
          .map((section) => (
            <EconomicCard key={section.id}>
              <SectionHeader>
                <div>
                  <strong style={{ color: tokens.text }}>{section.label}</strong>
                  <Meta style={{ marginTop: 4 }}>{section.description}</Meta>
                </div>
                <Link href={section.moduleHref} passHref legacyBehavior>
                  <ModuleLink>{t('Identity open module')} →</ModuleLink>
                </Link>
              </SectionHeader>
              {section.items.length > 0 ? (
                <ItemList>
                  {section.items.slice(0, 6).map((item) => (
                    <li key={item.id}>
                      {item.href ? (
                        <Link href={item.href} style={{ color: tokens.gold }}>
                          {item.label}
                        </Link>
                      ) : (
                        item.label
                      )}
                      {item.status ? ` · ${item.status}` : ''}
                      {item.notes ? ` — ${item.notes}` : ''}
                    </li>
                  ))}
                  {section.items.length > 6 && (
                    <li>… {section.items.length - 6} more indexed</li>
                  )}
                </ItemList>
              ) : (
                <Meta style={{ marginTop: 8, fontStyle: 'italic' }}>{section.emptyMessage}</Meta>
              )}
            </EconomicCard>
          ))}
      </EconomicSection>

      <EconomicSection title={t('Identity cross links title')}>
        <EconomicActionGrid
          links={[
            { label: 'Workspace', href: model.crossLinks.workspace },
            { label: 'Launch', href: model.crossLinks.launch },
            { label: 'Identity Hub (Collectibles)', href: model.crossLinks.collectibles },
            { label: 'Presence', href: model.crossLinks.presence },
            { label: 'Activation', href: model.crossLinks.activation },
            { label: 'Execution', href: model.crossLinks.execution },
            { label: 'Surface Map', href: '/map' },
            { label: 'Graph', href: model.crossLinks.graph },
            { label: 'Query', href: model.crossLinks.query },
          ]}
        />
      </EconomicSection>

      <EconomicAiLayer title={t('Identity manifest title')}>
        <EconomicManifestLink
          manifests={[{ label: t('Identity manifest note'), uri: '/registry/identity/index.json' }]}
        />
        <Meta style={{ marginTop: 12 }}>
          Read-only · execution disabled · as of {model.asOf}
        </Meta>
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default EconomicIdentityConsole
