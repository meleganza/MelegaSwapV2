import React from 'react'
import styled, { keyframes } from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout, liquidityTypography } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsPanelTitle } from './liquidityStudioPrimitives'

const barPulse = keyframes`
  0%, 100% { opacity: 0.82; transform: scaleY(0.96); }
  50% { opacity: 1; transform: scaleY(1); }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: ${liquidityStudioLayout.metricsAfterBarsGap};
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
`

const FeeBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  white-space: nowrap;
`

const StatusNote = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.gold};
  white-space: nowrap;
`

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 40px;
  height: ${liquidityStudioLayout.barsAreaHeight};
  min-height: 120px;
  flex-shrink: 0;
`

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const Bar = styled.div<{ $gold?: boolean; $scale?: number }>`
  width: ${liquidityStudioLayout.liquidityBarWidth};
  min-height: 48px;
  height: ${({ $scale }) =>
    $scale ? Math.max(48, liquidityStudioLayout.liquidityBarHeight * $scale) : liquidityStudioLayout.liquidityBarHeight}px;
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
`

const BarPct = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  font-variant-numeric: ${liquidityTypography.fontVariantNumeric};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex-shrink: 0;
`

const MetricCard = styled.div`
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
  font-size: ${liquidityTypography.statLabel.size};
  font-weight: ${liquidityTypography.statLabel.weight};
  color: ${liquidityStudioColors.muted};
`

const MetricValue = styled.span`
  font-size: ${liquidityTypography.statValue.size};
  font-weight: ${liquidityTypography.statValue.weight};
  line-height: ${liquidityTypography.statValue.lineHeight};
  color: ${liquidityStudioColors.text};
  font-variant-numeric: ${liquidityTypography.fontVariantNumeric};
`

const IlBlock = styled.div`
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 10px 12px 8px;
  box-sizing: border-box;
  min-height: ${liquidityStudioLayout.ilChartHeight};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`

const IlTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  margin-bottom: 4px;
`

const IlChart = styled.div`
  position: relative;
  flex: 1;
  min-height: 48px;
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

const SplitBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  flex-shrink: 0;
`

const SplitHalf = styled.span<{ $gold?: boolean }>`
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $gold }) => ($gold ? liquidityStudioColors.gold : liquidityStudioColors.text)};
  font-variant-numeric: ${liquidityTypography.fontVariantNumeric};
`

const SplitDivider = styled.span`
  width: 1px;
  height: 28px;
  background: ${liquidityStudioColors.border};
`

export const PositionPreviewPanel: React.FC = () => {
  const { preview, loadingLabel, mode } = useLiquidityRuntime()
  const tokenASymbol =
    preview.tokenASymbol && preview.tokenASymbol !== 'A' ? preview.tokenASymbol : 'BNB'
  const tokenBSymbol =
    preview.tokenBSymbol && preview.tokenBSymbol !== 'B' ? preview.tokenBSymbol : 'MARCO'
  const leftPct = preview.tokenAPct > 0 ? preview.tokenAPct : 50
  const rightPct = preview.tokenBPct > 0 ? preview.tokenBPct : 50
  const leftScale = Math.max(0.35, leftPct / 100)
  const rightScale = Math.max(0.35, rightPct / 100)

  return (
    <LsPanel
      data-ls-panel
      data-ls-position-preview
      $width={liquidityStudioLayout.centerWidth}
      $height={liquidityStudioLayout.previewHeight}
      $pad={`${liquidityStudioLayout.previewPanelPaddingTop} 18px 18px 18px`}
      style={{ minHeight: liquidityStudioLayout.previewMinHeight }}
    >
      <Head>
        <LsPanelTitle style={{ margin: 0 }}>Position preview</LsPanelTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loadingLabel ? <StatusNote>{loadingLabel}</StatusNote> : null}
          <FeeBadge>Fee tier {preview.feeTier}</FeeBadge>
        </div>
      </Head>
      <Body>
        <Bars>
          <BarCol>
            <Bar $scale={leftScale} data-ls-liquidity-bar />
            <BarLabel>{tokenASymbol}</BarLabel>
            <BarPct>{leftPct}%</BarPct>
          </BarCol>
          <BarCol>
            <Bar $gold $scale={rightScale} data-ls-liquidity-bar />
            <BarLabel>{tokenBSymbol}</BarLabel>
            <BarPct>{rightPct}%</BarPct>
          </BarCol>
        </Bars>
        <SplitBadge aria-label={`${tokenASymbol} ${leftPct}% / ${tokenBSymbol} ${rightPct}%`}>
          <SplitHalf>
            {tokenASymbol} {leftPct}%
          </SplitHalf>
          <SplitDivider />
          <SplitHalf $gold>
            {tokenBSymbol} {rightPct}%
          </SplitHalf>
        </SplitBadge>
        <Metrics>
          <MetricCard>
            <MetricLabel>{mode === 'Remove Liquidity' ? 'LP removed' : 'Expected LP'}</MetricLabel>
            <MetricValue>{preview.expectedLp}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>Pool share</MetricLabel>
            <MetricValue>{preview.poolShare}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>APR</MetricLabel>
            <MetricValue>{preview.apr}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>Fee tier</MetricLabel>
            <MetricValue>{preview.feeTier}</MetricValue>
          </MetricCard>
          {preview.estimatedDailyFees ? (
            <MetricCard>
              <MetricLabel>Est. daily fees</MetricLabel>
              <MetricValue style={{ fontSize: '18px' }}>{preview.estimatedDailyFees}</MetricValue>
            </MetricCard>
          ) : null}
          {preview.currentValue ? (
            <MetricCard>
              <MetricLabel>Current value</MetricLabel>
              <MetricValue style={{ fontSize: '18px' }}>{preview.currentValue}</MetricValue>
            </MetricCard>
          ) : null}
        </Metrics>
        <IlBlock>
          <IlTitle>Impermanent loss preview ({preview.impermanentLoss})</IlTitle>
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
      </Body>
    </LsPanel>
  )
}

export default PositionPreviewPanel
