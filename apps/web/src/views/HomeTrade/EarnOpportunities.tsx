import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaSectionCard, colors } from 'design-system/melega'
import { EarnRow } from './useHomeTradeData'

const SectionLink = styled(Link)`
  color: ${colors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 12px;
  margin-bottom: 8px;
`

const Tab = styled.button<{ $active?: boolean }>`
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244, 196, 48,0.30)' : 'rgba(255,255,255,0.08)')};
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48,0.13)' : 'transparent')};
  color: ${({ $active }) => ($active ? colors.gold : colors.textSecondary)};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease;

  &:hover {
    border-color: rgba(244, 196, 48, 0.35);
    color: ${colors.textPrimary};
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  height: 34px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`

const Pair = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const AprWrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: ${colors.green};
  text-align: right;
`

const AprDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.green};
  flex-shrink: 0;
`

type TabId = 'top' | 'farms' | 'pools'

const parseApr = (apr?: string) => {
  if (!apr) return 0
  const n = parseFloat(apr.replace('%', ''))
  return Number.isFinite(n) ? n : 0
}

export const EarnOpportunities: React.FC<{
  farmRows: EarnRow[]
  poolRows: EarnRow[]
  showNote: boolean
}> = ({ farmRows, poolRows }) => {
  const [tab, setTab] = useState<TabId>('top')

  const topRows = useMemo(() => {
    const combined = [
      ...farmRows.map((r) => ({ ...r, kind: 'farm' as const })),
      ...poolRows.map((r) => ({ ...r, kind: 'pool' as const })),
    ]
    return combined
      .sort((a, b) => parseApr(b.apr) - parseApr(a.apr))
      .slice(0, 3)
  }, [farmRows, poolRows])

  const rows = tab === 'farms' ? farmRows : tab === 'pools' ? poolRows : topRows

  if (!farmRows.length && !poolRows.length) return null

  return (
    <MelegaSectionCard
      title="Earn Opportunities"
      minHeight="260px"
      action={<SectionLink href="/farms">View Earn →</SectionLink>}
    >
      <Tabs>
        <Tab type="button" $active={tab === 'top'} onClick={() => setTab('top')}>
          Top
        </Tab>
        <Tab type="button" $active={tab === 'farms'} onClick={() => setTab('farms')}>
          Farms
        </Tab>
        <Tab type="button" $active={tab === 'pools'} onClick={() => setTab('pools')}>
          Pools
        </Tab>
      </Tabs>
      {rows.map((row) => (
        <Row key={row.id}>
          <Pair>{row.name}</Pair>
          <AprWrap>
            <AprDot aria-hidden />
            {row.apr || 'APR unavailable'}
          </AprWrap>
        </Row>
      ))}
    </MelegaSectionCard>
  )
}

export default EarnOpportunities
