import { Interface, defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits, formatUnits } from '@ethersproject/units'
import wrapperAbi from 'lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json'
import {
  formatEthError,
  getEthereum,
  getReadProvider,
  isBnbTestnetChain,
  readWalletChain,
  connectWallet,
  switchToTestnet,
  type EthProvider,
} from '../TestnetWrapperDeploy/wrapperDeployActions'
import {
  ADDR,
  ROUTES,
  WRAPPER_ADDRESS,
  type RouteDef,
  type RouteId,
} from './wrapperValidateConfig'

export {
  getEthereum,
  readWalletChain,
  connectWallet,
  switchToTestnet,
  formatEthError,
  isBnbTestnetChain,
} from '../TestnetWrapperDeploy/wrapperDeployActions'

export { VALIDATE_CHAIN_ID } from './wrapperValidateConfig'

const WRAPPER_IFACE = new Interface(wrapperAbi as readonly unknown[])
const ERC20_IFACE = new Interface([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
])
const PAIR_IFACE = new Interface(['function getReserves() view returns (uint112,uint112,uint32)'])
const FACTORY_IFACE = new Interface(['function getPair(address,address) view returns (address)'])

const SWAP_GAS_MARGIN_NUM = 130
const SWAP_GAS_MARGIN_DEN = 100
const SWAP_MIN_GAS = 350_000
const SWAP_MAX_GAS = 1_500_000

export type RouteSwapStatus = 'idle' | 'preparing' | 'wallet_open' | 'submitted' | 'confirmed' | 'failed'

export type DecodedEvents = {
  protocolFeeCollected: Record<string, unknown> | null
  smartRouterSwapRouted: Record<string, unknown> | null
  treasuryHandoffPrepared: Record<string, unknown> | null
}

export type RouteValidationResult = {
  routeId: RouteId
  pass: boolean
  blocked?: boolean
  blockerReason?: string
  txHash: string | null
  receiptStatus: number | null
  gasUsed: string | null
  failures: string[]
  events: DecodedEvents
  treasuryDelta: string | null
  expectedFeeBps: number
  actualFeeBps: number | null
  grossAmount: string | null
  netAmount: string | null
  feeAmount: string | null
  executionMethod: string | null
  revertReason: string | null
}

export type LiquidityStatus = {
  routeId: RouteId
  available: boolean
  pairAddress: string | null
  reserve0: string | null
  reserve1: string | null
  blockerReason?: string
}

export type ValidationReport = {
  schema: 'melega.wrapper-validate-report.v1'
  timestamp: string
  chainId: number
  wrapperAddress: string
  verdict: 'PASS' | 'BLOCKED'
  routes: RouteValidationResult[]
  executableRoutes: RouteId[]
  passCount: string
  blockers: string[]
}

export function getRouteDef(id: RouteId): RouteDef {
  const route = ROUTES.find((r) => r.id === id)
  if (!route) throw new Error(`Unknown route ${id}`)
  return route
}

export function computeFeePreview(grossHuman: string, feeBps: number) {
  const gross = parseUnits(grossHuman || '0', 18)
  const fee = gross.mul(feeBps).div(10_000)
  const net = gross.sub(fee)
  return {
    grossWei: gross.toString(),
    feeWei: fee.toString(),
    netWei: net.toString(),
    grossHuman,
    feeHuman: formatUnits(fee, 18),
    netHuman: formatUnits(net, 18),
    feeBps,
  }
}

function capSwapGas(estimated: BigNumber): BigNumber {
  const withMargin = estimated.mul(SWAP_GAS_MARGIN_NUM).div(SWAP_GAS_MARGIN_DEN)
  const floored = withMargin.lt(SWAP_MIN_GAS) ? BigNumber.from(SWAP_MIN_GAS) : withMargin
  return floored.gt(SWAP_MAX_GAS) ? BigNumber.from(SWAP_MAX_GAS) : floored
}

export function decodeRevertReason(data: string | null | undefined): string | null {
  if (!data || data === '0x') return null
  try {
    if (data.startsWith('0x08c379a0')) {
      const [reason] = defaultAbiCoder.decode(['string'], `0x${data.slice(10)}`)
      return String(reason)
    }
    const parsed = WRAPPER_IFACE.parseError(data)
    return parsed.name
  } catch {
    return data
  }
}

