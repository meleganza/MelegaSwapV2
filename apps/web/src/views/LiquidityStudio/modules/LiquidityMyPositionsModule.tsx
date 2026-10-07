/**
 * LIQUIDITY_MODULE_006_MY_POSITIONS — wallet LP positions (read + route).
 * Reuses shared liquidityRuntime. No second wallet indexer.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { ChainSwitchConfirmDialog, chainDisplayName } from 'components/ChainSwitchConfirmDialog'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { useLiquidityPositionDetails, type LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'
import { useLPApr } from 'state/swap/useLPApr'
import { formatPoolShare, formatPositionUsd, resolvePositionStatus } from './liquidityMyPositionsModel'
import { LIQUIDITY_MY_POSITIONS_COPY, liquidityMyPositions } from './liquidityMyPositionsTokens'
import { buildLiquidityPositionDirectory } from './liquidityPositionDirectory'

const Shell = styled.section<{ $embedded?: boolean }>`
  width: 100%;
  max-width: ${liquidityMyPositions.contentMax};
  margin: ${({ $embedded }) => ($embedded ? '0' : `${liquidityMyPositions.gapAfterActions} auto 0`)};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityMyPositions.tabletBreak}) {
    padding: ${({ $embedded }) => ($embedded ? '0' : '0 16px')};
  }
`

const Main = styled.div`
  width: 100%;
  max-width: ${liquidityMyPositions.mainW};
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${liquidityMyPositions.text};
`

const Desc = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 18px;
  color: ${liquidityMyPositions.muted};
`

const Grid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${liquidityMyPositions.columnGap};
  min-width: 0;

  @media (max-width: ${liquidityMyPositions.tabletBreak}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${liquidityMyPositions.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.article`
  width: 100%;
  min-height: ${liquidityMyPositions.cardMinH};
  box-sizing: border-box;
  border-radius: ${liquidityMyPositions.cardRadius};
  border: ${liquidityMyPositions.cardBorder};
  background: ${liquidityMyPositions.cardBg};
  padding: ${liquidityMyPositions.cardPad};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const PairRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Logos = styled.div`
  display: flex;
  align-items: center;
  > *:last-child {
    margin-left: -8px;
  }
`

const PairName = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: ${liquidityMyPositions.text};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Status = styled.span<{ $tone: string }>`
  display: inline-flex;
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${(p) =>
    p.$tone === 'ACTIVE' ? liquidityMyPositions.gold : p.$tone === 'PARTIAL' ? '#FBBF24' : liquidityMyPositions.dim};
`

const Metrics = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

const Metric = styled.div`
  min-width: 0;
`

const MetricLabel = styled.dt`
  margin: 0;
  font-size: 11px;
  color: ${liquidityMyPositions.dim};
`

const MetricValue = styled.dd`
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: ${liquidityMyPositions.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const PrimaryBtn = styled.button`
  appearance: none;
  height: ${liquidityMyPositions.ctaH};
  padding: 0 14px;
  border-radius: ${liquidityMyPositions.ctaRadius};
  border: 0;
  background: ${liquidityMyPositions.gold};
  color: #111;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: ${liquidityMyPositions.goldHover};
  }
`

const SecondaryBtn = styled.button`
  appearance: none;
  height: ${liquidityMyPositions.ctaH};
  padding: 0 14px;
  border-radius: ${liquidityMyPositions.ctaRadius};
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: ${liquidityMyPositions.text};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

const Empty = styled.div`
  margin-top: 12px;
  max-height: 120px;
  box-sizing: border-box;
  border-radius: ${liquidityMyPositions.cardRadius};
  border: ${liquidityMyPositions.cardBorder};
  background: rgba(255, 255, 255, 0.02);
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
`

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${liquidityMyPositions.muted};
`

const ChainReadNotice = styled.div`
  margin-top: 10px;
  color: ${liquidityMyPositions.muted};
  font-size: 12px;
  line-height: 18px;
`

const EmptyActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`



const ConnectWrap = styled.div`
  display: inline-flex;
  min-width: 160px;
  height: ${liquidityMyPositions.ctaH};

  button {
    width: 100% !important;
    height: ${liquidityMyPositions.ctaH} !important;
    border-radius: ${liquidityMyPositions.ctaRadius} !important;
  }
`

const Skeleton = styled.div`
  margin-top: 16px;
  min-height: 168px;
  border-radius: ${liquidityMyPositions.cardRadius};
  border: ${liquidityMyPositions.cardBorder};
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
`

const Toolbar = styled.div`
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const ViewToggle = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.28);
`

const ViewBtn = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.35)' : 'transparent')};
  background: ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.12)' : 'transparent')};
  color: ${({ $on }) => ($on ? '#fff' : liquidityMyPositions.muted)};
  font-size: 12px;
  font-weight: 750;
`

const DirectoryControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 420px;
  justify-content: flex-end;

  @media (max-width: ${liquidityMyPositions.mobileBreak}) {
    flex-basis: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
`

const PositionSearch = styled.input`
  width: min(320px, 100%);
  min-width: 0;
  height: 36px;
  box-sizing: border-box;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.28);
  color: ${liquidityMyPositions.text};
  padding: 0 12px;
  font-size: 13px;

  &::placeholder {
    color: ${liquidityMyPositions.dim};
  }

  &:focus-visible {
    outline: 2px solid rgba(244, 196, 48, 0.7);
    outline-offset: 1px;
  }
`

const PositionCount = styled.span`
  color: ${liquidityMyPositions.muted};
  font-size: 12px;
  white-space: nowrap;

  @media (max-width: ${liquidityMyPositions.mobileBreak}) {
    align-self: flex-end;
  }
`

const ListTable = styled.div`
  margin-top: 14px;
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  border-radius: ${liquidityMyPositions.cardRadius};
  border: ${liquidityMyPositions.cardBorder};
  background: ${liquidityMyPositions.cardBg};
`

const ListHead = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1.6fr) 100px 100px 90px minmax(220px, 1.2fr);
  gap: 8px;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liquidityMyPositions.dim};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 700px;
`

const ListRow = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1.6fr) 100px 100px 90px minmax(220px, 1.2fr);
  gap: 8px;
  padding: 12px 14px;
  align-items: center;
  min-width: 700px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: 0;
  }
`

const ListCell = styled.div`
  min-width: 0;
  font-size: 13px;
  font-weight: 650;
  color: ${liquidityMyPositions.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListPair = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const ListLogos = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;

  > *:last-child {
    margin-left: -7px;
  }
`

const PageButton = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: ${liquidityMyPositions.text};
  font-size: 13px;
  font-weight: 700;

  &:disabled {
    cursor: default;
    opacity: 0.4;
  }
`

const Pagination = styled.nav`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

function PositionCard({
  row,
  onManage,
  onRemove,
}: {
  row: LiquidityPositionRow
  onManage: (row: LiquidityPositionRow) => void
  onRemove: (row: LiquidityPositionRow) => void
}) {
  const details = useLiquidityPositionDetails(row)
  // Multichain rows are already batch-hydrated. Do not fan out one historical
  // subgraph request per card; APR remains unknown until a shared source exists.
  const lpApr = useLPApr(row.poolTvlSource ? undefined : row.pair)
  const aprLabel =
    lpApr?.lpApr7d != null && Number.isFinite(lpApr.lpApr7d)
      ? `${lpApr.lpApr7d >= 100 ? lpApr.lpApr7d.toFixed(0) : lpApr.lpApr7d.toFixed(2)}%`
      : LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
  const lpLabel = row.lpBalance?.greaterThan(0)
    ? row.lpBalance.toSignificant(6)
    : LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
  const valueLabel = formatPositionUsd(details.usdValue)
  const shareLabel = formatPoolShare(details.poolShare)
  const status = resolvePositionStatus({
    hasLpBalance: Boolean(row.lpBalance?.greaterThan(0)),
    hasValue: valueLabel !== LIQUIDITY_MY_POSITIONS_COPY.emptyMetric,
    hasShare: shareLabel !== LIQUIDITY_MY_POSITIONS_COPY.emptyMetric,
  })
  const token0 = row.pair.token0
  const token1 = row.pair.token1
  const positionChainId = row.chainId ?? token0.chainId ?? liquidityMyPositions.chainId

  return (
    <Card data-testid="liquidity-my-positions-card" data-position-id={row.id} data-position-status={status}>
      <PairRow>
        <Logos aria-hidden="true">
          <MelegaTokenAvatar
            symbol={token0.symbol}
            name={token0.name}
            address={token0.address}
            chainId={positionChainId}
            size={28}
            radius="circle"
          />
          <MelegaTokenAvatar
            symbol={token1.symbol}
            name={token1.name}
            address={token1.address}
            chainId={positionChainId}
            size={28}
            radius="circle"
          />
        </Logos>
        <div style={{ minWidth: 0, flex: 1 }}>
          <PairName>{row.pairLabel}</PairName>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
            <MelegaExploreChainBadge chainId={positionChainId} />
            <Status $tone={status} data-testid="liquidity-my-positions-status">
              {status}
            </Status>
          </div>
        </div>
      </PairRow>

      <Metrics data-testid="liquidity-my-positions-metrics">
        <Metric data-primary-metric="deposited-value">
          <MetricLabel>Position value</MetricLabel>
          <MetricValue>{valueLabel}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.poolShare}</MetricLabel>
          <MetricValue>{shareLabel}</MetricValue>
        </Metric>
        <Metric data-testid="liquidity-my-positions-apr">
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.apr}</MetricLabel>
          <MetricValue>{aprLabel}</MetricValue>
        </Metric>
        <Metric data-secondary-metric="lp-amount">
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.lpBalance}</MetricLabel>
          <MetricValue>{lpLabel}</MetricValue>
        </Metric>
      </Metrics>

      <Actions>
        <PrimaryBtn type="button" data-testid="liquidity-my-positions-manage" onClick={() => onManage(row)}>
          {LIQUIDITY_MY_POSITIONS_COPY.manage}
        </PrimaryBtn>
        <SecondaryBtn type="button" data-testid="liquidity-my-positions-add-more" onClick={() => onManage(row)}>
          {LIQUIDITY_MY_POSITIONS_COPY.addMore}
        </SecondaryBtn>
        <SecondaryBtn type="button" data-testid="liquidity-my-positions-remove" onClick={() => onRemove(row)}>
          {LIQUIDITY_MY_POSITIONS_COPY.remove}
        </SecondaryBtn>
      </Actions>
    </Card>
  )
}

function PositionListRow({
  row,
  onManage,
  onRemove,
}: {
  row: LiquidityPositionRow
  onManage: (row: LiquidityPositionRow) => void
  onRemove: (row: LiquidityPositionRow) => void
}) {
  const details = useLiquidityPositionDetails(row)
  const valueLabel = formatPositionUsd(details.usdValue)
  const shareLabel = formatPoolShare(details.poolShare)
  const token0 = row.pair.token0
  const token1 = row.pair.token1
  const positionChainId = row.chainId ?? token0.chainId ?? liquidityMyPositions.chainId

  return (
    <ListRow data-testid="liquidity-my-positions-list-row" data-position-id={row.id}>
      <ListCell data-testid="liquidity-my-positions-list-pair">
        <ListPair>
          <ListLogos aria-hidden="true">
            <MelegaTokenAvatar
              symbol={token0.symbol}
              name={token0.name}
              address={token0.address}
              chainId={positionChainId}
              size={24}
              radius="circle"
            />
            <MelegaTokenAvatar
              symbol={token1.symbol}
              name={token1.name}
              address={token1.address}
              chainId={positionChainId}
              size={24}
              radius="circle"
            />
          </ListLogos>
          <span>{row.pairLabel}</span>
        </ListPair>
      </ListCell>
      <ListCell data-testid="liquidity-my-positions-list-chain">
        <MelegaExploreChainBadge chainId={positionChainId} />
      </ListCell>
      <ListCell data-testid="liquidity-my-positions-list-value">{valueLabel}</ListCell>
      <ListCell data-testid="liquidity-my-positions-list-share">{shareLabel}</ListCell>
      <ListCell>
        <Actions style={{ marginTop: 0 }}>
          <PrimaryBtn type="button" data-testid="liquidity-my-positions-manage" onClick={() => onManage(row)}>
            {LIQUIDITY_MY_POSITIONS_COPY.manage}
          </PrimaryBtn>
          <SecondaryBtn type="button" data-testid="liquidity-my-positions-add-more" onClick={() => onManage(row)}>
            {LIQUIDITY_MY_POSITIONS_COPY.addMore}
          </SecondaryBtn>
          <SecondaryBtn type="button" data-testid="liquidity-my-positions-remove" onClick={() => onRemove(row)}>
            {LIQUIDITY_MY_POSITIONS_COPY.remove}
          </SecondaryBtn>
        </Actions>
      </ListCell>
    </ListRow>
  )
}

type PendingSwitch = { row: LiquidityPositionRow; intent: 'manage' | 'remove' }

/**
 * The editor is permanently mounted below My Liquidity in the approved
 * one-page workspace. Wait for React to expose the selected Add/Remove panel,
 * then move focus to it without triggering a route transition.
 */
