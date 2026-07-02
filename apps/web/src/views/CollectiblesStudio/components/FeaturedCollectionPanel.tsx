import React from 'react'
import styled, { keyframes } from 'styled-components'
import { FEATURED_COLLECTION } from '../collectiblesStudioData'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { IconStar } from './collectiblesStudioIcons'
import {
  CsBody,
  CsMetricLabel,
  CsMetricValue,
  CsOutlineBtn,
  CsPanel,
  CsPrimaryBtn,
  ScoreRingDisplay,
} from './collectiblesStudioPrimitives'

const coinFloat = keyframes`
  0%, 100% { transform: translateY(0) rotateY(0deg); }
  50% { transform: translateY(-10px) rotateY(8deg); }
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;

  @media (max-width: 767px) {
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
  font-size: 24px;
  line-height: 30px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const UtilityTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Tag = styled.span`
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(214, 180, 69, 0.35);
  background: rgba(214, 180, 69, 0.06);
  font-family: ${CS_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${collectiblesStudioColors.gold};
  display: inline-flex;
  align-items: center;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const Visual = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  background: radial-gradient(ellipse at 50% 60%, rgba(214, 180, 69, 0.15) 0%, transparent 60%);
  border-radius: 16px;

  @media (max-width: 767px) {
    order: -1;
    min-height: 200px;
  }
`

const Coin = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f0d060 0%, #d6b445 35%, #8a7020 70%, #d6b445 100%);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.5),
    inset 0 -8px 20px rgba(0, 0, 0, 0.3),
    inset 0 8px 20px rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${coinFloat} 8s ease-in-out infinite;
  position: relative;

  &::before {
    content: 'M';
    font-family: ${CS_FONT_DISPLAY};
    font-size: 72px;
    font-weight: 700;
    color: #1a1408;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
  }
`

const ScoreWrap = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
`

const UtilityLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
`

export const FeaturedCollectionPanel: React.FC = () => (
  <CsPanel data-cs-panel data-cs-featured $height={collectiblesStudioLayout.featuredHeight}>
    <Inner>
      <Info>
        <TitleRow>
          <IconStar size={18} />
          <Title>{FEATURED_COLLECTION.title}</Title>
        </TitleRow>
        <CsBody>{FEATURED_COLLECTION.description}</CsBody>
        <UtilityTags>
          {FEATURED_COLLECTION.utilities.map((u) => (
            <Tag key={u}>{u}</Tag>
          ))}
        </UtilityTags>
        <Metrics>
          <Metric>
            <CsMetricLabel>Floor Price</CsMetricLabel>
            <CsMetricValue>{FEATURED_COLLECTION.floorPrice}</CsMetricValue>
          </Metric>
          <Metric>
            <CsMetricLabel>Owners</CsMetricLabel>
            <CsMetricValue>{FEATURED_COLLECTION.owners}</CsMetricValue>
          </Metric>
          <Metric>
            <CsMetricLabel>Items</CsMetricLabel>
            <CsMetricValue>{FEATURED_COLLECTION.items}</CsMetricValue>
          </Metric>
          <Metric>
            <CsMetricLabel>Volume</CsMetricLabel>
            <CsMetricValue>{FEATURED_COLLECTION.volume}</CsMetricValue>
          </Metric>
        </Metrics>
        <BtnRow>
          <CsPrimaryBtn $width={collectiblesStudioLayout.btnFeaturedW} $height={collectiblesStudioLayout.btnFeaturedH}>
            View Collection
          </CsPrimaryBtn>
          <CsOutlineBtn $width={collectiblesStudioLayout.btnFeaturedW} $height={collectiblesStudioLayout.btnFeaturedH}>
            Learn More
          </CsOutlineBtn>
        </BtnRow>
      </Info>
      <Visual>
        <Coin data-cs-featured-coin />
        <ScoreWrap>
          <ScoreRingDisplay
            score={FEATURED_COLLECTION.utilityScore}
            size={collectiblesStudioLayout.scoreRingLg}
            large
            sub="Utility"
          />
        </ScoreWrap>
      </Visual>
    </Inner>
  </CsPanel>
)

export default FeaturedCollectionPanel
