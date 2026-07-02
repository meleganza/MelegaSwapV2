import React, { useEffect } from 'react'
import styled from 'styled-components'
import type { RadarEventCard } from '../radarStudioData'
import { statusColor } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors } from '../radarStudioTokens'
import { RadarProjectLogo, RdOutlineGoldBtn, StatusDot } from './radarStudioPrimitives'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    align-items: flex-end;
    padding: 0;
  }
`

const Sheet = styled.div`
  width: min(560px, 100%);
  max-height: min(88vh, 720px);
  overflow: auto;
  background: ${radarStudioColors.panel};
  border: 1px solid ${radarStudioColors.border};
  border-radius: 20px;
  padding: 24px;
  box-sizing: border-box;
  box-shadow: ${radarStudioColors.shadow};

  @media (max-width: 767px) {
    width: 100%;
    max-height: 85vh;
    border-radius: 20px 20px 0 0;
    animation: rdSheetUp 280ms ease-out;
  }

  @keyframes rdSheetUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`

const Title = styled.h3`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 20px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  color: ${radarStudioColors.subtitle};
`

const CloseBtn = styled.button`
  margin-left: auto;
  width: 36px;
  height: 36px;
  border: 1px solid ${radarStudioColors.border};
  border-radius: 10px;
  background: transparent;
  color: ${radarStudioColors.grey};
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: ${radarStudioColors.panelAlt};
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
`

const FieldLabel = styled.span`
  color: ${radarStudioColors.grey};
`

const FieldValue = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`

const ScoreRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`

const ScoreBox = styled.div`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.border};
  background: ${radarStudioColors.panelAlt};
`

const ScoreLabel = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${radarStudioColors.grey};
  margin-bottom: 4px;
`

const ScoreValue = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 24px;
  font-weight: 700;
  color: ${radarStudioColors.green};
`

const Summary = styled.p`
  margin: 0 0 16px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 1.55;
  color: ${radarStudioColors.subtitle};
`

const Disclaimer = styled.p`
  margin: 0 0 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.border};
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 1.5;
  color: ${radarStudioColors.secondary};
`

const Cta = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.gold};
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 180ms ease;

  &:hover {
    transform: scale(0.99);
  }
`

interface Props {
  event: RadarEventCard
  onClose: () => void
}

export const ContractIntelligencePreview: React.FC<Props> = ({ event, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Contract Intelligence Preview" onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <Header>
          <RadarProjectLogo name={event.name} symbol={event.symbol} size={40} />
          <div>
            <Title>Contract Intelligence</Title>
            <Subtitle>
              {event.name} · {event.network} · Free AI Preview
            </Subtitle>
          </div>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            ×
          </CloseBtn>
        </Header>

        <Grid>
          {event.contractIntel.map((field) => (
            <Field key={field.label}>
              <FieldLabel>{field.label}</FieldLabel>
              <FieldValue $color={statusColor(field.status)}>
                <StatusDot level={field.status} />
                {field.value}
              </FieldValue>
            </Field>
          ))}
        </Grid>

        <ScoreRow>
          <ScoreBox>
            <ScoreLabel>Risk Score</ScoreLabel>
            <ScoreValue>{event.riskScore}/100</ScoreValue>
          </ScoreBox>
          <ScoreBox>
            <ScoreLabel>Gas Complexity</ScoreLabel>
            <ScoreValue style={{ fontSize: 18 }}>{event.gasComplexity}</ScoreValue>
          </ScoreBox>
        </ScoreRow>

        <Summary>{event.intelSummary}</Summary>

        <Disclaimer>
          For a complete Professional AI Contract Audit with downloadable PDF, certification and detailed
          legal-grade report, continue on Melega Space. Radar remains free — no PDF or professional
          certification is provided here.
        </Disclaimer>

        <Cta href="https://space.melega.io" target="_blank" rel="noopener noreferrer">
          Professional Audit on Melega Space
        </Cta>
      </Sheet>
    </Overlay>
  )
}

export default ContractIntelligencePreview
