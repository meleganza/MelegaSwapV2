import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { isMarcoSymbol, MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'

export const PsPanel = styled.div<{ $height?: string; $radius?: string }>`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: ${poolsStudioColors.panel};
  border: 1px solid ${poolsStudioColors.border};
  border-radius: ${({ $radius }) => $radius || poolsStudioLayout.cardRadius};
  padding: ${poolsStudioLayout.cardPadding};
  overflow: hidden;
  transition: border-color ${poolsStudioLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}

  &:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }
`

export const PsCard = styled.div`
  background: ${poolsStudioColors.card};
  border: 1px solid ${poolsStudioColors.border};
  border-radius: ${poolsStudioLayout.cardRadius};
`

export const PsPreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.gold};
  background: ${poolsStudioColors.previewBadgeBg};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${poolsStudioColors.goldBright};
  white-space: nowrap;
`

export const PsPrimaryBtn = styled.button`
  height: ${poolsStudioLayout.btnHeight};
  min-height: ${poolsStudioLayout.btnHeight};
  padding: 0 24px;
  border: none;
  border-radius: ${poolsStudioLayout.btnRadius};
  background: ${poolsStudioColors.goldGradient};
  color: #050505;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: box-shadow ${poolsStudioLayout.hoverTransition} ease;

  &:hover {
    box-shadow: ${poolsStudioColors.goldButtonGlow};
    filter: none;
  }
`

export const PsGhostBtn = styled.button`
  height: ${poolsStudioLayout.btnHeight};
  min-height: ${poolsStudioLayout.btnHeight};
  padding: 0 18px;
  border-radius: ${poolsStudioLayout.btnRadius};
  border: 1px solid ${poolsStudioColors.goldBorder};
  background: transparent;
  color: ${poolsStudioColors.goldBright};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color ${poolsStudioLayout.hoverTransition} ease, box-shadow ${poolsStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
    box-shadow: ${poolsStudioColors.goldButtonGlow};
  }
`

export const PsSmallPrimaryBtn = styled(PsPrimaryBtn)`
  flex: 1;
  width: auto;
  min-width: 0;
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  border-radius: ${poolsStudioLayout.poolCardBtnRadius};
  padding: 0;
  font-size: 14px;

  &:hover {
    box-shadow: ${poolsStudioColors.goldButtonGlow};
  }
`

export const PsSmallGhostBtn = styled(PsGhostBtn)`
  flex: 1;
  width: auto;
  min-width: 0;
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  border-radius: ${poolsStudioLayout.poolCardBtnRadius};
  padding: 0;
  font-size: 14px;
`

export const PsSidebarCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  background: ${poolsStudioColors.card};
  border: 1px solid ${poolsStudioColors.border};
  border-radius: 18px;
  transition: border-color ${poolsStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }
`

export const PsKpiCard = styled.div`
  height: ${poolsStudioLayout.kpiHeight};
  min-height: ${poolsStudioLayout.kpiHeight};
  max-height: ${poolsStudioLayout.kpiHeight};
  border-radius: ${poolsStudioLayout.kpiRadius};
  border: 1px solid ${poolsStudioColors.border};
  background: ${poolsStudioColors.card};
  padding: ${poolsStudioLayout.kpiPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  transition: border-color ${poolsStudioLayout.hoverTransition} ease;
  min-width: 0;
  overflow: hidden;

  &:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }

  @media (max-width: 767px) {
    width: ${poolsStudioLayout.kpiMobileWidth};
    min-width: ${poolsStudioLayout.kpiMobileWidth};
    height: ${poolsStudioLayout.kpiMobileHeight};
    min-height: ${poolsStudioLayout.kpiMobileHeight};
    max-height: ${poolsStudioLayout.kpiMobileHeight};
    flex-shrink: 0;
  }
`

export const PsKpiLabel = styled.span`
  font-size: 12px;
  line-height: 14px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

export const PsKpiValue = styled.span<{ $gold?: boolean; $compact?: boolean; $green?: boolean }>`
  font-size: ${({ $compact }) => ($compact ? 18 : 34)}px;
  line-height: ${({ $compact }) => ($compact ? '22px' : '38px')};
  font-weight: 900;
  color: ${({ $gold, $green }) =>
    $green ? poolsStudioColors.aprGreen : $gold ? poolsStudioColors.gold : poolsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PsKpiSecondary = styled.span<{ $gold?: boolean }>`
  display: block;
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
  color: ${({ $gold }) => ($gold ? poolsStudioColors.gold : poolsStudioColors.mutedSecondary)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PsKpiDelta = styled.span<{ $positive?: boolean }>`
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  margin-left: ${poolsStudioLayout.kpiDeltaGap};
  color: ${({ $positive }) => ($positive ? poolsStudioColors.green : poolsStudioColors.red)};
`

export const PsMetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

export const PsMetricValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
`

export const PsField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const PsFieldLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

export const PsInput = styled.input`
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${poolsStudioColors.border};
  background: rgba(255, 255, 255, 0.03);
  color: ${poolsStudioColors.text};
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  box-sizing: border-box;
`

export const PoolTokenIcon: React.FC<{
  symbol: string
  size?: number
  offset?: boolean
  address?: string
  chainId?: number
}> = ({ symbol, size = 24, offset, address, chainId }) => (
  <span
    style={{
      marginLeft: offset ? -6 : 0,
      position: 'relative',
      zIndex: offset ? 1 : 2,
      flexShrink: 0,
      display: 'inline-flex',
    }}
  >
    <MelegaTokenAvatar
      name={symbol}
      symbol={symbol}
      size={size}
      address={isMarcoSymbol(symbol) ? MARCO_BSC_ADDRESS : address}
      chainId={isMarcoSymbol(symbol) ? MARCO_BSC_CHAIN_ID : chainId}
      radius="circle"
    />
  </span>
)
