import React from 'react'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'
import {
  PR_FONT_BODY,
  projectsStudioColors,
  projectsStudioLayout,
  projectsStudioType,
} from '../projectsStudioTokens'

export const PrPanel = styled.section`
  width: 100%;
  box-sizing: border-box;
  background: ${projectsStudioColors.card};
  border: 1px solid ${projectsStudioColors.cardBorder};
  border-radius: ${projectsStudioLayout.cardRadius};
  transition: border-color 180ms ease;

  &:hover {
    border-color: ${projectsStudioColors.cardBorderHover};
  }
`

export const PrPrimaryBtn = styled.button`
  width: ${projectsStudioType.headerPrimaryW};
  height: ${projectsStudioType.headerPrimaryH};
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: ${projectsStudioColors.gold};
  color: #050505;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
`

export const PrGhostBtn = styled.button`
  width: ${projectsStudioType.headerPrimaryW};
  height: ${projectsStudioType.headerPrimaryH};
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.gold};
  background: transparent;
  color: ${projectsStudioColors.gold};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`

export const PrFeaturedPrimaryBtn = styled.a`
  width: 100%;
  max-width: ${projectsStudioLayout.projectBtnWidth};
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  background: ${projectsStudioColors.gold};
  color: #050505;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
`

export const PrFeaturedOutlineBtn = styled.a`
  width: 100%;
  max-width: ${projectsStudioLayout.projectBtnWidth};
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.gold};
  background: transparent;
  color: ${projectsStudioColors.gold};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
`

export const PrFeaturedOutlineBtnDisabled = styled.span`
  width: 100%;
  max-width: ${projectsStudioLayout.projectBtnWidth};
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.gold};
  background: transparent;
  color: ${projectsStudioColors.secondary};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`

export const PrCardOutlineBtnDisabled = styled.span`
  flex: 1;
  min-width: 0;
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.gold};
  background: transparent;
  color: ${projectsStudioColors.secondary};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`

export const PrCardPrimaryBtn = styled.a`
  flex: 1;
  min-width: 0;
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 12px;
  border: none;
  border-radius: 12px;
  background: ${projectsStudioColors.gold};
  color: #050505;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
`

export const PrCardOutlineBtn = styled.a`
  flex: 1;
  min-width: 0;
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.gold};
  background: transparent;
  color: ${projectsStudioColors.gold};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
`

export const PrCardFollowBtn = styled.button`
  flex: 1;
  min-width: 0;
  height: ${projectsStudioLayout.projectBtnHeight};
  padding: 0 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: ${projectsStudioColors.gold};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`

export const PrKpiCard = styled.div`
  height: ${projectsStudioLayout.kpiHeight};
  min-height: ${projectsStudioLayout.kpiHeight};
  border-radius: ${projectsStudioLayout.cardRadius};
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.card};
  padding: ${projectsStudioLayout.kpiPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  transition: border-color 180ms ease;

  &:hover {
    border-color: ${projectsStudioColors.cardBorderHover};
  }
`

export const PrKpiLabel = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: ${projectsStudioType.kpiLabel};
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

export const PrKpiValue = styled.span<{ $muted?: boolean }>`
  font-family: ${PR_FONT_BODY};
  font-size: ${projectsStudioType.kpiMetric};
  font-weight: 700;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  color: ${({ $muted }) => ($muted ? projectsStudioColors.secondary : projectsStudioColors.text)};
`

export const PrKpiSubline = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  color: ${projectsStudioColors.muted};
`

export const PrMetricLabel = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

export const PrMetricValue = styled.span<{ $muted?: boolean; $tone?: 'green' | 'gold' | 'red' | 'gray' }>`
  font-family: ${PR_FONT_BODY};
  font-size: ${({ $muted, $tone }) => ($muted || $tone === 'gray' ? '13px' : '14px')};
  font-weight: ${({ $muted, $tone }) => ($muted || $tone === 'gray' ? 500 : 600)};
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $muted, $tone }) =>
    $muted || $tone === 'gray'
      ? projectsStudioColors.secondary
      : $tone === 'green'
        ? projectsStudioColors.green
        : $tone === 'gold'
          ? projectsStudioColors.gold
          : $tone === 'red'
            ? projectsStudioColors.red
            : projectsStudioColors.text};
`

export const ProjectLogo: React.FC<{
  name: string
  symbol?: string
  size?: number
  address?: string
  chainId?: number
}> = ({ name, symbol, size = 48, address, chainId }) => (
  <MelegaTokenAvatar
    name={name}
    symbol={symbol}
    size={size}
    address={address ?? (symbol?.toUpperCase() === 'MARCO' ? MARCO_BSC_ADDRESS : undefined)}
    chainId={chainId ?? (symbol?.toUpperCase() === 'MARCO' ? MARCO_BSC_CHAIN_ID : undefined)}
    radius="circle"
  />
)
