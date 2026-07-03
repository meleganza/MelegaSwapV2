import React from 'react'
import styled from 'styled-components'
import { BUILDER_STATUS, COLLECTIBLES, INFRASTRUCTURE_SUMMARY, RECENT_ACTIVITY } from '../commandCenterData'
import { safeArray, safePct } from '../commandCenterSafe'
import { CC_FONT_BODY, CC_FONT_DISPLAY, commandCenterColors } from '../commandCenterTokens'
import { CcPanel, CcProgressFill, CcProgressTrack, CcTitle } from './commandCenterPrimitives'

const CollectiblesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CollectibleCard = styled(CcPanel)`
  padding: 16px;
  text-align: center;
`

const CollIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`

const CollTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  color: ${commandCenterColors.white};
`

const CollSub = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
`

const InfraRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const InfraPanel = styled(CcPanel)`
  padding: 20px;
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 14px 0;
`

const Stat = styled.div`
  text-align: center;
`

const StatVal = styled.div`
  font-family: ${CC_FONT_DISPLAY};
  font-size: 24px;
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

const BuilderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 14px;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Timeline = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
  padding: 20px 0 8px;
  margin-top: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`

const TimelineItem = styled.div`
  flex: 1;
  min-width: 100px;
  text-align: center;
  position: relative;
  padding-top: 28px;

  @media (max-width: 768px) {
    text-align: left;
    padding-top: 0;
    padding-left: 36px;
    min-width: 0;
  }
`

const TimelineDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${commandCenterColors.gold};
  background: ${commandCenterColors.goldBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 768px) {
    left: 0;
    transform: none;
  }
`

const TimelineLine = styled.div`
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: ${commandCenterColors.border};
  z-index: 0;

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
  margin-top: 4px;
`

const KiriFooter = styled.div`
  text-align: center;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
  padding: 16px 0 0;
`

export const CommandBottomSection: React.FC = () => {
  const collectibles = safeArray(COLLECTIBLES)
  const activity = safeArray(RECENT_ACTIVITY)
  const infraScore = safePct(INFRASTRUCTURE_SUMMARY?.score, 0)
  const builderProgress = safePct(BUILDER_STATUS?.progress, 0)

  return (
  <div data-cc-bottom-section>
    <CcPanel $padding="20px" style={{ marginBottom: 16 }}>
      <CcTitle>Collectibles</CcTitle>
      <CollectiblesGrid style={{ marginTop: 14 }}>
        {collectibles.map((c) => (
          <CollectibleCard key={c.id}>
            <CollIcon>{c.icon}</CollIcon>
            <CollTitle>{c.title}</CollTitle>
            <CollSub>{c.subtitle}</CollSub>
          </CollectibleCard>
        ))}
      </CollectiblesGrid>
    </CcPanel>

    <InfraRow>
      <InfraPanel>
        <CcTitle>Infrastructure</CcTitle>
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
          <span>Infrastructure Score</span>
          <span style={{ color: commandCenterColors.green }}>{infraScore}/100</span>
        </ScoreLabel>
        <CcProgressTrack>
          <CcProgressFill $pct={infraScore} />
        </CcProgressTrack>
      </InfraPanel>

      <InfraPanel>
        <CcTitle>Builder Status</CcTitle>
        <div style={{ marginTop: 12, fontFamily: CC_FONT_BODY, fontSize: 14, fontWeight: 700, color: commandCenterColors.white }}>
          Builder Level {BUILDER_STATUS.level}
        </div>
        <CcProgressTrack style={{ marginTop: 10 }}>
          <CcProgressFill $pct={builderProgress} />
        </CcProgressTrack>
        <BuilderStats>
          <div>Projects: {BUILDER_STATUS.projects}</div>
          <div>Pools: {BUILDER_STATUS.pools}</div>
          <div>Farms: {BUILDER_STATUS.farms}</div>
          <div>TVL: {BUILDER_STATUS.tvlManaged}</div>
        </BuilderStats>
      </InfraPanel>
    </InfraRow>

    <CcPanel $padding="20px" style={{ marginTop: 16 }}>
      <CcTitle>Recent Activity</CcTitle>
      <div style={{ position: 'relative' }}>
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
    </CcPanel>

    <KiriFooter data-cc-kiri-footer>⚠ KIRI is observing. KIRI is learning. KIRI is building the Civilization.</KiriFooter>
  </div>
  )
}

export default CommandBottomSection
