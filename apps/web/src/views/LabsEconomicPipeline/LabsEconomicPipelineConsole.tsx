import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveLabsEconomicPipelineReadModel } from 'lib/labs-economic-pipeline'
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

const Field = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;

  strong {
    display: block;
    color: ${tokens.gold};
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  ul {
    margin: 4px 0 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 4px;
  }
`

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;

  a {
    font-size: 12px;
    color: ${tokens.gold};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

const ReasonNote = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: ${tokens.goldHighlight};
  line-height: 1.5;
`

const LabsEconomicPipelineConsole: React.FC = () => {
  const model = resolveLabsEconomicPipelineReadModel()
  const pipeline = model.pipelines[0]

  return (
    <EconomicPageShell>
      <EconomicHero title={t('Pipeline page title')} subtitle={t('Pipeline page subtitle')} />

      <EconomicStatusSummary
        items={[
          { label: t('Pipeline stages total'), value: String(pipeline.readiness.total) },
          { label: t('Pipeline stages ready'), value: String(pipeline.readiness.ready) },
          { label: t('Pipeline stages waiting'), value: String(pipeline.readiness.waiting) },
          { label: t('Pipeline stages planned'), value: String(pipeline.readiness.planned) },
        ]}
      />

      <EconomicSection title={t('Pipeline timeline title')} lead={pipeline.description}>
        <EconomicTimeline
          steps={pipeline.stages.map((stage, index) => ({
            label: stage.label,
            description: stage.purpose,
            surface: stage.linkedSurface,
            index: index + 1,
          }))}
        />
      </EconomicSection>

      <EconomicDetailToggle title="Technical details">
        <Meta>{model.disclaimer}</Meta>
        <Meta style={{ marginTop: 12 }}>
          {pipeline.label} · {model.constitutional.canonicalAsset} on{' '}
          {model.constitutional.canonicalChain} · <EconomicBadge status={model.constitutional.status} />
        </Meta>
        {pipeline.stages.map((stage) => (
          <EconomicCard key={stage.id} title={stage.label}>
            <EconomicBadge status={stage.status} />
            <Field style={{ marginTop: 12 }}>
              <strong>{t('Pipeline purpose')}</strong>
              {stage.purpose}
            </Field>
            <Field>
              <strong>{t('Pipeline human action')}</strong>
              {stage.humanAction}
            </Field>
            <Field>
              <strong>{t('Pipeline agent action')}</strong>
              {stage.agentAction}
            </Field>
            <Field>
              <strong>{t('Pipeline required inputs')}</strong>
              <ul>
                {stage.requiredInputs.map((input) => (
                  <li key={input.id}>
                    {input.label}
                    {input.required ? ' *' : ''}
                    {input.indexed ? ` · ${t('Pipeline indexed')}` : ` · ${t('Pipeline not indexed')}`}
                    {input.notes ? ` — ${input.notes}` : ''}
                  </li>
                ))}
              </ul>
            </Field>
            {stage.dependencies.length > 0 && (
              <Field>
                <strong>{t('Pipeline dependencies')}</strong>
                <ul>
                  {stage.dependencies.map((dependency) => (
                    <li key={dependency.stageId}>
                      {dependency.label}
                      {dependency.required ? ' *' : ` (${t('Pipeline optional')})`}
                    </li>
                  ))}
                </ul>
              </Field>
            )}
            <Field>
              <strong>{t('Pipeline output artifact')}</strong>
              <code style={{ fontSize: 11 }}>{stage.outputArtifact}</code>
            </Field>
            {stage.blockedReason && <ReasonNote>{stage.blockedReason}</ReasonNote>}
            {stage.plannedReason && <ReasonNote>{stage.plannedReason}</ReasonNote>}
            <LinkRow>
              <Link href={stage.linkedSurface}>
                {t('Pipeline linked surface')}: {stage.linkedSurface}
              </Link>
              {stage.manifestUri && (
                <a href={stage.manifestUri}>
                  {t('Pipeline manifest')}: {stage.manifestUri}
                </a>
              )}
            </LinkRow>
          </EconomicCard>
        ))}
        <Meta style={{ marginTop: 16, marginBottom: 12 }}>{t('Pipeline cross links title')}</Meta>
        <EconomicActionGrid
          links={[
            ...model.crossLinks.map((link) => ({ label: link.label, href: link.route })),
            { label: t('Runtime cross link'), href: '/runtime/labs' },
            { label: t('Orchestrator cross link'), href: '/orchestrator' },
            { label: t('Submission cross link'), href: '/submit' },
            { label: t('Review cross link'), href: '/review' },
          ]}
        />
      </EconomicDetailToggle>

      <EconomicDetailToggle title="Manifest">
        <EconomicManifestLink
          manifests={[
            {
              label: t('Pipeline manifest note'),
              uri: '/registry/pipeline/labs-economic-pipeline.json',
            },
            { label: t('Intake cross link'), uri: '/registry/intake/real-event-intake.json' },
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
          Read-only · execution disabled · as of {model.asOf}
        </Meta>
      </EconomicDetailToggle>
    </EconomicPageShell>
  )
}

export default LabsEconomicPipelineConsole
