import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveUserWorkspaceReadModel } from 'lib/user-workspace'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicCard,
  EconomicBadge,
  EconomicActionGrid,
  EconomicAiLayer,
  EconomicManifestLink,
} from 'views/EconomicOS/components'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Meta = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
`

const ItemList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.5;

  li {
    margin-bottom: 8px;
  }
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
`

const SectionTitle = styled.strong`
  display: block;
  color: ${tokens.text};
  font-size: 15px;
`

const ModuleLink = styled.a`
  font-size: 12px;
  color: ${tokens.gold};
  text-decoration: none;
  white-space: nowrap;
  font-weight: 600;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${tokens.success};
  font-weight: 600;
  font-size: 12px;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${tokens.success};
  }
`

const EmptyPanel = styled.div`
  margin-top: 10px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
`

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.text};
`

const EmptyDesc = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.45;
`

const UserWorkspaceConsole: React.FC = () => {
  const model = resolveUserWorkspaceReadModel()

  return (
    <EconomicPageShell>
      <EconomicHero
        title="My Economy"
        subtitle="Your activity, positions, and projects — one calm cockpit aligned with Melega DEX."
        primaryAction={{ href: '/trade', label: 'Open Trade' }}
      />

      <EconomicSection title="Your activity">
        {model.sections.map((section) => (
          <EconomicCard key={section.id}>
            <SectionHeader>
              <div>
                <SectionTitle>{section.label}</SectionTitle>
                <Meta style={{ marginTop: 4 }}>{section.description}</Meta>
              </div>
              <Link href={section.moduleHref} passHref legacyBehavior>
                <ModuleLink>{t('Workspace open module')} →</ModuleLink>
              </Link>
            </SectionHeader>

            {section.hasActivity ? (
              <ItemList>
                {section.items.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link href={item.href} style={{ color: tokens.gold, fontWeight: 600 }}>
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                    {item.status ? ` · ${item.status}` : ''}
                    {item.notes ? ` — ${item.notes}` : ''}
                  </li>
                ))}
              </ItemList>
            ) : (
              <EmptyPanel>
                <EmptyTitle>No activity yet</EmptyTitle>
                <EmptyDesc>{section.emptyMessage}</EmptyDesc>
              </EmptyPanel>
            )}
          </EconomicCard>
        ))}
      </EconomicSection>

      <EconomicAiLayer title="Workspace details">
        <EconomicCard>
          <Meta>
            {model.constitutional.canonicalChain} · {model.constitutional.canonicalAsset} ·{' '}
            <LiveDot>{model.constitutional.status}</LiveDot>
          </Meta>
          <Meta style={{ marginTop: 8 }}>{model.disclaimer}</Meta>
        </EconomicCard>
        <EconomicSection title={t('Workspace future title')} columns={2}>
          {model.futureSurfaces.map((surface) => (
            <EconomicCard key={surface.id} title={surface.label} footer={surface.notes}>
              <EconomicBadge status={surface.status} />
            </EconomicCard>
          ))}
        </EconomicSection>
      </EconomicAiLayer>

      <EconomicAiLayer title={t('Workspace manifest title')}>
        <EconomicManifestLink
          manifests={[
            { label: t('Workspace manifest note'), uri: '/registry/workspace/index.json' },
            { label: t('Dry run manifest note'), uri: '/registry/dry-runs/civilization-dry-run.json' },
          ]}
        />
        <EconomicActionGrid
          links={[
            { label: t('Pipeline cross link'), href: '/pipeline' },
            { label: t('Runtime cross link'), href: '/runtime/labs' },
            { label: t('Identity cross link'), href: '/identity' },
            { label: t('Surface map cross link'), href: '/map' },
            { label: t('Submission cross link'), href: '/submit' },
            { label: t('Review cross link'), href: '/review' },
            { label: t('Orchestrator cross link'), href: '/orchestrator' },
            { label: 'Dry run', href: '/dry-run' },
          ]}
        />
        <Meta style={{ marginTop: 12 }}>
          Read-only · execution disabled · as of {model.asOf}
        </Meta>
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default UserWorkspaceConsole
