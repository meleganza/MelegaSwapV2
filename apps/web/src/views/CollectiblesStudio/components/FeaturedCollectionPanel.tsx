import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { IconStar, IconCheck } from './collectiblesStudioIcons'
import {
  CsPrimaryBtn,
  FeaturedScoreRingDisplay,
} from './collectiblesStudioPrimitives'

const coinFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`

const PrivilegesBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PrivilegesTitle = styled.h3`
  margin: 0;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 15px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const PrivilegeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${CS_FONT_BODY};
  font-size: 14px;
  color: ${collectiblesStudioColors.body};
`

const Panel = styled.div`
  min-height: ${collectiblesStudioLayout.featuredHeight};
  border-radius: ${collectiblesStudioLayout.featuredRadius};
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.gold};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    height: auto;
    min-height: 360px;
  }
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 20px;
  height: 100%;
  padding: 28px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 30px;
  line-height: 36px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const Desc = styled.p`
  margin: 0;
  max-width: 600px;
  font-family: ${CS_FONT_BODY};
  font-size: 17px;
  line-height: 27px;
  color: ${collectiblesStudioColors.body};
`

const IdentityBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const IdentityBadge = styled.span`
  width: 150px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(214, 180, 69, 0.55);
  background: rgba(214, 180, 69, 0.08);
  color: ${collectiblesStudioColors.gold};
  font-family: ${CS_FONT_DISPLAY};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const AgentBadge = styled.span`
  height: 22px;
  padding: 0 8px;
  border: 1px solid ${collectiblesStudioColors.green};
  color: ${collectiblesStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
  border-radius: 999px;
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  width: fit-content;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const FeaturedMetricLabel = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.label};
`

const FeaturedMetricValue = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 18px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`

const ViewBtn = styled(CsPrimaryBtn)`
  width: 160px;
  height: 46px;
  min-height: 46px;
  border-radius: 12px;
  font-weight: 800;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const LearnBtn = styled.button`
  width: 160px;
  height: 46px;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(214, 180, 69, 0.75);
  background: transparent;
  color: ${collectiblesStudioColors.gold};
  font-family: ${CS_FONT_BODY};
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const Visual = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;

  @media (max-width: 768px) {
    order: -1;
    min-height: 180px;
  }
`

const Coin = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f0d060 0%, #d6b445 35%, #8a7020 70%, #d6b445 100%);
  box-shadow: 0 0 70px rgba(214, 180, 69, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${coinFloat} 8s ease-in-out infinite;
  position: relative;

  &::before {
    content: 'M';
    font-family: ${CS_FONT_DISPLAY};
    font-size: 80px;
    font-weight: 700;
    color: #1a1408;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 768px) {
    width: 140px;
    height: 140px;

    &::before {
      font-size: 64px;
    }
  }
`

const ScoreWrap = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
`

export const FeaturedCollectionPanel: React.FC = () => {
  const { featured } = useCollectiblesRuntime()

  return (
  <Panel data-cs-panel data-cs-featured>
    <Inner>
      <Info>
        <TitleRow>
          <IconStar size={18} />
          <Title>{featured.title}</Title>
        </TitleRow>
        <Desc>{featured.description}</Desc>
        <PrivilegesBlock data-cs-privileges>
          <PrivilegesTitle>Privileges</PrivilegesTitle>
          {featured.privileges.map((privilege) => (
            <PrivilegeRow key={privilege}>
              <IconCheck size={14} color={collectiblesStudioColors.green} />
              {privilege}
            </PrivilegeRow>
          ))}
        </PrivilegesBlock>
        <IdentityBadges>
          {featured.identityBadges.map((badge) => (
            <IdentityBadge key={badge}>{badge}</IdentityBadge>
          ))}
        </IdentityBadges>
        {featured.agentEnabled ? <AgentBadge>Agent Enabled</AgentBadge> : null}
        <Metrics>
          <Metric>
            <FeaturedMetricLabel>Floor Price</FeaturedMetricLabel>
            <FeaturedMetricValue>{featured.floorPrice}</FeaturedMetricValue>
          </Metric>
          <Metric>
            <FeaturedMetricLabel>Owners</FeaturedMetricLabel>
            <FeaturedMetricValue>{featured.owners}</FeaturedMetricValue>
          </Metric>
          <Metric>
            <FeaturedMetricLabel>Items</FeaturedMetricLabel>
            <FeaturedMetricValue>{featured.items}</FeaturedMetricValue>
          </Metric>
          <Metric>
            <FeaturedMetricLabel>Volume</FeaturedMetricLabel>
            <FeaturedMetricValue>{featured.volume}</FeaturedMetricValue>
          </Metric>
        </Metrics>
        <BtnRow>
          <ViewBtn type="button">View Collection</ViewBtn>
          <LearnBtn type="button">Learn More</LearnBtn>
        </BtnRow>
      </Info>
      <Visual>
        <Coin data-cs-featured-coin />
        <ScoreWrap>
          <FeaturedScoreRingDisplay score={featured.utilityScore} />
        </ScoreWrap>
      </Visual>
    </Inner>
  </Panel>
  )
}

export default FeaturedCollectionPanel