export function extractRevertReason(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null
  const err = error as {
    data?: string
    error?: { data?: string; message?: string }
    reason?: string
  }
  return (
    decodeRevertReason(err.data) ??
    decodeRevertReason(err.error?.data) ??
    (err.reason && !err.reason.includes('execution reverted') ? err.reason : null) ??
    decodeRevertReason(err.error?.message?.match(/0x[0-9a-f]+/i)?.[0])
  )
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v
  if (BigNumber.isBigNumber(v)) return v.toNumber()
  return Number(v)
}

function serializeDecoded(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(args)) {
    if (BigNumber.isBigNumber(v)) out[k] = v.toString()
    else if (typeof v === 'boolean' || typeof v === 'string' || typeof v === 'number') out[k] = v
    else out[k] = String(v)
  }
  return out
}

export function decodeWrapperEvents(logs: Array<{ address: string; topics: string[]; data: string }>): DecodedEvents {
  const result: DecodedEvents = {
    protocolFeeCollected: null,
    smartRouterSwapRouted: null,
    treasuryHandoffPrepared: null,
  }
  const wrapperLower = WRAPPER_ADDRESS.toLowerCase()
  for (const log of logs) {
    if (log.address.toLowerCase() !== wrapperLower) continue
    try {
      const parsed = WRAPPER_IFACE.parseLog(log)
      if (parsed.name === 'ProtocolFeeCollected') {
        result.protocolFeeCollected = serializeDecoded(parsed.args as unknown as Record<string, unknown>)
      } else if (parsed.name === 'SmartRouterSwapRouted') {
        result.smartRouterSwapRouted = serializeDecoded(parsed.args as unknown as Record<string, unknown>)
      } else if (parsed.name === 'TreasuryHandoffPrepared') {
        result.treasuryHandoffPrepared = serializeDecoded(parsed.args as unknown as Record<string, unknown>)
      }
    } catch {
      // ignore unrelated logs
    }
  }
  return result
}

async function waitForReceipt(eth: EthProvider, txHash: string, timeoutMs = 180_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const receipt = (await eth.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })) as {
      status?: string
      gasUsed?: string
      logs?: Array<{ address: string; topics: string[]; data: string }>
    } | null
    if (receipt) {
      const status = Number.parseInt(receipt.status ?? '0x1', 16)
      return { success: status !== 0, status, gasUsed: receipt.gasUsed ?? null, logs: receipt.logs ?? [] }
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error('Transaction receipt timeout')
}

async function readTreasuryBalance(route: RouteDef): Promise<BigNumber> {
  const provider = await getReadProvider()
  const { Contract } = await import('@ethersproject/contracts')
  // Native-input swaps deliver protocol fee as WBNB ERC20 inside swapExactETHForTokens.
  const feeToken = route.inputIsNative ? ADDR.wbnb : route.inputToken!
  const token = new Contract(feeToken, ERC20_IFACE, provider)
  return token.balanceOf(ADDR.treasuryIntake)
}

async function ensureAllowance(eth: EthProvider, token: string, owner: string, spender: string, amount: BigNumber) {
  const data = ERC20_IFACE.encodeFunctionData('allowance', [owner, spender])
  const result = (await eth.request({
    method: 'eth_call',
    params: [{ to: token, data }, 'latest'],
  })) as string
  const decoded = ERC20_IFACE.decodeFunctionResult('allowance', result)
  if (BigNumber.from(decoded[0]).gte(amount)) return false

  const { Web3Provider } = await import('@ethersproject/providers')
  const { Contract } = await import('@ethersproject/contracts')
  const provider = new Web3Provider(eth as unknown as import('@ethersproject/providers').ExternalProvider)
  const signer = provider.getSigner()
  const erc20 = new Contract(token, ERC20_IFACE, signer)
  const tx = await erc20.approve(spender, BigNumber.from(2).pow(256).sub(1))
  await tx.wait(1)
  return true
}

export async function checkRouteLiquidity(route: RouteDef): Promise<LiquidityStatus> {
  if (!route.liquidityPair) {
    return { routeId: route.id, available: true, pairAddress: null, reserve0: null, reserve1: null }
  }
  const provider = await getReadProvider()
  const { Contract } = await import('@ethersproject/contracts')
  const factory = new Contract(ADDR.factory, FACTORY_IFACE, provider)
  const [a, b] = route.liquidityPair
  const pairAddress: string = await factory.getPair(a, b)
  if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
    return {
      routeId: route.id,
      available: false,
      pairAddress: null,
      reserve0: null,
      reserve1: null,
      blockerReason: 'BLOCKED_STANDARD_SWAP_LIQUIDITY_MISSING',
    }
  }
  const pair = new Contract(pairAddress, PAIR_IFACE, provider)
  const [r0, r1] = await pair.getReserves()
  const available = !r0.isZero() && !r1.isZero()
  return {
    routeId: route.id,
    available,
    pairAddress,
    reserve0: formatUnits(r0, 18),
    reserve1: formatUnits(r1, 18),
    blockerReason: available ? undefined : 'BLOCKED_STANDARD_SWAP_LIQUIDITY_MISSING',
  }
}

