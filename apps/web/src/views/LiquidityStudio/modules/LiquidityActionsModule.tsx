/**
 * LIQUIDITY_MODULE_002_ACTIONS — journey chooser (navigation + explanation only).
 * No Add Liquidity form. No AI Builder execution.
 */
import React from 'react'
import NextLink from 'next/link'
import styled from 'styled-components'
import { LIQUIDITY_ACTIONS_COPY, liquidityActions } from './liquidityActionsTokens'

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityActions.contentMax};
  margin: ${liquidityActions.gapAfterHero} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 0;

  @media (max-width: ${liquidityActions.tabletBreak}) {
    padding: 0 16px;
  }
`

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: ${liquidityActions.columnGap};
  row-gap: ${liquidityActions.columnGap};
  align-items: stretch;
  min-width: 0;

  @media (max-width: ${liquidityActions.twoColMin}) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.article`
  width: 100%;
  max-width: ${liquidityActions.cardW};
  min-height: ${liquidityActions.cardMinH};
  box-sizing: border-box;
  margin: 0 auto;
  border-radius: ${liquidityActions.cardRadius};
  border: ${liquidityActions.cardBorder};
  background: ${liquidityActions.cardBg};
  padding: ${liquidityActions.cardPad};
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: ${liquidityActions.titleSize};
  line-height: ${liquidityActions.titleLine};
  font-weight: ${liquidityActions.titleWeight};
  color: ${liquidityActions.titleColor};
  letter-spacing: -0.02em;
`

const CardDesc = styled.p`
  margin: 0;
  font-size: ${liquidityActions.descSize};
  line-height: ${liquidityActions.descLine};
  font-weight: 400;
  color: ${liquidityActions.descColor};
`

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
`

const Step = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const StepLabel = styled.span`
  font-size: ${liquidityActions.stepSize};
  line-height: ${liquidityActions.stepLine};
  font-weight: 600;
  color: ${liquidityActions.stepColor};
`

const StepArrow = styled.span`
  font-size: 12px;
  line-height: 14px;
  color: ${liquidityActions.gold};
  opacity: 0.85;
  padding-left: 2px;
`

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`

const PrimaryCta = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  height: ${liquidityActions.ctaH};
  padding: 0 ${liquidityActions.ctaPadX};
  border-radius: ${liquidityActions.ctaRadius};
  background: ${liquidityActions.gold};
  color: #111;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  transition: background 0.15s ease;

  &:hover {
    background: ${liquidityActions.goldHover};
  }

  &:focus-visible {
    outline: ${liquidityActions.focusRing};
    outline-offset: ${liquidityActions.focusOffset};
  }
`

const Unavailable = styled.div`
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: rgba(244, 196, 48, 0.06);
  padding: 12px 14px;
`

const UnavailableTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${liquidityActions.gold};
`

const UnavailableBody = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.58);
`

function JourneySteps({ steps, testId }: { steps: readonly string[]; testId: string }) {
  return (
    <Steps data-testid={testId} aria-label="Journey steps">
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
          {index < steps.length - 1 ? <StepArrow aria-hidden="true">↓</StepArrow> : null}
        </Step>
      ))}
    </Steps>
  )
}

export const LiquidityActionsModule: React.FC = () => {
  const aiAvailable = liquidityActions.aiBuilderAvailable

  return (
    <Shell
      data-testid="liquidity-actions-module"
      data-liquidity-module="002-actions"
      data-liquidity-module-002="mounted"
      aria-label={LIQUIDITY_ACTIONS_COPY.sectionLabel}
    >
      <Grid data-testid="liquidity-actions-grid" data-liquidity-actions-geometry="1376-24-676">
        <Card data-testid="liquidity-actions-manual" data-liquidity-action="manual">
          <CardTitle>{LIQUIDITY_ACTIONS_COPY.manual.title}</CardTitle>
          <CardDesc>{LIQUIDITY_ACTIONS_COPY.manual.description}</CardDesc>
          <JourneySteps steps={LIQUIDITY_ACTIONS_COPY.manual.steps} testId="liquidity-actions-manual-steps" />
          <Footer>
            <PrimaryCta href={liquidityActions.manualHref} data-testid="liquidity-actions-cta-manual">
              {LIQUIDITY_ACTIONS_COPY.manual.cta}
            </PrimaryCta>
          </Footer>
        </Card>

        <Card data-testid="liquidity-actions-ai" data-liquidity-action="ai-builder">
          <CardTitle>{LIQUIDITY_ACTIONS_COPY.aiBuilder.title}</CardTitle>
          <CardDesc>{LIQUIDITY_ACTIONS_COPY.aiBuilder.description}</CardDesc>
          <JourneySteps steps={LIQUIDITY_ACTIONS_COPY.aiBuilder.steps} testId="liquidity-actions-ai-steps" />
          <Footer>
            {aiAvailable ? (
              <PrimaryCta href={liquidityActions.aiBuilderHref} data-testid="liquidity-actions-cta-ai">
                {LIQUIDITY_ACTIONS_COPY.aiBuilder.cta}
              </PrimaryCta>
            ) : (
              <Unavailable data-testid="liquidity-actions-ai-unavailable" role="status">
                <UnavailableTitle>{LIQUIDITY_ACTIONS_COPY.aiBuilder.unavailableTitle}</UnavailableTitle>
                <UnavailableBody>{LIQUIDITY_ACTIONS_COPY.aiBuilder.unavailableBody}</UnavailableBody>
              </Unavailable>
            )}
          </Footer>
        </Card>
      </Grid>
    </Shell>
  )
}

export default LiquidityActionsModule
