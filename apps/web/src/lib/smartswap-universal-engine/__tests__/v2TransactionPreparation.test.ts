import { spawn, execFileSync, execSync, type ChildProcess } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { JsonRpcProvider } from '@ethersproject/providers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS, evmNative } from '../assetIdentity'
import { evmNetwork } from '../domain'
import { computeFeeAmountRaw, computeNetVenueInput } from '../evaluateRevenuePolicy'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { createMelegaDexAdapter, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { computeMinimumReceived, type SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition, type ShadowCandidate } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import {
  EXECUTOR_V2_EXECUTE_FRAGMENT,
  V2_BINDING_QUOTE_STALE,
  V2_NATIVE_ASSET,
  V2_PREP_ALLOWANCE_IDENTITY,
  V2_PREP_ALLOWANCE_MISSING,
  V2_PREP_CHAIN_MISMATCH,
  V2_PREP_DEADLINE_EXPIRED,
  V2_PREP_EXECUTOR_INVALID,
  V2_PREP_NOW_INVALID,
  buildV2ExecutionBinding,
  prepareV2UserTransactions,
  v2VenueIdHash,
  type ObservedAllowanceIdentity,
  type PrepareV2UserTransactionsInput,
  type UnsignedUserTransaction,
} from '../v2ExecutionBinding'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const NOW = '2026-08-20T00:00:05.000Z'
const GROSS_INPUT = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const USER_B = '0x2222222222222222222222222222222222222222'
const EXECUTOR = '0x3333333333333333333333333333333333333333'
const TEAM = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const DEADLINE = 1_893_456_000
const NONCE = 7
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const MELEGA_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const WBNB_CHECKSUM = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDC_BSC_CHECKSUM = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const APPROVE_IFACE = new Interface(['function approve(address spender, uint256 amount)'])
const ANVIL_HOST = '127.0.0.1'
const ANVIL_PORT = 18556
const ERC20_VIEW = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function setRevertNext(bool value)',
  'function lastAmountIn() view returns (uint256)',
]

const LEGACY: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: { address: WBNB_CHECKSUM, symbol: 'WBNB', decimals: 18 },
  output: { address: USDC_BSC_CHECKSUM, symbol: 'USDC', decimals: 18 },
  inputAmountRaw: GROSS_INPUT,
  expectedOutputRaw: '600000',
  pathAddresses: [WBNB_CHECKSUM, USDC_BSC_CHECKSUM],
  freshness: NOW,
  slippageBps: 50,
}

function bscErc20Request(amount = GROSS_INPUT): SmartSwapRequest {
  return {
    requestId: 'v2-prep-bsc-erc20',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: amount,
    exactOut: false,
    slippageBps: 50,
  }
}

function bscNativeInRequest(): SmartSwapRequest {
  return {
    requestId: 'v2-prep-bsc-native',
    network: evmNetwork(56),
    inputAsset: evmNative(56, 'BNB', 18),
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function ethErc20Request(): SmartSwapRequest {
  return {
    requestId: 'v2-prep-uni-erc20',
    network: evmNetwork(1),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function allowance(
  amountRaw: string,
  overrides: Partial<ObservedAllowanceIdentity> = {},
): ObservedAllowanceIdentity {
  return {
    chainId: 56,
    token: WBNB_CHECKSUM,
    owner: USER,
    spender: EXECUTOR,
    amountRaw,
    ...overrides,
  }
}

function prepArgs(
  request: SmartSwapRequest,
  winner: ShadowCandidate | null,
  extra: Partial<PrepareV2UserTransactionsInput> = {},
): PrepareV2UserTransactionsInput {
  return {
    request,
    winner,
    user: USER,
    deadline: DEADLINE,
    nonce: NONCE,
    nowIso: NOW,
    currentChainId: request.network.domain === 'evm' ? request.network.chainId : 0,
    executorAddress: EXECUTOR,
    observedAllowance: request.inputAsset.location.kind === 'native' ? undefined : allowance(GROSS_INPUT),
    ...extra,
  }
}

async function pancakeWinner(request: SmartSwapRequest, pathKey: string, amountOutRaw = '500000') {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [createPancakeSwapVenueAdapter(createSyntheticQuoteSource({ [pathKey]: { amountOutRaw } }))],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  return result.shadowWinner!
}

async function melegaWinner(request: SmartSwapRequest, amountOutRaw = '580000') {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createMelegaDexAdapter(
        { ...LEGACY, inputAmountRaw: request.inputAmountRaw },
        { quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw } }) },
      ),
    ],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('melega-dex')
  return result.shadowWinner!
}

