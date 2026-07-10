import styled from 'styled-components'
import {
  MelegaStudioGhostBtn,
  MelegaStudioOutlineBtn,
  MelegaStudioPrimaryBtn,
} from 'design-system/melega'
import { liquidityStudioColors, liquidityStudioLayout, liquidityTypography, LIQUIDITY_FONT_DISPLAY } from '../liquidityStudioTokens'

export const LsPanel = styled.div<{ $height?: string; $width?: string; $radius?: string; $pad?: string }>`
  width: ${({ $width }) => $width || '100%'};
  max-width: 100%;
  box-sizing: border-box;
  background: ${liquidityStudioColors.panelGradient};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${({ $radius }) => $radius || liquidityStudioLayout.panelRadius};
  padding: ${({ $pad }) => $pad || liquidityStudioLayout.panelPadding};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color ${liquidityStudioLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height && $height !== 'auto'
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : `
    height: auto;
  `}

  &:hover {
    border-color: ${liquidityStudioColors.cardBorderHover};
  }
`

export const LsPanelTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${LIQUIDITY_FONT_DISPLAY};
  font-size: ${liquidityTypography.panelTitle.size};
  font-weight: ${liquidityTypography.panelTitle.weight};
  line-height: ${liquidityTypography.panelTitle.lineHeight};
  color: ${liquidityStudioColors.text};
  flex-shrink: 0;
`

export const LsSectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: ${liquidityTypography.sectionTitle.size};
  font-weight: ${liquidityTypography.sectionTitle.weight};
  line-height: ${liquidityTypography.sectionTitle.lineHeight};
  color: ${liquidityStudioColors.text};
  flex-shrink: 0;
`

export const LsPreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${liquidityStudioColors.gold};
  background: ${liquidityStudioColors.previewBadgeBg};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.goldBright};
  white-space: nowrap;
`

export const LsPrimaryBtn = styled(MelegaStudioPrimaryBtn)`
  width: 100%;
  margin-top: ${liquidityStudioLayout.executionButtonGap};
  flex-shrink: 0;
`

export const LsOutlineBtn = styled(MelegaStudioOutlineBtn)`
  width: 100%;
`

export const LsGhostBtn = styled(MelegaStudioGhostBtn)`
  width: 100%;
`

export const LsRightRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
`

export const LsRightLabel = styled.span`
  font-size: ${liquidityTypography.lpInfoLabel.size};
  font-weight: ${liquidityTypography.lpInfoLabel.weight};
  line-height: ${liquidityTypography.lpInfoLabel.lineHeight};
  color: ${liquidityStudioColors.muted};
  flex-shrink: 0;
`

export const LsRightValue = styled.span`
  font-size: ${liquidityTypography.lpInfoValue.size};
  font-weight: ${liquidityTypography.lpInfoValue.weight};
  line-height: ${liquidityTypography.lpInfoValue.lineHeight};
  color: ${liquidityStudioColors.text};
  text-align: right;
  font-variant-numeric: ${liquidityTypography.fontVariantNumeric};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`
