import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveSmartExecutionReadModel } from 'lib/smart-execution'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Root = styled.div`
  min-height: 100vh;
  background: ${tokens.bg};
  color: ${tokens.text};
  font-family: ${tokens.fontBody};
  padding: 24px 24px 48px;
`

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${tokens.goldHighlight};
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const Panel = styled.section`
  background: ${tokens.surfaceGlass};
  backdrop-filter: blur(14px);
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radius};
  padding: 20px;
`

const PanelTitle = styled.h2`
  margin: 0 0 16px;
  font-family: ${tokens.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${tokens.gold};
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
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

const Meta = styled.p`
  margin: 0 0 12px;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const CandidateGrid = styled.div`
  display: grid;
  gap: 12px;
`

const CandidateCard = styled.div<{ $highlight?: boolean }>`
  border: 1px solid ${({ $highlight }) => ($highlight ? tokens.gold : tokens.border)};
  border-radius: ${tokens.radiusSm};
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
`

const CandidateTitle = styled.div`
  font-family: ${tokens.fontDisplay};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
`

const ScoreBar = styled.div`
  display: grid;
  gap: 8px;
`

const ScoreRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr 40px;
  gap: 10px;
  align-items: center;
  font-size: 11px;
`

const ScoreTrack = styled.div`
  height: 6px;
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
  margin: 0;
  padding-left: 18px;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;

  li {
    margin-bottom: 6px;
  }
`

const Tag = styled.span<{ $kind: string }>`
  display: inline-block;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
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
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Root>
        <Shell>
          <header>
            <Title>{t('Execution page title')}</Title>
            <Subtitle>{t('Execution page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Execution canonical title')}</PanelTitle>
            <Row>
              <span>{t('CMD chain label')}</span>
              <strong>{model.constitutional.canonicalChain}</strong>
            </Row>
            <Row>
              <span>{t('CMD asset label')}</span>
              <strong>{model.constitutional.canonicalAsset}</strong>
            </Row>
            <Row>
              <span>{t('CMD status label')}</span>
              <LiveDot>{model.constitutional.status}</LiveDot>
            </Row>
            <Meta>{t('Execution illustrative note')}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution constraints title')}</PanelTitle>
            {model.constraints.map((constraint) => (
              <Meta key={constraint.id}>
                <strong>{constraint.label}:</strong> {constraint.rule}
              </Meta>
            ))}
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution recommendation title')}</PanelTitle>
            <CandidateCard $highlight>
              <CandidateTitle>{model.recommendation.label}</CandidateTitle>
              <Meta>
                {model.recommendation.venue} · {model.recommendation.chain}
              </Meta>
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
            </CandidateCard>
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution candidates title')}</PanelTitle>
            <Meta>{model.disclaimer}</Meta>
            <CandidateGrid>
              {model.candidates.map((candidate) => {
                const score = model.scores.find((entry) => entry.candidateId === candidate.id)
                const isRecommended = candidate.id === model.recommendation.candidateId
                return (
                  <CandidateCard key={candidate.id} $highlight={isRecommended}>
                    <CandidateTitle>
                      {candidate.label}
                      {isRecommended ? ` · ${t('Execution recommended')}` : ''}
                    </CandidateTitle>
                    <Meta>
                      {candidate.venue} · {candidate.chain} · {t('Execution illustrative sample')}
                    </Meta>
                    <Row>
                      <span>{t('Execution quality score')}</span>
                      <strong>{score?.executionQualityScore}</strong>
                    </Row>
                    <Row>
                      <span>{t('Civilization benefit score')}</span>
                      <strong>{score?.civilizationBenefitScore}</strong>
                    </Row>
                  </CandidateCard>
                )
              })}
            </CandidateGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution score breakdown title')}</PanelTitle>
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
            <Meta style={{ marginTop: 12 }}>{t('Execution score breakdown note')}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution alternatives title')}</PanelTitle>
            {model.alternatives.length === 0 ? (
              <Meta>{t('Execution no alternatives')}</Meta>
            ) : (
              <CandidateGrid>
                {model.alternatives.map((alternative) => (
                  <CandidateCard key={alternative.candidateId}>
                    <CandidateTitle>
                      #{alternative.rank} {alternative.label}
                    </CandidateTitle>
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
                  </CandidateCard>
                ))}
              </CandidateGrid>
            )}
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution rejections title')}</PanelTitle>
            <CandidateGrid>
              {model.rejections.map((rejection) => (
                <CandidateCard key={rejection.candidateId}>
                  <CandidateTitle>{rejection.label}</CandidateTitle>
                  <ReasonList>
                    {rejection.reasons.map((reason) => (
                      <li key={reason.id}>
                        <Tag $kind={reason.kind}>{reason.kind}</Tag>
                        {reason.message}
                      </li>
                    ))}
                  </ReasonList>
                </CandidateCard>
              ))}
            </CandidateGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Execution manifest title')}</PanelTitle>
            <Meta>
              {t('Execution manifest note')}:{' '}
              <a href="/registry/execution/index.json" style={{ color: tokens.gold }}>
                /registry/execution/index.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Read-only · execution disabled · illustrative samples · as of {model.asOf}
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('View economic presence registry')}:{' '}
              <a href="/presence" style={{ color: tokens.gold }}>
                /presence
              </a>
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default SmartExecutionExplorer
