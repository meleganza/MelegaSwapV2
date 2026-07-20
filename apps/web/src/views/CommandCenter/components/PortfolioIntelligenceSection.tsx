/**
 * Portfolio Intelligence section (R791D.4E + R791D.4F visual foundation).
 * Operational items only — no scoring / advice / fetch.
 */

import React from 'react'
import styled from 'styled-components'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import type { PortfolioIntelligenceModel } from '../commandCenterRuntime/portfolioIntelligence'
import {
  IntelligenceItem,
  PortfolioSection,
  SectionHeader,
} from './commandCenterVisualFoundation'

const EmptyState = styled.div`
  padding: 20px 16px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  color: ${commandCenterColors.body};
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
`

const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  min-width: 0;
`

const SummaryChip = styled.span`
  display: inline-flex;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${commandCenterColors.cardBorder};
  background: ${commandCenterColors.cardBg};
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.white};
`

const ChipLabel = styled.span`
  color: ${commandCenterColors.muted};
`

const Columns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    align-items: start;
  }
`

const Column = styled.div`
  min-width: 0;
`

const ColumnTitle = styled.h4`
  margin: 0 0 8px;
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  color: ${commandCenterColors.label};
  font-weight: 700;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

export function PortfolioIntelligenceSection({
  model,
  walletConnected,
}: {
  model: PortfolioIntelligenceModel
  walletConnected: boolean
}) {
  if (!walletConnected || model.generatedState === 'WALLET_NOT_CONNECTED') {
    return (
      <PortfolioSection
        center="INTELLIGENCE_CENTER"
        testId="portfolio-intelligence-section"
        state="WALLET_NOT_CONNECTED"
        data-cc-r791d-4e
      >
        <SectionHeader title="Portfolio Intelligence" />
        <EmptyState data-testid="portfolio-intelligence-empty">Wallet not connected.</EmptyState>
      </PortfolioSection>
    )
  }

  if (model.generatedState === 'EMPTY') {
    return (
      <PortfolioSection
        center="INTELLIGENCE_CENTER"
        testId="portfolio-intelligence-section"
        state="EMPTY"
        data-cc-r791d-4e
      >
        <SectionHeader title="Portfolio Intelligence" />
        <EmptyState data-testid="portfolio-intelligence-empty">No intelligence available.</EmptyState>
      </PortfolioSection>
    )
  }

  const { summary, attentionItems, actionItems, healthItems } = model

  return (
    <PortfolioSection
      center="INTELLIGENCE_CENTER"
      testId="portfolio-intelligence-section"
      state="READY"
      data-cc-r791d-4e
    >
      <SectionHeader title="Portfolio Intelligence" />
      <SummaryRow data-testid="portfolio-intelligence-summary" aria-label="Intelligence summary">
        <SummaryChip data-testid="intelligence-active-positions">
          <ChipLabel>Active</ChipLabel>
          <span>{summary.activePositions}</span>
        </SummaryChip>
        <SummaryChip data-testid="intelligence-attention-count">
          <ChipLabel>Attention</ChipLabel>
          <span>{summary.attentionCount}</span>
        </SummaryChip>
        <SummaryChip data-testid="intelligence-action-count">
          <ChipLabel>Actions</ChipLabel>
          <span>{summary.actionCount}</span>
        </SummaryChip>
        <SummaryChip data-testid="intelligence-claimable-count">
          <ChipLabel>Claimable</ChipLabel>
          <span>{summary.claimableCount}</span>
        </SummaryChip>
        <SummaryChip data-testid="intelligence-unavailable-count">
          <ChipLabel>Unavailable</ChipLabel>
          <span>{summary.unavailableCount}</span>
        </SummaryChip>
        <SummaryChip data-testid="intelligence-historical-count">
          <ChipLabel>Historical</ChipLabel>
          <span>{summary.historicalCount}</span>
        </SummaryChip>
      </SummaryRow>

      <Columns data-testid="portfolio-intelligence-columns">
        <Column data-testid="intelligence-attention-column">
          <ColumnTitle>Needs attention</ColumnTitle>
          {attentionItems.length === 0 ? (
            <EmptyState data-testid="intelligence-attention-empty">No attention items.</EmptyState>
          ) : (
            <List data-testid="intelligence-attention-list">
              {attentionItems.map((item) => (
                <IntelligenceItem
                  key={item.id}
                  testId="intelligence-attention-item"
                  source={item.source}
                  title={item.title}
                  meta={`${item.reason ?? item.source}${item.positionId ? ` · ${item.positionId}` : ''}`}
                />
              ))}
            </List>
          )}
        </Column>

        <Column data-testid="intelligence-actions-column">
          <ColumnTitle>Available actions</ColumnTitle>
          {actionItems.length === 0 ? (
            <EmptyState data-testid="intelligence-actions-empty">No actions available.</EmptyState>
          ) : (
            <List data-testid="intelligence-actions-list">
              {actionItems.map((item) => (
                <IntelligenceItem
                  key={item.id}
                  testId="intelligence-action-item"
                  actionType={item.action.type}
                  positionId={item.positionId}
                  title={item.positionTitle}
                  meta={`${item.action.type}${item.reason ? ` · ${item.reason}` : ''}`}
                  href={item.route}
                  actionLabel={item.action.label}
                />
              ))}
            </List>
          )}
        </Column>

        <Column data-testid="intelligence-health-column">
          <ColumnTitle>Operational health</ColumnTitle>
          {healthItems.length === 0 ? (
            <EmptyState data-testid="intelligence-health-empty">No health items.</EmptyState>
          ) : (
            <List data-testid="intelligence-health-list">
              {healthItems.map((item) => (
                <IntelligenceItem
                  key={item.id}
                  testId="intelligence-health-item"
                  kind={item.kind}
                  title={item.title}
                  meta={`${item.kind}${item.detail ? ` · ${item.detail}` : ''}`}
                />
              ))}
            </List>
          )}
        </Column>
      </Columns>
    </PortfolioSection>
  )
}

export default PortfolioIntelligenceSection
