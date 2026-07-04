import { useMemo } from 'react'
import { Currency, Trade, TradeType } from '@pancakeswap/sdk'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useAtomValue } from 'jotai'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo, useSwapState } from 'state/swap/hooks'
import { useGasPrice, useUserSlippageTolerance, useWatchlistTokens } from 'state/user/hooks'
import { useStableSwapByDefault } from 'state/user/smartRouter'
import { combinedTokenMapFromOfficialsUrlsAtom } from 'state/lists/hooks'
import {
  useDerivedSwapInfoWithStableSwap,
  useIsSmartRouterBetter,
  useTradeInfo,
} from 'views/Swap/SmartSwap/hooks'
import { SMART_ROUTER_ADDRESS } from 'views/Swap/SmartSwap/utils/exchange'
import {
  chainLabel,
  compareOutputDelta,
  estimatedGasLabel,
  formatAmount,
  formatPercent,
  minReceivedLabel,
  routeHopLabel,
  routePathLabels,
  routerSourceLabel,
} from './formatTradeRuntime'
import { runtimeErrorFromPhase, type TradeRuntimeError } from './tradeRuntimeErrors'
import { useTradeSettlementMetadata } from './useTradeSettlementMetadata'
import type { TradeSettlementMachineMetadata } from 'lib/treasury-handoff'

export type TradeRuntimePhase =
  | 'idle'
  | 'routing'
  | 'ready'
  | 'wallet_required'
  | 'approval_required'
  | 'error'

export interface TradeRouteEntry {
  rank: number
  chain: string
  source: string
  amount: string
  delta: string
  gas?: string
  time?: string
  best: boolean
}

export interface TradeAssetRow {
  symbol: string
  balance: string
  usd?: string
  address?: string
}

export interface TradeRouterStatus {
  status: string
  statusTone: 'ok' | 'warn' | 'error'
  uptime: string
  routes: string
  chains: string
}

export interface TradeExecutionSummary {
  estimatedReceived?: string
  minimumReceived?: string
  priceImpact?: string
  networkFee?: string
  executionRoute?: string
  liquiditySources?: string
  routeQuality?: string
}

export interface TradeMachinePayload {
  status: TradeRuntimePhase
  chainId?: number
  wallet?: string
  inputSymbol?: string
  outputSymbol?: string
  routePath: string[]
  routeHops: string
  router: string
  fallbackV2: boolean
  approval: string
  priceImpact?: string
  minimumReceived?: string
  error?: TradeRuntimeError | null
  timestamp: string
  settlement: TradeSettlementMachineMetadata
}

export interface TradeSwapRuntime {
  phase: TradeRuntimePhase
  loadingLabel?: string
  error: TradeRuntimeError | null
  tradeInfo: ReturnType<typeof useTradeInfo>
  routeEntries: TradeRouteEntry[]
  assets: TradeAssetRow[]
  routerStatus: TradeRouterStatus
  executionSummary: TradeExecutionSummary
  routeSteps: string[]
  smartRouteSavings?: string
  executionSpeed?: string
  approval: ApprovalState
  account?: string
  machine: TradeMachinePayload
  watchlistHrefs: Array<{ id: string; pair: string; href: string }>
}

