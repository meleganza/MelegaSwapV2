import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, Token } from '@pancakeswap/sdk'
import { useAccount } from 'wagmi'
import IPancakePairABI from 'config/abi/IPancakePair.json'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useContract } from 'hooks/useContract'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { calculateGasMargin } from 'utils'
import { calculateSlippageAmount, useRouterContract } from 'utils/exchange'
import {
  erc20ForOption,
  getTokenOption,
  RUNTIME_LABELS,
  TESTNET_LIQUIDITY_CHAIN_ID,
  TESTNET_TOKEN_OPTIONS,
} from './testnetLiquidityConfig'

const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  'function createPair(address tokenA, address tokenB) external returns (address pair)',
]

const ZERO = '0x0000000000000000000000000000000000000000'

function tryParseAmount(value: string, token: Token): CurrencyAmount<Token> | undefined {
  if (!value || Number.isNaN(Number(value)) || Number(value) <= 0) return undefined
  try {
    return CurrencyAmount.fromRawAmount(token, parseUnits(value, token.decimals).toString())
  } catch {
    return undefined
  }
}

function erc20AddressForOption(optionId: string): string {
  const opt = getTokenOption(optionId)
  return opt.isNative ? BSC_TESTNET_ADDRESSES.wbnb : opt.address
}

export type TestnetLiquidityPhase = 'idle' | 'approve' | 'create_pair' | 'add_liquidity'

