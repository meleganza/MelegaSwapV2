/**
 * Command Center My Positions experience composition (R791D.3H).
 *
 * Consumes runtime My Positions foundation + universal PositionCard.
 * No product-specific cards. No local ownership filtering.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import styled from 'styled-components'
import { PositionCard } from 'components/portfolio/PositionCard'
import {
  projectMyPositionCard,
  type MyPositionCardModel as LibMyPositionCardModel,
} from 'lib/wallet-portfolio/myPositionCardModel'
import { CommandCenterHumanizedEmpty } from './commandCenterEmptyStatePresentation'
import type { PortfolioPosition } from 'lib/wallet-portfolio/contracts'
import type { PortfolioViewResult } from 'lib/wallet-portfolio/viewEngine'
import {
  CC_FONT_BODY,
  CC_FONT_DISPLAY,
  commandCenterColors,
  commandCenterLayout,
  commandCenterType,
} from '../commandCenterTokens'
import { SectionHeading } from './canonical/commandCenterSpecPrimitives'
import type {
  MyPositionCardModel as RuntimeGroupCard,
  MyPositionsExperienceState,
  MyPositionsGroups,
  MyPositionsSummary,
} from '../commandCenterRuntime/commandCenterPortfolioCutover'

export type MyPositionsGroupKey = keyof MyPositionsGroups

const GROUP_ORDER: MyPositionsGroupKey[] = ['Liquidity', 'Farm', 'Pool', 'Other']

export interface MyPositionsSectionProps {
  myPositionsView: PortfolioViewResult
  myPositionsGroups: MyPositionsGroups
  myPositionsSummary: MyPositionsSummary
  myPositionsState: MyPositionsExperienceState
}

const Section = styled.section`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
`

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`

const SummaryCell = styled.div`
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  box-sizing: border-box;
`

const SummaryLabel = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.label};
  color: ${commandCenterColors.label};
  margin-bottom: 6px;
`

const SummaryValue = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 20px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.1;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${commandCenterLayout.cardGap};
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  & > * {
    min-width: 0;
    max-width: 100%;
  }
`

const GroupBlock = styled.div`
  margin-bottom: 28px;
  min-width: 0;
`

const GroupTitle = styled.h3`
  margin: 0 0 12px;
  font-family: ${CC_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 700;
  color: ${commandCenterColors.white};
`

const UnavailableCard = styled.div`
  padding: 16px;
  border: 1px dashed ${commandCenterColors.cardBorder};
  border-radius: 12px;
  color: ${commandCenterColors.muted};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
`

interface BoundaryState {
  hasError: boolean
}

/** Isolates a single card failure from the Command Center shell (f55bb759 lineage). */
export class SafePositionCardBoundary extends Component<
  { positionId: string; children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[MyPositions] card unavailable', this.props.positionId, error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <UnavailableCard data-testid="position-card-unavailable" role="status">
          Position unavailable
        </UnavailableCard>
      )
    }
    return this.props.children
  }
}

export function SafePositionCard({ position }: { position: LibMyPositionCardModel }) {
  return (
    <SafePositionCardBoundary positionId={position.positionId}>
      <PositionCard position={position} />
    </SafePositionCardBoundary>
  )
}

/** Resolve lib card models for a group from View Engine positions — no product roots. */
export function resolveGroupCardModels(
  groupCards: readonly RuntimeGroupCard[],
  positions: readonly PortfolioPosition[],
): LibMyPositionCardModel[] {
  const byId = new Map(positions.map((p) => [p.positionId, p]))
  const out: LibMyPositionCardModel[] = []
  for (const card of groupCards) {
    const source = byId.get(card.positionId)
    if (!source) continue
    try {
      out.push(projectMyPositionCard(source))
    } catch {
      // Projection failure → skip; boundary covers render-time failures.
    }
  }
  return out
}

function SummaryHeader({ summary }: { summary: MyPositionsSummary }) {
  const cells: Array<{ label: string; value: number; testId: string }> = [
    { label: 'Total', value: summary.totalPositions, testId: 'summary-total' },
    { label: 'Liquidity', value: summary.liquidityCount, testId: 'summary-liquidity' },
    { label: 'Farm', value: summary.farmCount, testId: 'summary-farm' },
    { label: 'Pool', value: summary.poolCount, testId: 'summary-pool' },
    { label: 'Claimable', value: summary.claimablePositions, testId: 'summary-claimable' },
    { label: 'Attention', value: summary.attentionPositions, testId: 'summary-attention' },
  ]
  return (
    <SummaryRow data-testid="my-positions-summary" aria-label="My Positions summary">
      {cells.map((c) => (
        <SummaryCell key={c.testId}>
          <SummaryLabel>{c.label}</SummaryLabel>
          <SummaryValue data-testid={c.testId}>{c.value}</SummaryValue>
        </SummaryCell>
      ))}
    </SummaryRow>
  )
}

/**
 * Presentational My Positions section — props-driven for tests and composition.
 */
export function MyPositionsSection({
  myPositionsView,
  myPositionsGroups,
  myPositionsSummary,
  myPositionsState,
}: MyPositionsSectionProps) {
  if (myPositionsState === 'WALLET_NOT_CONNECTED') {
    return (
      <Section data-testid="my-positions-section" data-state="WALLET_NOT_CONNECTED">
        <SectionHeading>My Positions</SectionHeading>
        <CommandCenterHumanizedEmpty
          state="WALLET_NOT_CONNECTED"
          testId="my-positions-empty"
        />
      </Section>
    )
  }

  if (myPositionsState === 'EMPTY') {
    return (
      <Section data-testid="my-positions-section" data-state="EMPTY">
        <SectionHeading>My Positions</SectionHeading>
        <SummaryHeader summary={myPositionsSummary} />
        <CommandCenterHumanizedEmpty state="EMPTY" testId="my-positions-empty" />
      </Section>
    )
  }

  const positions = Array.isArray(myPositionsView.positions) ? myPositionsView.positions : []

  return (
    <Section data-testid="my-positions-section" data-state="READY">
      <SectionHeading>My Positions</SectionHeading>
      <SummaryHeader summary={myPositionsSummary} />
      {GROUP_ORDER.map((groupKey) => {
        const groupCards = myPositionsGroups[groupKey] ?? []
        if (groupCards.length === 0) return null
        const models = resolveGroupCardModels(groupCards, positions)
        if (models.length === 0) return null
        return (
          <GroupBlock key={groupKey} data-testid={`my-positions-group-${groupKey}`}>
            <GroupTitle>{groupKey}</GroupTitle>
            <CardGrid data-testid={`my-positions-grid-${groupKey}`}>
              {models.map((model) => (
                <SafePositionCard key={model.positionId} position={model} />
              ))}
            </CardGrid>
          </GroupBlock>
        )
      })}
    </Section>
  )
}

export default MyPositionsSection
