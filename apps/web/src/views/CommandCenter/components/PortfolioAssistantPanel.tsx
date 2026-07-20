/**
 * AI Portfolio Assistant panel (R791D.5B).
 *
 * Deterministic Portfolio Intelligence UI from PortfolioAssistantContext.
 * Not a chatbot. Not financial advice. No LLM. No autonomous execution.
 */

import React from 'react'
import styled from 'styled-components'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import type {
  PortfolioAssistantActionContext,
  PortfolioAssistantContext,
  PortfolioAssistantState,
} from '../commandCenterRuntime/portfolioAssistantContext'
import {
  ActionItem,
  SectionHeader,
  CC_VISUAL_SPACING,
} from './commandCenterVisualFoundation'

const STATE_COPY: Record<
  Exclude<PortfolioAssistantState, 'READY'>,
  string
> = {
  DISCONNECTED: 'Connect your wallet to view portfolio intelligence.',
  EMPTY: 'No positions detected.',
  PARTIAL: 'Some portfolio data is unavailable.',
  UNAVAILABLE: 'Portfolio intelligence unavailable.',
}

/** Local section — does not reuse INTELLIGENCE_CENTER data-cc-center (avoids hierarchy dupes). */
const AssistantSection = styled.section`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${commandCenterColors.divider};
  margin-bottom: ${CC_VISUAL_SPACING.sectionGapTight};
`

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    gap: 18px;
  }
`

const Card = styled.div`
  min-width: 0;
  width: 100%;
  max-width: 100%;
  padding: 16px 18px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  overflow-x: hidden;
`

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  & + & {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid ${commandCenterColors.cardBorder};
  }
`

const BlockLabel = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${commandCenterColors.label};
`

const BlockText = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  line-height: 1.45;
  color: ${commandCenterColors.body};
  word-break: break-word;
`

const StateText = styled(BlockText)`
  color: ${commandCenterColors.white};
`

const InsightList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin-top: 6px;
`

const NavLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid ${commandCenterColors.cardBorder};
  background: transparent;
  color: ${commandCenterColors.white};
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    border-color: ${commandCenterColors.label};
  }
`

/** Navigational labels only — never execute on-chain actions. */
export type AssistantNavLinkKind = 'View' | 'Manage' | 'Open'

export function resolveAssistantNavLinks(
  action: PortfolioAssistantActionContext,
): AssistantNavLinkKind[] {
  if (!action.enabled || !action.route) return []
  switch (action.type) {
    case 'APPROVE':
    case 'WITHDRAW':
    case 'REMOVE_LIQUIDITY':
      return ['Manage', 'View']
    case 'CLAIM':
    case 'HARVEST':
      return ['Open', 'View']
    default:
      return ['View']
  }
}

export function buildPositionInsights(context: PortfolioAssistantContext): string[] {
  const seen = new Set<string>()
  const insights: string[] = []
  for (const action of context.actions) {
    const title = action.position?.trim()
    if (!title || seen.has(title)) continue
    seen.add(title)
    insights.push(`${title} has available actions.`)
  }
  return insights
}

function pickSummaryLine(lines: readonly string[], matcher: RegExp): string | null {
  return lines.find((line) => matcher.test(line)) ?? null
}

