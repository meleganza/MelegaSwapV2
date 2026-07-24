import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import {
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Minus,
  Settings2,
  Layers,
  Search,
} from 'lucide-react'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { selectLiquidityPortfolioPositions } from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import { useProgramReadModel } from '../liquidityBuilding/useProgramReadModel'
import { liqOne } from './onePageTokens'

type PosStatus = 'Active' | 'Paused' | 'Stopped' | 'Pending' | 'Completed'

export type LbPositionRow = {
  id: string
  pair: string
  status: string
  value: string
}

type Props = {
  lbPrograms?: LbPositionRow[]
  /** Preferred LB manage callback (select program in LB card — no page navigation). */
  onManageLb?: (programId?: string) => void
  /** Preferred manual add callback (scroll Add Liquidity + pair). */
  onAddManual?: (pairHint?: string) => void
  /** Parent UnifiedLiquidityPage wiring (kept for locked parent compatibility). */
  onAddLiquidity?: () => void
  onOpenBuilding?: () => void
}

type ViewRow = {
  id: string
  tokenA: string
  tokenB: string
  feeLabel: string
  type: 'Manual' | 'Liquidity Building'
  isLb: boolean
  value: string
  share: string
  fees: string
  status: PosStatus
  closed: boolean
  contract: string | null
}

type InjectedFixture = {
  rows: ViewRow[]
}

declare global {
  // eslint-disable-next-line no-var
  var __LIQ_MODULE_006_FIXTURE__: InjectedFixture | undefined
}

const Section = styled.section`
  width: ${liqOne.contentMax};
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
  font-family: ${liqOne.font};

  @media (max-width: 1375px) {
    width: calc(100vw - 32px);
  }
`

const Shell = styled.div`
  width: 100%;
  padding: ${liqOne.positionsPad};
  box-sizing: border-box;
  background: ${liqOne.card};
  border: 1px solid ${liqOne.border};
  border-radius: ${liqOne.cardRadius};
  overflow: hidden;
`

const Chrome = styled.div`
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(220px, 1.2fr) minmax(180px, 1fr) auto;
  align-items: center;
  gap: 12px;
  height: ${liqOne.positionsHeadH};
  min-height: ${liqOne.positionsHeadH};
  max-height: ${liqOne.positionsHeadH};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    height: auto;
    min-height: 0;
    max-height: none;
    grid-template-columns: 1fr;
    row-gap: 10px;
    padding-bottom: 8px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
  color: ${liqOne.text};
  white-space: nowrap;
`

const Filters = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
`

const FilterBtn = styled.button<{ $on?: boolean }>`
  appearance: none;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ $on }) => ($on ? liqOne.goldBorder : liqOne.borderStrong)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.12)' : 'transparent')};
  color: ${({ $on }) => ($on ? liqOne.gold : liqOne.secondary)};
  font-size: 12px;
  font-weight: 650;
  font-family: ${liqOne.font};
  cursor: pointer;
  white-space: nowrap;
`

const SearchWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${liqOne.borderStrong};
  background: ${liqOne.elevated};
  min-width: 0;
  color: ${liqOne.muted};
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: ${liqOne.text};
  font-size: 13px;
  font-family: ${liqOne.font};
  outline: none;

  &::placeholder {
    color: ${liqOne.muted};
  }
`

const HideClosed = styled.button<{ $on?: boolean }>`
  appearance: none;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $on }) => ($on ? liqOne.goldBorder : liqOne.borderStrong)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.1)' : 'transparent')};
  color: ${({ $on }) => ($on ? liqOne.gold : liqOne.secondary)};
  font-size: 12px;
  font-weight: 700;
  font-family: ${liqOne.font};
  cursor: pointer;
  white-space: nowrap;
  justify-self: end;
`

const Table = styled.div`
  display: none;
  width: 100%;
  margin-top: 4px;

  @media (min-width: 900px) {
    display: block;
  }
`

const ColGrid = `
  grid-template-columns:
    minmax(220px, 1.6fr)
    minmax(120px, 0.9fr)
    minmax(90px, 0.8fr)
    minmax(80px, 0.7fr)
    minmax(70px, 0.7fr)
    minmax(90px, 0.8fr)
    minmax(120px, 0.95fr);
`

