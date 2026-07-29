import { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import { Currency, TradeType } from '@pancakeswap/sdk'
import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  formatProtocolFeePercent,
  resolveSwapProtocolFeeContext,
  SWAP_PROTOCOL_FEE_BUY_MARCO_BPS,
  SWAP_PROTOCOL_FEE_STANDARD_BPS,
} from 'lib/d87-pricing'
import {
  DEX_ECONOMIC_AUTHORITY,
  MELEGA_TREASURY_WALLET_ADDRESS,
  MELEGA_TREASURY_WALLET_LABEL,
} from 'config/dexEconomicAuthority'
import { MarcoBuyFeeIncentive } from './MarcoBuyFeeIncentive'
import { useSmartRouterFeePanelContext } from './useSmartRouterFeePanelContext'

const Panel = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #b8b8b8;
  margin-top: 6px;

  &:first-child {
    margin-top: 0;
  }
`

const Label = styled.span`
  color: #8f8f8f;
`

const Value = styled.span`
  color: #f2f2f2;
  text-align: right;
`

const Note = styled(Text)`
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #8f8f8f;
  line-height: 1.45;
`

const PricingLink = styled(Link)`
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: #F4C430;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

type Props = {
  trade?: {
    inputAmount: { currency: Currency }
    outputAmount: { currency: Currency }
    tradeType?: TradeType
  } | null
}

export function DexSwapFeeDisclosure({ trade }: Props) {
  const { chainId } = useActiveChainId()
  const panel = useSmartRouterFeePanelContext()
  const ctx = useMemo(
    () => (trade ? resolveSwapProtocolFeeContext(trade, chainId) : null),
    [trade, chainId],
  )

  if (!ctx) return null

  return (
    <Panel data-d87-swap-fee-disclosure>
      <Row>
        <Label>Execution Router</Label>
        <Value>{panel?.executionRouterLabel ?? 'PancakeSwap Smart Router'}</Value>
      </Row>
      <Row>
        <Label>Protocol Wrapper</Label>
        <Value>{panel?.protocolWrapperLabel ?? 'ADAPTER → WRAPPER (undeployed on mainnet)'}</Value>
      </Row>
      <Row>
        <Label>Protocol Fee (policy)</Label>
        <Value>
          {formatProtocolFeePercent(SWAP_PROTOCOL_FEE_STANDARD_BPS)} standard ·{' '}
          {formatProtocolFeePercent(SWAP_PROTOCOL_FEE_BUY_MARCO_BPS)} BUY MARCO
        </Value>
      </Row>
      <Row>
        <Label>Applied (policy)</Label>
        <Value>{formatProtocolFeePercent(ctx.protocolFeeBps)}</Value>
      </Row>
      <Row>
        <Label>LP Fee</Label>
        <Value>Separate — paid to liquidity providers</Value>
      </Row>
      <Row>
        <Label>Fee destination</Label>
        <Value>
          {MELEGA_TREASURY_WALLET_LABEL} ({MELEGA_TREASURY_WALLET_ADDRESS})
        </Value>
      </Row>
      <Row>
        <Label>Execution</Label>
        <Value>{DEX_ECONOMIC_AUTHORITY.executionModel}</Value>
      </Row>
      {ctx.buyMarcoApplied ? (
        <Note color="#F4C430">
          BUY MARCO incentive applied: protocol fee reduced to 0.20% (policy).
        </Note>
      ) : (
        <Note>Standard D87 protocol fee policy: 0.30%. Collection requires deployed wrapper.</Note>
      )}
      <Note>
        DEX-owned application fees route directly to {MELEGA_TREASURY_WALLET_LABEL}. LP fees remain with
        liquidity providers. Execution is non-custodial.
      </Note>
      <MarcoBuyFeeIncentive trade={trade ?? undefined} compact />
      <PricingLink href="/pricing-fees">Pricing &amp; Fees</PricingLink>
    </Panel>
  )
}

export default DexSwapFeeDisclosure
