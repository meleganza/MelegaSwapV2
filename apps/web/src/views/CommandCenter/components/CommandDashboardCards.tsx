import React from 'react'
import styled from 'styled-components'
import { useCommandRuntime } from '../commandCenterRuntime/CommandRuntimeContext'
import { safeArray, safePct } from '../commandCenterSafe'
import { CC_FONT_BODY, CC_FONT_DISPLAY, commandCenterColors, commandCenterLayout } from '../commandCenterTokens'
import {
  CcCardHeader,
  CcDashBody,
  CcDashCard,
  CcGoldBtn,
  CcOutlineBtn,
  CcPill,
  CcProgressFill,
  CcProgressTrack,
  CcTitle,
  CcViewAll,
} from './commandCenterPrimitives'

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const TokenIcon = styled.span<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $color }) => $color}22;
  border: 1px solid ${({ $color }) => $color}55;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`

const Change = styled.span<{ $pos: boolean }>`
  font-weight: 700;
  color: ${({ $pos }) => ($pos ? commandCenterColors.green : commandCenterColors.red)};
`

const PairTitle = styled.div`
  font-weight: 700;
  color: ${commandCenterColors.white};
  font-size: 13px;
`

const Meta = styled.div`
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
`

const BtnWrap = styled.div`
  margin-top: auto;
  padding-top: 4px;
`

const CollectiblesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (min-width: 769px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const CollectibleCard = styled.div`
  width: 100%;
  min-height: 100px;
  border-radius: 14px;
  border: 1px solid ${commandCenterColors.border};
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const CollIcon = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
`

const CollTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  color: ${commandCenterColors.white};
`

const CollSub = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 10px;
  color: ${commandCenterColors.muted};
  margin-top: 2px;
`

const PrivilegeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-top: 6px;
`

const PrivilegeChip = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
  color: ${commandCenterColors.green};
  border: 1px solid rgba(27, 231, 122, 0.35);
  background: rgba(27, 231, 122, 0.08);
`

const SettlementRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
`

const SettlementLabel = styled.span<{ $tone: 'ok' | 'warn' | 'error' | 'muted' }>`
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'ok'
      ? commandCenterColors.green
      : $tone === 'error'
        ? '#f87171'
        : $tone === 'warn'
          ? commandCenterColors.gold
          : commandCenterColors.muted};
`

const SettlementMeta = styled.div`
  font-size: 11px;
  color: ${commandCenterColors.muted};
  line-height: 1.45;
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`

const Stat = styled.div`
  text-align: center;
`

const StatVal = styled.div`
  font-family: ${CC_FONT_DISPLAY};
  font-size: 20px;
  font-weight: 700;
  color: ${commandCenterColors.white};
`

const StatLabel = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 10px;
  color: ${commandCenterColors.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
`

const ScoreLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.body};
  margin-bottom: 8px;
`

const Timeline = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  min-height: 0;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`

const TimelineItem = styled.div`
  flex: 1;
  min-width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    text-align: left;
    min-width: 0;
    width: 100%;
  }