const TableHead = styled.div`
  display: grid;
  ${ColGrid}
  gap: 8px;
  height: ${liqOne.positionsTableHeadH};
  min-height: ${liqOne.positionsTableHeadH};
  max-height: ${liqOne.positionsTableHeadH};
  align-items: center;
  box-sizing: border-box;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 650;
  color: ${liqOne.muted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${liqOne.borderDefault};
  overflow: hidden;
`

const Row = styled.div`
  display: grid;
  ${ColGrid}
  gap: 8px;
  height: ${liqOne.positionsRowH};
  min-height: ${liqOne.positionsRowH};
  max-height: ${liqOne.positionsRowH};
  align-items: center;
  box-sizing: border-box;
  padding: 0 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 13px;
  color: ${liqOne.text};
  overflow: hidden;

  &:last-child {
    border-bottom: none;
  }
`

const PairCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
`

const IconStack = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`

const TokenDisc = styled.div<{ $x: string; $bg: string }>`
  position: absolute;
  top: 4px;
  left: ${({ $x }) => $x};
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  border: 2px solid ${liqOne.card};
  display: grid;
  place-items: center;
  font-size: 9px;
  font-weight: 800;
  color: #111;
`

const PairText = styled.div`
  min-width: 0;
  overflow: hidden;
`

const PairTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${liqOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PairFee = styled.div`
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: ${liqOne.muted};
`

const TypeBadge = styled.span<{ $lb?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $lb }) => ($lb ? '#111' : liqOne.text)};
  background: ${({ $lb }) => ($lb ? liqOne.gold : liqOne.elevated)};
  border: 1px solid ${({ $lb }) => ($lb ? liqOne.gold : liqOne.borderStrong)};
  white-space: nowrap;
`

const StatusPill = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $tone }) => $tone};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  position: relative;
`

const ActionBtn = styled.button`
  appearance: none;
  cursor: pointer;
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${liqOne.borderStrong};
  background: transparent;
  color: ${liqOne.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 650;
  font-family: ${liqOne.font};

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const Menu = styled.div`
  position: absolute;
  top: 36px;
  right: 0;
  z-index: 5;
  min-width: 140px;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid ${liqOne.borderStrong};
  background: #121212;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
`

const MenuItem = styled.button`
  appearance: none;
  width: 100%;
  height: 32px;
  border: 0;
  background: transparent;
  color: ${liqOne.text};
  font-size: 12px;
  font-weight: 650;
  font-family: ${liqOne.font};
  text-align: left;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`

const MobileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;

  @media (min-width: 900px) {
    display: none;
  }
`

const MobileCard = styled.div`
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 12px;
  background: ${liqOne.elevated};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const MobileMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 12px;
  color: ${liqOne.secondary};
`

const Empty = styled.div`
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  color: ${liqOne.secondary};
  padding: 24px 12px;
`

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${liqOne.text};
`

const EmptyBtn = styled.button`
  appearance: none;
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  background: ${liqOne.gold};
  color: #111;
  font-size: 13px;
  font-weight: 800;
  font-family: ${liqOne.font};
  cursor: pointer;
