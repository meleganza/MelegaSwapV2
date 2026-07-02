import React, { useState } from 'react'
import styled from 'styled-components'
import type { RadarEventCard as RadarEventCardType } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import ContractIntelligencePreview from './ContractIntelligencePreview'
import { RadarProjectLogo, RdGhostBtn, RdIntelBtn, RdLabel, RdPrimaryBtn, SignalChip } from './radarStudioPrimitives'

const Card = styled.article<{ $delay: number; $featured?: boolean }>`
  width: 100%;
  max-width: ${radarStudioLayout.eventCardWidth};
  min-height: ${radarStudioLayout.eventCardMinHeight};
  padding: 18px;
  border-radius: ${radarStudioLayout.cardRadius};
  background: ${radarStudioColors.panelGradientAlt};
  border: 1px solid ${({ $featured }) => ($featured ? radarStudioColors.goldBorder : '#282828')};
  box-sizing: border-box;
  display: grid;
  grid-template-rows: 52px 46px 28px 46px 42px;
  gap: 0;
  min-width: 0;
  animation: rdCardIn 420ms ease both;
  animation-delay: ${({ $delay }) => $delay}ms;

  @media (max-width: 767px) {
    max-width: 100%;
    min-height: 280px;
    grid-template-rows: auto auto auto auto auto;
    gap: 10px;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 52px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Rank = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${radarStudioColors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 11px;
  font-weight: 800;
  color: ${radarStudioColors.muted};
  flex-shrink: 0;
`

const Name = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 26px;
  line-height: 1;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const Network = styled.div`
  margin-top: 2px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.muted};
`

const Confidence = styled.div`
  text-align: right;
  flex-shrink: 0;
`

const ConfLabel = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
`

const ConfValue = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 30px;
  font-weight: 800;
  color: ${radarStudioColors.green};
  line-height: 1;
`

const Summary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 20px;
  color: ${radarStudioColors.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  align-self: center;
`

const Signals = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
`

const MetricValue = styled.span`
  display: block;
  font-family: ${RADAR_FONT_BODY};
  font-size: 15px;
  font-weight: 800;
  color: ${radarStudioColors.white};
  line-height: 1.1;
  white-space: nowrap;
`

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 88px 126px 1fr;
  gap: 10px;
  align-items: end;

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    & > :first-child {
      grid-column: 1 / -1;
    }
  }
`

interface Props {
  event: RadarEventCardType
  index: number
}

export const RadarEventCard: React.FC<Props> = ({ event, index }) => {
  const [intelOpen, setIntelOpen] = useState(false)

  return (
    <>
      <Card data-rd-event-card $delay={index * 80} $featured={index === 0}>
        <TopRow>
          <HeaderLeft>
            <Rank>{event.rank}</Rank>
            <RadarProjectLogo name={event.name} symbol={event.symbol} size={42} />
            <div>
              <Name>{event.name}</Name>
              <Network>{event.network}</Network>
            </div>
          </HeaderLeft>
          <Confidence>
            <ConfLabel>AI Confidence</ConfLabel>
            <ConfValue>{event.aiConfidence}%</ConfValue>
          </Confidence>
        </TopRow>

        <Summary>{event.summary}</Summary>

        <Signals>
          {event.signals.map((signal) => (
            <SignalChip key={signal}>{signal}</SignalChip>
          ))}
        </Signals>

        <Metrics>
          <div>
            <RdLabel>Liquidity</RdLabel>
            <MetricValue>{event.liquidity}</MetricValue>
          </div>
          <div>
            <RdLabel>Volume</RdLabel>
            <MetricValue>{event.volume}</MetricValue>
          </div>
          <div>
            <RdLabel>New Holders</RdLabel>
            <MetricValue>{event.newHolders}</MetricValue>
          </div>
          <div>
            <RdLabel>Whales</RdLabel>
            <MetricValue>{event.whales}</MetricValue>
          </div>
          <div>
            <RdLabel>Contract Risk</RdLabel>
            <MetricValue>{event.contractRisk}</MetricValue>
          </div>
        </Metrics>

        <ButtonRow>
          <RdPrimaryBtn type="button">Trade</RdPrimaryBtn>
          <RdGhostBtn type="button">Open Project</RdGhostBtn>
          <RdIntelBtn type="button" onClick={() => setIntelOpen(true)}>
            Contract Intelligence
          </RdIntelBtn>
        </ButtonRow>
      </Card>

      {intelOpen ? <ContractIntelligencePreview event={event} onClose={() => setIntelOpen(false)} /> : null}
    </>
  )
}

export default RadarEventCard
