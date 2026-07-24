/**
 * PASSPORT_MODULE_005 — desktop table row + mobile card for one position.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PassportLiquidityPosition } from './passportLiquidityTypes'

const Tr = styled.tr`
  height: 68px;

  &:hover td {
    background: rgba(255, 255, 255, 0.018);
  }

  td {
    transition: background 120ms ease;
    vertical-align: middle;
    padding: 0 8px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  td:first-child {
    padding-left: 0;
  }
  td:last-child {
    padding-right: 0;
  }
`

const PairCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 300px;
`

const Logos = styled.div`
  position: relative;
  width: 52px;
  height: 30px;
  flex-shrink: 0;
`

const Logo = styled.div`
  position: absolute;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.gold};
  font-size: 9px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:first-child {
    left: 0;
    z-index: 2;
  }
  &:last-child {
    left: 22px;
    z-index: 1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const PairMeta = styled.div`
  min-width: 0;
`

const PairTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PairSub = styled.div`
  font-size: 11px;
  line-height: 15px;
  color: ${passportOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TypeBadge = styled.span<{ $lb?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
  ${({ $lb }) =>
    $lb
      ? `
    color: ${passportOne.gold};
    background: rgba(221,185,47,0.1);
    border: 1px solid rgba(221,185,47,0.28);
  `
      : `
    color: ${passportOne.secondary};
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  `}
`

const ValuePrimary = styled.div`
  font-size: 14px;
  line-height: 19px;
  font-weight: 700;
  color: ${passportOne.text};
`

const ValueSub = styled.div`
  font-size: 10px;
  line-height: 14px;
  color: ${passportOne.muted};
  margin-top: 2px;
`

const StatusPill = styled.span<{ $tone: PassportLiquidityPosition['statusTone'] }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
  ${({ $tone }) => {
    if ($tone === 'active')
      return `color:#0d3d24;background:rgba(22,217,119,0.18);border:1px solid rgba(22,217,119,0.35);`
    if ($tone === 'action')
      return `color:${passportOne.gold};background:rgba(221,185,47,0.12);border:1px solid rgba(221,185,47,0.35);`
    if ($tone === 'danger')
      return `color:#F04F5F;background:rgba(240,79,95,0.12);border:1px solid rgba(240,79,95,0.35);`
    return `color:${passportOne.secondary};background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);`
  }}
`

const Manage = styled(Link)`
  width: 96px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Card = styled.article`
  width: 326px;
  max-width: 100%;
  min-height: 176px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid ${passportOne.border};
  background: ${passportOne.card};
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
`

const Metric = styled.div`
  min-width: 0;
`

const MetricLabel = styled.div`
  font-size: 10px;
  line-height: 14px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const MetricValue = styled.div`
  margin-top: 2px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
`

const ManageFull = styled(Link)`
  margin-top: auto;
  width: 100%;
  height: 40px;
  border-radius: 9px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

function TokenMarks({ position }: { position: PassportLiquidityPosition }) {
  const mark = (sym: string, url: string | null, side: 'a' | 'b') => (
    <Logo aria-hidden={!url && !sym ? true : undefined}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`${sym} logo`} />
      ) : (
        <span aria-hidden="true">{(sym || '?').slice(0, 2)}</span>
      )}
    </Logo>
  )
  return (
    <Logos>
      {mark(position.token0Symbol, position.token0LogoUrl, 'a')}
      {mark(position.token1Symbol, position.token1LogoUrl, 'b')}
    </Logos>
  )
}

const freshnessLabel: Record<string, string> = {
  indexed: 'Indexed',
  partial: 'Partial valuation',
  unavailable: 'Valuation unavailable',
  stale: 'Stale',
}

export const PassportLiquidityDesktopRow: React.FC<{ position: PassportLiquidityPosition }> = ({
  position,
}) => (
  <Tr data-testid="passport-liquidity-row" data-position-id={position.id} data-type={position.type}>
    <td>
      <PairCell>
        <TokenMarks position={position} />
        <PairMeta>
          <PairTitle>{position.pairLabel}</PairTitle>
          <PairSub>{position.supportingLine}</PairSub>
        </PairMeta>
      </PairCell>
    </td>
    <td style={{ width: 160 }}>
      <TypeBadge $lb={position.type === 'Liquidity Building'}>{position.type}</TypeBadge>
    </td>
    <td style={{ width: 180 }}>
      <ValuePrimary>{position.estimatedValue}</ValuePrimary>
      {position.estimatedValueState !== 'indexed' ? (
        <ValueSub>{freshnessLabel[position.estimatedValueState]}</ValueSub>
      ) : null}
    </td>
    <td style={{ width: 180 }}>
      <ValuePrimary>{position.sharePrimary}</ValuePrimary>
      {position.shareSecondary ? <ValueSub>{position.shareSecondary}</ValueSub> : null}
    </td>
    <td style={{ width: 180 }}>
      <ValuePrimary>{position.feesOrProgressValue}</ValuePrimary>
      <ValueSub>{position.feesOrProgressLabel}</ValueSub>
    </td>
    <td style={{ width: 156 }}>
      <StatusPill $tone={position.statusTone}>{position.status}</StatusPill>
    </td>
    <td style={{ width: 180 }}>
      <Manage href={position.actionHref} aria-label={position.actionAriaLabel}>
        {position.actionLabel}
        <span aria-hidden="true">›</span>
      </Manage>
    </td>
  </Tr>
)

export const PassportLiquidityMobileCard: React.FC<{ position: PassportLiquidityPosition }> = ({
  position,
}) => (
  <Card data-testid="passport-liquidity-mobile-card" data-position-id={position.id}>
    <CardTop>
      <PairCell style={{ width: 'auto', flex: 1 }}>
        <TokenMarks position={position} />
        <PairMeta>
          <PairTitle>{position.pairLabel}</PairTitle>
        </PairMeta>
      </PairCell>
      <StatusPill $tone={position.statusTone}>{position.status}</StatusPill>
    </CardTop>
    <TypeBadge $lb={position.type === 'Liquidity Building'}>{position.type}</TypeBadge>
    <Metrics>
      <Metric>
        <MetricLabel>Estimated Value</MetricLabel>
        <MetricValue>{position.estimatedValue}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>Your Share</MetricLabel>
        <MetricValue>{position.sharePrimary}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>{position.feesOrProgressLabel}</MetricLabel>
        <MetricValue>{position.feesOrProgressValue}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>Chain</MetricLabel>
        <MetricValue>{position.chainLabel}</MetricValue>
      </Metric>
    </Metrics>
    <ManageFull href={position.actionHref} aria-label={position.actionAriaLabel}>
      {position.actionLabel}
    </ManageFull>
  </Card>
)