export async function checkAllLiquidity(): Promise<LiquidityStatus[]> {
  return Promise.all(ROUTES.map((r) => checkRouteLiquidity(r)))
}

function validateDecodedEvents(
  events: DecodedEvents,
  route: RouteDef,
  treasuryDelta: BigNumber | null,
): string[] {
  const failures: string[] = []
  const pfc = events.protocolFeeCollected
  const routed = events.smartRouterSwapRouted
  const handoff = events.treasuryHandoffPrepared

  if (!pfc) failures.push('ProtocolFeeCollected missing')
  if (!routed) failures.push('SmartRouterSwapRouted missing')
  if (!handoff) failures.push('TreasuryHandoffPrepared missing')

  if (pfc) {
    if (toNum(pfc.protocolFeeBps) !== route.expectedFeeBps) {
      failures.push(`protocolFeeBps expected ${route.expectedFeeBps}, got ${pfc.protocolFeeBps}`)
    }
    if (route.id === 'BUY_MARCO' && pfc.buyMarcoIncentiveApplied !== true) {
      failures.push('buyMarcoIncentiveApplied expected true')
    }
    if (route.id !== 'BUY_MARCO' && pfc.buyMarcoIncentiveApplied === true) {
      failures.push('buyMarcoIncentiveApplied expected false')
    }
    const feeAmount = BigNumber.from(String(pfc.feeAmount))
    if (treasuryDelta && !treasuryDelta.eq(feeAmount)) {
      failures.push(`treasury delta ${treasuryDelta.toString()} != feeAmount ${feeAmount.toString()}`)
    }
    if (String(pfc.treasuryCollector).toLowerCase() !== ADDR.treasuryIntake.toLowerCase()) {
      failures.push('treasuryCollector mismatch')
    }
  }

  if (handoff) {
    const handoffFee = BigNumber.from(String(handoff.protocolFee))
    if (pfc && !handoffFee.eq(BigNumber.from(String(pfc.feeAmount)))) {
      failures.push('TreasuryHandoffPrepared.protocolFee mismatch')
    }
  }

  return failures
}

export type SwapCallbacks = {
  onStatus: (status: RouteSwapStatus) => void
  onTxHash: (hash: string) => void
}

