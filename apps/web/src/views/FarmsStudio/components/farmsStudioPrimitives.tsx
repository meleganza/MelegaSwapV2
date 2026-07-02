import styled from 'styled-components'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'

export const FsPanel = styled.div<{ $height?: string; $width?: string }>`
  width: ${({ $width }) => $width || '100%'};
  max-width: 100%;
  box-sizing: border-box;
  background: ${farmsStudioColors.panel};
  border: 1px solid ${farmsStudioColors.border};
  border-radius: 18px;
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

export const FsPanelTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 28px;
  font-weight: 800;
  line-height: 32px;
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
  height: 44px;
  min-height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%);
  color: #050505;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 140ms ease, filter 140ms ease;

  &:hover {
    filter: brightness(1.06);
    transform: translateY(-1px) scale(1.01);
  }
`

export const FsGhostBtn = styled.button`
  height: 44px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${farmsStudioColors.goldBorder};
  background: transparent;
  color: ${farmsStudioColors.goldBright};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 140ms ease, filter 140ms ease, border-color 140ms ease;

  &:hover {
    filter: brightness(1.06);
    border-color: ${farmsStudioColors.gold};
    transform: translateY(-1px) scale(1.01);
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
  font-size: 18px;
  font-weight: 700;
  color: ${farmsStudioColors.text};
  line-height: 1;
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
  border-radius: 18px;
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
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: ${({ $gold }) => ($gold ? farmsStudioColors.gold : farmsStudioColors.text)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const FsKpiDelta = styled.span<{ $positive?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $positive }) => ($positive ? farmsStudioColors.green : farmsStudioColors.red)};
`
