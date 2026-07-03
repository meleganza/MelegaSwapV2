import React from 'react'
import styled from 'styled-components'
import {
  ASSETS,
  BUILDER_STATUS,
  COLLECTIBLES,
  FARMS,
  INFRASTRUCTURE_SUMMARY,
  LIQUIDITY,
  POOLS,
  RECENT_ACTIVITY,
} from '../commandCenterData'
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
  min-height: ${commandCenterLayout.collectibleH};
  border-radius: 14px;
  border: 1px solid ${commandCenterColors.border};
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  text-align: center;
  box-sizing: border-box;
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
  gap: 0;
  overflow-x: auto;
  min-height: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`

const TimelineItem = styled.div`
  flex: 1;
  min-width: 88px;
  text-align: center;
  padding-top: 36px;
  position: relative;

  @media (max-width: 768px) {
    text-align: left;
    padding-top: 0;
    padding-left: 40px;
    min-width: 0;
  }
`

const TimelineDot = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid ${commandCenterColors.gold};
  background: ${commandCenterColors.goldBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  margin: 0 auto 8px;

  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    top: 0;
    margin: 0;
  }
`

const TimelineLine = styled.div`
  position: absolute;
  top: 14px;
  left: 24px;
  right: 24px;
  height: 2px;
  background: ${commandCenterColors.border};

  @media (max-width: 768px) {
    display: none;
  }
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

const positionH = commandCenterLayout.positionCardHeight

export const CommandAssetsCard: React.FC = () => {
  const assets = safeArray(ASSETS)
  return (
    <CcDashCard data-cc-assets $height={positionH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Assets</CcTitle>
        <CcViewAll href="/assets">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {assets.map((a) => (
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
        ))}
      </CcDashBody>
    </CcDashCard>
  )
}

export const CommandLiquidityCard: React.FC = () => {
  const liquidity = safeArray(LIQUIDITY)
  return (
    <CcDashCard data-cc-liquidity $height={positionH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Liquidity</CcTitle>
        <CcViewAll href="/liquidity-studio">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {liquidity.map((l) => (
          <div key={l.id} style={{ paddingBottom: 8, borderBottom: `1px solid ${commandCenterColors.border}` }}>
            <PairTitle>{l.pair}</PairTitle>
            <Meta>
              APR {l.apr} · <CcPill $tone="gold">{l.tag}</CcPill>
            </Meta>
            <Meta style={{ color: commandCenterColors.red, marginTop: 4 }}>IL {l.impermanentLoss}</Meta>
          </div>
        ))}
      </CcDashBody>
      <BtnWrap>
        <CcGoldBtn type="button">Add Liquidity</CcGoldBtn>
      </BtnWrap>
    </CcDashCard>
  )
}

export const CommandPoolsCard: React.FC = () => {
  const pools = safeArray(POOLS)
  return (
    <CcDashCard data-cc-pools $height={positionH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Pools</CcTitle>
        <CcViewAll href="/pools">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {pools.map((p) => (
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
        ))}
      </CcDashBody>
      <BtnWrap>
        <CcOutlineBtn type="button">Go to Pools</CcOutlineBtn>
      </BtnWrap>
    </CcDashCard>
  )
}

export const CommandFarmsCard: React.FC = () => {
  const farms = safeArray(FARMS)
  return (
    <CcDashCard data-cc-farms $height={positionH}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Farms</CcTitle>
        <CcViewAll href="/farms">View all</CcViewAll>
      </CcCardHeader>
      <CcDashBody>
        {farms.map((f) => (
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
        ))}
      </CcDashBody>
      <BtnWrap>
        <CcOutlineBtn type="button">Go to Farms</CcOutlineBtn>
      </BtnWrap>
    </CcDashCard>
  )
}

export const CommandCollectiblesCard: React.FC = () => {
  const collectibles = safeArray(COLLECTIBLES)
  return (
    <CcDashCard data-cc-collectibles>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Collectibles</CcTitle>
      </CcCardHeader>
      <CollectiblesGrid>
        {collectibles.map((c) => (
          <CollectibleCard key={c.id}>
            <CollIcon>{c.icon}</CollIcon>
            <CollTitle>{c.title}</CollTitle>
            <CollSub>{c.subtitle}</CollSub>
          </CollectibleCard>
        ))}
      </CollectiblesGrid>
    </CcDashCard>
  )
}

export const CommandInfrastructureCard: React.FC = () => {
  const infraScore = safePct(INFRASTRUCTURE_SUMMARY?.score, 0)
  const builderProgress = safePct(BUILDER_STATUS?.progress, 0)

  return (
    <CcDashCard data-cc-infrastructure>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Infrastructure</CcTitle>
      </CcCardHeader>
      <StatGrid>
        <Stat>
          <StatVal>{INFRASTRUCTURE_SUMMARY.tokens}</StatVal>
          <StatLabel>Tokens</StatLabel>
        </Stat>
        <Stat>
          <StatVal>{INFRASTRUCTURE_SUMMARY.pools}</StatVal>
          <StatLabel>Pools</StatLabel>
        </Stat>
        <Stat>
          <StatVal>{INFRASTRUCTURE_SUMMARY.farms}</StatVal>
          <StatLabel>Farms</StatLabel>
        </Stat>
        <Stat>
          <StatVal>{INFRASTRUCTURE_SUMMARY.smartdrop}</StatVal>
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
      <div style={{ marginTop: 12, fontFamily: CC_FONT_BODY, fontSize: 13, fontWeight: 700, color: commandCenterColors.white }}>
        Builder Level {BUILDER_STATUS.level}
      </div>
      <CcProgressTrack style={{ marginTop: 8 }}>
        <CcProgressFill $pct={builderProgress} />
      </CcProgressTrack>
      <Meta style={{ marginTop: 8 }}>TVL managed: {BUILDER_STATUS.tvlManaged}</Meta>
    </CcDashCard>
  )
}

export const CommandRecentActivityCard: React.FC = () => {
  const activity = safeArray(RECENT_ACTIVITY)

  return (
    <CcDashCard data-cc-recent-activity $height={commandCenterLayout.activityHeight}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Recent Activity</CcTitle>
      </CcCardHeader>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <TimelineLine />
        <Timeline>
          {activity.map((e) => (
            <TimelineItem key={e.id}>
              <TimelineDot>{e.icon}</TimelineDot>
              <TimelineLabel>{e.label}</TimelineLabel>
              <TimelineTime>{e.time}</TimelineTime>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </CcDashCard>
  )
}
