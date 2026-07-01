import React from 'react'
import styled, { keyframes } from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsPanelTitle } from './liquidityStudioPrimitives'

const barPulse = keyframes`
  0%, 100% { opacity: 0.82; transform: scaleY(0.96); }
  50% { opacity: 1; transform: scaleY(1); }
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
`

const FeeBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  white-space: nowrap;
`

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 40px;
  height: 130px;
  margin-bottom: 10px;
`

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const Bar = styled.div<{ $gold?: boolean }>`
  width: ${liquidityStudioLayout.liquidityBarWidth};
  height: ${liquidityStudioLayout.liquidityBarHeight};
  border-radius: 999px;
  background: ${({ $gold }) =>
    $gold
      ? `linear-gradient(180deg, ${liquidityStudioColors.goldBright} 0%, ${liquidityStudioColors.gold} 100%)`
      : 'linear-gradient(180deg, #f0f0f0 0%, #b8b8b8 100%)'};
  animation: ${barPulse} 6s ease-in-out infinite;
`

const BarLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  line-height: 1;
`

const BarPct = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  line-height: 1;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
`

const MetricCard = styled.div`
  height: ${liquidityStudioLayout.metricCardHeight};
  min-height: ${liquidityStudioLayout.metricCardHeight};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 10px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
  line-height: 1;
`

const MetricValue = styled.span`
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

const IlBlock = styled.div`
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 10px 12px 8px;
  box-sizing: border-box;
`

const IlTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  margin-bottom: 6px;
`

const IlChart = styled.div`
  position: relative;
  height: ${liquidityStudioLayout.ilChartHeight};
  border-radius: 8px;
  overflow: hidden;
  background-image:
    linear-gradient(${liquidityStudioColors.rowBorder} 1px, transparent 1px),
    linear-gradient(90deg, ${liquidityStudioColors.rowBorder} 1px, transparent 1px);
  background-size: 20px 20px;
`

const IlSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`

export const PositionPreviewPanel: React.FC = () => (
  <LsPanel data-ls-panel data-ls-position-preview $height={liquidityStudioLayout.positionPreviewHeight}>
    <Head>
      <LsPanelTitle style={{ margin: 0 }}>Position Preview</LsPanelTitle>
      <FeeBadge>Fee Tier 0.25%</FeeBadge>
    </Head>
    <Bars>
      <BarCol>
        <Bar data-ls-liquidity-bar />
        <BarLabel>BNB</BarLabel>
        <BarPct>52%</BarPct>
      </BarCol>
      <BarCol>
        <Bar $gold data-ls-liquidity-bar />
        <BarLabel>MARCO</BarLabel>
        <BarPct>48%</BarPct>
      </BarCol>
    </Bars>
    <Metrics>
      <MetricCard>
        <MetricLabel>Expected LP</MetricLabel>
        <MetricValue>0.0000</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>Pool Share</MetricLabel>
        <MetricValue>0.00%</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>APR</MetricLabel>
        <MetricValue>—</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>Fee Tier</MetricLabel>
        <MetricValue>0.25%</MetricValue>
      </MetricCard>
    </Metrics>
    <IlBlock>
      <IlTitle>Impermanent Loss Preview</IlTitle>
      <IlChart data-ls-mini-chart aria-hidden>
        <IlSvg viewBox="0 0 400 90" preserveAspectRatio="none">
          <path
            d="M 0 72 Q 100 8 200 45 T 400 28"
            fill="none"
            stroke={liquidityStudioColors.gold}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </IlSvg>
      </IlChart>
    </IlBlock>
  </LsPanel>
)

export default PositionPreviewPanel
