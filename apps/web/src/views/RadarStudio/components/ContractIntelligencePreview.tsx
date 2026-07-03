import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { ContractPreviewData } from '../radarStudioData'
import type { RadarEventCard } from '../radarStudioData'
import { statusColor } from '../radarStudioData'
import { buildContractPreview } from '../radarRuntime/buildContractIntelligence'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { PreviewGauge, RadarProjectLogo, StatusPill } from './radarStudioPrimitives'

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
  width: min(860px, 100%);
  max-height: min(90vh, 900px);
  overflow: auto;
  background: ${radarStudioColors.panel};
  border: 1px solid ${radarStudioColors.gold};
  border-radius: ${radarStudioLayout.cardRadius};
  padding: ${radarStudioLayout.cardPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 767px) {
    width: 100%;
    max-height: 86vh;
    border-radius: 22px 22px 0 0;
    animation: rdSheetUp 280ms ease-out;
  }

  @keyframes rdSheetUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`

const Title = styled.h3`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 22px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const SubLine = styled.p`
  margin: 4px 0 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  color: ${radarStudioColors.subtitle};
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

const GaugeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const GaugeLabel = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const MetricCell = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.border};
  background: rgba(0, 0, 0, 0.2);
`

const MetricName = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${radarStudioColors.label};
  margin-bottom: 6px;
`

const MetricDesc = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 16px;
  color: ${radarStudioColors.secondary};
  margin-top: 6px;
`

const SummaryCard = styled.div`
  min-height: 170px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${radarStudioColors.border};
  background: rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
`

const SummaryTitle = styled.h4`
  margin: 0 0 10px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 20px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const SummaryBody = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 16px;
  line-height: 24px;
  color: ${radarStudioColors.secondary};
  white-space: pre-line;
`

const ProvenanceCard = styled.div`
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${radarStudioColors.border};
  background: rgba(0, 0, 0, 0.2);
`

const ProvenanceTitle = styled.h4`
  margin: 0 0 12px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const SourceGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const SourceChip = styled.span<{ $available: boolean }>`
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${({ $available }) => ($available ? radarStudioColors.green : radarStudioColors.border)};
  background: ${({ $available }) => ($available ? 'rgba(0,232,132,0.08)' : 'transparent')};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${({ $available }) => ($available ? radarStudioColors.green : radarStudioColors.muted)};
  display: inline-flex;
  align-items: center;
`

const ProvenanceFooter = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${radarStudioColors.divider};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.muted};

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const SpaceSection = styled.div`
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${radarStudioColors.border};
`

const SpaceTitle = styled.h4`
  margin: 0 0 8px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 800;
  color: ${radarStudioColors.gold};
`

const SpaceList = styled.ul`
  margin: 0 0 14px;
  padding-left: 18px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  line-height: 20px;
  color: ${radarStudioColors.secondary};
`

const SpaceBtn = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.gold};
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: filter ${radarStudioColors.transition} ease;

  &:hover {
    filter: brightness(1.08);
  }
`

interface Props {
  preview?: ContractPreviewData
  event?: RadarEventCard
  onClose: () => void
}

export const ContractIntelligencePreview: React.FC<Props> = ({ preview, event, onClose }) => {
  const [animated, setAnimated] = useState(0)
  const data = preview ?? (event ? buildContractPreview(event) : null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!data) return
    const t = window.setTimeout(() => setAnimated(data.score), 80)
    return () => window.clearTimeout(t)
  }, [data])

  if (!data) return null

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="AI Contract Intelligence Preview" onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()} data-rd-contract-intel-modal>
        <TopRow>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            {data.projectName ? <RadarProjectLogo name={data.projectName} symbol={data.symbol} size={44} /> : null}
            <div>
              <Title>AI Contract Intelligence Preview</Title>
              <SubLine>
                {data.address} · {data.network}
              </SubLine>
            </div>
          </div>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            ×
          </CloseBtn>
        </TopRow>

        <GaugeSection>
          <GaugeLabel>Overall AI Confidence</GaugeLabel>
          <PreviewGauge score={data.score} animated={animated} />
        </GaugeSection>

        <MetricsGrid>
          {data.metrics.map((m) => (
            <MetricCell key={m.label}>
              <MetricName>{m.label}</MetricName>
              <StatusPill $color={statusColor(m.status)}>{m.description}</StatusPill>
            </MetricCell>
          ))}
        </MetricsGrid>

        <SummaryCard>
          <SummaryTitle>AI Operational Summary</SummaryTitle>
          <SummaryBody>{data.operationalSummary}</SummaryBody>
        </SummaryCard>

        <ProvenanceCard>
          <ProvenanceTitle>Evidence Sources</ProvenanceTitle>
          <SourceGrid>
            {data.provenance.map((s) => (
              <SourceChip key={s.id} $available={s.available}>
                {s.label}
              </SourceChip>
            ))}
          </SourceGrid>
          <ProvenanceFooter>
            <span>Last Updated: {data.lastUpdated}</span>
            <span>Freshness: {data.freshness}</span>
            <span>Evidence: {data.evidenceCount}</span>
            <span>{data.aiVersion}</span>
          </ProvenanceFooter>
        </ProvenanceCard>

        <SpaceSection>
          <SpaceTitle>Professional Contract Audit</SpaceTitle>
          <SpaceList>
            <li>Security analysis</li>
            <li>Attack vectors</li>
            <li>Tax simulation</li>
            <li>Ownership report</li>
            <li>Proxy analysis</li>
            <li>Upgradeability</li>
            <li>Legal disclaimer</li>
            <li>Professional export</li>
          </SpaceList>
          <SpaceBtn href="https://space.melega.io" target="_blank" rel="noopener noreferrer">
            Open in Melega Space
          </SpaceBtn>
        </SpaceSection>
      </Sheet>
    </Overlay>
  )
}

export default ContractIntelligencePreview
