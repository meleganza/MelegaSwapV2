/**
 * AI Liquidity Portfolio — home inventory + empty state.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import type { LbProgramApiRow } from 'lib/liquidity-builder-indexer/types'
import { liqOne } from '../../onePage/onePageTokens'
import { LB_UX } from '../uxCopy'
import {
  formatReserveLabel,
  pairLabelForProgram,
  portfolioSummary,
  statusDisplay,
  symbolForAddress,
} from '../portfolioDisplay'
import { PageNextAction } from 'views/shared/journeys/PageNextAction'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Heading = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: ${liqOne.gold};
`

const HeadingRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 12px;
`

const DocsLink = styled(Link)`
  font-size: 12px;
  font-weight: 650;
  color: ${liqOne.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const SummaryCell = styled.div`
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  background: ${liqOne.elevated};
  padding: 8px 10px;
  min-width: 0;
`

const SummaryLabel = styled.div`
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${liqOne.muted};
  line-height: 14px;
`

const SummaryValue = styled.div`
  margin-top: 2px;
  font-size: 14px;
  font-weight: 750;
  color: ${liqOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CreateBtn = styled.button`
  align-self: flex-start;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${liqOne.gold};
  background: rgba(221, 185, 47, 0.12);
  color: ${liqOne.text};
  font-size: 13px;
  font-weight: 750;
  font-family: ${liqOne.font};
  cursor: pointer;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ProgramCard = styled.article`
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  background: ${liqOne.elevated};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const Pair = styled.div`
  font-size: 14px;
  font-weight: 750;
  color: ${liqOne.text};
`

const Status = styled.span<{ $tone: 'active' | 'paused' | 'other' }>`
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 6px;
  color: ${({ $tone }) =>
    $tone === 'active' ? '#86efac' : $tone === 'paused' ? '#fbbf24' : liqOne.muted};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'active'
        ? 'rgba(134,239,172,0.35)'
        : $tone === 'paused'
          ? 'rgba(251,191,36,0.35)'
          : liqOne.borderDefault};
`

const Meta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  font-size: 12px;
  line-height: 16px;
`

const MetaKey = styled.span`
  color: ${liqOne.muted};
  font-weight: 650;
`

const MetaVal = styled.span`
  color: ${liqOne.text};
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
`

const ActionBtn = styled.button<{ $primary?: boolean }>`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ $primary }) => ($primary ? liqOne.gold : liqOne.borderStrong)};
  background: ${({ $primary }) => ($primary ? 'rgba(221,185,47,0.14)' : 'transparent')};
  color: ${liqOne.text};
  font-size: 12px;
  font-weight: 700;
  font-family: ${liqOne.font};
  cursor: pointer;
`

const Empty = styled.div`
  padding: 8px 2px 4px;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  line-height: 22px;
  color: ${liqOne.text};
`

const EmptyBody = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: ${liqOne.secondary};
`

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${liqOne.muted};
`

function statusTone(status: string): 'active' | 'paused' | 'other' {
  if (status === 'Active') return 'active'
  if (status === 'Paused' || status === 'SafetyPaused') return 'paused'
  return 'other'
}

export type LbPortfolioHomeProps = {
  walletConnected: boolean
  loading: boolean
  error: string | null
  programs: LbProgramApiRow[]
  onCreate: () => void
  onManage: (programAddress: string) => void
  onViewDetails: (programAddress: string) => void
}

export function LbPortfolioHome({
  walletConnected,
  loading,
  error,
  programs,
  onCreate,
  onManage,
  onViewDetails,
}: LbPortfolioHomeProps) {
  const summary = portfolioSummary(programs)
  const empty = !loading && programs.length === 0

  if (!walletConnected) {
    return (
      <Root data-testid="liq-lb-portfolio" data-lb-portfolio="connect">
        <HeadingRow>
          <Heading data-testid="liq-lb-portfolio-title">{LB_UX.portfolioTitle}</Heading>
          <DocsLink href={LB_UX.docsHub} data-testid="liq-lb-portfolio-docs">
            {LB_UX.portfolioViewDocs}
          </DocsLink>
        </HeadingRow>
        <PageNextAction
          testId="lb-portfolio-next-connect"
          here="Connect your wallet to see Liquidity Builder programs"
          nextLabel="Read Documentation"
          nextHref={LB_UX.docsHub}
          secondaryLabel="Create Program"
          secondaryHref="/liquidity-studio?view=building"
        />
        <Empty data-testid="liq-lb-portfolio-empty">
          <EmptyTitle>{LB_UX.portfolioEmptyTitle}</EmptyTitle>
          <EmptyBody>{LB_UX.portfolioConnectBody}</EmptyBody>
        </Empty>
      </Root>
    )
  }

  if (empty) {
    return (
      <Root data-testid="liq-lb-portfolio" data-lb-portfolio="empty">
        <HeadingRow>
          <Heading data-testid="liq-lb-portfolio-title">{LB_UX.portfolioTitle}</Heading>
          <DocsLink href={LB_UX.docsHub} data-testid="liq-lb-portfolio-docs">
            {LB_UX.portfolioViewDocs}
          </DocsLink>
        </HeadingRow>
        <PageNextAction
          testId="lb-portfolio-next-empty"
          here="No programs yet — read docs, then create"
          nextLabel="Documentation"
          nextHref={LB_UX.docsHub}
          secondaryLabel="Create New Program"
          secondaryHref="/liquidity-studio?view=building"
        />
        <Empty data-testid="liq-lb-portfolio-empty">
          <EmptyTitle>{LB_UX.portfolioEmptyTitle}</EmptyTitle>
          <EmptyBody>{LB_UX.portfolioEmptyBody}</EmptyBody>
          <CreateBtn type="button" onClick={onCreate} data-testid="liq-lb-portfolio-create" style={{ marginTop: 12 }}>
            {LB_UX.portfolioEmptyCta}
          </CreateBtn>
        </Empty>
      </Root>
    )
  }

  return (
    <Root data-testid="liq-lb-portfolio" data-lb-portfolio="inventory">
      <HeadingRow>
        <Heading data-testid="liq-lb-portfolio-title">{LB_UX.portfolioTitle}</Heading>
        <DocsLink href={LB_UX.docsHub} data-testid="liq-lb-portfolio-docs">
          {LB_UX.portfolioViewDocs}
        </DocsLink>
      </HeadingRow>

      <SummaryGrid data-testid="liq-lb-portfolio-summary">
        <SummaryCell>
          <SummaryLabel>{LB_UX.portfolioActivePrograms}</SummaryLabel>
          <SummaryValue data-testid="liq-lb-portfolio-active-count">{summary.activeCount}</SummaryValue>
        </SummaryCell>
        <SummaryCell>
          <SummaryLabel>{LB_UX.portfolioTotalReserve}</SummaryLabel>
          <SummaryValue data-testid="liq-lb-portfolio-reserve-count">
            {summary.reservesWithValue > 0 ? `${summary.reservesWithValue} funded` : '—'}
          </SummaryValue>
        </SummaryCell>
        <SummaryCell>
          <SummaryLabel>{LB_UX.portfolioLiquidityGenerated}</SummaryLabel>
          <SummaryValue data-testid="liq-lb-portfolio-exec-count">
            {summary.totalExecutions > 0 ? `${summary.totalExecutions} steps` : '—'}
          </SummaryValue>
        </SummaryCell>
        <SummaryCell>
          <SummaryLabel>{LB_UX.portfolioFeesGenerated}</SummaryLabel>
          <SummaryValue data-testid="liq-lb-portfolio-fee-count">
            {summary.feesWithValue > 0 ? `${summary.feesWithValue} with fees` : '—'}
          </SummaryValue>
        </SummaryCell>
      </SummaryGrid>

      <CreateBtn type="button" onClick={onCreate} data-testid="liq-lb-portfolio-create">
        {LB_UX.portfolioCreateCta}
      </CreateBtn>

      {loading ? <Hint data-testid="liq-lb-portfolio-loading">Loading programs…</Hint> : null}
      {error ? <Hint data-testid="liq-lb-portfolio-error">Inventory unavailable — showing empty cache.</Hint> : null}

      <List data-testid="liq-lb-portfolio-list">
        {programs.map((p) => {
          const pair = pairLabelForProgram(p)
          const tokenSym = symbolForAddress(p.token)
          return (
            <ProgramCard key={p.programAddress} data-testid="liq-lb-program-card" data-program={p.programAddress}>
              <CardTop>
                <Pair data-testid="liq-lb-program-pair">{pair}</Pair>
                <Status $tone={statusTone(p.status)} data-testid="liq-lb-program-status-badge">
                  {statusDisplay(p.status)}
                </Status>
              </CardTop>
              <Meta>
                <MetaKey>Reserve</MetaKey>
                <MetaVal data-testid="liq-lb-program-reserve">{formatReserveLabel(p.reserve, p.token)}</MetaVal>
                <MetaKey>Strategy</MetaKey>
                <MetaVal data-testid="liq-lb-program-strategy">{p.strategy || '—'}</MetaVal>
                <MetaKey>Goal</MetaKey>
                <MetaVal data-testid="liq-lb-program-goal">{p.goal || LB_UX.portfolioGoalFallback}</MetaVal>
                <MetaKey>Liquidity Generated</MetaKey>
                <MetaVal data-testid="liq-lb-program-liquidity">
                  {p.executionCount > 0 ? `${p.executionCount} growth steps` : '—'}
                </MetaVal>
              </Meta>
              <Actions>
                <ActionBtn
                  type="button"
                  $primary
                  data-testid="liq-lb-program-manage"
                  onClick={() => onManage(p.programAddress)}
                >
                  {LB_UX.portfolioManage}
                </ActionBtn>
                <ActionBtn
                  type="button"
                  data-testid="liq-lb-program-details"
                  onClick={() => onViewDetails(p.programAddress)}
                >
                  {LB_UX.portfolioViewDetails}
                </ActionBtn>
              </Actions>
              <span hidden aria-hidden>
                {tokenSym}
              </span>
            </ProgramCard>
          )
        })}
      </List>
    </Root>
  )
}
