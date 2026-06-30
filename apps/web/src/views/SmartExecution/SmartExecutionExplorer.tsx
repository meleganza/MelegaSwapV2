import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveSmartExecutionReadModel } from 'lib/smart-execution'
import translations from 'config/localization/translations.json'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicStatusSummary,
  EconomicSection,
  EconomicCard,
  EconomicAiLayer,
  EconomicManifestLink,
} from 'views/EconomicOS/components'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid ${tokens.border};
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    color: ${tokens.textSecondary};
  }

  strong {
    color: ${tokens.text};
    font-weight: 500;
  }
`

const Meta = styled.p`
  margin: 0 0 10px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ScoreBar = styled.div`
  display: grid;
  gap: 8px;
`

const ScoreRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 36px;
  gap: 8px;
  align-items: center;
  font-size: 11px;
`

const ScoreTrack = styled.div`
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`

const ScoreFill = styled.div<{ $value: number; $accent?: boolean }>`
  height: 100%;
  width: ${({ $value }) => $value}%;
  background: ${({ $accent }) => ($accent ? tokens.goldHighlight : tokens.success)};
`

const ReasonList = styled.ul`
  margin: 8px 0 0;
  padding-left: 16px;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;

  li {
    margin-bottom: 4px;
  }
`

const Tag = styled.span<{ $kind: string }>`
  display: inline-block;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 5px;
  border-radius: 4px;
  margin-right: 6px;
  color: ${({ $kind }) =>
    $kind === 'rejection'
      ? '#f87171'
      : $kind === 'recommendation'
        ? tokens.success
        : $kind === 'constraint'
          ? tokens.gold
          : tokens.textSecondary};
  border: 1px solid
    ${({ $kind }) =>
      $kind === 'rejection'
        ? '#f87171'
        : $kind === 'recommendation'
          ? tokens.success
          : tokens.border};
`

const SmartExecutionExplorer: React.FC = () => {
  const model = resolveSmartExecutionReadModel()
  const recommendedScore = model.scores.find(
    (score) => score.candidateId === model.recommendation.candidateId,
  )

  return (
    <EconomicPageShell>
      <EconomicHero title={t('Execution page title')} subtitle={t('Execution page subtitle')} />

      <EconomicStatusSummary
        items={[
          { label: t('CMD chain label'), value: model.constitutional.canonicalChain },
          { label: t('CMD asset label'), value: model.constitutional.canonicalAsset },
          { label: t('CMD status label'), value: '', status: model.constitutional.status },
        ]}
      />

      <EconomicSection title={t('Execution recommendation title')}>
        <EconomicCard
          title={model.recommendation.label}
          footer={`${model.recommendation.venue} · ${model.recommendation.chain}`}
        >
          <Row>
            <span>{t('Execution quality score')}</span>
            <strong>{model.recommendation.executionQualityScore}</strong>
          </Row>
          <Row>
            <span>{t('Civilization benefit score')}</span>
            <strong>{model.recommendation.civilizationBenefitScore}</strong>
          </Row>
          <ReasonList>
            {model.recommendation.reasons.map((reason) => (
              <li key={reason.id}>
                <Tag $kind={reason.kind}>{reason.kind}</Tag>
                {reason.message}
              </li>
            ))}
          </ReasonList>
        </EconomicCard>
      </EconomicSection>

      <EconomicSection title={t('Execution candidates title')} lead={model.disclaimer}>
        <Stack>
          {model.candidates.map((candidate) => {
            const score = model.scores.find((entry) => entry.candidateId === candidate.id)
            const isRecommended = candidate.id === model.recommendation.candidateId
            return (
              <EconomicCard
                key={candidate.id}
                title={
                  isRecommended
                    ? `${candidate.label} · ${t('Execution recommended')}`
                    : candidate.label
                }
                footer={`${candidate.venue} · ${candidate.chain}`}
              >
                <Row>
                  <span>{t('Execution quality score')}</span>
                  <strong>{score?.executionQualityScore}</strong>
                </Row>
                <Row>
                  <span>{t('Civilization benefit score')}</span>
                  <strong>{score?.civilizationBenefitScore}</strong>
                </Row>
              </EconomicCard>
            )
          })}
        </Stack>
      </EconomicSection>

      <EconomicAiLayer title={t('Execution constraints title')}>
        {model.constraints.map((constraint) => (
          <Meta key={constraint.id}>
            <strong>{constraint.label}:</strong> {constraint.rule}
          </Meta>
        ))}
        <Meta>{t('Execution illustrative note')}</Meta>
      </EconomicAiLayer>

      <EconomicAiLayer title={t('Execution score breakdown title')}>
        {recommendedScore && (
          <ScoreBar>
            {recommendedScore.dimensionScores.map((dimension) => (
              <ScoreRow key={dimension.id}>
                <span>{dimension.label}</span>
                <ScoreTrack>
                  <ScoreFill
                    $value={dimension.score}
                    $accent={dimension.id === 'civilization_benefit'}
                  />
                </ScoreTrack>
                <strong>{dimension.score}</strong>
              </ScoreRow>
            ))}
          </ScoreBar>
        )}
        <Meta>{t('Execution score breakdown note')}</Meta>
      </EconomicAiLayer>

      <EconomicAiLayer title={t('Execution alternatives title')}>
        {model.alternatives.length === 0 ? (
          <Meta>{t('Execution no alternatives')}</Meta>
        ) : (
          <Stack>
            {model.alternatives.map((alternative) => (
              <EconomicCard
                key={alternative.candidateId}
                title={`#${alternative.rank} ${alternative.label}`}
              >
                <Row>
                  <span>{t('Execution quality score')}</span>
                  <strong>{alternative.executionQualityScore}</strong>
                </Row>
                <Row>
                  <span>{t('Gap from recommended')}</span>
                  <strong>{alternative.gapFromRecommended}</strong>
                </Row>
                <ReasonList>
                  {alternative.reasons.map((reason) => (
                    <li key={reason.id}>
                      <Tag $kind={reason.kind}>{reason.kind}</Tag>
                      {reason.message}
                    </li>
                  ))}
                </ReasonList>
              </EconomicCard>
            ))}
          </Stack>
        )}
      </EconomicAiLayer>

      <EconomicAiLayer title={t('Execution rejections title')}>
        <Stack>
          {model.rejections.map((rejection) => (
            <EconomicCard key={rejection.candidateId} title={rejection.label}>
              <ReasonList>
                {rejection.reasons.map((reason) => (
                  <li key={reason.id}>
                    <Tag $kind={reason.kind}>{reason.kind}</Tag>
                    {reason.message}
                  </li>
                ))}
              </ReasonList>
            </EconomicCard>
          ))}
        </Stack>
      </EconomicAiLayer>

      <EconomicAiLayer title={t('Execution manifest title')}>
        <Meta>{t('Execution manifest note')}</Meta>
        <EconomicManifestLink manifests={[{ label: 'Execution index', uri: '/registry/execution/index.json' }]} />
        <Meta>
          Read-only · execution disabled · illustrative samples · as of {model.asOf}
        </Meta>
        <EconomicManifestLink manifests={[{ label: t('View economic presence registry'), uri: '/presence' }]} />
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default SmartExecutionExplorer
