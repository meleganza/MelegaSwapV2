import styled from 'styled-components'
import { Currency, TradeType } from '@pancakeswap/sdk'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { SMART_SWAP_PREVIEW_GAS_UNITS, useSmartSwapGasProtocolFeePreview } from 'lib/smart-swap-gas-protocol-fee'
import { useSmartRouterFeePanelContext } from './useSmartRouterFeePanelContext'

const Panel = styled.div`
  margin: 8px 16px 0;
  min-width: 0;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
`

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(92px, 0.7fr) minmax(0, 1.3fr);
  align-items: start;
  gap: 10px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.35;

  &:first-child {
    margin-top: 0;
  }
`

const Label = styled.span`
  color: #8f8f8f;
  min-width: 0;
`

const Value = styled.span`
  color: #e8e8e8;
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;
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

  if (!trade) return null

  return (
    <Panel data-d87-swap-fee-disclosure>
      <Row>
        <Label>Execution router</Label>
        <Value>{panel?.executionRouterLabel ?? 'PancakeSwap Smart Router'}</Value>
      </Row>
      <Row>
        <Label>Protocol fee</Label>
        <Value>{feePlan ? `~${feePlan.display.protocolFeeBnb} ${feePlan.fee.feeAsset}` : 'Unavailable'}</Value>
      </Row>
      <Row>
        <Label>Calculation</Label>
        <Value>25% of estimated gas · fixed at confirmation</Value>
      </Row>
      <Row>
        <Label>Collection</Label>
        <Value>Unavailable on this network</Value>
      </Row>
      <Row>
        <Label>LP fee</Label>
        <Value>Separate · paid to liquidity providers</Value>
      </Row>
    </Panel>
  )
}

export default DexSwapFeeDisclosure
