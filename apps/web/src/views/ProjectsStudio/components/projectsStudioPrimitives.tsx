import React from 'react'
import styled from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'

export const PrPanel = styled.div<{ $height?: string; $radius?: string }>`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: ${projectsStudioColors.panelGradient};
  border: 1px solid ${projectsStudioColors.border};
  border-radius: ${({ $radius }) => $radius || projectsStudioLayout.cardRadius};
  padding: 18px;
  overflow: hidden;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}
`

export const PrCard = styled.article`
  background: ${projectsStudioColors.panelGradient};
  border: 1px solid ${projectsStudioColors.border};
  border-radius: ${projectsStudioLayout.cardRadius};
  box-sizing: border-box;
`

export const PrPreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${projectsStudioColors.gold};
  background: ${projectsStudioColors.previewBadgeBg};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${projectsStudioColors.goldBright};
  white-space: nowrap;
`

export const PrPrimaryBtn = styled.button`
  height: ${projectsStudioLayout.btnHeight};
  min-height: ${projectsStudioLayout.btnHeight};
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%);
  color: #050505;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 180ms ease, filter 180ms ease;

  &:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }
`

export const PrGhostBtn = styled.button`
  height: ${projectsStudioLayout.btnHeight};
  min-height: ${projectsStudioLayout.btnHeight};
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.goldBorder};
  background: transparent;
  color: ${projectsStudioColors.goldBright};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, filter 180ms ease, border-color 180ms ease;

  &:hover {
    filter: brightness(1.05);
    border-color: ${projectsStudioColors.gold};
    transform: translateY(-1px);
  }
`

export const PrSmallPrimaryBtn = styled(PrPrimaryBtn)`
  width: ${projectsStudioLayout.tradeBtnWidth};
  min-width: ${projectsStudioLayout.tradeBtnWidth};
  padding: 0;
`

export const PrSmallGhostBtn = styled(PrGhostBtn)`
  width: ${projectsStudioLayout.openBtnWidth};
  min-width: ${projectsStudioLayout.openBtnWidth};
  padding: 0;
`

export const PrFollowBtn = styled.button`
  width: ${projectsStudioLayout.followBtnWidth};
  min-width: ${projectsStudioLayout.followBtnWidth};
  height: ${projectsStudioLayout.btnHeight};
  min-height: ${projectsStudioLayout.btnHeight};
  border: none;
  border-radius: 12px;
  background: transparent;
  color: ${projectsStudioColors.secondary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, color 180ms ease;

  &:hover {
    color: ${projectsStudioColors.text};
    transform: translateY(-1px);
  }
`

export const PrKpiCard = styled.div`
  height: ${projectsStudioLayout.kpiHeight};
  min-height: ${projectsStudioLayout.kpiHeight};
  border-radius: ${projectsStudioLayout.cardRadius};
  border: 1px solid ${projectsStudioColors.border};
  background: ${projectsStudioColors.panelGradient};
  padding: 14px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  position: relative;
`

export const PrKpiLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

export const PrKpiValue = styled.span<{ $gold?: boolean }>`
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: ${({ $gold }) => ($gold ? projectsStudioColors.gold : projectsStudioColors.text)};
  white-space: nowrap;
`

export const PrKpiDelta = styled.span<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  margin-left: ${projectsStudioLayout.kpiDeltaGap};
  color: ${({ $positive }) => ($positive ? projectsStudioColors.green : projectsStudioColors.red)};
`

export const PrMetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

export const PrMetricValue = styled.span<{ $tone?: 'green' | 'gold' | 'red' | 'gray' }>`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  word-break: break-word;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? projectsStudioColors.green
      : $tone === 'gold'
        ? projectsStudioColors.gold
        : $tone === 'red'
          ? projectsStudioColors.red
          : $tone === 'gray'
            ? projectsStudioColors.muted
            : projectsStudioColors.text};
`

export const ProjectLogo: React.FC<{ name: string; symbol?: string; size?: number }> = ({
  name,
  symbol,
  size = 48,
}) => {
  const isMarco = symbol === 'MARCO' || name === 'MARCO'
  if (isMarco) {
    return (
      <span style={{ flexShrink: 0, display: 'inline-flex', borderRadius: 12, overflow: 'hidden' }}>
        <MelegaLogoSvg size={size} />
      </span>
    )
  }

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        border: `1px solid ${projectsStudioColors.borderStrong}`,
        background: projectsStudioColors.panel,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.36,
        fontWeight: 800,
        color: projectsStudioColors.goldBright,
      }}
    >
      {name.slice(0, 1)}
    </span>
  )
}
