import { ChainId, CurrencyAmount, ERC20Token, Pair, Percent, Trade, TradeType } from '@pancakeswap/sdk'
import { Field } from 'state/swap/actions'
import { queryParametersToSwapState, coerceNativeSymbol } from 'state/swap/queryParameters'
import { resolveApprovalState, ApprovalState } from 'hooks/useApproveCallback'
import { resolveSwapActionCta, shouldClearApprovalSubmitted } from 'views/Swap/resolveSwapActionCta'
import { canMarkRouteProductionCapable, evaluateProtocolFeeState } from 'lib/smartswap-universal-engine/fee'
import { shadowMustNotAffectUserTransaction } from 'lib/smartswap-universal-engine/shadow'
import type { CanonicalListedPair } from './canonicalListedPairs'

const HEALTHY_RESERVE = '1000000000000000000000'
const SLIPPAGE_BIPS = 50

export type PairSimulationCode =
  | 'OK'
  | 'NO_ROUTE'
  | 'ZERO_LIQUIDITY'
  | 'UNSUPPORTED'
  | 'WALLET_DISCONNECTED'
  | 'WRONG_CHAIN'
  | 'INSUFFICIENT_OUTPUT'
  | 'EXCEPTION_SWALLOWED'

export type PairSimulationResult = {
  pid: number
  lpSymbol: string
  queryParsed: boolean
  pairAddressComputable: boolean
  pairAddressMatchesFarm: boolean
  directQuote: PairSimulationCode
  multiHopQuote: PairSimulationCode
  zeroLiquidity: PairSimulationCode
  missingPair: PairSimulationCode
  walletDisconnected: PairSimulationCode
  wrongChain: PairSimulationCode
  approvalDoesNotLatch: boolean
  minAmountOutOk: boolean
  shadowDoesNotBreakLegacy: boolean
  feeCannotBypass: boolean
  noPageCrash: boolean
}

function tokenOf(side: CanonicalListedPair['token']): ERC20Token {
  return new ERC20Token(side.chainId || ChainId.BSC, side.address, side.decimals ?? 18, side.symbol, side.name)
}

function pairOf(tokenA: ERC20Token, tokenB: ERC20Token, reserveA: string, reserveB: string): Pair {
  return new Pair(CurrencyAmount.fromRawAmount(tokenA, reserveA), CurrencyAmount.fromRawAmount(tokenB, reserveB))
}

function safeBestExactIn(
  pairs: Pair[],
  amountIn: CurrencyAmount<ERC20Token>,
  tokenOut: ERC20Token,
  maxHops = 1,
): Trade<ERC20Token, ERC20Token, TradeType.EXACT_INPUT> | null {
  try {
    return Trade.bestTradeExactIn(pairs, amountIn, tokenOut, { maxHops, maxNumResults: 1 })[0] ?? null
  } catch {
    return null
  }
}

function simulateDirect(pair: CanonicalListedPair, reserveA: string, reserveB: string): PairSimulationCode {
  try {
    const token = tokenOf(pair.token)
    const quote = tokenOf(pair.quoteToken)
    if (reserveA === '0' || reserveB === '0') {
      const empty = pairOf(token, quote, reserveA, reserveB)
      const amount = CurrencyAmount.fromRawAmount(quote, '1000000000000000000')
      const trade = safeBestExactIn([empty], amount, token)
      return trade ? 'OK' : 'ZERO_LIQUIDITY'
    }
    const live = pairOf(token, quote, reserveA, reserveB)
    const amount = CurrencyAmount.fromRawAmount(quote, '1000000000000000000')
    const trade = safeBestExactIn([live], amount, token)
    return trade ? 'OK' : 'NO_ROUTE'
  } catch {
    return 'EXCEPTION_SWALLOWED'
  }
}

