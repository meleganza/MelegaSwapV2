import React from 'react'
import styled from 'styled-components'
import type { RadarEventCard } from '../radarStudioData'
import {
  RADAR_FONT_BODY,
  radarStudioColors,
  radarStudioLayout,
} from '../radarStudioTokens'
import { RadarProjectLogo } from './radarStudioPrimitives'

const Card = styled.article`
  height: ${radarStudioLayout.discoveryCardHeight};
  padding: 24px;
  border-radius: ${radarStudioLayout.cardRadius};
  background: ${radarStudioColors.card};
  border: 1px solid ${radarStudioColors.cardBorder};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 180ms ease;
  width: 100%;
  min-width: 0;

  &:hover {
    border-color: ${radarStudioColors.cardBorderHover};
  }

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    height: auto;
    padding: 20px;
  }
`

const Split = styled.div`
  display: grid;
  grid-template-columns: ${radarStudioLayout.discoverySplitLeft} ${radarStudioLayout.discoverySplitRight};
  gap: 20px;
  flex: 1;
  min-height: 0;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`

const Left = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Right = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    padding-top: 4px;
    border-top: 1px solid ${radarStudioColors.cardBorder};
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const Name = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 24px;
  font-weight: 700;
  color: ${radarStudioColors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    white-space: normal;
    word-break: break-word;
  }
`

const Network = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.muted};
`

const Summary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 1.45;
  color: ${radarStudioColors.summary};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-top: auto;
`

const MetricLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.muted};
  display: block;
`

const MetricValue = styled.span<{ $muted?: boolean }>`
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 500;
  color: ${({ $muted }) => ($muted ? radarStudioColors.secondary : radarStudioColors.text)};
`

const Score = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  color: ${radarStudioColors.green};

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    font-size: 36px;
  }
`

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  flex-shrink: 0;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > a:last-child {
      grid-column: 1 / -1;
    }
  }
`

const GoldBtn = styled.a`
  height: ${radarStudioLayout.btnHeight};
  border: none;
  border-radius: 12px;
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
  min-width: 0;
  padding: 0 12px;
`

const OutlineBtn = styled.a`
  height: ${radarStudioLayout.btnHeight};
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.gold};
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
  min-width: 0;
  padding: 0 12px;
`

function isEmpty(v: string) {
  return v === '—' || v === 'Unavailable'
}

interface Props {
  event: RadarEventCard
}

export const RadarDiscoveryReportCard: React.FC<Props> = ({ event }) => (
  <Card data-rd-discovery-card>
    <Split>
      <Left>
        <HeaderRow>
          <RadarProjectLogo name={event.name} symbol={event.symbol} size={48} address={event.contractAddress} />
          <div style={{ minWidth: 0 }}>
            <Name>{event.name}</Name>
            <Network>{event.network}</Network>
          </div>
        </HeaderRow>
        <Summary>{event.summary}</Summary>
        <Metrics>
          <div>
            <MetricLabel>Liquidity</MetricLabel>
            <MetricValue $muted={isEmpty(event.liquidity)}>{isEmpty(event.liquidity) ? '—' : event.liquidity}</MetricValue>
          </div>
          <div>
            <MetricLabel>Volume</MetricLabel>
            <MetricValue $muted={isEmpty(event.volume)}>{isEmpty(event.volume) ? '—' : event.volume}</MetricValue>
          </div>
        </Metrics>
      </Left>
      <Right>
        <div>
          <MetricLabel>AI Score</MetricLabel>
          <Score>{event.aiConfidence}</Score>
        </div>
        <MetricValue>{event.aiConfidence}% confidence</MetricValue>
        <div style={{ minWidth: 0, flex: 1 }}>
          <MetricLabel>Signals</MetricLabel>
          <MetricValue>{event.signals.slice(0, 3).join(' · ')}</MetricValue>
        </div>
      </Right>
    </Split>
    <BtnRow>
      <GoldBtn href={event.tradeHref ?? '/trade'}>Trade</GoldBtn>
      <OutlineBtn href={event.projectHref ?? '#'}>Open Project</OutlineBtn>
      <OutlineBtn href={event.contractAddress ? `/radar?contract=${event.contractAddress}` : '/radar'}>Radar</OutlineBtn>
    </BtnRow>
  </Card>
)

export default RadarDiscoveryReportCard
