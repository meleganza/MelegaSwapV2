/**
 * Payment Router asset + package picker (Featured / Trend Boost / create add-ons).
 */
import React from 'react'
import styled from 'styled-components'
import { RC_COPY } from 'lib/monetization/copy'
import type { MonetizationAsset, PlacementPackage } from 'lib/monetization/packages'
import { MONETIZATION_ASSETS } from 'lib/monetization/packages'

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
`

const Price = styled.div`
  font-size: 12px;
  color: #cfcfcf;
`

type Props = {
  packages?: readonly PlacementPackage[]
  packageId?: string
  onPackageChange?: (id: string) => void
  asset: MonetizationAsset
  onAssetChange: (asset: MonetizationAsset) => void
  acceptedAssets?: readonly MonetizationAsset[]
  testId?: string
}

export const PaymentRouterPicker: React.FC<Props> = ({
  packages,
  packageId,
  onPackageChange,
  asset,
  onAssetChange,
  acceptedAssets = MONETIZATION_ASSETS,
  testId = 'payment-router-picker',
}) => {
  const selected = packages?.find((p) => p.id === packageId) ?? packages?.find((p) => p.isDefault)
  return (
    <Block data-testid={testId}>
      {packages && packages.length > 0 && onPackageChange ? (
        <>
          <Label>{RC_COPY.packageLabel}</Label>
          <Row aria-label="Packages">
            {packages.map((p) => (
              <Chip
                key={p.id}
                type="button"
                $on={packageId === p.id || (!packageId && p.isDefault)}
                onClick={() => onPackageChange(p.id)}
                data-testid={`${testId}-pkg-${p.id}`}
              >
                {p.shortLabel}
              </Chip>
            ))}
          </Row>
          {selected ? (
            <Price data-testid={`${testId}-price`}>
              ${selected.usdPrice} · {selected.durationLabel}
            </Price>
          ) : null}
        </>
      ) : null}
      <Label>{RC_COPY.payWith}</Label>
      <Row aria-label="Payment assets">
        {acceptedAssets.map((a) => (
          <Chip
            key={a}
            type="button"
            $on={asset === a}
            onClick={() => onAssetChange(a)}
            data-testid={`${testId}-pay-${a.toLowerCase()}`}
          >
            {a}
          </Chip>
        ))}
      </Row>
    </Block>
  )
}

export default PaymentRouterPicker
