import React, { useState } from 'react'
import styled from 'styled-components'
import type { RadarEventCard as RadarEventCardType } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import ContractIntelligencePreview from './ContractIntelligencePreview'
import { RadarProjectLogo, RdGhostBtn, RdLabel, RdPrimaryBtn, SignalChip } from './radarStudioPrimitives'

const Card = styled.article<{ $delay: number }>`
  width: 100%;
  max-width: ${radarStudioLayout.eventCardWidth};
  height: ${radarStudioLayout.eventCardHeight};
  min-height: ${radarStudioLayout.eventCardHeight};
  padding: 16px 18px;
  border-radius: ${radarStudioLayout.cardRadius};
  border: 1px solid ${radarStudioColors.border};
  background: ${radarStudioColors.panel};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  animation: rdCardIn 420ms ease both;
  animation-delay: ${({ $delay }) => $delay}ms;

  @media (max-width: 767px) {
    max-width: 100%;
    height: auto;
    min-height: ${radarStudioLayout.eventCardHeight};
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Rank = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid ${radarStudioColors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 10px;
  font-weight: 800;
  color: ${radarStudioColors.grey};
  flex-shrink: 0;
`

const NameBlock = styled.div`
  min-width: 0;
`

const Name = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  color: ${radarStudioColors.white};
`

const Network = styled.div`
  margin-top: 2px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
`

const Confidence = styled.div`
  text-align: right;
  flex-shrink: 0;
`

const ConfLabel = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
`

const ConfValue = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${radarStudioColors.green};
  line-height: 1;
`

const Summary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  color: ${radarStudioColors.subtitle};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Signals = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
`

const MetricCell = styled.div`
  min-width: 0;
`

const MetricValue = styled.span`
  display: block;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 13px;
  font-weight: 700;
  color: ${radarStudioColors.white};
  line-height: 1.1;
  white-space: nowrap;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: ${radarStudioLayout.eventBtnGap};
  margin-top: auto;
  flex-wrap: wrap;
`

interface Props {
  event: RadarEventCardType
  index: number
}

export const RadarEventCard: React.FC<Props> = ({ event, index }) => {
  const [intelOpen, setIntelOpen] = useState(false)

  return (
    <>
      <Card data-rd-event-card $delay={index * 80}>
        <Header>
          <HeaderLeft>
            <Rank>{event.rank}</Rank>
            <RadarProjectLogo name={event.name} symbol={event.symbol} size={32} />
            <NameBlock>
              <Name>{event.name}</Name>
              <Network>{event.network}</Network>
            </NameBlock>
          </HeaderLeft>
          <Confidence>
            <ConfLabel>AI Confidence</ConfLabel>
            <ConfValue>{event.aiConfidence}%</ConfValue>
          </Confidence>
        </Header>

        <Summary>{event.summary}</Summary>

        <Signals>
          {event.signals.map((signal) => (
            <SignalChip key={signal}>{signal}</SignalChip>
          ))}
        </Signals>

        <Metrics>
          <MetricCell>
            <RdLabel>Liquidity</RdLabel>
            <MetricValue>{event.liquidity}</MetricValue>
          </MetricCell>
          <MetricCell>
            <RdLabel>Volume</RdLabel>
            <MetricValue>{event.volume}</MetricValue>
          </MetricCell>
          <MetricCell>
            <RdLabel>New Holders</RdLabel>
            <MetricValue>{event.newHolders}</MetricValue>
          </MetricCell>
          <MetricCell>
            <RdLabel>Whales</RdLabel>
            <MetricValue>{event.whales}</MetricValue>
          </MetricCell>
          <MetricCell>
            <RdLabel>Contract Risk</RdLabel>
            <MetricValue>{event.contractRisk}</MetricValue>
          </MetricCell>
        </Metrics>

        <Footer>
          <RdPrimaryBtn type="button">Trade</RdPrimaryBtn>
          <RdGhostBtn type="button">Open Project</RdGhostBtn>
          <RdGhostBtn type="button" onClick={() => setIntelOpen(true)}>
            Contract Intelligence
          </RdGhostBtn>
        </Footer>
      </Card>

      {intelOpen && <ContractIntelligencePreview event={event} onClose={() => setIntelOpen(false)} />}
    </>
  )
}

export default RadarEventCard
