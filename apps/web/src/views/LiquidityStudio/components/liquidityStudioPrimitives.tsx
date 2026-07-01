import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'

export const LsPanel = styled.div<{ $height?: string }>`
  width: 100%;
  box-sizing: border-box;
  background: ${liquidityStudioColors.panelGradient};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.panelRadius};
  padding: ${liquidityStudioLayout.panelPadding};
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
    max-height: ${$height};
    overflow: hidden;
  `
      : ''}
`

export const LsPanelTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: ${liquidityStudioColors.text};
`

export const LsSectionTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
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
`