function focusLiquidityEditor() {
  if (typeof window === 'undefined') return
  const focus = () => {
    document.getElementById('liquidity-add')?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
  window.requestAnimationFrame(() => window.requestAnimationFrame(focus))
}

const LiquidityMyPositionsBody: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const {
    account,
    positions,
    positionsPhase,
    positionsTimedOut,
    setSelectedPositionId,
    setMode,
    setCurrencyA,
    setCurrencyB,
    retryPositions,
    positionChainStatuses = [],
  } = useLiquidityRuntime()
  const { chainId } = useActiveChainId()
  const { switchNetworkAsync, isLoading: switching } = useSwitchNetwork()
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [positionQuery, setPositionQuery] = useState('')
  const [positionPage, setPositionPage] = useState(1)
  const directory = useMemo(
    () => buildLiquidityPositionDirectory(positions, positionQuery, positionPage),
    [positions, positionQuery, positionPage],
  )

  useEffect(() => {
    setPositionQuery('')
    setPositionPage(1)
  }, [account])

  useEffect(() => {
    if (directory.page !== positionPage) setPositionPage(directory.page)
  }, [directory.page, positionPage])

  const proceedManage = useCallback(
    (row: LiquidityPositionRow) => {
      setSelectedPositionId(row.id)
      setCurrencyA(row.pair.token0)
      setCurrencyB(row.pair.token1)
      setMode('Add Liquidity', { syncUrl: false, preservePair: true })
      focusLiquidityEditor()
    },
    [setSelectedPositionId, setCurrencyA, setCurrencyB, setMode],
  )

  const proceedRemove = useCallback(
    (row: LiquidityPositionRow) => {
      setSelectedPositionId(row.id)
      setCurrencyA(row.pair.token0)
      setCurrencyB(row.pair.token1)
      setMode('Remove Liquidity', { syncUrl: false })
      focusLiquidityEditor()
    },
    [setSelectedPositionId, setCurrencyA, setCurrencyB, setMode],
  )

  const onManage = useCallback(
    (row: LiquidityPositionRow) => {
      const target = row.chainId ?? row.pair.token0.chainId
      if (account && target != null && chainId != null && target !== chainId) {
        setPendingSwitch({ row, intent: 'manage' })
        return
      }
      proceedManage(row)
    },
    [account, chainId, proceedManage],
  )

  const onRemove = useCallback(
    (row: LiquidityPositionRow) => {
      const target = row.chainId ?? row.pair.token0.chainId
      if (account && target != null && chainId != null && target !== chainId) {
        setPendingSwitch({ row, intent: 'remove' })
        return
      }
      proceedRemove(row)
    },
    [account, chainId, proceedRemove],
  )

  const confirmSwitch = useCallback(async () => {
    if (!pendingSwitch) return
    const target = pendingSwitch.row.chainId ?? pendingSwitch.row.pair.token0.chainId
    try {
      if (target != null) {
        const switched = await switchNetworkAsync(target)
        if (switched === false) return
      }
      if (pendingSwitch.intent === 'remove') proceedRemove(pendingSwitch.row)
      else proceedManage(pendingSwitch.row)
    } finally {
      setPendingSwitch(null)
    }
  }, [pendingSwitch, switchNetworkAsync, proceedManage, proceedRemove])

  return (
    <Main data-testid="liquidity-my-positions-layout" data-liquidity-positions-geometry="full-width">
      {!embedded ? (
        <>
          <Title id="liquidity-my-positions-title">{LIQUIDITY_MY_POSITIONS_COPY.title}</Title>
          <Desc>{LIQUIDITY_MY_POSITIONS_COPY.description}</Desc>
        </>
      ) : null}

      <div
        data-testid="liquidity-my-positions-phase"
        data-positions-phase={positionsPhase}
        data-positions-timed-out={positionsTimedOut ? '1' : '0'}
        hidden
        aria-hidden
      />

      <div data-testid="liquidity-chain-read-statuses" hidden aria-hidden>
        {positionChainStatuses.map((status) => (
          <span
            key={status.chainId}
            data-chain-id={status.chainId}
            data-chain-state={status.state}
            data-position-count={status.positionCount}
          />
        ))}
      </div>

      {positionsPhase === 'ready' &&
      positionChainStatuses.some((status) => ['UNAVAILABLE', 'ERROR', 'TIMED_OUT'].includes(status.state)) ? (
        <ChainReadNotice data-testid="liquidity-chain-read-partial">
          Positions from available networks are shown. One or more networks could not be read right now.
        </ChainReadNotice>
      ) : null}

      {positionsPhase === 'connecting' ? (
        <Empty data-testid="liquidity-my-positions-disconnected">
          <EmptyText>{LIQUIDITY_MY_POSITIONS_COPY.emptyDisconnected}</EmptyText>
          <EmptyActions>
            <ConnectWrap>
              <ConnectWalletButton>{LIQUIDITY_MY_POSITIONS_COPY.connect}</ConnectWalletButton>
            </ConnectWrap>
          </EmptyActions>
        </Empty>
      ) : null}

      {positionsPhase === 'fetching' ? (
        <Skeleton
          data-testid="liquidity-my-positions-skeleton"
          aria-label="Fetching positions"
          data-positions-loading="fetching"
        />
      ) : null}

      {positionsPhase === 'empty' ? (
        <Empty data-testid="liquidity-my-positions-empty">
          <EmptyText>{LIQUIDITY_MY_POSITIONS_COPY.emptyConnected}</EmptyText>
          <EmptyActions>
            <PrimaryBtn
              type="button"
              data-testid="liquidity-my-positions-empty-add"
              onClick={() => {
                setMode('Add Liquidity')
              }}
            >
              Add Liquidity
            </PrimaryBtn>
          </EmptyActions>
        </Empty>
      ) : null}

      {positionsPhase === 'error' ? (
        <Empty data-testid="liquidity-my-positions-error">
          <EmptyText>
            {positionsTimedOut ? LIQUIDITY_MY_POSITIONS_COPY.emptyTimedOut : LIQUIDITY_MY_POSITIONS_COPY.emptyError}
          </EmptyText>
          <EmptyActions>
            <PrimaryBtn type="button" data-testid="liquidity-my-positions-retry" onClick={() => retryPositions()}>
              {LIQUIDITY_MY_POSITIONS_COPY.retry}
            </PrimaryBtn>
            <SecondaryBtn
              type="button"
              data-testid="liquidity-my-positions-empty-add"
              onClick={() => setMode('Add Liquidity')}
            >
              Add Liquidity
            </SecondaryBtn>
          </EmptyActions>
        </Empty>
      ) : null}

      {positionsPhase === 'ready' ? (
        <>
          <Toolbar data-testid="liquidity-my-positions-toolbar">
            <ViewToggle role="group" aria-label="Positions layout">
              <ViewBtn
                type="button"
                $on={viewMode === 'cards'}
                onClick={() => setViewMode('cards')}
                data-testid="liquidity-my-positions-view-cards"
              >
                {LIQUIDITY_MY_POSITIONS_COPY.viewCards}
              </ViewBtn>
              <ViewBtn
                type="button"
                $on={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                data-testid="liquidity-my-positions-view-list"
              >
                {LIQUIDITY_MY_POSITIONS_COPY.viewList}
              </ViewBtn>
            </ViewToggle>
            <DirectoryControls>
              <PositionSearch
                type="search"
                value={positionQuery}
                onChange={(event) => {
                  setPositionQuery(event.currentTarget.value)
                  setPositionPage(1)
                }}
                placeholder="Search pair, symbol, or address"
                aria-label="Search wallet liquidity positions"
                data-testid="liquidity-my-positions-search"
              />
              <PositionCount data-testid="liquidity-my-positions-count">
                {directory.filtered.length === directory.totalPositions
                  ? `${directory.totalPositions} positions`
                  : `${directory.filtered.length} of ${directory.totalPositions}`}
              </PositionCount>
            </DirectoryControls>
          </Toolbar>

          {directory.filtered.length === 0 ? (
            <Empty data-testid="liquidity-my-positions-no-results">
              <EmptyText>No wallet positions match this search.</EmptyText>
            </Empty>
          ) : viewMode === 'cards' ? (
            <Grid data-testid="liquidity-my-positions-grid">
              {directory.visible.map((row) => (
                <PositionCard key={row.id} row={row} onManage={onManage} onRemove={onRemove} />
              ))}
            </Grid>
          ) : (
            <ListTable data-testid="liquidity-my-positions-list">
              <ListHead>
                <span>{LIQUIDITY_MY_POSITIONS_COPY.colPair}</span>
                <span>{LIQUIDITY_MY_POSITIONS_COPY.colChain}</span>
                <span>{LIQUIDITY_MY_POSITIONS_COPY.colValue}</span>
                <span>{LIQUIDITY_MY_POSITIONS_COPY.colShare}</span>
                <span>{LIQUIDITY_MY_POSITIONS_COPY.colActions}</span>
              </ListHead>
              {directory.visible.map((row) => (
                <PositionListRow key={row.id} row={row} onManage={onManage} onRemove={onRemove} />
              ))}
            </ListTable>
          )}

          {directory.filtered.length > 0 && directory.totalPages > 1 ? (
            <Pagination aria-label="Wallet liquidity position pages" data-testid="liquidity-my-positions-pagination">
              <PageButton
                type="button"
                disabled={directory.page <= 1}
                onClick={() => setPositionPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </PageButton>
              <PositionCount>
                {directory.firstVisible}–{directory.lastVisible} of {directory.filtered.length} · Page {directory.page}{' '}
                of {directory.totalPages}
              </PositionCount>
              <PageButton
                type="button"
                disabled={directory.page >= directory.totalPages}
                onClick={() => setPositionPage((page) => Math.min(directory.totalPages, page + 1))}
              >
                Next
              </PageButton>
            </Pagination>
          ) : null}
        </>
      ) : null}

      <ChainSwitchConfirmDialog
        open={Boolean(pendingSwitch)}
        targetChainId={pendingSwitch?.row.chainId ?? pendingSwitch?.row.pair.token0.chainId ?? 56}
        productLabel={`This liquidity position is on ${chainDisplayName(
          pendingSwitch?.row.chainId ?? pendingSwitch?.row.pair.token0.chainId ?? 56,
        )}. Switch network to continue?`}
        onCancel={() => setPendingSwitch(null)}
        onConfirm={() => {
          void confirmSwitch()
        }}
        busy={switching}
      />
    </Main>
  )
}

export const LiquidityMyPositionsModule: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => (
  <Shell
    $embedded={embedded}
    data-testid="liquidity-my-positions-module"
    data-liquidity-module="006-your-positions"
    data-liquidity-module-006="mounted"
    aria-labelledby="liquidity-my-positions-title"
  >
    <LiquidityMyPositionsBody embedded={embedded} />
  </Shell>
)

export default LiquidityMyPositionsModule
