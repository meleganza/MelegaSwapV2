import React from 'react'
import styled, { keyframes } from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
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
  margin-bottom: 0;
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
  height: ${liquidityStudioLayout.barsAreaHeight};
  margin-top: 8px;
  margin-bottom: 0;
`

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const Bar = styled.div<{ $gold?: boolean; $scale?: number }>`
  width: ${liquidityStudioLayout.liquidityBarWidth};
  height: ${({ $scale }) =>
    $scale ? Math.max(24, liquidityStudioLayout.liquidityBarHeight * $scale) : liquidityStudioLayout.liquidityBarHeight}px;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: ${liquidityStudioLayout.metricsAfterBarsGap};
`

const MetricCard = styled.div`
  height: ${liquidityStudioLayout.metricCardHeight};
  min-height: ${liquidityStudioLayout.metricCardHeight};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
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
  margin-top: ${liquidityStudioLayout.ilMarginTop};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 10px 12px 8px;
  box-sizing: border-box;
  height: ${liquidityStudioLayout.ilChartHeight};
  min-height: ${liquidityStudioLayout.ilChartHeight};
  display: flex;
  flex-direction: column;
`

const IlTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  margin-bottom: 4px;
  flex-shrink: 0;
`

const IlChart = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
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

const LoadingLine = styled.p`
  margin: 12px 0 0;
  font-size: 12px;
  color: ${liquidityStudioColors.muted};
`

export const PositionPreviewPanel: React.FC = () => {
  const { preview, loadingLabel, mode } = useLiquidityRuntime()
  const leftScale = preview.tokenAPct / 100
  const rightScale = preview.tokenBPct / 100

  return (
    <LsPanel
      data-ls-panel
      data-ls-position-preview
      $width={liquidityStudioLayout.centerWidth}
      $height={liquidityStudioLayout.previewHeight}
      $pad={`${liquidityStudioLayout.previewPanelPaddingTop} 18px 18px 18px`}
    >
      <Head>
        <LsPanelTitle style={{ margin: 0 }}>Position Preview</LsPanelTitle>
        <FeeBadge>Fee Tier {preview.feeTier}</FeeBadge>
      </Head>
      {loadingLabel ? (
        <LoadingLine>{loadingLabel}</LoadingLine>
      ) : (
        <>
          <Bars>
            <BarCol>
              <Bar $scale={leftScale} data-ls-liquidity-bar />
              <BarLabel>{preview.tokenASymbol}</BarLabel>
              <BarPct>{preview.tokenAPct}%</BarPct>
            </BarCol>
            <BarCol>
              <Bar $gold $scale={rightScale} data-ls-liquidity-bar />
              <BarLabel>{preview.tokenBSymbol}</BarLabel>
              <BarPct>{preview.tokenBPct}%</BarPct>
            </BarCol>
          </Bars>
          <Metrics>
            <MetricCard>
              <MetricLabel>{mode === 'Remove Liquidity' ? 'LP Removed' : 'Expected LP'}</MetricLabel>
              <MetricValue>{preview.expectedLp}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Pool Share</MetricLabel>
              <MetricValue>{preview.poolShare}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>APR</MetricLabel>
              <MetricValue>{preview.apr}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Fee Tier</MetricLabel>
              <MetricValue>{preview.feeTier}</MetricValue>
            </MetricCard>
            {preview.estimatedDailyFees && (
              <MetricCard>
                <MetricLabel>Est. Daily Fees</MetricLabel>
                <MetricValue style={{ fontSize: 16 }}>{preview.estimatedDailyFees}</MetricValue>
              </MetricCard>
            )}
            {preview.currentValue && (
              <MetricCard>
                <MetricLabel>Current Value</MetricLabel>
                <MetricValue style={{ fontSize: 16 }}>{preview.currentValue}</MetricValue>
              </MetricCard>
            )}
          </Metrics>
          <IlBlock>
            <IlTitle>Impermanent Loss Preview ({preview.impermanentLoss})</IlTitle>
            <IlChart data-ls-mini-chart aria-hidden>
              <IlSvg viewBox="0 0 400 60" preserveAspectRatio="none">
                <path
                  d="M 0 48 Q 100 6 200 32 T 400 20"
                  fill="none"
                  stroke={liquidityStudioColors.gold}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </IlSvg>
            </IlChart>
          </IlBlock>
        </>
      )}
    </LsPanel>
  )
}

export default PositionPreviewPanel
