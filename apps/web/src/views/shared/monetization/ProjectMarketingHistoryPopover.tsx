import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { loadMarketingHistory, MARKETING_KIND_LABEL, resolveMarketingStatus } from './marketingHistory'
import type { MarketingHistoryEntry, MarketingHistoryKind } from './commercialCheckoutTypes'

const Wrap = styled.div`
  position: relative;
  display: inline-flex;
  min-width: 0;
`

const Trigger = styled.button`
  min-height: 42px;
  display: inline-grid;
  grid-template-columns: 28px auto;
  grid-template-rows: auto auto;
  column-gap: 8px;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid rgba(244, 196, 48, 0.42);
  border-radius: 12px;
  color: #f5f5f5;
  background: linear-gradient(145deg, rgba(25, 22, 13, 0.96), rgba(10, 10, 10, 0.98));
  cursor: pointer;
  text-align: left;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.22);

  &:hover,
  &:focus-visible {
    border-color: ${uxRebuildColors.gold};
    outline: none;
    box-shadow: 0 0 0 2px rgba(244, 196, 48, 0.08), 0 10px 28px rgba(0, 0, 0, 0.3);
  }
`

const Clock = styled.span`
  grid-row: 1 / span 2;
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(244, 196, 48, 0.42);
  border-radius: 50%;
  color: ${uxRebuildColors.gold};
  font-size: 16px;
  line-height: 1;
`

const TriggerLabel = styled.span`
  color: rgba(255, 255, 255, 0.76);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.07em;
  line-height: 1.1;
  text-transform: uppercase;
  white-space: nowrap;
`

const ActiveCount = styled.strong<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? uxRebuildColors.positive : 'rgba(255,255,255,.5)')};
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.05em;
  line-height: 1.1;
  text-transform: uppercase;
`

const Popover = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 40;
  width: min(360px, calc(100vw - 32px));
  padding: 14px;
  border: 1px solid rgba(244, 196, 48, 0.52);
  border-radius: 14px;
  background: linear-gradient(155deg, rgba(21, 20, 16, 0.99), rgba(8, 8, 8, 0.99));
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.58), 0 0 26px rgba(244, 196, 48, 0.06);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transform: translateY(${({ $open }) => ($open ? '0' : '-4px')});
  transition: opacity 140ms ease, transform 140ms ease, visibility 140ms ease;

  ${Wrap}:hover &,
  ${Wrap}:focus-within & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 26px;
    width: 10px;
    height: 10px;
    border-top: 1px solid rgba(244, 196, 48, 0.52);
    border-left: 1px solid rgba(244, 196, 48, 0.52);
    background: rgba(20, 19, 15, 0.99);
    transform: rotate(45deg);
  }

  @media (max-width: 620px) {
    top: calc(100% + 8px);
    right: auto;
    bottom: auto;
    left: 0;
    width: min(326px, calc(100vw - 48px));

    &::before {
      right: auto;
      left: 26px;
    }
  }
`

const PopoverHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 2px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const Title = styled.strong`
  color: ${uxRebuildColors.gold};
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const ActiveBadge = styled.span`
  padding: 3px 7px;
  border: 1px solid rgba(22, 217, 119, 0.35);
  border-radius: 999px;
  color: ${uxRebuildColors.positive};
  background: rgba(22, 217, 119, 0.08);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const Entry = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const EntryIcon = styled.span`
  width: 36px;
  height: 36px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  color: ${uxRebuildColors.gold};
  background: rgba(255, 255, 255, 0.025);
  font-size: 17px;
`

const EntryCopy = styled.div`
  min-width: 0;
  strong,
  span {
    display: block;
  }
  strong {
    overflow: hidden;
    color: #f5f5f5;
    font-size: 12px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  span {
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 10px;
  }
  span[data-active='true'] {
    color: ${uxRebuildColors.positive};
  }
`

const Empty = styled.p`
  margin: 0;
  padding: 18px 4px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  line-height: 1.45;
  text-align: center;
`

