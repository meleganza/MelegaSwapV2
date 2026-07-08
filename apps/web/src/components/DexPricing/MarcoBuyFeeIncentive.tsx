import { Currency, Trade, TradeType } from '@pancakeswap/sdk'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import {
  formatProtocolFeePercent,
  getMarcoBuyIncentiveShortCopy,
  getSwapProtocolFeeBps,
  isBuyMarcoSwap,
} from 'lib/d87-pricing'
import { useActiveChainId } from 'hooks/useActiveChainId'

const Banner = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.08);
`

type Props = {
  trade?: Trade<Currency, Currency, TradeType> | null
  outputAddress?: string | null
  outputSymbol?: string | null
  compact?: boolean
}

export function MarcoBuyFeeIncentive({ trade, outputAddress, outputSymbol, compact }: Props) {
  const { chainId } = useActiveChainId()
  const resolvedSymbol = trade?.outputAmount.currency.symbol ?? outputSymbol ?? undefined
  const resolvedAddress = trade?.outputAmount.currency.isNative
    ? undefined
    : trade?.outputAmount.currency.wrapped.address ?? outputAddress ?? undefined

  const buyMarco = isBuyMarcoSwap({ chainId, outputAddress: resolvedAddress, outputSymbol: resolvedSymbol })
  if (!buyMarco) return null

  const bps = getSwapProtocolFeeBps({ chainId, outputAddress: resolvedAddress, outputSymbol: resolvedSymbol })

  return (
    <Banner data-d87-marco-buy-incentive>
      <Text fontSize={compact ? '12px' : '13px'} color="#D4AF37" bold>
        {getMarcoBuyIncentiveShortCopy()}
      </Text>
      <Text fontSize={compact ? '11px' : '12px'} color="#B8B8B8" mt="4px">
        Protocol fee {formatProtocolFeePercent(bps)} · routed via FSC-01
      </Text>
    </Banner>
  )
}

export default MarcoBuyFeeIncentive
