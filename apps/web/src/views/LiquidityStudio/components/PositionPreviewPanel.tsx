import React from 'react'
import styled, { keyframes } from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'

const barPulse = keyframes`
  0%, 100% { transform: scaleY(0.92); opacity: 0.75; }
  50% { transform: scaleY(1); opacity: 1; }
`

const Panel = styled.div`
  width: 100%;
  height: ${liquidityStudioLayout.positionPreviewHeight};
  min-height: ${liquidityStudioLayout.positionPreviewHeight};
  background: ${liquidityStudioColors.panelGradient};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.panelRadius};
  padding: ${liquidityStudioLayout.panelPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Title = styled.h2`
  margin: 0 0 14px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  color: ${liquidityStudioColors.text};
`

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 28px;
  height: 120px;
  margin-bottom: 16px;
`

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 72px;
`

const Bar = styled.div<{ $h: number; $gold?: boolean }>`
  width: 44px;
  height: ${({ $h }) => $h}px;
  border-radius: 8px 8px 4px 4px;
  background: ${({ $gold }) =>
    $gold
      ? `linear-gradient(180deg, ${liquidityStudioColors.goldBright}, ${liquidityStudioColors.gold})`
      : 'linear-gradient(180deg, #ffffff, #d8d8d8)'};
  animation: ${barPulse} 6s ease-in-out infinite;
`

const BarLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
`

const BarPct = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
`

const MetricCard = styled.div`
  height: ${liquidityStudioLayout.metricCardHeight};
  min-height: ${liquidityStudioLayout.metricCardHeight};
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #171717;
  padding: 10px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`

const MetricLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const MetricValue = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: ${liquidityStudioColors.text};
`

const IlBlock = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #171717;
  padding: 10px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`

const IlTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  margin-bottom: 8px;
`

const IlChart = styled.div`
  flex: 1;
  min-height: ${liquidityStudioLayout.ilChartHeight};
  border-radius: 8px;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 8%;
    right: 8%;
    bottom: 18px;
    height: 2px;
    background: linear-gradient(90deg, ${liquidityStudioColors.green}, ${liquidityStudioColors.gold});
    border-radius: 1px;
    transform: skewY(-4deg);
  }
`

export const PositionPreviewPanel: React.FC = () => (
  <Panel data-ls-panel data-ls-position-preview>
    <Title>Position Preview</Title>
    <Bars>
      <BarCol>
        <Bar $h={88} data-ls-liquidity-bar />
        <BarLabel>BNB</BarLabel>
        <BarPct>52%</BarPct>
      </BarCol>
      <BarCol>
        <Bar $h={76} $gold data-ls-liquidity-bar />
        <BarLabel>MARCO</BarLabel>
        <BarPct>48%</BarPct>
      </BarCol>
    </Bars>
    <Metrics>
      <MetricCard>
        <MetricLabel>Expected LP</MetricLabel>
        <MetricValue>—</MetricValue>
      </MetricCard>
      <MetricCard>
        <MetricLabel>Pool Share</MetricLabel>
        <MetricValue>—</MetricValue>
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
      <IlChart data-ls-mini-chart aria-hidden />
    </IlBlock>
  </Panel>
)

export default PositionPreviewPanel