export function PortfolioAssistantPanel({
  context,
}: {
  context: PortfolioAssistantContext
}) {
  const { state, summary, actions } = context
  const isTerminalEmpty =
    state === 'DISCONNECTED' || state === 'EMPTY' || state === 'UNAVAILABLE'

  const stateSummary =
    state === 'READY' || state === 'PARTIAL'
      ? pickSummaryLine(summary.lines, /active position|You have \d+ position/i) ??
        (summary.activePositions > 0
          ? `You have ${summary.activePositions} active position${summary.activePositions === 1 ? '' : 's'}.`
          : summary.positionCount > 0
            ? `You have ${summary.positionCount} position${summary.positionCount === 1 ? '' : 's'}.`
            : null)
      : null

  const attentionSummary =
    state === 'READY' || state === 'PARTIAL'
      ? pickSummaryLine(summary.lines, /require(?:s)? attention/i) ??
        (summary.attentionCount > 0
          ? `${summary.attentionCount} position${summary.attentionCount === 1 ? '' : 's'} require${summary.attentionCount === 1 ? 's' : ''} attention.`
          : null)
      : null

  const actionSummary =
    state === 'READY' || state === 'PARTIAL'
      ? pickSummaryLine(summary.lines, /claimable rewards|operational action/i) ??
        (summary.farmClaimableCount > 0
          ? `${summary.farmClaimableCount} farm${summary.farmClaimableCount === 1 ? '' : 's'} ${summary.farmClaimableCount === 1 ? 'has' : 'have'} claimable rewards.`
          : summary.actionCount > 0
            ? `${summary.actionCount} operational action${summary.actionCount === 1 ? '' : 's'} ${summary.actionCount === 1 ? 'is' : 'are'} available.`
            : null)
      : null

  const positionInsights =
    state === 'READY' || state === 'PARTIAL' ? buildPositionInsights(context) : []

  const showOperational =
    !isTerminalEmpty &&
    Boolean(stateSummary || attentionSummary || actionSummary || positionInsights.length || actions.length)

  return (
    <AssistantSection
      data-testid="portfolio-assistant-panel"
      data-state={state}
      data-cc-r791d-5b="assistant-panel"
      data-awareness="ai-portfolio-assistant"
      data-cc-assistant-center="AI_PORTFOLIO_ASSISTANT"
      data-visual-priority="2"
    >
      <SectionHeader
        title="AI Portfolio Assistant"
        subtitle="Operational wallet context"
        testId="portfolio-assistant-header"
      />
      <PanelBody data-testid="portfolio-assistant-body" data-cc-layout="assistant-stacked">
        <Card data-testid="portfolio-assistant-card" data-desktop="full-width">
          {state !== 'READY' ? (
            <Block data-testid="portfolio-assistant-state-block">
              <BlockLabel>Status</BlockLabel>
              <StateText data-testid="portfolio-assistant-state-copy">
                {STATE_COPY[state as Exclude<PortfolioAssistantState, 'READY'>] ??
                  STATE_COPY.UNAVAILABLE}
              </StateText>
            </Block>
          ) : null}

          {showOperational ? (
            <>
              {stateSummary ? (
                <Block data-testid="portfolio-assistant-state-summary">
                  <BlockLabel>State summary</BlockLabel>
                  <BlockText data-testid="portfolio-assistant-state-summary-text">
                    {stateSummary}
                  </BlockText>
                </Block>
              ) : null}

              {attentionSummary ? (
                <Block data-testid="portfolio-assistant-attention-summary">
                  <BlockLabel>Attention</BlockLabel>
                  <BlockText data-testid="portfolio-assistant-attention-summary-text">
                    {attentionSummary}
                  </BlockText>
                </Block>
              ) : null}

              {actionSummary ? (
                <Block data-testid="portfolio-assistant-action-summary">
                  <BlockLabel>Actions</BlockLabel>
                  <BlockText data-testid="portfolio-assistant-action-summary-text">
                    {actionSummary}
                  </BlockText>
                </Block>
              ) : null}

              {positionInsights.length > 0 ? (
                <Block data-testid="portfolio-assistant-position-insights">
                  <BlockLabel>Position insight</BlockLabel>
                  <InsightList data-testid="portfolio-assistant-insight-list">
                    {positionInsights.map((line) => (
                      <li key={line}>
                        <BlockText data-testid="portfolio-assistant-insight-text">{line}</BlockText>
                      </li>
                    ))}
                  </InsightList>
                </Block>
              ) : null}

              {actions.length > 0 ? (
                <Block data-testid="portfolio-assistant-actions">
                  <BlockLabel>Available actions</BlockLabel>
                  <InsightList as="div" data-testid="portfolio-assistant-actions-list">
                    {actions.map((action, index) => {
                      const navLinks = resolveAssistantNavLinks(action)
                      return (
                        <div key={`${action.type}:${action.position}:${action.route}:${index}`}>
                          <ActionItem
                            testId="portfolio-assistant-action-item"
                            title={action.position}
                            meta={`${action.type}${action.reason ? ` · ${action.reason}` : ''}`}
                            actionType={action.type}
                          />
                          {navLinks.length > 0 && action.route ? (
                            <LinkRow data-testid="portfolio-assistant-action-links">
                              {navLinks.map((kind) => (
                                <NavLink
                                  key={kind}
                                  href={action.route!}
                                  data-testid={`portfolio-assistant-nav-${kind.toLowerCase()}`}
                                  data-nav-kind={kind}
                                  aria-label={`${kind}: ${action.label} for ${action.position}`}
                                >
                                  {kind}
                                </NavLink>
                              ))}
                            </LinkRow>
                          ) : null}
                        </div>
                      )
                    })}
                  </InsightList>
                </Block>
              ) : null}
            </>
          ) : null}

          {state === 'READY' && !showOperational ? (
            <Block data-testid="portfolio-assistant-ready-idle">
              <BlockText>Portfolio context is ready.</BlockText>
            </Block>
          ) : null}
        </Card>
      </PanelBody>
    </AssistantSection>
  )
}

export default PortfolioAssistantPanel
