import { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import { Currency, TradeType } from '@pancakeswap/sdk'
import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  DEX_ECONOMIC_AUTHORITY,
  MELEGA_TREASURY_WALLET_ADDRESS,
  MELEGA_TREASURY_WALLET_LABEL,
} from 'config/dexEconomicAuthority'
import { SMART_SWAP_PREVIEW_GAS_UNITS, useSmartSwapGasProtocolFeePreview } from 'lib/smart-swap-gas-protocol-fee'
import { useSmartRouterFeePanelContext } from './useSmartRouterFeePanelContext'

const Panel = styled.div`
  margin-top: 10px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  min-width: 0;
`

const Value = styled.span`
  color: #f2f2f2;
  text-align: right;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
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
  const feePlan = useSmartSwapGasProtocolFeePreview(SMART_SWAP_PREVIEW_GAS_UNITS, chainId)
  const ctx = useMemo(() => (trade ? { ready: true } : null), [trade])

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
        <Label>Protocol Fee</Label>
        <Value>{feePlan ? `~${feePlan.display.protocolFeeBnb} ${feePlan.fee.feeAsset}` : '—'}</Value>
      </Row>
      <Row>
        <Label>Calculation</Label>
        <Value>25% of estimated gas · finalized at confirmation</Value>
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
      <Note>Collection status: Not collected — the atomic protocol wrapper is not deployed on mainnet.</Note>
      <Note>
        DEX-owned application fees route directly to {MELEGA_TREASURY_WALLET_LABEL}. LP fees remain with
        liquidity providers. Execution is non-custodial.
      </Note>
      <PricingLink href="/pricing-fees">Pricing &amp; Fees</PricingLink>
    </Panel>
  )
}

export default DexSwapFeeDisclosure