export function useTradeSwapRuntime(): TradeSwapRuntime {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const settlementMetadata = useTradeSettlementMetadata()
  const [allowedSlippage] = useUserSlippageTolerance()
  const [isStableSwapByDefault] = useStableSwapByDefault()
  const gasPrice = useGasPrice()
  const tokenMap = useAtomValue(combinedTokenMapFromOfficialsUrlsAtom)
  const [watchlistTokens] = useWatchlistTokens()

  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const { v2Trade, inputError: swapInputError } = useDerivedSwapInfo(
    independentField,
    typedValue,
    inputCurrency,
    outputCurrency,
    recipient,
  )

  const {
    trade: tradeWithStableSwap,
    currencyBalances,
    parsedAmount,
    inputError: stableSwapInputError,
  } = useDerivedSwapInfoWithStableSwap(
    independentField,
    typedValue,
    inputCurrency,
    outputCurrency,
    recipient,
  )

  const isSmartRouterBetter = useIsSmartRouterBetter({ trade: tradeWithStableSwap, v2Trade })
  const useSmartRouter = isStableSwapByDefault || isSmartRouterBetter

  const tradeInfo = useTradeInfo({
    trade: tradeWithStableSwap,
    v2Trade,
    useSmartRouter,
    allowedSlippage,
    chainId,
    swapInputError,
    stableSwapInputError,
  })

  const amountToApprove = tradeInfo?.slippageAdjustedAmounts[Field.INPUT]
  const [approval] = useApproveCallback(amountToApprove, tradeInfo?.routerAddress)

  const hasAmount = Boolean(parsedAmount?.greaterThan(0) || typedValue)
  const routing = hasAmount && !tradeInfo && Boolean(inputCurrency && outputCurrency)

  const phase: TradeRuntimePhase = useMemo(() => {
    if (!account && hasAmount && tradeInfo) return 'wallet_required'
    if (approval === ApprovalState.NOT_APPROVED && account && tradeInfo && amountToApprove) {
      return 'approval_required'
    }
    if (tradeInfo?.inputError) return 'error'
    if (routing) return 'routing'
    if (tradeInfo && hasAmount) return 'ready'
    return 'idle'
  }, [account, hasAmount, tradeInfo, routing, approval, amountToApprove])

  const error = useMemo(
    () => runtimeErrorFromPhase(phase === 'routing' ? 'routing' : 'idle', tradeInfo?.inputError),
    [phase, tradeInfo?.inputError],
  )

  const routeEntries = useMemo((): TradeRouteEntry[] => {
    const entries: TradeRouteEntry[] = []
    const gas = estimatedGasLabel(gasPrice)
    const chain = chainLabel(chainId)

    if (tradeWithStableSwap?.outputAmount && useSmartRouter) {
      entries.push({
        rank: 1,
        chain,
        source: routerSourceLabel(tradeInfo, true),
        amount: formatAmount(tradeWithStableSwap.outputAmount) ?? '—',
        delta: compareOutputDelta(tradeWithStableSwap.outputAmount, v2Trade?.outputAmount) ?? 'Best route',
        gas,
        best: true,
      })
    }

    if (v2Trade?.outputAmount) {
      const isBest = !entries.length
      entries.push({
        rank: entries.length + 1,
        chain,
        source: 'MelegaSwap V2',
        amount: formatAmount(v2Trade.outputAmount) ?? '—',
        delta: isBest ? 'Best route' : compareOutputDelta(v2Trade.outputAmount, tradeWithStableSwap?.outputAmount) ?? '—',
        gas,
        best: isBest,
      })
    }

    return entries.slice(0, 3)
  }, [tradeWithStableSwap, v2Trade, tradeInfo, useSmartRouter, gasPrice, chainId])

  const assets = useMemo((): TradeAssetRow[] => {
    const rows: TradeAssetRow[] = []
    if (inputCurrency) {
      const bal = currencyBalances[Field.INPUT]
      rows.push({
        symbol: inputCurrency.symbol ?? '?',
        balance: bal ? bal.toSignificant(6) : account ? '0' : '—',
        address: inputCurrency.isToken ? inputCurrency.address : undefined,
      })
    }
    if (outputCurrency) {
      const bal = currencyBalances[Field.OUTPUT]
      rows.push({
        symbol: outputCurrency.symbol ?? '?',
        balance: bal ? bal.toSignificant(6) : account ? '0' : '—',
        address: outputCurrency.isToken ? outputCurrency.address : undefined,
      })
    }
    return rows
  }, [inputCurrency, outputCurrency, currencyBalances, account])

  const routerStatus = useMemo((): TradeRouterStatus => {
    const smartAddr = chainId ? SMART_ROUTER_ADDRESS[chainId] : undefined
    const v2Addr = chainId ? ROUTER_ADDRESS[chainId] : undefined
    const available = Boolean(smartAddr || v2Addr)
    return {
      status: available ? 'Router online' : 'Router unavailable on network',
      statusTone: available ? 'ok' : 'warn',
      uptime: tradeInfo ? 'Live quote' : available ? 'Standby' : '—',
      routes: tradeInfo ? String(Math.max(0, (tradeInfo.route.path?.length ?? 1) - 1)) : '—',
      chains: String(SUPPORT_MULTI_CHAINS.length),
    }
  }, [chainId, tradeInfo])

  const executionSummary = useMemo((): TradeExecutionSummary => {
    const pairs = tradeInfo?.route?.pairs?.length
    return {
      estimatedReceived: formatAmount(tradeInfo?.outputAmount),
      minimumReceived: minReceivedLabel(tradeInfo),
      priceImpact: formatPercent(tradeInfo?.priceImpactWithoutFee),
      networkFee: estimatedGasLabel(gasPrice),
      executionRoute: routeHopLabel(tradeInfo),
      liquiditySources: pairs ? `${pairs} pool${pairs === 1 ? '' : 's'}` : undefined,
      routeQuality: useSmartRouter && !tradeInfo?.fallbackV2 ? 'Smart Router' : 'V2 Router',
    }
  }, [tradeInfo, gasPrice, useSmartRouter])

  const routeSteps = useMemo(() => routePathLabels(tradeInfo), [tradeInfo])

  const smartRouteSavings = useMemo(() => {
    if (!tradeWithStableSwap?.outputAmount || !v2Trade?.outputAmount) return undefined
    if (!isSmartRouterBetter) return undefined
    return compareOutputDelta(tradeWithStableSwap.outputAmount, v2Trade.outputAmount)
  }, [tradeWithStableSwap, v2Trade, isSmartRouterBetter])

  const watchlistHrefs = useMemo(() => {
    return watchlistTokens.slice(0, 5).map((address) => {
      const token = tokenMap[chainId ?? 56]?.[address.toLowerCase()]
      const symbol = token?.symbol ?? `${address.slice(0, 6)}…`
      return {
        id: address,
        pair: `${symbol} / BNB`,
        href: `/trade?outputCurrency=${address}`,
      }
    })
  }, [watchlistTokens, tokenMap, chainId])

  const machine: TradeMachinePayload = useMemo(
    () => ({
      status: phase,
      chainId,
      wallet: account,
      inputSymbol: inputCurrency?.symbol,
      outputSymbol: outputCurrency?.symbol,
      routePath: routeSteps,
      routeHops: routeHopLabel(tradeInfo),
      router: routerSourceLabel(tradeInfo, useSmartRouter),
      fallbackV2: tradeInfo?.fallbackV2 ?? true,
      approval:
        approval === ApprovalState.APPROVED
          ? 'APPROVED'
          : approval === ApprovalState.PENDING
            ? 'PENDING'
            : approval === ApprovalState.NOT_APPROVED
              ? 'NOT_APPROVED'
              : 'UNKNOWN',
      priceImpact: formatPercent(tradeInfo?.priceImpactWithoutFee),
      minimumReceived: minReceivedLabel(tradeInfo),
      error,
      timestamp: new Date().toISOString(),
      settlement: settlementMetadata,
    }),
    [
      phase,
      chainId,
      account,
      inputCurrency?.symbol,
      outputCurrency?.symbol,
      routeSteps,
      tradeInfo,
      useSmartRouter,
      approval,
      error,
      settlementMetadata,
    ],
  )

  return {
    phase,
    loadingLabel: phase === 'routing' ? 'Routing…' : undefined,
    error,
    tradeInfo,
    routeEntries,
    assets,
    routerStatus,
    executionSummary,
    routeSteps,
    smartRouteSavings,
    executionSpeed: tradeInfo ? 'Fast' : undefined,
    approval,
    account,
    machine,
    watchlistHrefs,
  }
}
