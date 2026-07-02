import React, { useState } from 'react'
import styled from 'styled-components'
import type { RadarEventCard as RadarEventCardType } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import ContractIntelligencePreview from './ContractIntelligencePreview'
import {
  ConfidenceBar,
  RadarProjectLogo,
  RdGhostBtn,
  RdIntelBtn,
  RdLabel,
  RdPrimaryBtn,
  SignalChip,
  StatusDot,
} from './radarStudioPrimitives'

const Card = styled.article<{ $delay: number; $featured?: boolean }>`
  width: 100%;
  max-width: ${radarStudioLayout.eventCardWidth};
  padding: ${radarStudioLayout.cardPadding};
  border-radius: ${radarStudioLayout.cardRadius};
  background: ${radarStudioColors.panel};
  border: 1px solid ${({ $featured }) => ($featured ? radarStudioColors.goldBorder : radarStudioColors.border)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  animation: rdCardIn 420ms ease both;
  animation-delay: ${({ $delay }) => $delay}ms;
  transition: transform ${radarStudioColors.transition} ease, border-color ${radarStudioColors.transition} ease,
    box-shadow ${radarStudioColors.transition} ease;

  @media (max-width: 767px) {
    max-width: 100%;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const Network = styled.div`
  margin-top: 4px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
  color: ${radarStudioColors.muted};
`

const ConfBlock = styled.div`
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
  font-size: 28px;
  font-weight: 800;
  color: ${radarStudioColors.green};
  line-height: 1;
`

const Summary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
`

const Signals = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 18px;
  row-gap: 24px;
`

const MetricValue = styled.span`
  display: block;
  font-family: ${RADAR_FONT_BODY};
  font-size: 15px;
  font-weight: 800;
  color: ${radarStudioColors.white};
  line-height: 1.2;
  margin-top: 4px;
`

const SectionTitle = styled.h4`
  margin: 0 0 10px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 14px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const BulletList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};

  li {
    margin-bottom: 4px;
  }
`

const ConfidenceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const RiskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const RiskCell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border-radius: 8px;
  border: 1px solid ${radarStudioColors.border};
  cursor: default;

  &:hover [data-rd-risk-tip] {
    opacity: 1;
    visibility: visible;
  }
`

const RiskLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
  text-align: center;
`

const RiskTip = styled.span`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #1a1a1a;
  border: 1px solid ${radarStudioColors.border};
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  line-height: 14px;
  color: ${radarStudioColors.secondary};
  opacity: 0;
  visibility: hidden;
  transition: opacity ${radarStudioColors.transition} ease;
  z-index: 2;
  pointer-events: none;
`

const TimelineToggle = styled.button`
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.border};
  background: rgba(0, 0, 0, 0.2);
  color: ${radarStudioColors.white};
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
`

const TimelineBody = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => ($open ? '220px' : '0')};
  overflow: hidden;
  transition: max-height ${radarStudioColors.transition} ease;
`

const TimelineList = styled.div`
  padding: 10px 0 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 210px;
  overflow-y: auto;
`

const TimelineRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 8px;
  align-items: center;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.secondary};
`

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: auto;

  button {
    height: ${radarStudioLayout.eventBtnHeight};
    min-height: ${radarStudioLayout.eventBtnHeight};
    width: 100%;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

interface Props {
  event: RadarEventCardType
  index: number
}

export const RadarEventCard: React.FC<Props> = ({ event, index }) => {
  const [intelOpen, setIntelOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

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
          <ConfBlock>
            <ConfLabel>AI Confidence</ConfLabel>
            <ConfValue>{event.aiConfidence}%</ConfValue>
          </ConfBlock>
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
            <RdLabel>24h Volume</RdLabel>
            <MetricValue>{event.volume}</MetricValue>
          </div>
          <div>
            <RdLabel>Whales</RdLabel>
            <MetricValue>{event.whales}</MetricValue>
          </div>
          <div>
            <RdLabel>Holder Growth</RdLabel>
            <MetricValue>{event.newHolders}</MetricValue>
          </div>
          <div>
            <RdLabel>Contract Status</RdLabel>
            <MetricValue>{event.contractStatus}</MetricValue>
          </div>
          <div>
            <RdLabel>Risk Level</RdLabel>
            <MetricValue>{event.riskLevel}</MetricValue>
          </div>
          <div>
            <RdLabel>Freshness</RdLabel>
            <MetricValue>{event.freshness}</MetricValue>
          </div>
          <div>
            <RdLabel>Last Detection</RdLabel>
            <MetricValue>{event.lastDetection}</MetricValue>
          </div>
        </Metrics>

        <div>
          <SectionTitle>AI Detection Reason</SectionTitle>
          <BulletList>
            {event.detectionReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </BulletList>
        </div>

        <div>
          <SectionTitle>Confidence Breakdown</SectionTitle>
          <ConfidenceGrid>
            {event.confidenceBreakdown.map((item, i) => (
              <ConfidenceBar key={item.label} label={item.label} value={item.value} delay={i * 40} />
            ))}
          </ConfidenceGrid>
        </div>

        <div>
          <SectionTitle>Risk Matrix</SectionTitle>
          <RiskGrid>
            {event.riskMatrix.map((item) => (
              <RiskCell key={item.label}>
                <StatusDot level={item.level} />
                <RiskLabel>{item.label}</RiskLabel>
                <RiskTip data-rd-risk-tip>{item.tooltip}</RiskTip>
              </RiskCell>
            ))}
          </RiskGrid>
        </div>

        <div>
          <TimelineToggle type="button" onClick={() => setTimelineOpen((v) => !v)} aria-expanded={timelineOpen}>
            Event Timeline
            <span>{timelineOpen ? '−' : '+'}</span>
          </TimelineToggle>
          <TimelineBody $open={timelineOpen}>
            <TimelineList>
              {event.timeline.map((row) => (
                <TimelineRow key={`${row.timestamp}-${row.label}`}>
                  <StatusDot level={row.severity} />
                  <span>{row.label}</span>
                  <span style={{ color: radarStudioColors.muted }}>{row.timestamp}</span>
                  <span style={{ color: radarStudioColors.green, fontWeight: 700 }}>{row.confidence}</span>
                </TimelineRow>
              ))}
            </TimelineList>
          </TimelineBody>
        </div>

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