`

const TimelineDot = styled.div`
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 50%;
  border: 1px solid ${commandCenterColors.gold};
  background: ${commandCenterColors.goldBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
`

const TimelineCopy = styled.div`
  min-width: 0;
`

const TimelineLabel = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${commandCenterColors.white};
`

const TimelineTime = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 10px;
  color: ${commandCenterColors.muted};
  margin-top: 2px;
`

const positionMinH = '240px'

export const CommandAssetsCard: React.FC = () => {
  const { assets } = useCommandRuntime()
  const rows = safeArray(assets)
  return (
    <CcDashCard data-cc-assets $minHeight={positionMinH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Assets</CcTitle>
        <CcViewAll href="/assets">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {rows.length === 0 ? (
          <Meta>No assets — connect wallet or open Trade runtime.</Meta>
        ) : (
          rows.map((a) => (
          <Row key={a.id}>
            <Left>
              <TokenIcon $color={a.color}>{a.symbol.slice(0, 1)}</TokenIcon>
              <div>
                <div style={{ fontWeight: 700, color: commandCenterColors.white }}>{a.symbol}</div>
                <div style={{ color: commandCenterColors.muted, fontSize: 11 }}>{a.amount}</div>
              </div>
            </Left>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: commandCenterColors.white }}>{a.usd}</div>
              <Change $pos={a.change24h >= 0}>
                {a.change24h >= 0 ? '+' : ''}
                {a.change24h}%
              </Change>
            </div>
          </Row>
          ))
        )}
      </CcDashBody>
    </CcDashCard>
  )
}

export const CommandLiquidityCard: React.FC = () => {
  const { liquidity } = useCommandRuntime()
  const rows = safeArray(liquidity)
  return (
    <CcDashCard data-cc-liquidity $minHeight={positionMinH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Liquidity</CcTitle>
        <CcViewAll href="/liquidity-studio">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {rows.length === 0 ? (
          <Meta>No liquidity positions from Liquidity runtime.</Meta>
        ) : (
          rows.map((l) => (
          <div key={l.id} style={{ paddingBottom: 8, borderBottom: `1px solid ${commandCenterColors.border}` }}>
            <PairTitle>{l.pair}</PairTitle>
            <Meta>
              APR {l.apr} · <CcPill $tone="gold">{l.tag}</CcPill>
            </Meta>
            <Meta style={{ color: commandCenterColors.red, marginTop: 4 }}>IL {l.impermanentLoss}</Meta>
          </div>
          ))
        )}
      </CcDashBody>
      <BtnWrap>
        <CcGoldBtn type="button">Add Liquidity</CcGoldBtn>
      </BtnWrap>
    </CcDashCard>
  )
}

export const CommandPoolsCard: React.FC = () => {
  const { pools } = useCommandRuntime()
  const rows = safeArray(pools)
  return (
    <CcDashCard data-cc-pools $minHeight={positionMinH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Pools</CcTitle>
        <CcViewAll href="/pools">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {rows.length === 0 ? (
          <Meta>No pool positions from Pools runtime.</Meta>
        ) : (
          rows.map((p) => (
          <Row key={p.id}>
            <div>
              <PairTitle>{p.name}</PairTitle>
              <Meta>APR {p.apr}</Meta>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Meta>Pending</Meta>
              <div style={{ fontWeight: 700, color: commandCenterColors.green }}>{p.pending}</div>
            </div>
          </Row>
          ))
        )}
      </CcDashBody>
      <BtnWrap>
        <CcOutlineBtn type="button">Go to Pools</CcOutlineBtn>
      </BtnWrap>
    </CcDashCard>
  )
}

export const CommandFarmsCard: React.FC = () => {
  const { farms } = useCommandRuntime()
  const rows = safeArray(farms)
  return (
    <CcDashCard data-cc-farms $minHeight={positionMinH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Farms</CcTitle>
        <CcViewAll href="/farms">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {rows.length === 0 ? (
          <Meta>No farm positions from Farms runtime.</Meta>
        ) : (
          rows.map((f) => (
          <Row key={f.id}>
            <div>
              <PairTitle>{f.name}</PairTitle>
              <Meta>APR {f.apr}</Meta>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Meta>Pending</Meta>
              <div style={{ fontWeight: 700, color: commandCenterColors.green }}>{f.pending}</div>
            </div>
          </Row>
          ))
        )}
      </CcDashBody>
      <BtnWrap>
        <CcOutlineBtn type="button">Go to Farms</CcOutlineBtn>
      </BtnWrap>
    </CcDashCard>
  )
}

export const CommandSettlementCard: React.FC = () => {
  const { settlement } = useCommandRuntime()
  const timeLabel = settlement.settlementTime
    ? new Date(settlement.settlementTime).toLocaleString()
    : '—'

  return (
    <CcDashCard data-cc-settlement>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Latest Settlement</CcTitle>
      </CcCardHeader>
      <SettlementRow>
        <SettlementLabel $tone={settlement.tone}>{settlement.label}</SettlementLabel>
        <SettlementMeta>Settlement ID: {settlement.settlementId ?? '—'}</SettlementMeta>
        <SettlementMeta>Settlement Time: {timeLabel}</SettlementMeta>
        <SettlementMeta>Treasury Status: {settlement.treasuryStatus}</SettlementMeta>
        {settlement.txHash ? (
          <SettlementMeta>Tx: {settlement.txHash.slice(0, 10)}…</SettlementMeta>
        ) : null}
      </SettlementRow>
    </CcDashCard>
  )
}

export const CommandCollectiblesCard: React.FC = () => {
  const { collectibles } = useCommandRuntime()
  const rows = safeArray(collectibles)
  return (
    <CcDashCard data-cc-collectibles>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Collectibles</CcTitle>
      </CcCardHeader>
      <CollectiblesGrid>
        {rows.length === 0 ? (
          <Meta style={{ gridColumn: '1 / -1' }}>No collectibles — wallet ownership from registry.</Meta>
        ) : (
          rows.map((c) => (
          <CollectibleCard key={c.id}>
            <CollIcon>{c.icon}</CollIcon>
            <CollTitle>{c.title}</CollTitle>
            <CollSub>{c.subtitle}</CollSub>
            {c.privileges?.length ? (
              <PrivilegeRow data-cc-privileges>
                {c.privileges.slice(0, 4).map((privilege) => (
                  <PrivilegeChip key={privilege}>{privilege}</PrivilegeChip>
                ))}
                {c.privileges.length > 4 ? (
                  <PrivilegeChip>+{c.privileges.length - 4}</PrivilegeChip>
                ) : null}
              </PrivilegeRow>
            ) : null}
          </CollectibleCard>
          ))
        )}
      </CollectiblesGrid>
    </CcDashCard>
  )
}

export const CommandInfrastructureCard: React.FC = () => {
  const { infrastructureSummary } = useCommandRuntime()
  const infraScore = safePct(infrastructureSummary?.score, 0)

  return (
    <CcDashCard data-cc-infrastructure>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Infrastructure</CcTitle>
      </CcCardHeader>
      <StatGrid>
        <Stat>
          <StatVal>{infrastructureSummary.tokens}</StatVal>
          <StatLabel>Tokens</StatLabel>
        </Stat>
        <Stat>
          <StatVal>{infrastructureSummary.pools}</StatVal>
          <StatLabel>Pools</StatLabel>
        </Stat>
        <Stat>
          <StatVal>{infrastructureSummary.farms}</StatVal>
          <StatLabel>Farms</StatLabel>
        </Stat>
        <Stat>
          <StatVal>{infrastructureSummary.smartdrop}</StatVal>
          <StatLabel>SmartDrop</StatLabel>
        </Stat>
      </StatGrid>
      <ScoreLabel>
        <span>Infra Score</span>
        <span style={{ color: commandCenterColors.green }}>{infraScore}/100</span>
      </ScoreLabel>
      <CcProgressTrack>
        <CcProgressFill $pct={infraScore} />
      </CcProgressTrack>
    </CcDashCard>
  )
}

export const CommandBuilderStatusCard: React.FC = () => {
  const { builderStatus } = useCommandRuntime()
  const builderProgress = safePct(builderStatus?.progress, 0)

  return (
    <CcDashCard data-cc-builder-status>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Builder Status</CcTitle>
      </CcCardHeader>
      <div style={{ marginTop: 4, fontFamily: CC_FONT_BODY, fontSize: 14, fontWeight: 700, color: commandCenterColors.white }}>
        Builder Level {builderStatus.level}
      </div>
      <CcProgressTrack style={{ marginTop: 10 }}>
        <CcProgressFill $pct={builderProgress} />
      </CcProgressTrack>
      <Meta style={{ marginTop: 10 }}>Projects: {builderStatus.projects}</Meta>
      <Meta>Pools: {builderStatus.pools} · Farms: {builderStatus.farms}</Meta>
      <Meta>TVL managed: {builderStatus.tvlManaged}</Meta>
    </CcDashCard>
  )
}

export const CommandRecentActivityCard: React.FC = () => {
  const { recentActivity } = useCommandRuntime()
  const activity = safeArray(recentActivity)

  return (
    <CcDashCard data-cc-recent-activity $minHeight={commandCenterLayout.activityMinHeight}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Recent Activity</CcTitle>
      </CcCardHeader>
      <Timeline>
        {activity.length === 0 ? (
          <Meta>No recent activity from connected runtimes.</Meta>
        ) : (
          activity.map((e) => (
          <TimelineItem key={e.id}>
            <TimelineDot>{e.icon}</TimelineDot>
            <TimelineCopy>
              <TimelineLabel>{e.label}</TimelineLabel>
              <TimelineTime>{e.time}</TimelineTime>
            </TimelineCopy>
          </TimelineItem>
          ))
        )}
      </Timeline>
    </CcDashCard>
  )
}