export async function executeRouteSwap(
  eth: EthProvider,
  routeId: RouteId,
  amountHuman: string,
  callbacks: SwapCallbacks,
): Promise<RouteValidationResult> {
  const route = getRouteDef(routeId)
  const liquidity = await checkRouteLiquidity(route)
  if (!liquidity.available) {
    return {
      routeId,
      pass: false,
      blocked: true,
      blockerReason: liquidity.blockerReason ?? 'BLOCKED_STANDARD_SWAP_LIQUIDITY_MISSING',
      txHash: null,
      receiptStatus: null,
      gasUsed: null,
      failures: [liquidity.blockerReason ?? 'liquidity missing'],
      events: { protocolFeeCollected: null, smartRouterSwapRouted: null, treasuryHandoffPrepared: null },
      treasuryDelta: null,
      expectedFeeBps: route.expectedFeeBps,
      actualFeeBps: null,
      grossAmount: null,
      netAmount: null,
      feeAmount: null,
      executionMethod: null,
      revertReason: null,
    }
  }

  callbacks.onStatus('preparing')
  const gross = parseUnits(amountHuman || '0', 18)
  if (gross.lte(0)) throw new Error('Amount must be greater than zero')

  const { Web3Provider } = await import('@ethersproject/providers')
  const { Contract } = await import('@ethersproject/contracts')
  const provider = new Web3Provider(eth as unknown as import('@ethersproject/providers').ExternalProvider)
  const signer = provider.getSigner()
  const account = await signer.getAddress()
  const network = await provider.getNetwork()
  if (!isBnbTestnetChain(network.chainId)) {
    throw new Error(`Wrong chain ${network.chainId} — switch to BNB Testnet (97)`)
  }

  const wrapper = new Contract(WRAPPER_ADDRESS, wrapperAbi, signer)
  const deadline = Math.floor(Date.now() / 1000) + 1200

  if (!route.inputIsNative && route.inputToken) {
    await ensureAllowance(eth, route.inputToken, account, WRAPPER_ADDRESS, gross)
  }

  const treasuryBefore = await readTreasuryBalance(route)

  callbacks.onStatus('wallet_open')
  let tx: { hash: string; wait: (conf?: number) => Promise<{ status?: number; gasUsed?: BigNumber; logs?: unknown[] }> }
  let executionMethod: string

  if (route.inputIsNative) {
    executionMethod = 'swapExactETHForTokens'
    const gasEstimate = await wrapper.estimateGas.swapExactETHForTokens(1, route.path, account, deadline, {
      value: gross,
    })
    tx = await wrapper.swapExactETHForTokens(1, route.path, account, deadline, {
      value: gross,
      gasLimit: capSwapGas(gasEstimate),
    })
  } else {
    executionMethod = 'swapExactTokensForTokens'
    const gasEstimate = await wrapper.estimateGas.swapExactTokensForTokens(gross, 1, route.path, account, deadline)
    tx = await wrapper.swapExactTokensForTokens(gross, 1, route.path, account, deadline, {
      gasLimit: capSwapGas(gasEstimate),
    })
  }

  const txHash = tx.hash
  callbacks.onStatus('submitted')
  callbacks.onTxHash(txHash)

  const polled = await waitForReceipt(eth, txHash)
  if (!polled.success) {
    callbacks.onStatus('failed')
    return {
      routeId,
      pass: false,
      txHash,
      receiptStatus: polled.status,
      gasUsed: polled.gasUsed,
      failures: [`Transaction reverted (status ${polled.status})`],
      events: decodeWrapperEvents(polled.logs),
      treasuryDelta: null,
      expectedFeeBps: route.expectedFeeBps,
      actualFeeBps: null,
      grossAmount: gross.toString(),
      netAmount: null,
      feeAmount: null,
      executionMethod,
      revertReason: `Transaction reverted (status ${polled.status})`,
    }
  }

  const treasuryAfter = await readTreasuryBalance(route)
  const treasuryDelta = treasuryAfter.sub(treasuryBefore)
  const events = decodeWrapperEvents(polled.logs)
  const failures = validateDecodedEvents(events, route, treasuryDelta)
  const pfc = events.protocolFeeCollected

  callbacks.onStatus(failures.length === 0 ? 'confirmed' : 'failed')

  return {
    routeId,
    pass: failures.length === 0,
    txHash,
    receiptStatus: polled.status,
    gasUsed: polled.gasUsed,
    failures,
    events,
    treasuryDelta: treasuryDelta.toString(),
    expectedFeeBps: route.expectedFeeBps,
    actualFeeBps: pfc ? toNum(pfc.protocolFeeBps) : null,
    grossAmount: pfc ? String(pfc.grossAmountIn) : gross.toString(),
    netAmount: pfc ? String(pfc.netAmountIn) : null,
    feeAmount: pfc ? String(pfc.feeAmount) : null,
    executionMethod,
    revertReason: null,
  }
}

export function buildValidationReport(results: RouteValidationResult[], liquidity: LiquidityStatus[]): ValidationReport {
  const executableRoutes = ROUTES.filter((r) => {
    const liq = liquidity.find((l) => l.routeId === r.id)
    return liq?.available !== false
  }).map((r) => r.id)

  const relevant = results.filter((r) => executableRoutes.includes(r.routeId))
  const passCount = relevant.filter((r) => r.pass).length
  const blockers: string[] = []

  for (const liq of liquidity) {
    if (!liq.available && liq.blockerReason) blockers.push(`${liq.routeId}: ${liq.blockerReason}`)
  }
  for (const r of relevant) {
    if (!r.pass && !r.blocked) blockers.push(`${r.routeId}: ${r.failures.join('; ')}`)
  }

  const allPassed = passCount === executableRoutes.length && executableRoutes.length > 0 &&
    relevant.length === executableRoutes.length

  return {
    schema: 'melega.wrapper-validate-report.v1',
    timestamp: new Date().toISOString(),
    chainId: 97,
    wrapperAddress: WRAPPER_ADDRESS,
    verdict: allPassed ? 'PASS' : 'BLOCKED',
    routes: results,
    executableRoutes,
    passCount: `${passCount}/${executableRoutes.length}`,
    blockers,
  }
}