async function uniswapWinner() {
  const request = ethErc20Request()
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createUniswapVenueAdapter(createSyntheticQuoteSource({ [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw: '400000' } })),
    ],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('uniswap')
  return { request, winner: result.shadowWinner! }
}

function decodeApprove(data: string) {
  const decoded = APPROVE_IFACE.decodeFunctionData('approve', data)
  return { spender: getAddress(decoded.spender), amount: decoded.amount.toString() }
}

function compiledExecutorArtifact() {
  const candidates = [
    path.join(REPO, 'out-smartswap-executor-release/SmartSwapExecutorV2.sol/SmartSwapExecutorV2.json'),
    path.join(REPO, 'out/SmartSwapExecutorV2.sol/SmartSwapExecutorV2.json'),
  ]
  for (const file of candidates) {
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  }
  throw new Error('COMPILED_EXECUTOR_V2_ABI_MISSING')
}

function ensureCompiledExecutor() {
  try {
    return compiledExecutorArtifact()
  } catch {
    execSync('FOUNDRY_PROFILE=smartswap_executor_release forge build', { cwd: REPO, stdio: 'pipe' })
    execSync('forge build', { cwd: REPO, stdio: 'pipe' })
    return compiledExecutorArtifact()
  }
}

function decodeExecuteWithCompiledAbi(data: string) {
  const iface = new Interface(compiledExecutorArtifact().abi)
  const decoded = iface.decodeFunctionData('execute', data)
  return { intent: decoded.intent, path: decoded.path.map((row: string) => getAddress(row)) }
}

