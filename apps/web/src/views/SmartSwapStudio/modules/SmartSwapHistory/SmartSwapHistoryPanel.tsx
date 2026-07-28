/**
 * Smart Swap Module 005 — History panel (read-only).
 * No signing, custody, or execution authority.
 */

import React from 'react'
import styled from 'styled-components'
import type { SmartSwapHistoryEntry, SmartSwapHistoryPage } from 'lib/smart-swap-history'

const UNAVAILABLE = '—'

const Root = styled.section`
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Panel = styled.div`
  flex: 1;
  min-height: 0;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(165deg, rgba(15, 23, 42, 0.94) 0%, rgba(2, 6, 23, 0.97) 100%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #f8fafc;

  @media (max-width: 430px) {
    font-size: 20px;
  }
`

const Sub = styled.p`
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled.li`
  margin: 0;
`

const Article = styled.article`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(0, 0, 0, 0.22);
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
`

const Flow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
`

const FlowRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`

const Label = styled.span`
  color: #94a3b8;
`

const Value = styled.span`
  text-align: right;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
`

const Arrow = styled.div`
  color: #64748b;
  font-size: 11px;
  text-align: center;
  line-height: 1;
`

const Route = styled.ol`
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
`

const Meta = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.45;
`

const Status = styled.span<{ $tone: 'ok' | 'warn' | 'error' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'ok' ? '#86efac' : $tone === 'warn' ? '#fcd34d' : $tone === 'error' ? '#fca5a5' : '#94a3b8'};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok'
        ? 'rgba(134,239,172,0.35)'
        : $tone === 'warn'
          ? 'rgba(252,211,77,0.35)'
          : $tone === 'error'
            ? 'rgba(252,165,165,0.35)'
            : 'rgba(148,163,184,0.25)'};
`

const PageMeta = styled.span`
  font-size: 11px;
  color: #94a3b8;
`

const Pager = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const PageBtn = styled.button`
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }
`

const Empty = styled.p`
  margin: 16px 0;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
`

function statusTone(status: SmartSwapHistoryEntry['executionStatus']): 'ok' | 'warn' | 'error' | 'muted' {
  if (status === 'SUCCESS') return 'ok'
  if (status === 'PENDING' || status === 'PARTIAL') return 'warn'
  if (status === 'FAILED') return 'error'
  return 'muted'
}

function statusLabel(status: SmartSwapHistoryEntry['executionStatus']): string {
  if (status === 'SUCCESS') return 'Completed'
  if (status === 'PENDING') return 'Pending'
  if (status === 'FAILED') return 'Failed'
  if (status === 'PARTIAL') return 'Partial'
  return 'Unavailable'
}

function feeLabel(entry: SmartSwapHistoryEntry): string {
  if (entry.feeState === 'AVAILABLE' && entry.protocolFee) return entry.protocolFee
  if (entry.feeState === 'PARTIAL' && entry.protocolFee) return `${entry.protocolFee} (partial)`
  if (entry.feeState === 'STALE') return 'Stale'
  return UNAVAILABLE
}

export type SmartSwapHistoryPanelProps = {
  page: SmartSwapHistoryPage
  account?: string | null
  getExplorerUrl?: (txHash: string) => string | undefined
  onPageChange?: (page: number) => void
  connectSlot?: React.ReactNode
}

export function SmartSwapHistoryPanel({
  page,
  account,
  getExplorerUrl,
  onPageChange,
  connectSlot,
}: SmartSwapHistoryPanelProps) {
  return (
    <Root data-smart-swap-module="005" data-history-state={page.listState} aria-label="Smart Swap history">
      <Panel>
        <Title>Smart Swap history</Title>
        <Sub>Read-only execution memory. Blockchain remains the source of transaction truth.</Sub>

        {page.listState !== 'READY' ? (
          <Empty role="status">{page.emptyReason ?? 'No history available.'}</Empty>
        ) : (
          <List>
            {page.entries.map((entry) => {
              const href = getExplorerUrl?.(entry.transactionHash)
              return (
                <Item key={entry.transactionHash}>
                  <Article tabIndex={0} aria-label={`Swap ${entry.inputToken.symbol} to ${entry.outputToken.symbol}`}>
                    <Flow>
                      <FlowRow>
                        <Label>Input</Label>
                        <Value>
                          {entry.inputAmount ?? UNAVAILABLE} {entry.inputToken.symbol}
                        </Value>
                      </FlowRow>
                      <Arrow aria-hidden>↓</Arrow>
                      <FlowRow>
                        <Label>Output</Label>
                        <Value>
                          {entry.outputAmount ?? UNAVAILABLE} {entry.outputToken.symbol}
                        </Value>
                      </FlowRow>
                      <FlowRow>
                        <Label>Fee</Label>
                        <Value>{feeLabel(entry)}</Value>
                      </FlowRow>
                      <FlowRow>
                        <Label>Gas used</Label>
                        <Value>{entry.gasState === 'AVAILABLE' ? entry.gasUsed : UNAVAILABLE}</Value>
                      </FlowRow>
                      <FlowRow>
                        <Label>Status</Label>
                        <Value>
                          <Status $tone={statusTone(entry.executionStatus)}>
                            {statusLabel(entry.executionStatus)}
                          </Status>
                        </Value>
                      </FlowRow>
                    </Flow>

                    {entry.routeHops.length > 0 ? (
                      <Route aria-label="Used route">
                        {entry.routeHops.map((hop, i) => (
                          <React.Fragment key={`${hop.kind}-${hop.label}-${i}`}>
                            {i > 0 ? <li aria-hidden>↓</li> : null}
                            <li>{hop.label}</li>
                          </React.Fragment>
                        ))}
                      </Route>
                    ) : (
                      <Meta>Route memory: {UNAVAILABLE}</Meta>
                    )}

                    {entry.executionStatus === 'FAILED' && entry.failureReason ? (
                      <Meta role="status">Reason: {entry.failureReason}</Meta>
                    ) : null}
                    {entry.executionStatus === 'PENDING' ? (
                      <Meta role="status">Pending confirmation — not marked completed.</Meta>
                    ) : null}

                    <Meta>
                      Economic attribution: {entry.economicAttributionState.replace(/_/g, ' ').toLowerCase()}
                      {' · '}
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          {entry.transactionHash.slice(0, 10)}…
                        </a>
                      ) : (
                        <span>{entry.transactionHash.slice(0, 10)}…</span>
                      )}
                    </Meta>
                  </Article>
                </Item>
              )
            })}
          </List>
        )}

        {page.listState === 'READY' ? (
          <Pager>
            <PageBtn
              type="button"
              disabled={page.page <= 1}
              onClick={() => onPageChange?.(page.page - 1)}
              aria-label="Previous history page"
            >
              Previous
            </PageBtn>
            <PageMeta>
              Page {page.page} · {page.total} total
            </PageMeta>
            <PageBtn
              type="button"
              disabled={!page.hasMore}
              onClick={() => onPageChange?.(page.page + 1)}
              aria-label="Next history page"
            >
              Next
            </PageBtn>
          </Pager>
        ) : null}

        {!account && connectSlot ? connectSlot : null}
      </Panel>
    </Root>
  )
}
