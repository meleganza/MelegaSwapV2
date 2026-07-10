import { useCallback, useMemo } from 'react'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { TradeWithStableSwap } from '@pancakeswap/smart-router/evm'
import { useWeb3React } from '@pancakeswap/wagmi'
import { Web3Provider } from '@ethersproject/providers'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useTransactionAdder } from 'state/transactions/hooks'
import { isKerlRoutingAuthorityEnforced } from './authority'
import { produceKerlExecutionRequest } from './producer'
import { buildKerlConstitutionalSwapHandoffContext, buildKerlTradeFacade } from './tradeFacade'
import type { ExecutionRequest } from './types'
import { executeKerlWrapperSwap } from './wrapperExecutor'

export interface KerlConstitutionalSwapResult {
  executionRequest: ExecutionRequest | null
  trade: TradeWithStableSwap<Currency, Currency, TradeType> | null
  inputError?: string
  callback: (() => Promise<string>) | null
  routerAddress: string | null
}

export function useKerlConstitutionalSwap(input: {
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
  allowedSlippage: number
  recipient: string | null
}): KerlConstitutionalSwapResult {
  const { account, connector } = useWeb3React()
  const { chainId } = useActiveChainId()
  const addTransaction = useTransactionAdder()

  const enforced = isKerlRoutingAuthorityEnforced(chainId)

  const produced = useMemo(() => {
    if (!enforced || !input.parsedAmount || !input.inputCurrency || !input.outputCurrency) {
      return null
    }

    const inputAddress = input.inputCurrency.isNative
      ? null
      : input.inputCurrency.wrapped.address

    return produceKerlExecutionRequest({
      chainId: chainId!,
      inputAddress,
      outputAddress: input.outputCurrency.isToken
        ? input.outputCurrency.wrapped.address
        : input.outputCurrency.wrapped.address,
      inputIsNative: input.inputCurrency.isNative,
      amountRaw: input.parsedAmount.quotient.toString(),
      slippageBps: input.allowedSlippage,
      recipient: input.recipient,
      tradeType: TradeType.EXACT_INPUT,
    })
  }, [
    enforced,
    input.parsedAmount,
    input.inputCurrency,
    input.outputCurrency,
    chainId,
    input.allowedSlippage,
    input.recipient,
  ])

  const executionRequest = produced?.ok ? produced.request : null
  const inputError = produced && !produced.ok ? produced.message : undefined

  const trade = useMemo(() => {
    if (!executionRequest || !input.inputCurrency || !input.outputCurrency) return null
    return buildKerlTradeFacade(executionRequest, input.inputCurrency, input.outputCurrency)
  }, [executionRequest, input.inputCurrency, input.outputCurrency])

  const callback = useCallback(async (): Promise<string> => {
    if (!executionRequest || !account || !connector) {
      throw new Error('KERL execution request unavailable')
    }

    const provider = await connector.getProvider()
    const web3Provider = new Web3Provider(provider as import('@ethersproject/providers').ExternalProvider)
    const signer = web3Provider.getSigner()

    const result = await executeKerlWrapperSwap(executionRequest, signer)

    addTransaction({ hash: result.hash }, {
      type: 'swap',
      summary: `KERL Wrapper ${executionRequest.routeType}`,
      settlementHandoffContext: buildKerlConstitutionalSwapHandoffContext(
        executionRequest,
        input.inputCurrency!,
      ),
    })

    return result.hash
  }, [executionRequest, account, connector, addTransaction, input.inputCurrency])

  return {
    executionRequest,
    trade,
    inputError,
    callback: executionRequest && account ? callback : null,
    routerAddress: executionRequest?.wrapperAddress ?? null,
  }
}