`

function splitPair(label: string): { a: string; b: string } {
  const parts = label.split(/[/\-]/).map((s) => s.trim()).filter(Boolean)
  return { a: parts[0] || '—', b: parts[1] || '—' }
}

function mapStatus(raw: string | undefined | null): PosStatus {
  const s = String(raw || 'Active').toUpperCase()
  if (s.includes('PAUSE')) return 'Paused'
  if (s.includes('STOP')) return 'Stopped'
  if (s.includes('PEND') || s.includes('READY') || s.includes('AWAIT') || s.includes('SETUP')) return 'Pending'
  if (s.includes('COMPLETE') || s.includes('DEPLET')) return 'Completed'
  return 'Active'
}

function statusTone(status: PosStatus): string {
  switch (status) {
    case 'Active':
      return liqOne.positive
    case 'Paused':
      return liqOne.warning
    case 'Stopped':
    case 'Completed':
      return liqOne.muted
    case 'Pending':
      return liqOne.gold
    default:
      return liqOne.secondary
  }
}

function formatUsd(raw: string | null | undefined): string {
  if (raw == null || raw === '') return '—'
  const n = Number(String(raw).replace(/[$,]/g, ''))
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '$0.00'
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
}

function discColor(symbol: string): string {
  const s = symbol.toUpperCase()
  if (s.includes('BNB') || s.includes('WBNB')) return '#F0B90B'
  if (s.includes('USD')) return '#26A17B'
  if (s.includes('MARCO') || s.includes('TOKEN_A')) return liqOne.gold
  return '#5B8CFF'
}

export const LiquidityPositions: React.FC<Props> = ({
  lbPrograms = [],
  onManageLb,
  onAddManual,
  onAddLiquidity,
  onOpenBuilding,
}) => {
  const { address, isConnected } = useAccount()
  const { positionsLoading, setMode, setSelectedPositionId, positions, liquidityWalletPortfolio } =
    useLiquidityRuntime()

  const programRead = useProgramReadModel({
    owner: address ?? null,
    projectTokenAddress: null,
  })

  const [filter, setFilter] = useState<'all' | 'manual' | 'lb'>('all')
  const [query, setQuery] = useState('')
  const [hideClosed, setHideClosed] = useState(true)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [injected, setInjected] = useState<InjectedFixture | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isLocalHost()) return
    setInjected(window.__LIQ_MODULE_006_FIXTURE__ ?? null)
  }, [])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuId(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const manual = useMemo(
    () => selectLiquidityPortfolioPositions(liquidityWalletPortfolio),
    [liquidityWalletPortfolio],
  )

  const lbFromChain = useMemo((): LbPositionRow[] => {
    if (lbPrograms.length) return lbPrograms
    if (programRead.source !== 'ON_CHAIN' || !programRead.snapshot.status) return []
    if (['NOT_ACTIVE', 'STOPPED'].includes(String(programRead.snapshot.status))) return []
    const snap = programRead.snapshot
    const pair = snap.pair || 'LB Program'
    return [
      {
        id: snap.programAddress || 'lb-program',
        pair,
        status: String(snap.status),
        value: snap.metrics?.liquidityBuiltLabel || '—',
      },
    ]
  }, [lbPrograms, programRead])

  const baseRows = useMemo((): ViewRow[] => {
    if (injected?.rows?.length) return injected.rows
    const manuals: ViewRow[] = manual.map((p) => {
      const { a, b } = splitPair(p.title || '— / —')
      const status = mapStatus('Active')
      return {
        id: p.positionId,
        tokenA: a,
        tokenB: b,
        feeLabel: '0.25% fee',
        type: 'Manual',
        isLb: false,
        value: formatUsd(p.currentValueUsd),
        share: p.poolShare ?? '—',
        fees: p.feesEarnedUsd || p.claimableValueUsd ? formatUsd(p.feesEarnedUsd ?? p.claimableValueUsd) : '—',
        status,
        closed: false,
        contract: p.contract,
      }
    })
    const lbs: ViewRow[] = lbFromChain.map((p) => {
      const { a, b } = splitPair(p.pair)
      const status = mapStatus(p.status)
      return {
        id: p.id,
        tokenA: a,
        tokenB: b,
        feeLabel: 'Program',
        type: 'Liquidity Building',
        isLb: true,
        value: p.value && p.value !== '—' ? p.value : '—',
        share: '—',
        fees: '—',
        status,
        closed: status === 'Stopped' || status === 'Completed',
        contract: null,
      }
    })
    return [...manuals, ...lbs]
  }, [injected, manual, lbFromChain])

  const rows = useMemo(() => {
    return baseRows.filter((r) => {
      if (hideClosed && r.closed) return false
      if (filter === 'manual' && r.isLb) return false
      if (filter === 'lb' && !r.isLb) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        const hay = `${r.tokenA}/${r.tokenB} ${r.type} ${r.status}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [baseRows, hideClosed, filter, query])

  const openAdd = useCallback(
    (pairHint?: string) => {
      if (onAddManual) onAddManual(pairHint)
      else onAddLiquidity?.()
      setMode('Add Liquidity')
    },
    [onAddManual, onAddLiquidity, setMode],
  )

  const openLbManage = useCallback(
    (id?: string) => {
      if (onManageLb) onManageLb(id)
      else onOpenBuilding?.()
      setMode('Liquidity Building')
    },
    [onManageLb, onOpenBuilding, setMode],
  )

  const showEmpty = isConnected && !positionsLoading && rows.length === 0 && !injected
  const showConnect = !isConnected && !injected

  return (
    <Section data-testid="liq-one-positions" id="liq-your-positions" data-pixel-positions="006">
      <Shell data-testid="liq-positions-shell">
        <Chrome data-testid="liq-positions-chrome" data-pixel-pos-chrome="64">
          <Title>Your Positions</Title>
          <Filters data-testid="liq-positions-filters">
            <FilterBtn type="button" $on={filter === 'all'} onClick={() => setFilter('all')}>
              All
            </FilterBtn>
            <FilterBtn type="button" $on={filter === 'manual'} onClick={() => setFilter('manual')}>
              Manual
            </FilterBtn>
            <FilterBtn type="button" $on={filter === 'lb'} onClick={() => setFilter('lb')}>
              Building
            </FilterBtn>
          </Filters>
          <SearchWrap>
            <Search size={14} aria-hidden />
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pairs"
              data-testid="liq-positions-search"
              aria-label="Search positions"
            />
          </SearchWrap>
          <HideClosed
            type="button"
            $on={hideClosed}
            onClick={() => setHideClosed((v) => !v)}
            data-testid="liq-positions-hide-closed"
          >
            Hide Closed
          </HideClosed>
        </Chrome>

        {showConnect ? (
          <Empty data-testid="liq-one-positions-disconnected">
            <Layers size={28} color={liqOne.gold} strokeWidth={1.75} aria-hidden />
            <EmptyTitle>Connect wallet to view positions</EmptyTitle>
          </Empty>
        ) : positionsLoading && !injected ? (
          <Empty>Loading positions…</Empty>
        ) : showEmpty ? (
          <Empty data-testid="liq-one-positions-empty">
            <Layers size={28} color={liqOne.gold} strokeWidth={1.75} aria-hidden />
            <EmptyTitle>No Positions Yet</EmptyTitle>
            <EmptyBtn type="button" onClick={() => openAdd()} data-testid="liq-positions-empty-add">
              Add Liquidity
            </EmptyBtn>
          </Empty>
        ) : (
          <>
            <Table data-testid="liq-positions-table">
              <TableHead data-testid="liq-positions-table-head" data-pixel-pos-thead="52">
                <span>Pair</span>
                <span>Type</span>
                <span>Value</span>
                <span>Pool Share</span>
                <span>Fees</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </TableHead>
              {rows.map((r) => {
                const primary = r.isLb
                  ? [
                      { key: 'manage', label: 'Manage', onClick: () => openLbManage(r.id) },
                      { key: 'view', label: 'View', onClick: () => openLbManage(r.id) },
                    ]
                  : [
                      {
                        key: 'add',
                        label: 'Add',
                        onClick: () => openAdd(`${r.tokenA} / ${r.tokenB}`),
                      },
                      {
                        key: 'remove',
                        label: 'Remove',
                        onClick: () => {
                          const hit = positions.find(
                            (p) => p.id.toLowerCase() === (r.contract || '').toLowerCase(),
                          )
                          if (hit) setSelectedPositionId(hit.id)
                          setMode('Remove Liquidity')
                        },
                      },
                    ]
                const secondary = r.isLb
                  ? [
                      {
                        key: 'pause',
                        label: r.status === 'Paused' ? 'Resume' : 'Pause',
                        onClick: () => openLbManage(r.id),
                      },
                    ]
                  : [
                      {
                        key: 'view',
                        label: 'View',
                        onClick: () => {
                          const hit = positions.find(
                            (p) => p.id.toLowerCase() === (r.contract || '').toLowerCase(),
                          )
                          if (hit) setSelectedPositionId(hit.id)
                        },
                      },
                    ]
                const visible = primary.slice(0, 2)
                const overflow = [...primary.slice(2), ...secondary]

                return (
                  <Row
                    key={r.id}
                    data-testid={r.isLb ? 'liq-one-lb-position-row' : 'liq-one-manual-position-row'}
                    data-pixel-pos-row="68"
                  >
                    <PairCell>
                      <IconStack aria-hidden>
                        <TokenDisc $x="0" $bg={discColor(r.tokenA)}>
                          {r.tokenA.slice(0, 2)}
                        </TokenDisc>
                        <TokenDisc $x="18px" $bg={discColor(r.tokenB)}>
                          {r.tokenB.slice(0, 2)}
                        </TokenDisc>
                      </IconStack>
                      <PairText>
                        <PairTitle>
                          {r.tokenA} / {r.tokenB}
                        </PairTitle>
                        <PairFee>{r.feeLabel}</PairFee>
                      </PairText>
                    </PairCell>
                    <div>
                      <TypeBadge $lb={r.isLb}>{r.type}</TypeBadge>
                    </div>
                    <span>{r.value}</span>
                    <span>{r.share}</span>
                    <span>{r.fees}</span>
                    <div>
                      <StatusPill $tone={statusTone(r.status)}>{r.status}</StatusPill>
                    </div>
                    <Actions ref={menuId === r.id ? menuRef : undefined}>
                      {visible.map((a) => (
                        <ActionBtn key={a.key} type="button" onClick={a.onClick} aria-label={a.label}>
                          {a.key === 'manage' ? <Settings2 size={14} /> : null}
                          {a.key === 'view' ? <Eye size={14} /> : null}
                          {a.key === 'add' ? <Plus size={14} /> : null}
                          {a.key === 'remove' ? <Minus size={14} /> : null}
                          <span>{a.label}</span>
                        </ActionBtn>
                      ))}
                      {overflow.length ? (
                        <>
                          <ActionBtn
                            type="button"
                            aria-label="More actions"
                            onClick={() => setMenuId((id) => (id === r.id ? null : r.id))}
                          >
                            <MoreHorizontal size={14} />
                          </ActionBtn>
                          {menuId === r.id ? (
                            <Menu>
                              {overflow.map((a) => (
                                <MenuItem
                                  key={a.key}
                                  type="button"
                                  onClick={() => {
                                    setMenuId(null)
                                    a.onClick()
                                  }}
                                >
                                  {a.key === 'pause' && r.status !== 'Paused' ? (
                                    <Pause size={12} style={{ marginRight: 6 }} />
                                  ) : null}
                                  {a.key === 'pause' && r.status === 'Paused' ? (
                                    <Play size={12} style={{ marginRight: 6 }} />
                                  ) : null}
                                  {a.label}
                                </MenuItem>
                              ))}
                            </Menu>
                          ) : null}
                        </>
                      ) : null}
                    </Actions>
                  </Row>
                )
              })}
            </Table>

            <MobileList data-testid="liq-positions-mobile">
              {rows.map((r) => (
                <MobileCard key={`m-${r.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <PairTitle>
                        {r.tokenA} / {r.tokenB}
                      </PairTitle>
                      <div style={{ marginTop: 6 }}>
                        <TypeBadge $lb={r.isLb}>{r.type}</TypeBadge>
                      </div>
                    </div>
                    <StatusPill $tone={statusTone(r.status)}>{r.status}</StatusPill>
                  </div>
                  <MobileMeta>
                    <span>Value {r.value}</span>
                    <span>Share {r.share}</span>
                    <span>Fees {r.fees}</span>
                    <span>{r.feeLabel}</span>
                  </MobileMeta>
                  <Actions style={{ justifyContent: 'stretch' }}>
                    {r.isLb ? (
                      <ActionBtn type="button" style={{ flex: 1 }} onClick={() => openLbManage(r.id)}>
                        Manage
                      </ActionBtn>
                    ) : (
                      <>
                        <ActionBtn
                          type="button"
                          style={{ flex: 1 }}
                          onClick={() => openAdd(`${r.tokenA} / ${r.tokenB}`)}
                        >
                          Add
                        </ActionBtn>
                        <ActionBtn
                          type="button"
                          style={{ flex: 1 }}
                          onClick={() => {
                            const hit = positions.find(
                              (p) => p.id.toLowerCase() === (r.contract || '').toLowerCase(),
                            )
                            if (hit) setSelectedPositionId(hit.id)
                            setMode('Remove Liquidity')
                          }}
                        >
                          Remove
                        </ActionBtn>
                      </>
                    )}
                  </Actions>
                </MobileCard>
              ))}
            </MobileList>
          </>
        )}
      </Shell>
    </Section>
  )
}

export default LiquidityPositions