describe('SmartSwap V2 unsigned transaction preparation', () => {
  beforeAll(() => {
    ensureCompiledExecutor()
  }, 120_000)

  it('1A: ERC20 allowance >= GROSS ships no approve txs', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const prepared = prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance(GROSS_INPUT) }))
    expect(prepared.approvalTransactions).toEqual([])
    expect(prepared.requiresRefreshBeforeSwap).toBe(false)
    expect(prepared.requiresOnChainPreflight).toBe(true)
    expect(prepared.productionExecutionCapable).toBe(false)
  })

  it('1B: ERC20 allowance 0 ships one approve(executor, GROSS)', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const prepared = prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance('0') }))
    expect(prepared.approvalTransactions).toHaveLength(1)
    expect(prepared.requiresRefreshBeforeSwap).toBe(true)
    const approve = prepared.approvalTransactions[0]
    expect(approve.from).toBe(USER)
    expect(approve.to).toBe(WBNB_CHECKSUM)
    expect(approve.chainId).toBe(56)
    expect(approve.value).toBe('0x0')
    expect(decodeApprove(approve.data)).toEqual({ spender: EXECUTOR, amount: GROSS_INPUT })
  })

  it('1C: partial ERC20 allowance resets to 0 then approves GROSS', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const prepared = prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance('1') }))
    expect(prepared.approvalTransactions).toHaveLength(2)
    expect(prepared.requiresRefreshBeforeSwap).toBe(true)
    expect(decodeApprove(prepared.approvalTransactions[0].data)).toEqual({ spender: EXECUTOR, amount: '0' })
    expect(decodeApprove(prepared.approvalTransactions[1].data)).toEqual({ spender: EXECUTOR, amount: GROSS_INPUT })
    for (const row of prepared.approvalTransactions) {
      expect(row.from).toBe(USER)
      expect(row.to).toBe(WBNB_CHECKSUM)
      expect(row.value).toBe('0x0')
      expect(row.to).not.toBe(PANCAKE_ROUTER)
      expect(row.to).not.toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
      expect(row.to).not.toBe(TEAM)
      expect(decodeApprove(row.data).spender).toBe(EXECUTOR)
      expect(decodeApprove(row.data).spender).not.toBe(PANCAKE_ROUTER)
    }
  })

  it('2: native input uses value=GROSS and no approve', async () => {
    const request = bscNativeInRequest()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const prepared = prepareV2UserTransactions(prepArgs(request, winner))
    expect(prepared.approvalTransactions).toEqual([])
    expect(prepared.swapTransaction.value).toBe('0xf4240')
    expect(BigInt(prepared.swapTransaction.value)).toBe(BigInt(GROSS_INPUT))
    expect(prepared.swapTransaction.value).not.toBe('0xf3e58')
    expect(prepared.requiresRefreshBeforeSwap).toBe(false)
  })

  it('3: ERC20 swap value is 0 and execute targets executor', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const prepared = prepareV2UserTransactions(prepArgs(request, winner))
    expect(prepared.swapTransaction.from).toBe(USER)
    expect(prepared.swapTransaction.to).toBe(EXECUTOR)
    expect(prepared.swapTransaction.chainId).toBe(56)
    expect(prepared.swapTransaction.value).toBe('0x0')
    expect(prepared.swapTransaction.to).not.toBe(PANCAKE_ROUTER)
    expect(prepared.swapTransaction.to).not.toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
  })

  it('4: Melega and Pancake winners encode their own venue/router; fees stay input-side', async () => {
    const request = bscErc20Request()
    const melega = prepareV2UserTransactions(prepArgs(request, await melegaWinner(request)))
    const pancake = prepareV2UserTransactions(prepArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)))
    const melegaDecoded = new Interface(EXECUTOR_V2_EXECUTE_FRAGMENT as unknown as ConstructorParameters<typeof Interface>[0]).decodeFunctionData(
      'execute',
      melega.swapTransaction.data,
    )
    const pancakeDecoded = new Interface(EXECUTOR_V2_EXECUTE_FRAGMENT as unknown as ConstructorParameters<typeof Interface>[0]).decodeFunctionData(
      'execute',
      pancake.swapTransaction.data,
    )
    expect(melegaDecoded.intent.router).toBe(MELEGA_ROUTER)
    expect(melegaDecoded.intent.venueId).toBe(v2VenueIdHash('melega-dex'))
    expect(pancakeDecoded.intent.router).toBe(PANCAKE_ROUTER)
    expect(pancakeDecoded.intent.venueId).toBe(v2VenueIdHash('pancakeswap'))
    expect(melegaDecoded.intent.feeBps.toString()).toBe('20')
    expect(melegaDecoded.intent.feeAmount.toString()).toBe('2000')
    expect(melegaDecoded.intent.structuralRouteCostBps.toString()).toBe('25')
    expect(melegaDecoded.intent.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(melegaDecoded.intent.inputAmount.toString()).toBe(GROSS_INPUT)
    expect(melegaDecoded.intent.minUserOut.toString()).toBe(computeMinimumReceived('580000', 50))
    expect(pancakeDecoded.intent.minUserOut.toString()).toBe(computeMinimumReceived('500000', 50))
    expect(melegaDecoded.path.map((row: string) => getAddress(row))).toEqual([WBNB_CHECKSUM, USDC_BSC_CHECKSUM])
  })

  it('5: Uniswap Ethereum winner is encodable', async () => {
    const { request, winner } = await uniswapWinner()
    const prepared = prepareV2UserTransactions(
      prepArgs(request, winner, {
        observedAllowance: {
          chainId: 1,
          token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          owner: USER,
          spender: EXECUTOR,
          amountRaw: GROSS_INPUT,
        },
      }),
    )
    const decoded = decodeExecuteWithCompiledAbi(prepared.swapTransaction.data)
    expect(decoded.intent.chainId.toNumber()).toBe(1)
    expect(decoded.intent.router).toBe(UNISWAP_ROUTER)
    expect(decoded.intent.venueId).toBe(v2VenueIdHash('uniswap'))
    expect(decoded.intent.feeBps.toString()).toBe('15')
    expect(decoded.intent.feeAmount.toString()).toBe('1500')
    expect(decoded.intent.structuralRouteCostBps.toString()).toBe('30')
  })

  it('6: wrong chain / executor / allowance identity fail closed', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { currentChainId: 1 }))).toThrow(
      V2_PREP_CHAIN_MISMATCH,
    )
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { executorAddress: '0x0' }))).toThrow(
      V2_PREP_EXECUTOR_INVALID,
    )
    expect(() =>
      prepareV2UserTransactions(prepArgs(request, winner, { executorAddress: '0x0000000000000000000000000000000000000000' })),
    ).toThrow(V2_PREP_EXECUTOR_INVALID)
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { executorAddress: TEAM }))).toThrow(
      V2_PREP_EXECUTOR_INVALID,
    )
    expect(() =>
      prepareV2UserTransactions(prepArgs(request, winner, { executorAddress: CANONICAL_SMARTSWAP_FEE_BENEFICIARY })),
    ).toThrow(V2_PREP_EXECUTOR_INVALID)
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { executorAddress: PANCAKE_ROUTER }))).toThrow(
      V2_PREP_EXECUTOR_INVALID,
    )
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: undefined }))).toThrow(
      V2_PREP_ALLOWANCE_MISSING,
    )
    expect(() =>
      prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance(GROSS_INPUT, { chainId: 1 }) })),
    ).toThrow(V2_PREP_ALLOWANCE_IDENTITY)
    expect(() =>
      prepareV2UserTransactions(
        prepArgs(request, winner, { observedAllowance: allowance(GROSS_INPUT, { token: PANCAKE_ROUTER }) }),
      ),
    ).toThrow(V2_PREP_ALLOWANCE_IDENTITY)
    expect(() =>
      prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance(GROSS_INPUT, { owner: USER_B }) })),
    ).toThrow(V2_PREP_ALLOWANCE_IDENTITY)
    expect(() =>
      prepareV2UserTransactions(
        prepArgs(request, winner, { observedAllowance: allowance(GROSS_INPUT, { spender: PANCAKE_ROUTER }) }),
      ),
    ).toThrow(V2_PREP_ALLOWANCE_IDENTITY)
    expect(() =>
      prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance('1e6') })),
    ).toThrow(V2_PREP_ALLOWANCE_IDENTITY)
  })

  it('7: stale quote and expired deadline reject', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { nowIso: 'not-a-date' }))).toThrow(
      V2_PREP_NOW_INVALID,
    )
    expect(() => prepareV2UserTransactions(prepArgs(request, winner, { nowIso: '2026-08-20T00:00:30.000Z' }))).toThrow(
      V2_BINDING_QUOTE_STALE,
    )
    expect(() =>
      prepareV2UserTransactions(prepArgs(request, winner, { deadline: Math.floor(Date.parse(NOW) / 1000) })),
    ).toThrow(V2_PREP_DEADLINE_EXPIRED)
  })

  it('8: package has no V1 signer fields and calls buildV2ExecutionBinding', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const prepared = prepareV2UserTransactions(prepArgs(request, winner))
    expect('engineSeal' in prepared.swapTransaction).toBe(false)
    expect('signature' in prepared.swapTransaction).toBe(false)
    expect('intentSigner' in prepared).toBe(false)
    expect(JSON.stringify(prepared)).not.toMatch(/engineSeal|intentSigner|"signature"/)
    const src = readFileSync(path.join(ENGINE, 'v2ExecutionBinding.ts'), 'utf8')
    expect(src).toContain('prepareV2UserTransactions')
    expect(src).toMatch(/buildV2ExecutionBinding\(\{/)
    expect(src).not.toContain('from \'./executionIntent\'')
    expect(src).not.toContain('Permit2')
    expect(src).not.toContain('window.ethereum')
    expect(src).not.toContain('sendTransaction')
  })

  it('9: large integers keep floor rounding and no Number precision loss', async () => {
    const gross = '1000000000000000000000001'
    const fee = computeFeeAmountRaw(gross, 20)
    const net = computeNetVenueInput(gross, 20).netVenueInputRaw
    expect(fee).toBe('2000000000000000000000')
    expect(net).toBe('998000000000000000000001')
    expect(gross).not.toBe(String(Number(gross)))
    const request = bscErc20Request(gross)
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`, '500000')
    const prepared = prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance(gross) }))
    const decoded = decodeExecuteWithCompiledAbi(prepared.swapTransaction.data)
    expect(decoded.intent.inputAmount.toString()).toBe(gross)
    expect(decoded.intent.feeAmount.toString()).toBe(fee)
    expect(decoded.intent.feeAmount.toString()).not.toBe(String(Number(fee)))
  })

  it('10: compiled ABI decode matches binding tuple fields and path', async () => {
    const request = bscErc20Request()
    const winner = await melegaWinner(request)
    const binding = buildV2ExecutionBinding({
      request,
      winner,
      user: USER,
      deadline: DEADLINE,
      nonce: NONCE,
      nowIso: NOW,
    })
    const prepared = prepareV2UserTransactions(prepArgs(request, winner, { observedAllowance: allowance('0') }))
    const decoded = decodeExecuteWithCompiledAbi(prepared.swapTransaction.data)
    const intent = decoded.intent
    expect(intent.version.toString()).toBe(String(binding.intent.version))
    expect(intent.policyId).toBe(binding.intent.policyId)
    expect(intent.policyVersion).toBe(binding.intent.policyVersion)
    expect(intent.chainId.toNumber()).toBe(binding.intent.chainId)
    expect(intent.user).toBe(binding.intent.user)
    expect(intent.inputAsset).toBe(binding.intent.inputAsset)
    expect(intent.outputAsset).toBe(binding.intent.outputAsset)
    expect(intent.inputAmount.toString()).toBe(binding.intent.inputAmount)
    expect(intent.minUserOut.toString()).toBe(binding.intent.minUserOut)
    expect(intent.venueId).toBe(binding.intent.venueId)
    expect(intent.router).toBe(binding.intent.router)
    expect(intent.routeHash).toBe(binding.intent.routeHash)
    expect(intent.feeBps.toString()).toBe(String(binding.intent.feeBps))
    expect(intent.feeAmount.toString()).toBe(binding.intent.feeAmount)
    expect(intent.feeAsset).toBe(binding.intent.feeAsset)
    expect(intent.beneficiary).toBe(binding.intent.beneficiary)
    expect(intent.structuralRouteCostBps.toString()).toBe(String(binding.intent.structuralRouteCostBps))
    expect(intent.deadline.toNumber()).toBe(binding.intent.deadline)
    expect(intent.nonce.toString()).toBe(binding.intent.nonce)
    expect(intent.nativeIn).toBe(false)
    expect(intent.nativeOut).toBe(false)
    expect(decoded.path).toEqual(binding.path)
    expect(intent.inputAsset).not.toBe(V2_NATIVE_ASSET)
  })

  it('11: production flags stay frozen', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)
  })
})

describe('SmartSwap V2 unsigned transaction local Anvil', () => {
  let anvil: ChildProcess | undefined
  let provider: JsonRpcProvider
  let owner: string
  let userA: string
  let userB: string
  let executor: string
  const evidence: string[] = []

  async function rpc(method: string, params: unknown[] = []) {
    return provider.send(method, params)
  }

  async function sendExact(tx: UnsignedUserTransaction) {
    const hash = await rpc('eth_sendTransaction', [
      { from: tx.from, to: tx.to, data: tx.data, value: tx.value },
    ])
    const receipt = await provider.waitForTransaction(hash)
    if (!receipt) throw new Error('LOCAL_TX_NO_RECEIPT')
    if (receipt.status !== 1) throw new Error(`LOCAL_TX_REVERTED:${tx.to}`)
    return receipt
  }

  function loadArtifact(rel: string) {
    const file = path.join(REPO, rel)
    if (!existsSync(file)) throw new Error(`LOCAL_ARTIFACT_MISSING:${rel}`)
    return JSON.parse(readFileSync(file, 'utf8'))
  }

  async function setCode(address: string, artifactRel: string) {
    const artifact = loadArtifact(artifactRel)
    await rpc('anvil_setCode', [address, artifact.deployedBytecode.object])
  }

  async function token(address: string) {
    return {
      address,
      async mint(to: string, amount: string) {
        const data = new Interface(ERC20_VIEW).encodeFunctionData('mint', [to, amount])
        await rpc('eth_sendTransaction', [{ from: owner, to: address, data }])
      },
      async balanceOf(who: string) {
        const data = new Interface(ERC20_VIEW).encodeFunctionData('balanceOf', [who])
        const raw = await rpc('eth_call', [{ to: address, data }, 'latest'])
        return BigInt(raw).toString()
      },
      async allowance(who: string, spender: string) {
        const data = new Interface(ERC20_VIEW).encodeFunctionData('allowance', [who, spender])
        const raw = await rpc('eth_call', [{ to: address, data }, 'latest'])
        return BigInt(raw).toString()
      },
    }
  }

  beforeAll(async () => {
    execFileSync('which', ['anvil'])
    execSync('FOUNDRY_PROFILE=smartswap_executor_release forge build', { cwd: REPO, stdio: 'pipe' })
    execSync('forge build', { cwd: REPO, stdio: 'pipe' })
    anvil = spawn(
      'anvil',
      ['--host', ANVIL_HOST, '--port', String(ANVIL_PORT), '--chain-id', '56', '--accounts', '10'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    provider = new JsonRpcProvider(`http://${ANVIL_HOST}:${ANVIL_PORT}`)
    let ready = false
    for (let i = 0; i < 80; i += 1) {
      try {
        const chain = await provider.send('eth_chainId', [])
        if (chain) {
          ready = true
          break
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
    if (!ready) throw new Error('ANVIL_NOT_READY')
    const accounts: string[] = await rpc('eth_accounts')
    owner = getAddress(accounts[0])
    userA = getAddress(accounts[1])
    userB = getAddress(accounts[2])
    expect(userA).not.toBe(getAddress(TEAM))
    expect(userB).not.toBe(getAddress(TEAM))
    expect(owner).not.toBe(getAddress(TEAM))
    await setCode(WBNB_CHECKSUM, 'out/MockWBNB.sol/MockWBNB.json')
    await setCode(USDC_BSC_CHECKSUM, 'out/MockERC20.sol/MockERC20.json')
    await setCode(MELEGA_ROUTER, 'out/MockSmartSwapV2Router.sol/MockSmartSwapV2Router.json')
    await setCode(PANCAKE_ROUTER, 'out/MockSmartSwapV2Router.sol/MockSmartSwapV2Router.json')
    const executorArt = compiledExecutorArtifact()
    const ctor = new Interface(executorArt.abi).encodeDeploy([
      CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
      WBNB_CHECKSUM,
      owner,
    ])
    const deployHash = await rpc('eth_sendTransaction', [
      { from: owner, data: `${executorArt.bytecode.object}${ctor.slice(2)}` },
    ])
    const deployReceipt = await provider.waitForTransaction(deployHash)
    if (!deployReceipt?.contractAddress) throw new Error('EXECUTOR_DEPLOY_FAILED')
    executor = getAddress(deployReceipt.contractAddress)
    const setRouter = new Interface(executorArt.abi)
    await rpc('eth_sendTransaction', [
      {
        from: owner,
        to: executor,
        data: setRouter.encodeFunctionData('setRouter', [MELEGA_ROUTER, v2VenueIdHash('melega-dex'), true]),
      },
    ])
    await rpc('eth_sendTransaction', [
      {
        from: owner,
        to: executor,
        data: setRouter.encodeFunctionData('setRouter', [PANCAKE_ROUTER, v2VenueIdHash('pancakeswap'), true]),
      },
    ])
    const wbnb = await token(WBNB_CHECKSUM)
    const usdc = await token(USDC_BSC_CHECKSUM)
    await wbnb.mint(userA, '100000000')
    await wbnb.mint(userB, '100000000')
    await usdc.mint(MELEGA_ROUTER, '100000000')
    await usdc.mint(PANCAKE_ROUTER, '100000000')
    evidence.push(`anvil=${ANVIL_HOST}:${ANVIL_PORT}`)
    evidence.push(`executor=${executor}`)
    evidence.push(`userA=${userA}`)
    evidence.push(`userB=${userB}`)
  }, 90_000)

  afterAll(() => {
    if (anvil && !anvil.killed) anvil.kill('SIGTERM')
  })

  it('local EVM: userA Melega, userB Pancake, fee/net/replay/rollback', async () => {
    const request = bscErc20Request()
    const wbnb = await token(WBNB_CHECKSUM)
    const usdc = await token(USDC_BSC_CHECKSUM)
    const executorArt = compiledExecutorArtifact()
    const execIface = new Interface(executorArt.abi)

    const melega = await melegaWinner(request)
    const melegaPrep = prepareV2UserTransactions({
      request,
      winner: melega,
      user: userA,
      deadline: DEADLINE,
      nonce: NONCE,
      nowIso: NOW,
      currentChainId: 56,
      executorAddress: executor,
      observedAllowance: { chainId: 56, token: WBNB_CHECKSUM, owner: userA, spender: executor, amountRaw: '0' },
    })
    expect(melegaPrep.approvalTransactions).toHaveLength(1)
    const treasuryBeforeA = await wbnb.balanceOf(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    const userAInBefore = await wbnb.balanceOf(userA)
    const userAOutBefore = await usdc.balanceOf(userA)
    for (const tx of melegaPrep.approvalTransactions) {
      const receipt = await sendExact(tx)
      expect(receipt.status).toBe(1)
    }
    const swapA = await sendExact(melegaPrep.swapTransaction)
    expect(swapA.status).toBe(1)
    const decodedA = decodeExecuteWithCompiledAbi(melegaPrep.swapTransaction.data)
    expect(decodedA.intent.router).toBe(MELEGA_ROUTER)
    expect(decodedA.intent.inputAmount.toString()).toBe(GROSS_INPUT)
    expect(decodedA.intent.feeAmount.toString()).toBe('2000')
    expect(await wbnb.balanceOf(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)).toBe(
      (BigInt(treasuryBeforeA) + BigInt(2000)).toString(),
    )
    expect(await wbnb.balanceOf(userA)).toBe((BigInt(userAInBefore) - BigInt(GROSS_INPUT)).toString())
    expect(await usdc.balanceOf(userA)).toBe((BigInt(userAOutBefore) + BigInt(decodedA.intent.minUserOut.toString()) + BigInt(1)).toString())
    expect(await wbnb.balanceOf(executor)).toBe('0')
    expect(await usdc.balanceOf(executor)).toBe('0')
    expect(await wbnb.allowance(executor, MELEGA_ROUTER)).toBe('0')
    const melegaIn = await rpc('eth_call', [
      { to: MELEGA_ROUTER, data: new Interface(ERC20_VIEW).encodeFunctionData('lastAmountIn', []) },
      'latest',
    ])
    expect(BigInt(melegaIn).toString()).toBe('998000')
    evidence.push('userA_melega=pass')

    const pancake = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const pancakePrep = prepareV2UserTransactions({
      request,
      winner: pancake,
      user: userB,
      deadline: DEADLINE,
      nonce: NONCE,
      nowIso: NOW,
      currentChainId: 56,
      executorAddress: executor,
      observedAllowance: { chainId: 56, token: WBNB_CHECKSUM, owner: userB, spender: executor, amountRaw: '0' },
    })
    for (const tx of pancakePrep.approvalTransactions) {
      expect((await sendExact(tx)).status).toBe(1)
    }
    expect((await sendExact(pancakePrep.swapTransaction)).status).toBe(1)
    const decodedB = decodeExecuteWithCompiledAbi(pancakePrep.swapTransaction.data)
    expect(decodedB.intent.router).toBe(PANCAKE_ROUTER)
    expect(decodedB.intent.nonce.toString()).toBe(String(NONCE))
    expect(decodedA.intent.nonce.toString()).toBe(String(NONCE))
    expect(decodedB.intent.user).not.toBe(decodedA.intent.user)
    const pancakeIn = await rpc('eth_call', [
      { to: PANCAKE_ROUTER, data: new Interface(ERC20_VIEW).encodeFunctionData('lastAmountIn', []) },
      'latest',
    ])
    expect(BigInt(pancakeIn).toString()).toBe('998000')
    evidence.push('userB_pancake=pass')

    await expect(sendExact(melegaPrep.swapTransaction)).rejects.toThrow()
    const usedA = await rpc('eth_call', [
      { to: executor, data: execIface.encodeFunctionData('usedNonce', [userA, NONCE]) },
      'latest',
    ])
    expect(Boolean(Number(usedA))).toBe(true)
    evidence.push('replay_rejected=pass')

    const rollbackPrep = prepareV2UserTransactions({
      request,
      winner: melega,
      user: userA,
      deadline: DEADLINE,
      nonce: 8,
      nowIso: NOW,
      currentChainId: 56,
      executorAddress: executor,
      observedAllowance: { chainId: 56, token: WBNB_CHECKSUM, owner: userA, spender: executor, amountRaw: '0' },
    })
    for (const tx of rollbackPrep.approvalTransactions) {
      expect((await sendExact(tx)).status).toBe(1)
    }
    expect(await wbnb.allowance(userA, executor)).toBe(GROSS_INPUT)
    await rpc('eth_sendTransaction', [
      {
        from: userA,
        to: MELEGA_ROUTER,
        data: new Interface(ERC20_VIEW).encodeFunctionData('setRevertNext', [true]),
      },
    ])
    const treasuryBeforeRevert = await wbnb.balanceOf(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    const userBeforeRevert = await wbnb.balanceOf(userA)
    await expect(sendExact(rollbackPrep.swapTransaction)).rejects.toThrow()
    expect(await wbnb.allowance(userA, executor)).toBe(GROSS_INPUT)
    expect(await wbnb.balanceOf(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)).toBe(treasuryBeforeRevert)
    expect(await wbnb.balanceOf(userA)).toBe(userBeforeRevert)
    const usedRollback = await rpc('eth_call', [
      { to: executor, data: execIface.encodeFunctionData('usedNonce', [userA, 8]) },
      'latest',
    ])
    expect(Boolean(Number(usedRollback))).toBe(false)
    evidence.push('rollback_preserves_approval=pass')
    evidence.push('V2_UNSIGNED_TRANSACTION_PREPARATION_LOCAL_PASS')
    expect(evidence.join(' ')).toContain('V2_UNSIGNED_TRANSACTION_PREPARATION_LOCAL_PASS')
    expect(provider.connection.url).toBe(`http://${ANVIL_HOST}:${ANVIL_PORT}`)
  }, 90_000)
})