export function useTestnetLiquidityRuntime() {
  const { chainId, isWrongNetwork } = useActiveChainId()
  const { address: account } = useAccount()
  const routerContract = useRouterContract()
  const factoryContract = useContract(BSC_TESTNET_ADDRESSES.factory, FACTORY_ABI, true)
  const factoryContractRef = useRef(factoryContract)
  factoryContractRef.current = factoryContract
  const { callWithGasPrice } = useCallWithGasPrice()
  const deadline = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const [tokenAId, setTokenAId] = useState('MARCO')
  const [tokenBId, setTokenBId] = useState('WBNB')
  const [amountA, setAmountA] = useState('100000')
  const [amountB, setAmountB] = useState('0.25')

  const [pairAddress, setPairAddress] = useState<string | null>(null)
  const [reserve0, setReserve0] = useState<string | null>(null)
  const [reserve1, setReserve1] = useState<string | null>(null)
  const [lpBalance, setLpBalance] = useState<string | null>(null)
  const [pairToken0, setPairToken0] = useState<string | null>(null)

  const [createPairTxHash, setCreatePairTxHash] = useState<string | undefined>()
  const [liquidityTxHash, setLiquidityTxHash] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [pendingPhase, setPendingPhase] = useState<TestnetLiquidityPhase | null>(null)
  const [pairCreatedStepDone, setPairCreatedStepDone] = useState(false)

  const tokenA = useMemo(() => getTokenOption(tokenAId), [tokenAId])
  const tokenB = useMemo(() => getTokenOption(tokenBId), [tokenBId])
  const marcoToken = erc20ForOption(getTokenOption('MARCO'))

  const tokenAErc20 = erc20ForOption(tokenA)
  const tokenBErc20 = erc20ForOption(tokenB)
  const parsedAmountA = useMemo(
    () => (tokenA.isNative ? undefined : tryParseAmount(amountA, tokenAErc20)),
    [tokenA.isNative, amountA, tokenAErc20],
  )
  const parsedAmountB = useMemo(
    () => (tokenB.isNative ? undefined : tryParseAmount(amountB, tokenBErc20)),
    [tokenB.isNative, amountB, tokenBErc20],
  )
  const parsedNativeA = useMemo(() => {
    if (!tokenA.isNative) return undefined
    try {
      return parseUnits(amountA, 18)
    } catch {
      return undefined
    }
  }, [tokenA.isNative, amountA])
  const parsedNativeB = useMemo(() => {
    if (!tokenB.isNative) return undefined
    try {
      return parseUnits(amountB, 18)
    } catch {
      return undefined
    }
  }, [tokenB.isNative, amountB])

  const marcoAmountParsed = useMemo(() => {
    if (tokenA.id === 'MARCO') return parsedAmountA
    if (tokenB.id === 'MARCO') return parsedAmountB
    return undefined
  }, [tokenA.id, tokenB.id, parsedAmountA, parsedAmountB])

  const routerSpender = ROUTER_ADDRESS[TESTNET_LIQUIDITY_CHAIN_ID]
  const [approvalState, approveCallback] = useApproveCallback(marcoAmountParsed, routerSpender)

  const isOnTestnet = chainId === TESTNET_LIQUIDITY_CHAIN_ID
  const pairAddrA = erc20AddressForOption(tokenAId)
  const pairAddrB = erc20AddressForOption(tokenBId)

  const refreshPairState = useCallback(async () => {
    const factory = factoryContractRef.current
    if (!factory) return
    try {
      const pair: string = await factory.getPair(pairAddrA, pairAddrB)
      if (!pair || pair === ZERO) {
        setPairAddress(ZERO)
        setReserve0(null)
        setReserve1(null)
        setLpBalance(null)
        setPairToken0(null)
        return
      }
      setPairAddress(pair)
      const provider = factory.provider
      if (!provider) return
      const pairRead = new Contract(pair, IPancakePairABI, provider)
      const [r0, r1] = await pairRead.getReserves()
      const t0: string = await pairRead.token0()
      setPairToken0(t0)
      setReserve0(r0.toString())
      setReserve1(r1.toString())
      if (account) {
        const bal = await pairRead.balanceOf(account)
        setLpBalance(bal.toString())
      }
    } catch (e) {
      console.error('refreshPairState', e)
    }
  }, [account, pairAddrA, pairAddrB])

  useEffect(() => {
    if (!isOnTestnet || !factoryContract) return undefined
    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      await refreshPairState()
    }
    tick()
    const timer = setInterval(tick, 12_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [isOnTestnet, factoryContract, refreshPairState])

  const pairExists = Boolean(pairAddress && pairAddress.toLowerCase() !== ZERO)

  useEffect(() => {
    if (pairExists) setPairCreatedStepDone(true)
  }, [pairExists])

  const ratioPreview = useMemo(() => {
    const a = Number(amountA)
    const b = Number(amountB)
    if (!a || !b || !Number.isFinite(a) || !Number.isFinite(b)) return '—'
    return `1 ${tokenA.symbol} ≈ ${(b / a).toFixed(8)} ${tokenB.symbol}`
  }, [amountA, amountB, tokenA.symbol, tokenB.symbol])

  const needsMarco = tokenA.id === 'MARCO' || tokenB.id === 'MARCO'
  const marcoApproved = !needsMarco || approvalState === ApprovalState.APPROVED

  const amountsValid = useMemo(() => {
    const aOk = tokenA.isNative ? parsedNativeA?.gt(0) : parsedAmountA?.greaterThan(0)
    const bOk = tokenB.isNative ? parsedNativeB?.gt(0) : parsedAmountB?.greaterThan(0)
    return Boolean(aOk && bOk && tokenAId !== tokenBId)
  }, [tokenA, tokenB, parsedNativeA, parsedNativeB, parsedAmountA, parsedAmountB, tokenAId, tokenBId])

  const canApprove =
    isOnTestnet &&
    account &&
    needsMarco &&
    approvalState === ApprovalState.NOT_APPROVED &&
    amountsValid &&
    !pendingPhase

  const canCreatePair =
    isOnTestnet && account && marcoApproved && !pairExists && !pairCreatedStepDone && !pendingPhase

  const canAddLiquidity =
    isOnTestnet && account && marcoApproved && (pairExists || pairCreatedStepDone) && amountsValid && !pendingPhase

  const onApproveMarco = useCallback(async () => {
    setErrorMessage(undefined)
    setPendingPhase('approve')
    try {
      await approveCallback()
    } catch (e: unknown) {
      setErrorMessage((e as Error)?.message ?? 'Approve failed')
    } finally {
      setPendingPhase(null)
    }
  }, [approveCallback])

  const onCreatePair = useCallback(async () => {
    if (!factoryContract || !account) return
    setErrorMessage(undefined)
    setPendingPhase('create_pair')
    try {
      const estimated = await factoryContract.estimateGas.createPair(pairAddrA, pairAddrB)
      const tx = await callWithGasPrice(factoryContract, 'createPair', [pairAddrA, pairAddrB], {
        gasLimit: calculateGasMargin(estimated),
      })
      setCreatePairTxHash(tx.hash)
      await tx.wait()
      setPairCreatedStepDone(true)
      await refreshPairState()
    } catch (e: unknown) {
      setErrorMessage((e as Error)?.message ?? 'Create pair failed')
    } finally {
      setPendingPhase(null)
    }
  }, [factoryContract, account, callWithGasPrice, refreshPairState, pairAddrA, pairAddrB])

  const onAddLiquidity = useCallback(async () => {
    if (!routerContract || !account || !deadline) return
    setErrorMessage(undefined)
    setPendingPhase('add_liquidity')
    try {
      const slippage = pairExists ? allowedSlippage : 0
      const hasNative = tokenA.isNative || tokenB.isNative

      if (hasNative) {
        const erc20Side = tokenA.isNative ? tokenB : tokenA
        const erc20Amount = tokenA.isNative ? parsedAmountB : parsedAmountA
        const nativeWei = tokenA.isNative ? parsedNativeA : parsedNativeB
        if (!erc20Amount || !nativeWei) throw new Error('Invalid amounts')

        const amountTokenMin = calculateSlippageAmount(erc20Amount, slippage)[0]
        const amountEthMin =
          slippage === 0 ? nativeWei : nativeWei.mul(BigNumber.from(10000 - slippage)).div(10000)

        const args = [
          erc20ForOption(erc20Side).address,
          erc20Amount.quotient.toString(),
          amountTokenMin.toString(),
          amountEthMin.toString(),
          account,
          deadline.toHexString(),
        ]
        const estimated = await routerContract.estimateGas.addLiquidityETH(...args, { value: nativeWei })
        const tx = await routerContract.addLiquidityETH(...args, {
          value: nativeWei,
          gasLimit: calculateGasMargin(estimated),
        })
        setLiquidityTxHash(tx.hash)
        await tx.wait()
      } else {
        if (!parsedAmountA || !parsedAmountB) throw new Error('Invalid amounts')
        const amountAMin = calculateSlippageAmount(parsedAmountA, slippage)[0]
        const amountBMin = calculateSlippageAmount(parsedAmountB, slippage)[0]
        const args = [
          tokenAErc20.address,
          tokenBErc20.address,
          parsedAmountA.quotient.toString(),
          parsedAmountB.quotient.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          account,
          deadline.toHexString(),
        ]
        const estimated = await routerContract.estimateGas.addLiquidity(...args)
        const tx = await routerContract.addLiquidity(...args, { gasLimit: calculateGasMargin(estimated) })
        setLiquidityTxHash(tx.hash)
        await tx.wait()
      }
      await refreshPairState()
    } catch (e: unknown) {
      setErrorMessage((e as Error)?.message ?? 'Add liquidity failed')
    } finally {
      setPendingPhase(null)
    }
  }, [
    routerContract,
    account,
    deadline,
    tokenA,
    tokenB,
    parsedAmountA,
    parsedAmountB,
    parsedNativeA,
    parsedNativeB,
    allowedSlippage,
    pairExists,
    refreshPairState,
    tokenAErc20,
    tokenBErc20,
  ])

  const reservesFormatted = useMemo(() => {
    if (!reserve0 || !reserve1 || !pairToken0) return null
    return { reserve0, reserve1, token0: pairToken0 }
  }, [reserve0, reserve1, pairToken0])

  const liquiditySuccess =
    pairExists &&
    reservesFormatted &&
    BigNumber.from(reservesFormatted.reserve0).gt(0) &&
    BigNumber.from(reservesFormatted.reserve1).gt(0)

  const statusLabel = liquiditySuccess ? 'Pool active' : pairExists ? 'Pair created' : 'Pair not created'

  return {
    isOnTestnet,
    isWrongNetwork,
    account,
    runtime: RUNTIME_LABELS,
    tokenA,
    tokenB,
    setTokenAId,
    setTokenBId,
    amountA,
    amountB,
    setAmountA,
    setAmountB,
    ratioPreview,
    pairAddress: pairExists ? pairAddress : null,
    pairExists,
    reservesFormatted,
    lpBalance,
    liquiditySuccess,
    statusLabel,
    approvalState,
    marcoApproved,
    canApprove,
    canCreatePair,
    canAddLiquidity,
    showCreatePair: !pairExists && !pairCreatedStepDone,
    pendingPhase,
    errorMessage,
    createPairTxHash,
    liquidityTxHash,
    onApproveMarco,
    onCreatePair,
    onAddLiquidity,
    tokenOptions: TESTNET_TOKEN_OPTIONS,
  }
}
