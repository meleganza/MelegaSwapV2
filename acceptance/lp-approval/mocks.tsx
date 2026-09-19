// Local-only fixture. All signing, RPC and transaction dependencies are replaced here.
import React, { useSyncExternalStore } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount, Token, Percent, WNATIVE, Pair } from '@pancakeswap/sdk'
export const chainId = Number(new URLSearchParams(location.search).get('chain') || 1)
export const account = '0x0000000000000000000000000000000000000001'
export const tokenA = new Token(chainId, '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76', 18, 'MARCO')
export const tokenB = WNATIVE[chainId]
const lp = new Token(chainId, '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E', 18, 'LP')
export const amount = CurrencyAmount.fromRawAmount(lp, '150000000000000000')
const pair = new Pair(
  CurrencyAmount.fromRawAmount(tokenA, '1443340000000000000000'),
  CurrencyAmount.fromRawAmount(tokenB, '155903000000000000'),
)
const position = {
  id: lp.address,
  pairAddress: lp.address,
  chainId,
  walletAddress: account,
  ownershipSource: 'DIRECT_WALLET_LP',
  pairLabel: `MARCO / ${tokenB.symbol}`,
  pair,
  lpBalance: amount,
}
const positions = [position]
const details = {
  usdValue: 7.68,
  poolShare: new Percent(1, 100),
  token0Deposited: CurrencyAmount.fromRawAmount(tokenA, '14433400000000000000'),
  token1Deposited: CurrencyAmount.fromRawAmount(tokenB, '1559030000000000'),
}
let pending = false
let allowance = '0'
let version = 0
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const notify = () => {
  version++
  listeners.forEach((fn) => fn())
}
const useVersion = () => useSyncExternalStore(subscribe, () => version)
export const evidence: any[] = []
export const confirmApproval = () => {
  allowance = amount.quotient.toString()
  evidence.push({ event: 'mock approval confirmed', chainId })
  notify()
}
const record = (event: string, args: unknown[]) => {
  evidence.push({ event, chainId, args })
  notify()
}
const contract = {
  allowance: async (owner: string, spender: string) => {
    evidence.push({ event: 'allowance', chainId, token: lp.address, owner, spender })
    return BigNumber.from(allowance)
  },
  estimateGas: { approve: async () => BigNumber.from(50000) },
}
export const useTokenContract = (address?: string) => (address ? contract : null)
export const useSingleCallResult = () => ({ result: [BigNumber.from(0)] }) // frozen pre-approval multicall
export const useHasPendingApproval = () => {
  useVersion()
  return pending
}
const addTransaction = (tx: any, meta: any) => {
  if (meta.approval) pending = true
  record('transaction', [tx, meta])
}
export const useTransactionAdder = () => addTransaction
const callWithGasPrice = async (_contract: any, method: string, args: unknown[]) => {
  record('wallet approval request', [method, ...args])
  return { hash: '0x' + 'a'.repeat(64) }
}
export const useCallWithGasPrice = () => ({ callWithGasPrice })
export const useAccount = () => ({ address: account })
export const useActiveChainId = () => ({ chainId })
export const useSwitchNetwork = () => ({ switchNetworkAsync: async () => {} })
const t = (s: string) => s
export const useTranslation = () => ({ t })
export const useToast = () => ({ toastError: console.error })
export const useModal = () => [() => {}]
const router = { query: {}, pathname: '/liquidity', replace: async () => {} }
export const useRouter = () => router
export const useCurrency = (id?: string) =>
  id?.toLowerCase() === tokenA.address.toLowerCase()
    ? tokenA
    : id?.toLowerCase() === tokenB.address.toLowerCase()
    ? tokenB
    : undefined
export const PairState = { LOADING: 0, EXISTS: 2 }
export const useMintState = () => ({ independentField: 'CURRENCY_A', typedValue: '', otherTypedValue: '' })
export const useMintActionHandlers = () => ({ onFieldAInput: () => {}, onFieldBInput: () => {} })
const parsedAmounts = {}
export const useDerivedMintInfo = () => ({ pair, pairState: 2, parsedAmounts, currencies: {}, noLiquidity: false })
const burn = { LIQUIDITY_PERCENT: new Percent(100, 100) }
export const useBurnState = () => ({ typedValue: '100' })
export const useBurnActionHandlers = () => ({ onUserInput: () => {} })
export const useDerivedBurnInfo = () => ({ parsedAmounts: burn })
export const useGasPrice = () => undefined
export const useUserSlippageTolerance = () => [50]
export const useUserTransactionTTL = () => [1200]
export const useLPApr = () => ({})
export const useLiquidityPositions = () => ({
  positions,
  isLoading: false,
  positionsPhase: 'ready',
  retryPositions: () => {},
})
export const useLiquidityPositionDetails = () => details
export const calculateGasMargin = (x: unknown) => x
export const calculateSlippageAmount = (x: any) => [x.quotient.toString(), x.quotient.toString()]
export const computeSlippageAdjustedAmounts = () => ({})
const remove = async (...args: unknown[]) => {
  record('mock removeLiquidity request', args)
  return { hash: '0x' + 'b'.repeat(64), wait: async () => ({ status: 1, transactionHash: '0x' + 'b'.repeat(64) }) }
}
const routerContract = {
  estimateGas: {
    removeLiquidity: async () => BigNumber.from(200000),
    removeLiquidityETH: async () => BigNumber.from(200000),
  },
  removeLiquidity: remove,
  removeLiquidityETH: remove,
}
export const useRouterContract = () => routerContract
export const logError = console.error
export const transactionErrorToUserReadableMessage = (e: Error) => e.message
export const chainDisplayName = (id: number) => (id === 1 ? 'Ethereum' : 'BNB Chain')
export const routeLiquidityInstruction = () => ({})
export let runtime: any
export const setRuntime = (r: any) => {
  runtime = r
}
export const useLiquidityRuntime = () => runtime

export const buildLiquidityWalletPortfolio = () => ({ positions: [] })
