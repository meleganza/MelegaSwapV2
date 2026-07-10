import styled from 'styled-components'
import { farmsStudioColors, farmsStudioLayout, farmsTypography, FARMS_FONT_DISPLAY } from '../farmsStudioTokens'

export const FsPanel = styled.div<{ $height?: string; $width?: string }>`
  width: ${({ $width }) => $width || '100%'};
  max-width: 100%;
  box-sizing: border-box;
  background: ${farmsStudioColors.panel};
  border: 1px solid ${farmsStudioColors.border};
  border-radius: ${farmsStudioLayout.cardRadius};
  padding: ${farmsStudioLayout.cardPadding};
  overflow: visible;
  transition: border-color ${farmsStudioLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}

  &:hover {
    border-color: ${farmsStudioColors.cardBorderHover};
  }
`

export const FsPanelTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${FARMS_FONT_DISPLAY};
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  color: ${farmsStudioColors.text};
`

export const FsSectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
  line-height: 22px;
  color: ${farmsStudioColors.text};
`

export const FsPreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${farmsStudioColors.gold};
  background: ${farmsStudioColors.previewBadgeBg};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${farmsStudioColors.goldBright};
  white-space: nowrap;
  flex-shrink: 0;
`

export const FsPrimaryBtn = styled.button`
  height: ${farmsStudioLayout.btnHeight};
  min-height: ${farmsStudioLayout.btnHeight};
  padding: 0 18px;
  border: none;
  border-radius: ${farmsStudioLayout.btnRadius};
  background: ${farmsStudioColors.gold};
  color: #050505;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: filter ${farmsStudioLayout.hoverTransition} ease;

  &:hover {
    filter: brightness(1.06);
  }
`

export const FsGhostBtn = styled.button`
  height: ${farmsStudioLayout.btnHeight};
  min-height: ${farmsStudioLayout.btnHeight};
  padding: 0 18px;
  border-radius: ${farmsStudioLayout.btnRadius};
  border: 1px solid ${farmsStudioColors.gold};
  background: transparent;
  color: ${farmsStudioColors.gold};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color ${farmsStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${farmsStudioColors.cardBorderHover};
  }
`

export const FsSmallPrimaryBtn = styled(FsPrimaryBtn)`
  width: ${farmsStudioLayout.farmCardBtnWidth};
  min-width: ${farmsStudioLayout.farmCardBtnWidth};
  height: ${farmsStudioLayout.farmCardBtnHeight};
  min-height: ${farmsStudioLayout.farmCardBtnHeight};
  padding: 0;
  font-size: 13px;
`

export const FsSmallGhostBtn = styled(FsGhostBtn)`
  width: ${farmsStudioLayout.farmCardBtnWidth};
  min-width: ${farmsStudioLayout.farmCardBtnWidth};
  height: ${farmsStudioLayout.farmCardBtnHeight};
  min-height: ${farmsStudioLayout.farmCardBtnHeight};
  padding: 0;
  font-size: 13px;
`

export const FsCardMetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
  line-height: 1;
`

export const FsCardMetricValue = styled.span`
  font-size: ${farmsTypography.cardMetricValue.size};
  font-weight: ${farmsTypography.cardMetricValue.weight};
  line-height: ${farmsTypography.cardMetricValue.lineHeight};
  color: ${farmsStudioColors.text};
  font-variant-numeric: ${farmsTypography.fontVariantNumeric};
`

export const FsMetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
  line-height: 1;
`

export const FsMetricValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${farmsStudioColors.text};
  line-height: 1.2;
`

export const FsKpiCard = styled.div`
  height: ${farmsStudioLayout.kpiHeight};
  min-height: ${farmsStudioLayout.kpiHeight};
  border-radius: ${farmsStudioLayout.cardRadius};
  border: 1px solid ${farmsStudioColors.border};
  background: ${farmsStudioColors.panel};
  padding: 14px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
`

export const FsKpiLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
  line-height: 1;
`

export const FsKpiValue = styled.span<{ $gold?: boolean }>`
  font-size: ${farmsTypography.kpiValue.size};
  font-weight: ${farmsTypography.kpiValue.weight};
  line-height: ${farmsTypography.kpiValue.lineHeight};
  color: ${({ $gold }) => ($gold ? farmsStudioColors.gold : farmsStudioColors.text)};
  font-variant-numeric: ${farmsTypography.fontVariantNumeric};
  white-space: nowrap;
`

export const FsKpiDelta = styled.span<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  margin-left: ${farmsStudioLayout.kpiDeltaGap};
  color: ${({ $positive }) => ($positive ? farmsStudioColors.green : farmsStudioColors.red)};
`
