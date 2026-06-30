import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import {
  resolveEconomicSubmissionReadModel,
  SubmissionReviewStatus,
  SubmissionSafetyClassification,
  SubmissionValidationStatus,
} from 'lib/economic-submission'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const statusColor = (status: SubmissionValidationStatus | SubmissionReviewStatus) => {
  switch (status) {
    case 'valid':
    case 'approved':
      return tokens.success
    case 'pending':
    case 'submitted':
    case 'under_review':
    case 'draft':
      return tokens.gold
    case 'blocked':
    case 'invalid':
    case 'rejected':
      return '#f87171'
    default:
      return tokens.textSecondary
  }
}

const safetyColor = (safety: SubmissionSafetyClassification) => {
  switch (safety) {
    case 'observation_only':
      return tokens.success
    case 'human_review_required':
      return tokens.goldHighlight
    case 'future_execution':
      return tokens.gold
    default:
      return '#f87171'
  }
}

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

const Badge = styled.span<{ $color: string }>`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => `${$color}55`};
`

const CategoryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const CategoryCard = styled.div`
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.55;

  strong {
    font-family: ${tokens.fontDisplay};
    color: ${tokens.goldHighlight};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  ul {
    margin: 8px 0 0;
    padding-left: 18px;
  }
`

const ExampleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CrossLinkGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const CrossLink = styled(Link)`
  padding: 8px 12px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 11px;
  color: ${tokens.textSecondary};
  text-decoration: none;

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.text};
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const GateList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const EconomicSubmissionConsole: React.FC = () => {
  const model = resolveEconomicSubmissionReadModel()

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
            <Title>{t('Submission page title')}</Title>
            <Subtitle>{t('Submission page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Submission overview title')}</PanelTitle>
            <Meta>{model.disclaimer}</Meta>
            <Meta style={{ marginTop: 12 }}>
              {t('Submission live count')}: {model.liveSubmissionsIndexed} ·{' '}
              {t('Submission persistence')}: {model.persistenceEnabled ? 'enabled' : 'disabled'}
            </Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Submission categories title')}</PanelTitle>
            <CategoryGrid>
              {model.categories.map((category) => (
                <CategoryCard key={category.id}>
                  <strong>{category.label}</strong>
                  <Badge $color={safetyColor(category.defaultSafety)} style={{ marginLeft: 8 }}>
                    {category.defaultSafety}
                  </Badge>
                  <Meta style={{ marginTop: 8 }}>{category.description}</Meta>
                  <Meta style={{ marginTop: 8 }}>
                    {t('Submission target surface')}:{' '}
                    <Link href={category.targetSurface} style={{ color: tokens.gold }}>
                      {category.targetSurface}
                    </Link>
                    {' · '}
                    {t('Submission target registry')}: {category.targetRegistry}
                  </Meta>
                  <Meta style={{ marginTop: 8 }}>
                    {t('Submission intake family')}: <code>{category.resultingEventIntakeFamily}</code>
                    {' → '}
                    {category.resultingRegistryTarget}
                  </Meta>
                  <ul>
                    <li>
                      <strong style={{ color: tokens.gold }}>{t('Submission required fields')}</strong>:{' '}
                      {category.requiredFields.map((field) => field.label).join(', ')}
                    </li>
                    {category.optionalFields.length > 0 && (
                      <li>
                        <strong style={{ color: tokens.gold }}>{t('Submission optional fields')}</strong>:{' '}
                        {category.optionalFields.map((field) => field.label).join(', ')}
                      </li>
                    )}
                  </ul>
                </CategoryCard>
              ))}
            </CategoryGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Submission review gates title')}</PanelTitle>
            <GateList>
              {model.reviewGates.map((gate) => (
                <li key={gate.id}>
                  <Badge $color={statusColor(gate.status)}>{gate.status}</Badge> — {gate.description}
                </li>
              ))}
            </GateList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Submission examples title')}</PanelTitle>
            <Meta style={{ marginBottom: 12 }}>{t('Submission examples note')}</Meta>
            <ExampleList>
              {model.schemaExamples.map((submission) => (
                <CategoryCard key={submission.submissionId}>
                  <strong>{submission.category.replace(/_/g, ' ')}</strong>
                  <Badge $color={statusColor(submission.validationStatus)} style={{ marginLeft: 8 }}>
                    {submission.validationStatus}
                  </Badge>
                  <Badge $color={statusColor(submission.reviewStatus)} style={{ marginLeft: 8 }}>
                    {submission.reviewStatus}
                  </Badge>
                  <Meta style={{ marginTop: 8 }}>{submission.nextAction}</Meta>
                  <Meta style={{ marginTop: 6 }}>
                    {t('Submission missing fields')}: {submission.missingFields.join(', ')}
                  </Meta>
                  <Meta style={{ marginTop: 6 }}>
                    {t('Submission human review')}: {submission.humanReviewerAction}
                  </Meta>
                  <Meta style={{ marginTop: 4 }}>
                    {t('Submission ai review')}: {submission.aiReviewerAction}
                  </Meta>
                </CategoryCard>
              ))}
            </ExampleList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Submission cross links title')}</PanelTitle>
            <CrossLinkGrid>
              {model.crossLinks.map((link) =>
                link.route.startsWith('/registry') ? (
                  <a
                    key={link.route}
                    href={link.route}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${tokens.border}`,
                      borderRadius: tokens.radiusSm,
                      fontSize: 11,
                      color: tokens.textSecondary,
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <CrossLink key={link.route} href={link.route}>
                    {link.label}
                  </CrossLink>
                ),
              )}
              <CrossLink href="/submit">{t('Submission cross link')}</CrossLink>
            </CrossLinkGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Submission manifest title')}</PanelTitle>
            <Meta>
              {t('Submission manifest note')}:{' '}
              <a href="/registry/submission/economic-submission.json" style={{ color: tokens.gold }}>
                /registry/submission/economic-submission.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Read-only · no persistence · as of {model.asOf}
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default EconomicSubmissionConsole