const ViewAll = styled.button`
  width: 100%;
  min-height: 36px;
  margin-top: 8px;
  border: 0;
  color: ${uxRebuildColors.gold};
  background: transparent;
  cursor: pointer;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  &:focus-visible {
    outline: 1px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const KIND_ICON: Record<MarketingHistoryKind, string> = {
  featured: '★',
  'trend-boost': '↗',
  'sponsored-research': '⌕',
  claim: '✓',
  farm: '♧',
  pool: '◉',
  liquidity: '◇',
}

const PUBLIC_KIND_LABEL: Partial<Record<MarketingHistoryKind, string>> = {
  'sponsored-research': 'Sponsored Search',
  farm: 'Featured Farm',
  pool: 'Featured Pool',
}

function remainingLabel(entry: MarketingHistoryEntry, now: number): string {
  const status = resolveMarketingStatus(entry.status, entry.expiresAt)
  if (status === 'Expired') return 'Expired'
  if (status === 'Completed')
    return `Completed · ${new Date(entry.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`
  if (!entry.expiresAt) return 'Active'
  const remaining = Math.max(0, Date.parse(entry.expiresAt) - now)
  const hours = Math.ceil(remaining / 3_600_000)
  if (hours < 24) return `${hours}h remaining`
  return `${Math.ceil(hours / 24)}d remaining`
}

type Props = {
  slug: string
  refreshKey?: number
}

export const ProjectMarketingHistoryPopover: React.FC<Props> = ({ slug, refreshKey = 0 }) => {
  const [entries, setEntries] = useState<MarketingHistoryEntry[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setEntries(loadMarketingHistory(slug))
  }, [slug, refreshKey])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const sorted = useMemo(
    () =>
      entries
        .map((entry) => ({ entry, status: resolveMarketingStatus(entry.status, entry.expiresAt) }))
        .sort((a, b) => {
          const activeDelta = Number(b.status === 'Running') - Number(a.status === 'Running')
          if (activeDelta) return activeDelta
          return Date.parse(b.entry.createdAt) - Date.parse(a.entry.createdAt)
        }),
    [entries, now],
  )
  const activeCount = sorted.filter(({ status }) => status === 'Running').length
  const visible = showAll ? sorted : sorted.slice(0, 3)

  return (
    <Wrap data-testid="project-marketing-history-popover">
      <Trigger
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-testid="project-marketing-history-trigger"
      >
        <Clock aria-hidden>◴</Clock>
        <TriggerLabel>Marketing History</TriggerLabel>
        <ActiveCount $active={activeCount > 0}>{activeCount} active</ActiveCount>
      </Trigger>
      <Popover $open={open} role="dialog" aria-label="Marketing history" data-testid="project-marketing-history-menu">
        <PopoverHead>
          <Title>Marketing History</Title>
          <ActiveBadge>{activeCount} active</ActiveBadge>
        </PopoverHead>
        {visible.length ? (
          visible.map(({ entry, status }) => (
            <Entry key={entry.id} data-marketing-kind={entry.kind}>
              <EntryIcon aria-hidden>{KIND_ICON[entry.kind]}</EntryIcon>
              <EntryCopy>
                <strong>{PUBLIC_KIND_LABEL[entry.kind] ?? MARKETING_KIND_LABEL[entry.kind]}</strong>
                <span data-active={status === 'Running'}>{remainingLabel(entry, now)}</span>
              </EntryCopy>
              <span aria-hidden style={{ color: 'rgba(255,255,255,.5)', fontSize: 18 }}>
                ›
              </span>
            </Entry>
          ))
        ) : (
          <Empty>No verified visibility purchases are recorded for this project in this session.</Empty>
        )}
        {sorted.length > 3 ? (
          <ViewAll type="button" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Show recent' : 'View full history'} ›
          </ViewAll>
        ) : null}
      </Popover>
    </Wrap>
  )
}

export default ProjectMarketingHistoryPopover
