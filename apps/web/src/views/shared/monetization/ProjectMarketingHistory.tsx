/**
 * Marketing History — Featured / Trend / Claim / Farm / Pool / Liquidity statuses.
 */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import {
  loadMarketingHistory,
  MARKETING_KIND_LABEL,
  resolveMarketingStatus,
} from './marketingHistory'
import type { MarketingHistoryEntry, MarketingHistoryKind } from './commercialCheckoutTypes'

const KINDS: MarketingHistoryKind[] = ['featured', 'trend-boost', 'claim', 'farm', 'pool', 'liquidity']

const Shell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const Card = styled.div`
  min-width: 0;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
`

const Kind = styled.div`
  font-size: 12px;
  font-weight: 780;
  color: #f2f2f2;
`

const Status = styled.span<{ $s: string }>`
  display: inline-flex;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid
    ${({ $s }) =>
      $s === 'Running'
        ? 'rgba(221,185,47,0.45)'
        : $s === 'Completed'
          ? 'rgba(22,217,119,0.4)'
          : 'rgba(255,255,255,0.14)'};
  color: ${({ $s }) =>
    $s === 'Running' ? uxRebuildColors.gold : $s === 'Completed' ? uxRebuildColors.positive : '#aaa'};
`

const Meta = styled.div`
  margin-top: 6px;
  font-size: 11px;
  color: ${uxRebuildColors.secondary};
  line-height: 1.35;
`

type Props = {
  slug: string
  refreshKey?: number
}

export const ProjectMarketingHistory: React.FC<Props> = ({ slug, refreshKey = 0 }) => {
  const [entries, setEntries] = useState<MarketingHistoryEntry[]>([])

  useEffect(() => {
    setEntries(loadMarketingHistory(slug))
  }, [slug, refreshKey])

  const byKind = (kind: MarketingHistoryKind) =>
    entries.find((e) => e.kind === kind) ?? null

  return (
    <Shell data-testid="project-marketing-history" data-project-section="marketing-history">
      <Grid>
        {KINDS.map((kind) => {
          const entry = byKind(kind)
          const status = entry
            ? resolveMarketingStatus(entry.status, entry.expiresAt)
            : null
          return (
            <Card key={kind} data-testid={`marketing-history-${kind}`} data-marketing-kind={kind}>
              {/* kinds: marketing-history-featured trend-boost claim farm pool liquidity */}
              <Kind>{MARKETING_KIND_LABEL[kind]}</Kind>
              {status ? <Status $s={status}>{status}</Status> : <Status $s="none">None</Status>}
              <Meta>{entry?.label || 'No purchases yet'}</Meta>
            </Card>
          )
        })}
      </Grid>
    </Shell>
  )
}

export default ProjectMarketingHistory
