import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout, LIQUIDITY_FONT_DISPLAY } from '../liquidityStudioTokens'

export const LsPanel = styled.div<{ $height?: string; $width?: string; $radius?: string; $pad?: string }>`
  width: ${({ $width }) => $width || '100%'};
  max-width: 100%;
  box-sizing: border-box;
  background: ${liquidityStudioColors.panelGradient};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${({ $radius }) => $radius || liquidityStudioLayout.panelRadius};
  padding: ${({ $pad }) => $pad || liquidityStudioLayout.panelPadding};
  overflow: visible;
  transition: border-color ${liquidityStudioLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height && $height !== 'auto'
      ? `
    height: ${$height};
    min-height: ${$height};
    max-height: ${$height};
  `
      : `
    height: auto;
    min-height: ${liquidityStudioLayout.builderMinHeight};
  `}

  &:hover {
    border-color: ${liquidityStudioColors.cardBorderHover};
  }
`

export const LsPanelTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${LIQUIDITY_FONT_DISPLAY};
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  color: ${liquidityStudioColors.text};
`

export const LsSectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
  line-height: 22px;
  color: ${liquidityStudioColors.text};
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

export const LsPrimaryBtn = styled.button`
  width: 100%;
  height: ${liquidityStudioLayout.connectButtonHeight};
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%);
  color: #050505;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 10px;
  flex-shrink: 0;
  transition: filter ${liquidityStudioLayout.hoverTransition} ease;

  &:hover {
    filter: brightness(1.05);
  }
`

export const LsRightRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  min-height: 28px;
`

export const LsRightLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

export const LsRightValue = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${liquidityStudioColors.text};
`
