import React, { useEffect } from 'react'
import styled from 'styled-components'
import type { ContractPreviewData, RadarEventCard } from '../radarStudioData'
import { statusColor } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors } from '../radarStudioTokens'
import { RadarProjectLogo, StatusDot } from './radarStudioPrimitives'

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
  width: min(760px, 100%);
  max-height: min(78vh, 720px);
  overflow: auto;
  background: #111111;
  border: 1px solid ${radarStudioColors.gold};
  border-radius: 20px;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 767px) {
    width: 100%;
    max-height: 86vh;
    border-radius: 22px 22px 0 0;
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

const Title = styled.h3`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 22px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const ContractLine = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  color: ${radarStudioColors.subtitle};
`

const ScoreRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid ${radarStudioColors.green};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const ScoreValue = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 800;
  color: ${radarStudioColors.green};
  line-height: 1;
`

const ScoreLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  color: ${radarStudioColors.muted};
  text-transform: uppercase;
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${radarStudioColors.border};
  border-radius: 10px;
  background: transparent;
  color: ${radarStudioColors.muted};
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
`

const Checklist = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const CheckItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  color: ${({ $color }) => $color};
`

const Summary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 20px;
  color: ${radarStudioColors.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;

  @media (max-width: 767px) {
    position: sticky;
    bottom: 0;
    background: #111111;
    padding-top: 8px;
  }
`

const OutlineBtn = styled.button`
  height: 42px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`

const GoldBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.gold};
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  flex: 1;
  min-width: 200px;
`

const FooterNote = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 18px;
  color: ${radarStudioColors.muted};
`

function fromEvent(event: RadarEventCard): ContractPreviewData {
  return {
    address: '0x8f3a…4e2c',
    network: event.network,
    score: event.aiConfidence,
    projectName: event.name,
    symbol: event.symbol,
    checklist: event.contractIntel.slice(0, 6).map((f) => ({
      label: f.label,
      status: f.status,
    })),
    summary: event.intelSummary,
  }
}

interface Props {
  preview?: ContractPreviewData
  event?: RadarEventCard
  onClose: () => void
}

export const ContractIntelligencePreview: React.FC<Props> = ({ preview, event, onClose }) => {
  const data = preview ?? (event ? fromEvent(event) : null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!data) return null

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="AI Contract Intelligence Preview" onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()} data-rd-contract-intel-modal>
        <TopRow>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            {data.projectName ? (
              <RadarProjectLogo name={data.projectName} symbol={data.symbol} size={40} />
            ) : null}
            <div>
              <Title>AI Contract Intelligence Preview</Title>
              <ContractLine>
                {data.address} · {data.network}
              </ContractLine>
            </div>
          </div>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            ×
          </CloseBtn>
        </TopRow>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ScoreRing>
            <ScoreValue>{data.score}</ScoreValue>
            <ScoreLabel>/ 100</ScoreLabel>
          </ScoreRing>
        </div>

        <Checklist>
          {data.checklist.map((item) => (
            <CheckItem key={item.label} $color={statusColor(item.status)}>
              <StatusDot level={item.status} />
              {item.label}
            </CheckItem>
          ))}
        </Checklist>

        <Summary>{data.summary}</Summary>

        <CtaRow>
          <OutlineBtn type="button">Open Project</OutlineBtn>
          <GoldBtn href="https://space.melega.io" target="_blank" rel="noopener noreferrer">
            Professional AI Contract Audit on Melega Space
          </GoldBtn>
        </CtaRow>

        <FooterNote>
          This is a free operational due diligence preview. It is not a legal, financial, or certified audit.
        </FooterNote>
      </Sheet>
    </Overlay>
  )
}

export default ContractIntelligencePreview
