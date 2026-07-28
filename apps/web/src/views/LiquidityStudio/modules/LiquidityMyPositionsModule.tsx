/**
 * LIQUIDITY_MODULE_006_MY_POSITIONS — wallet LP positions (read + route).
 * Reuses shared liquidityRuntime. No second wallet indexer.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import {
  useLiquidityPositionDetails,
  type LiquidityPositionRow,
} from '../liquidityRuntime/useLiquidityPositions'
import {
  formatPoolShare,
  formatPositionUsd,
  resolvePositionStatus,
} from './liquidityMyPositionsModel'
import { LIQUIDITY_MY_POSITIONS_COPY, liquidityMyPositions } from './liquidityMyPositionsTokens'

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityMyPositions.contentMax};
  margin: ${liquidityMyPositions.gapAfterActions} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityMyPositions.tabletBreak}) {
    padding: 0 16px;
  }
`

const Main = styled.div`
  width: 100%;
  max-width: ${liquidityMyPositions.mainW};
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${liquidityMyPositions.text};
`

const Desc = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: ${liquidityMyPositions.muted};
`

const Grid = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${liquidityMyPositions.columnGap};
  min-width: 0;

  @media (max-width: ${liquidityMyPositions.tabletBreak}) {
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
  gap: 12px;
  min-width: 0;
`

const PairRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
  gap: 10px;
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
  margin-top: 16px;
  border-radius: ${liquidityMyPositions.cardRadius};
  border: ${liquidityMyPositions.cardBorder};
  background: ${liquidityMyPositions.cardBg};
  padding: 24px;
  text-align: center;
`

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${liquidityMyPositions.muted};
`

const EmptyActions = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`

const LinkBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${liquidityMyPositions.ctaH};
  padding: 0 16px;
  border-radius: ${liquidityMyPositions.ctaRadius};
  background: ${liquidityMyPositions.gold};
  color: #111;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
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
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07),
    rgba(255, 255, 255, 0.03)
  );
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
  const lpLabel = row.lpBalance?.greaterThan(0) ? row.lpBalance.toSignificant(6) : LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
  const valueLabel = formatPositionUsd(details.usdValue)
  const shareLabel = formatPoolShare(details.poolShare)
  const status = resolvePositionStatus({
    hasLpBalance: Boolean(row.lpBalance?.greaterThan(0)),
    hasValue: valueLabel !== LIQUIDITY_MY_POSITIONS_COPY.emptyMetric,
    hasShare: shareLabel !== LIQUIDITY_MY_POSITIONS_COPY.emptyMetric,
  })
  const token0 = row.pair.token0
  const token1 = row.pair.token1

  return (
    <Card data-testid="liquidity-my-positions-card" data-position-id={row.id} data-position-status={status}>
      <PairRow>
        <Logos aria-hidden="true">
          <MelegaTokenAvatar
            symbol={token0.symbol}
            name={token0.name}
            address={token0.address}
            chainId={liquidityMyPositions.chainId}
            size={32}
            radius="circle"
          />
          <MelegaTokenAvatar
            symbol={token1.symbol}
            name={token1.name}
            address={token1.address}
            chainId={liquidityMyPositions.chainId}
            size={32}
            radius="circle"
          />
        </Logos>
        <div style={{ minWidth: 0 }}>
          <PairName>{row.pairLabel}</PairName>
          <Status $tone={status} data-testid="liquidity-my-positions-status">
            {status}
          </Status>
        </div>
      </PairRow>

      <Metrics>
        <Metric>
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.lpBalance}</MetricLabel>
          <MetricValue>{lpLabel}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.positionValue}</MetricLabel>
          <MetricValue>{valueLabel}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.poolShare}</MetricLabel>
          <MetricValue>{shareLabel}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{LIQUIDITY_MY_POSITIONS_COPY.feesEarned}</MetricLabel>
          <MetricValue>{LIQUIDITY_MY_POSITIONS_COPY.emptyMetric}</MetricValue>
        </Metric>
      </Metrics>

      <Actions>
        <PrimaryBtn type="button" data-testid="liquidity-my-positions-manage" onClick={() => onManage(row)}>
          {LIQUIDITY_MY_POSITIONS_COPY.manage}
        </PrimaryBtn>
        <SecondaryBtn type="button" data-testid="liquidity-my-positions-remove" onClick={() => onRemove(row)}>
          {LIQUIDITY_MY_POSITIONS_COPY.remove}
        </SecondaryBtn>
      </Actions>
    </Card>
  )
}

const LiquidityMyPositionsBody: React.FC = () => {
  const {
    account,
    positions,
    positionsLoading,
    setSelectedPositionId,
    setMode,
    setCurrencyA,
    setCurrencyB,
    openRemoveModal,
  } = useLiquidityRuntime()

  const onManage = useCallback(
    (row: LiquidityPositionRow) => {
      setSelectedPositionId(row.id)
      setCurrencyA(row.pair.token0)
      setCurrencyB(row.pair.token1)
      setMode('Add Liquidity')
      if (typeof document !== 'undefined') {
        document.getElementById('add-liquidity')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    [setSelectedPositionId, setCurrencyA, setCurrencyB, setMode],
  )

  const onRemove = useCallback(
    (row: LiquidityPositionRow) => {
      setSelectedPositionId(row.id)
      setMode('Remove Liquidity')
      openRemoveModal()
    },
    [setSelectedPositionId, setMode, openRemoveModal],
  )

  return (
    <Main data-testid="liquidity-my-positions-layout" data-liquidity-positions-geometry="full-width">
      <Title id="liquidity-my-positions-title">{LIQUIDITY_MY_POSITIONS_COPY.title}</Title>
      <Desc>{LIQUIDITY_MY_POSITIONS_COPY.description}</Desc>

      {!account ? (
        <Empty data-testid="liquidity-my-positions-disconnected">
          <EmptyText>{LIQUIDITY_MY_POSITIONS_COPY.emptyDisconnected}</EmptyText>
          <EmptyActions>
            <ConnectWrap>
              <ConnectWalletButton>{LIQUIDITY_MY_POSITIONS_COPY.connect}</ConnectWalletButton>
            </ConnectWrap>
          </EmptyActions>
        </Empty>
      ) : null}

      {account && positionsLoading ? (
        <Skeleton data-testid="liquidity-my-positions-skeleton" aria-label="Loading positions" />
      ) : null}

      {account && !positionsLoading && positions.length === 0 ? (
        <Empty data-testid="liquidity-my-positions-empty">
          <EmptyText>{LIQUIDITY_MY_POSITIONS_COPY.emptyConnected}</EmptyText>
          <EmptyActions>
            <LinkBtn href={liquidityMyPositions.explorePoolsHref} data-testid="liquidity-my-positions-explore">
              {LIQUIDITY_MY_POSITIONS_COPY.explorePools}
            </LinkBtn>
          </EmptyActions>
        </Empty>
      ) : null}

      {account && !positionsLoading && positions.length > 0 ? (
        <Grid data-testid="liquidity-my-positions-grid">
          {positions.map((row) => (
            <PositionCard key={row.id} row={row} onManage={onManage} onRemove={onRemove} />
          ))}
        </Grid>
      ) : null}
    </Main>
  )
}

export const LiquidityMyPositionsModule: React.FC = () => (
  <Shell
    data-testid="liquidity-my-positions-module"
    data-liquidity-module="006-your-positions"
    data-liquidity-module-006="mounted"
    aria-labelledby="liquidity-my-positions-title"
  >
    <LiquidityMyPositionsBody />
  </Shell>
)

export default LiquidityMyPositionsModule
