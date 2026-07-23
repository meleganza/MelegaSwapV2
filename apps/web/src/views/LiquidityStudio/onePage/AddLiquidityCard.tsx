import React from 'react'
import styled from 'styled-components'
import LiquidityBuilderPanel from '../components/LiquidityBuilderPanel'
import { liqOne } from './onePageTokens'

const Card = styled.section`
  width: 100%;
  height: ${liqOne.addH};
  min-height: ${liqOne.addH};
  max-height: ${liqOne.addH};
  box-sizing: border-box;
  padding: 0;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid ${liqOne.border};
  background: ${liqOne.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${liqOne.font};

  @media (max-width: 1375px) {
    height: auto;
    min-height: 0;
    max-height: none;
  }

  [data-ls-panel] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    height: 100%;
  }
`

const Art = styled.div`
  flex: 0 0 ${liqOne.addArtH};
  height: ${liqOne.addArtH};
  min-height: ${liqOne.addArtH};
  max-height: ${liqOne.addArtH};
  position: relative;
  padding: 16px 20px 0;
  box-sizing: border-box;
  overflow: hidden;
`

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liqOne.gold};
`

const Title = styled.h2`
  margin: 6px 0 0;
  font-size: 24px;
  line-height: 30px;
  font-weight: 750;
  color: ${liqOne.text};
`

const Desc = styled.p`
  margin: 6px 0 0;
  max-width: 320px;
  font-size: 13px;
  line-height: 18px;
  color: ${liqOne.bodySoft};
`

const Artwork = styled.div`
  pointer-events: none;
  position: absolute;
  right: 16px;
  top: 12px;
  width: 140px;
  height: 96px;
`

const Disc = styled.div<{ $x: string; $y: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #2c2c2c, #121212);
  border: 1px solid rgba(255, 255, 255, 0.08);
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

const Form = styled.div`
  flex: 0 0 ${liqOne.addFormH};
  height: ${liqOne.addFormH};
  min-height: ${liqOne.addFormH};
  max-height: ${liqOne.addFormH};
  overflow: auto;
  overflow-x: hidden;
  padding: 0 20px;
  box-sizing: border-box;
`

const Cta = styled.div`
  flex: 0 0 ${liqOne.addCtaH};
  height: ${liqOne.addCtaH};
  min-height: ${liqOne.addCtaH};
  max-height: ${liqOne.addCtaH};
  padding: 8px 20px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
`

const PositionsAnchor = styled.button`
  appearance: none;
  display: block;
  width: 100%;
  margin-top: 8px;
  background: transparent;
  border: none;
  color: ${liqOne.gold};
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  font-family: ${liqOne.font};
`

type Props = {
  onViewPositions: () => void
}

export const AddLiquidityCard = React.forwardRef<HTMLElement, Props>(function AddLiquidityCard(
  { onViewPositions },
  ref,
) {
  return (
    <Card
      ref={ref as React.Ref<HTMLElement>}
      id="liq-add-card"
      data-testid="liq-one-add-card"
      data-ls-card-add-liquidity="true"
      data-pixel-add="520"
    >
      <Art>
        <Eyebrow>MANUAL</Eyebrow>
        <Title>Add Liquidity</Title>
        <Desc>Add liquidity to an existing pool or create a new one. You will receive LP tokens.</Desc>
        <Artwork aria-hidden>
          <Disc $x="10%" $y="28%" />
          <Disc $x="38%" $y="18%" />
          <Plus>+</Plus>
        </Artwork>
      </Art>
      <Form data-testid="liq-add-form">
        <LiquidityBuilderPanel />
      </Form>
      <Cta>
        <PositionsAnchor type="button" onClick={onViewPositions}>
          View Your Positions →
        </PositionsAnchor>
      </Cta>
    </Card>
  )
})

export default AddLiquidityCard
