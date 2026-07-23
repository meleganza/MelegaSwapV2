import React, { useRef } from 'react'
import styled from 'styled-components'
import LiquidityBuildingPanel from '../components/LiquidityBuildingPanel'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  position: relative;
  width: 100%;
  min-width: 0;
  padding: 20px;
  box-sizing: border-box;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid ${liqOne.goldBorder};
  background:
    radial-gradient(circle at 86% 18%, rgba(221, 185, 47, 0.14) 0%, rgba(221, 185, 47, 0.03) 32%, transparent 55%),
    ${liqOne.card};
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.35),
    0 0 34px rgba(221, 185, 47, 0.06);
  overflow: hidden;

  /* Compact existing LB product chrome into the one-page card */
  [data-liquidity-building-panel] {
    max-width: none;
    margin: 0;
    padding-bottom: 8px;
  }

  /* Suppress redundant chrome: back link + giant env/status chips */
  [data-liquidity-building-panel] [data-testid='lb-back-to-studio'],
  [data-liquidity-building-panel] [data-testid='lb-env-badge'],
  [data-liquidity-building-panel] [data-testid='lb-product-state-badge'] {
    display: none !important;
  }
`

const Artwork = styled.div`
  pointer-events: none;
  position: absolute;
  right: 18px;
  top: 48px;
  width: 230px;
  height: 205px;
  opacity: 0.9;

  @media (max-width: 1100px) {
    width: 160px;
    height: 140px;
    opacity: 0.55;
  }

  @media (max-width: 767px) {
    width: 120px;
    height: 100px;
    top: 36px;
    right: 10px;
    opacity: 0.35;
  }
`

const Orbit = styled.div`
  position: absolute;
  inset: 18% 12%;
  border-radius: 50%;
  border: 1px solid rgba(221, 185, 47, 0.35);
  box-shadow: inset 0 0 24px rgba(221, 185, 47, 0.08);
`

const Orbit2 = styled(Orbit)`
  inset: 28% 22%;
  border-color: rgba(221, 185, 47, 0.22);
  transform: rotate(18deg);
`

const Disc = styled.div<{ $x: string; $y: string; $c: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #2a2a2a, #101010);
  border: 1px solid ${({ $c }) => $c};
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
`

const PoolGlow = styled.div`
  position: absolute;
  left: 42%;
  bottom: 18%;
  width: 54px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(221, 185, 47, 0.35), transparent 70%);
`

type Props = {
  focusToken?: string
}

/**
 * Liquidity Building product card — full lifecycle stays inside this card.
 * Reuses certified LiquidityBuildingPanel (setup / review / status / manage).
 */
export const LiquidityBuildingCard = React.forwardRef<HTMLElement, Props>(function LiquidityBuildingCard(
  _props,
  ref,
) {
  const localRef = useRef<HTMLElement | null>(null)

  return (
    <Card
      ref={(node) => {
        localRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      id="liq-building-card"
      data-testid="liq-one-building-card"
      data-ls-card-liquidity-building="true"
    >
      <Artwork aria-hidden>
        <Orbit />
        <Orbit2 />
        <Disc $x="18%" $y="22%" $c="rgba(221,185,47,0.7)" />
        <Disc $x="58%" $y="38%" $c="rgba(22,217,119,0.55)" />
        <Disc $x="38%" $y="58%" $c="rgba(91,140,255,0.55)" />
        <PoolGlow />
      </Artwork>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <LiquidityBuildingPanel />
      </div>
    </Card>
  )
})

export default LiquidityBuildingCard
