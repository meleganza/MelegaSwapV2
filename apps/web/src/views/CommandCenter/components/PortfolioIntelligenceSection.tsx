/**
 * Portfolio Intelligence section (R791D.4E) — operational items only.
 * Presentation of PortfolioIntelligenceModel. No scoring / advice / fetch.
 */

import React from 'react'
import styled from 'styled-components'
import {
  CC_FONT_BODY,
  commandCenterColors,
  commandCenterLayout,
  commandCenterType,
} from '../commandCenterTokens'
import { SectionHeading } from './canonical/commandCenterSpecPrimitives'
import type { PortfolioIntelligenceModel } from '../commandCenterRuntime/portfolioIntelligence'

const Section = styled.section`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
`

const EmptyState = styled.div`
  padding: 20px 16px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: ${commandCenterLayout.cardRadius};
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
  font-size: ${commandCenterType.label};
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

const ListItem = styled.li`
  padding: 10px 12px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 10px;
  background: ${commandCenterColors.cardBg};
  min-width: 0;
`

const ItemTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.white};
  word-break: break-word;
`

const ItemMeta = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
  word-break: break-word;
`

const ActionLink = styled.a`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
  text-decoration: none;
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
      <Section
        data-testid="portfolio-intelligence-section"
        data-state="WALLET_NOT_CONNECTED"
        data-cc-r791d-4e
      >
        <SectionHeading>Portfolio Intelligence</SectionHeading>
        <EmptyState data-testid="portfolio-intelligence-empty">Wallet not connected.</EmptyState>
      </Section>
    )
  }

  if (model.generatedState === 'EMPTY') {
    return (
      <Section data-testid="portfolio-intelligence-section" data-state="EMPTY" data-cc-r791d-4e>
        <SectionHeading>Portfolio Intelligence</SectionHeading>
        <EmptyState data-testid="portfolio-intelligence-empty">No intelligence available.</EmptyState>
      </Section>
    )
  }

  const { summary, attentionItems, actionItems, healthItems } = model

  return (
    <Section data-testid="portfolio-intelligence-section" data-state="READY" data-cc-r791d-4e>
      <SectionHeading>Portfolio Intelligence</SectionHeading>
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
                <ListItem key={item.id} data-testid="intelligence-attention-item" data-source={item.source}>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemMeta>
                    {item.reason ?? item.source}
                    {item.positionId ? ` · ${item.positionId}` : ''}
                  </ItemMeta>
                </ListItem>
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
                <ListItem
                  key={item.id}
                  data-testid="intelligence-action-item"
                  data-action-type={item.action.type}
                  data-position-id={item.positionId}
                >
                  <ItemTitle>{item.positionTitle}</ItemTitle>
                  <ItemMeta>
                    {item.action.type}
                    {item.reason ? ` · ${item.reason}` : ''}
                  </ItemMeta>
                  {item.route ? (
                    <ActionLink href={item.route} aria-label={item.action.label}>
                      {item.action.label}
                    </ActionLink>
                  ) : (
                    <ItemMeta>{item.action.label}</ItemMeta>
                  )}
                </ListItem>
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
                <ListItem key={item.id} data-testid="intelligence-health-item" data-health-kind={item.kind}>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemMeta>
                    {item.kind}
                    {item.detail ? ` · ${item.detail}` : ''}
                  </ItemMeta>
                </ListItem>
              ))}
            </List>
          )}
        </Column>
      </Columns>
    </Section>
  )
}

export default PortfolioIntelligenceSection
