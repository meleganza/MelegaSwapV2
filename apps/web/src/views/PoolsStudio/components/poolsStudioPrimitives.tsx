import React from 'react'
import styled from 'styled-components'
import { MARCO_LOGO_URI } from 'design-system/melega'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'

export const PsPanel = styled.div<{ $height?: string; $radius?: string }>`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: ${poolsStudioColors.panel};
  border: 1px solid ${poolsStudioColors.border};
  border-radius: ${({ $radius }) => $radius || '20px'};
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

export const PsCard = styled.div`
  background: ${poolsStudioColors.card};
  border: 1px solid ${poolsStudioColors.border};
  border-radius: 18px;
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
  height: 42px;
  min-height: 42px;
  padding: 0 24px;
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
  transition: transform 150ms ease, filter 150ms ease, box-shadow 150ms ease;

  &:hover {
    filter: brightness(1.06);
    transform: translateY(-1px) scale(0.99);
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.35);
  }
`

export const PsGhostBtn = styled.button`
  height: 42px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${poolsStudioColors.goldBorder};
  background: transparent;
  color: ${poolsStudioColors.goldBright};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, border-color 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.gold};
    transform: translateY(-1px) scale(0.99);
  }
`

export const PsSmallPrimaryBtn = styled(PsPrimaryBtn)`
  width: ${poolsStudioLayout.poolCardStakeWidth};
  min-width: ${poolsStudioLayout.poolCardStakeWidth};
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  padding: 0;
  font-size: 14px;
`

export const PsSmallGhostBtn = styled(PsGhostBtn)`
  width: ${poolsStudioLayout.poolCardAnalyzeWidth};
  min-width: ${poolsStudioLayout.poolCardAnalyzeWidth};
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  padding: 0;
  font-size: 14px;
`

export const PsKpiCard = styled.div`
  height: ${poolsStudioLayout.kpiHeight};
  min-height: ${poolsStudioLayout.kpiHeight};
  border-radius: 20px;
  border: 1px solid ${poolsStudioColors.border};
  background: ${poolsStudioColors.panel};
  padding: 14px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  position: relative;
`

export const PsKpiLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

export const PsKpiValue = styled.span<{ $gold?: boolean }>`
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  color: ${({ $gold }) => ($gold ? poolsStudioColors.gold : poolsStudioColors.text)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PsKpiDelta = styled.span<{ $positive?: boolean }>`
  font-size: 12px;
  font-weight: 700;
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

const TokenImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`

export const PoolTokenIcon: React.FC<{ symbol: string; size?: number; offset?: boolean; logoUri?: string }> = ({
  symbol,
  size = 24,
  offset,
  logoUri,
}) => {
  const uri = logoUri || (symbol === 'MARCO' ? MARCO_LOGO_URI : undefined)
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${poolsStudioColors.border}`,
        background: poolsStudioColors.card,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: offset ? -6 : 0,
        position: 'relative',
        zIndex: offset ? 1 : 2,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {uri ? (
        <TokenImg src={uri} alt={symbol} />
      ) : (
        <span style={{ fontSize: size * 0.38, fontWeight: 800, color: poolsStudioColors.goldBright }}>
          {symbol.slice(0, 1)}
        </span>
      )}
    </span>
  )
}