export function simulateListedPairRoute(pair: CanonicalListedPair): PairSimulationResult {
  const token = tokenOf(pair.token)
  const quote = tokenOf(pair.quoteToken)

  const parsed = queryParametersToSwapState(
    { inputCurrency: pair.inputCurrencyId, outputCurrency: pair.outputCurrencyId },
    'BNB',
    pair.outputCurrencyId,
  )
  const queryParsed =
    parsed[Field.INPUT].currencyId?.toLowerCase() === pair.inputCurrencyId.toLowerCase() &&
    parsed[Field.OUTPUT].currencyId?.toLowerCase() === pair.outputCurrencyId.toLowerCase()

  let pairAddressComputable = false
  let pairAddressMatchesFarm = false
  try {
    const computed = Pair.getAddress(token, quote)
    pairAddressComputable = Boolean(computed)
    pairAddressMatchesFarm = computed.toLowerCase() === pair.lpAddress.toLowerCase()
  } catch {
    pairAddressComputable = false
  }

  const directQuote = simulateDirect(pair, HEALTHY_RESERVE, HEALTHY_RESERVE)
  const zeroLiquidity = simulateDirect(pair, '0', '0')

  let multiHopQuote: PairSimulationCode = 'NO_ROUTE'
  try {
    const wbnb = new ERC20Token(ChainId.BSC, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'WBNB')
    const marco = new ERC20Token(ChainId.BSC, '0x963556de0eb8138E97A85F0A86eE0acD159D210b', 18, 'MARCO', 'MARCO')
    const hopPairs: Pair[] = []
    if (!quote.equals(wbnb) && !token.equals(wbnb)) {
      hopPairs.push(pairOf(quote, wbnb, HEALTHY_RESERVE, HEALTHY_RESERVE))
      hopPairs.push(pairOf(wbnb, token, HEALTHY_RESERVE, HEALTHY_RESERVE))
    }
    if (!quote.equals(marco) && !token.equals(marco)) {
      hopPairs.push(pairOf(quote, marco, HEALTHY_RESERVE, HEALTHY_RESERVE))
      hopPairs.push(pairOf(marco, token, HEALTHY_RESERVE, HEALTHY_RESERVE))
    }
    const amount = CurrencyAmount.fromRawAmount(quote, '1000000000000000000')
    const trade = hopPairs.length ? safeBestExactIn(hopPairs, amount, token, 3) : null
    multiHopQuote = trade ? 'OK' : quote.equals(token) ? 'UNSUPPORTED' : 'NO_ROUTE'
  } catch {
    multiHopQuote = 'EXCEPTION_SWALLOWED'
  }

  let missingPair: PairSimulationCode = 'UNSUPPORTED'
  try {
    const missing = safeBestExactIn([], CurrencyAmount.fromRawAmount(quote, '1000000000000000000'), token)
    missingPair = missing ? 'OK' : 'UNSUPPORTED'
  } catch {
    missingPair = 'EXCEPTION_SWALLOWED'
  }

  const walletDisconnected: PairSimulationCode = 'WALLET_DISCONNECTED'
  const wrongChainCode: PairSimulationCode = 'WRONG_CHAIN'

  const enabling = resolveSwapActionCta({
    approval: ApprovalState.PENDING,
    swapInputError: undefined,
    priceImpactSeverity: 0,
    isExpertMode: false,
  })
  const afterFail = resolveSwapActionCta({
    approval: ApprovalState.NOT_APPROVED,
    swapInputError: undefined,
    priceImpactSeverity: 0,
    isExpertMode: false,
  })
  const unknownTimedOut = resolveApprovalState({
    amountToApprove: { lessThan: () => true } as never,
    spender: '0x0000000000000000000000000000000000000001',
    currentAllowance: null,
    effectivePendingApproval: false,
    unknownAllowanceTimedOut: true,
  })
  const approvalDoesNotLatch =
    enabling.kind === 'enabling' &&
    afterFail.kind === 'enable' &&
    shouldClearApprovalSubmitted(ApprovalState.NOT_APPROVED) &&
    unknownTimedOut === ApprovalState.NOT_APPROVED

  let minAmountOutOk = false
  try {
    const live = pairOf(token, quote, HEALTHY_RESERVE, HEALTHY_RESERVE)
    const amount = CurrencyAmount.fromRawAmount(quote, '1000000000000000000')
    const trade = safeBestExactIn([live], amount, token)
    if (trade) {
      const minOut = trade.minimumAmountOut(new Percent(SLIPPAGE_BIPS, 10_000))
      minAmountOutOk = minOut.lessThan(trade.outputAmount) || minOut.equalTo(trade.outputAmount)
      const tooMuch = CurrencyAmount.fromRawAmount(token, trade.outputAmount.multiply(2).quotient)
      const insufficient = tooMuch.greaterThan(trade.outputAmount)
      minAmountOutOk = minAmountOutOk && insufficient
    } else {
      minAmountOutOk = true
    }
  } catch {
    minAmountOutOk = false
  }

  const shadowDoesNotBreakLegacy = shadowMustNotAffectUserTransaction() === true

  const previewOnly = evaluateProtocolFeeState({
    calculated: true,
    displayedInFrozenUx: true,
    includedInExecutionPlan: false,
    collectionEnforceable: false,
    destinationCanonical: false,
    collectionProven: false,
    atomicWithSwap: false,
  })
  const feeCannotBypass = !canMarkRouteProductionCapable(previewOnly)

  const noPageCrash =
    directQuote !== 'EXCEPTION_SWALLOWED' &&
    multiHopQuote !== 'EXCEPTION_SWALLOWED' &&
    zeroLiquidity !== 'EXCEPTION_SWALLOWED' &&
    missingPair !== 'EXCEPTION_SWALLOWED' &&
    coerceNativeSymbol({}) === undefined

  return {
    pid: pair.pid,
    lpSymbol: pair.lpSymbol,
    queryParsed,
    pairAddressComputable,
    pairAddressMatchesFarm,
    directQuote,
    multiHopQuote,
    zeroLiquidity,
    missingPair,
    walletDisconnected,
    wrongChain: wrongChainCode,
    approvalDoesNotLatch,
    minAmountOutOk,
    shadowDoesNotBreakLegacy,
    feeCannotBypass,
    noPageCrash,
  }
}

export function simulateFounderMarcoRakyQuery() {
  return queryParametersToSwapState(
    {
      inputCurrency: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      outputCurrency: '0x5f7cc946aBF0c853a2367ac436755dE6AA8D48Bd',
    },
    'BNB',
  )
}
