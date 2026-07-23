import React from 'react'
import styled from 'styled-components'
import LiquidityBuilderPanel from '../components/LiquidityBuilderPanel'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 610px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid ${liqOne.border};
  background: ${liqOne.card};
  overflow: hidden;

  @media (max-width: 767px) {
    min-height: 0;
  }

  /* Re-skin existing builder into one-page card */
  [data-ls-panel] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
`

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liqOne.gold};
  margin-bottom: 8px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 26px;
  line-height: 32px;
  font-weight: 750;
  color: ${liqOne.text};
`

const Desc = styled.p`
  margin: 8px 0 0;
  max-width: 340px;
  font-size: 14px;
  line-height: 21px;
  color: ${liqOne.bodySoft};
`

const Artwork = styled.div`
  pointer-events: none;
  position: absolute;
  right: 16px;
  top: 18px;
  width: 180px;
  height: 120px;
  opacity: 0.85;

  @media (max-width: 767px) {
    width: 110px;
    height: 72px;
    opacity: 0.4;
  }
`

const Disc = styled.div<{ $x: string; $y: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #2c2c2c, #121212);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
`

const Drop = styled.div`
  position: absolute;
  left: 46%;
  top: 38%;
  width: 34px;
  height: 34px;
  border-radius: 50% 50% 50% 8px;
  transform: rotate(45deg);
  background: radial-gradient(circle at 30% 30%, rgba(221, 185, 47, 0.55), rgba(221, 185, 47, 0.12));
  border: 1px solid rgba(221, 185, 47, 0.45);
`

const Plus = styled.div`
  position: absolute;
  left: 52%;
  top: 28%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${liqOne.gold};
  color: #111;
  font-size: 14px;
  font-weight: 800;
  display: grid;
  place-items: center;
  line-height: 1;
`

const Body = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 18px;
`

const PositionsAnchor = styled.button`
  appearance: none;
  display: block;
  width: 100%;
  margin-top: 12px;
  background: transparent;
  border: none;
  color: ${liqOne.gold};
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  text-align: center;
  padding: 8px;
`

type Props = {
  onViewPositions: () => void
}

/**
 * Manual Add Liquidity card — transaction lifecycle stays in-card via LiquidityBuilderPanel.
 */
export const AddLiquidityCard = React.forwardRef<HTMLElement, Props>(function AddLiquidityCard(
  { onViewPositions },
  ref,
) {
  return (
    <Card ref={ref as React.Ref<HTMLElement>} id="liq-add-card" data-testid="liq-one-add-card" data-ls-card-add-liquidity="true">
      <Eyebrow>MANUAL</Eyebrow>
      <Title>Add Liquidity</Title>
      <Desc>Add liquidity to an existing pool or create a new one. You will receive LP tokens.</Desc>
      <Artwork aria-hidden>
        <Disc $x="10%" $y="28%" />
        <Disc $x="48%" $y="18%" />
        <Drop />
        <Plus>+</Plus>
      </Artwork>
      <Body>
        <LiquidityBuilderPanel />
        <PositionsAnchor type="button" data-testid="liq-one-view-positions" onClick={onViewPositions}>
          View Your Positions ↓
        </PositionsAnchor>
      </Body>
    </Card>
  )
})

export default AddLiquidityCard
