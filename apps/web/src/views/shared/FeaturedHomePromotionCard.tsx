/**
 * Featured Home Rotation — product UX only (no payment / no on-chain settle).
 * Price 99 USD · 7 days · BNB / USDT / USDC / MARCO · 5% M-Credits cashback on MARCO.
 */
import React, { useState } from 'react'
import styled from 'styled-components'

const Card = styled.section`
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%, rgba(244, 196, 48, 0.12), transparent 55%),
    linear-gradient(165deg, rgba(22, 20, 12, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #f5f5f5;
  line-height: 20px;
`

const Meta = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 17px;
  color: #a8a8a8;
`

const Price = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  align-items: baseline;
`

const PriceMain = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #f2c84c;
  letter-spacing: -0.02em;
`

const PriceSub = styled.span`
  font-size: 12px;
  font-weight: 650;
  color: #c8c8c8;
`

const PayRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(244, 196, 48, 0.7)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $on }) => ($on ? 'rgba(244, 196, 48, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $on }) => ($on ? '#f2c84c' : '#e8e8e8')};
  font-size: 12px;
  font-weight: 700;

  &:focus-visible {
    outline: 2px solid #f2c84c;
    outline-offset: 2px;
  }
`

const Toggle = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  line-height: 18px;
  color: #e8e8e8;
  font-weight: 600;

  input {
    margin-top: 2px;
    accent-color: #f2c84c;
  }
`

const Note = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: #8f8f8f;
`

const PAYMENTS = ['BNB', 'USDT', 'USDC', 'MARCO'] as const
export type FeaturedHomePayAsset = (typeof PAYMENTS)[number]

type Props = {
  /** Controlled opt-in when embedded in List forms */
  selected?: boolean
  onSelectedChange?: (next: boolean) => void
  payAsset?: FeaturedHomePayAsset
  onPayAssetChange?: (asset: FeaturedHomePayAsset) => void
  compact?: boolean
  testId?: string
}

export const FeaturedHomePromotionCard: React.FC<Props> = ({
  selected: controlledSelected,
  onSelectedChange,
  payAsset: controlledPay,
  onPayAssetChange,
  compact = false,
  testId = 'featured-home-promotion',
}) => {
  const [localSelected, setLocalSelected] = useState(false)
  const [localPay, setLocalPay] = useState<FeaturedHomePayAsset>('BNB')
  const selected = controlledSelected ?? localSelected
  const pay = controlledPay ?? localPay

  const setSelected = (next: boolean) => {
    onSelectedChange?.(next)
    if (controlledSelected === undefined) setLocalSelected(next)
  }
  const setPay = (asset: FeaturedHomePayAsset) => {
    onPayAssetChange?.(asset)
    if (controlledPay === undefined) setLocalPay(asset)
  }

  return (
    <Card data-testid={testId} data-featured-home-promo="ux-only" data-compact={compact ? '1' : '0'}>
      <Title>Featured Home Rotation</Title>
      <Meta>
        Promote this project into the Home Featured Projects rotation for seven days. Product selection
        only — payment is not processed on this screen.
      </Meta>
      <Price>
        <PriceMain>99 USD</PriceMain>
        <PriceSub>7 days rotation</PriceSub>
      </Price>
      <PayRow aria-label="Accepted payment assets">
        {PAYMENTS.map((asset) => (
          <Chip
            key={asset}
            type="button"
            $on={pay === asset}
            onClick={() => setPay(asset)}
            data-testid={`${testId}-pay-${asset.toLowerCase()}`}
          >
            {asset}
          </Chip>
        ))}
      </PayRow>
      {pay === 'MARCO' ? (
        <Note data-testid={`${testId}-marco-cashback`}>5% cashback in M-Credits when paying with MARCO.</Note>
      ) : (
        <Note>Accepted: BNB · USDT · USDC · MARCO</Note>
      )}
      <Toggle>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => setSelected(e.target.checked)}
          data-testid={`${testId}-opt-in`}
        />
        <span>Add Featured Home Rotation to this project flow</span>
      </Toggle>
      <Note>No on-chain payment in this step. Checkout will be wired when settlement is ready.</Note>
    </Card>
  )
}

export default FeaturedHomePromotionCard
