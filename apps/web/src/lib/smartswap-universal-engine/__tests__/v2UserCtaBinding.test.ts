import { spawn, execFileSync, execSync, type ChildProcess } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { JsonRpcProvider } from '@ethersproject/providers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS, evmNative } from '../assetIdentity'
import { evmNetwork } from '../domain'
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
  V2_EXECUTION_RUNTIME_CONFIG,
  V2_EXECUTOR_CONFIG_STATUS,
  resolveV2ExecutorConfig,
  type V2ExecutorConfigTable,
} from '../v2ExecutionRuntimeConfig'
import {
  EXECUTOR_V2_EXECUTE_FRAGMENT,
  v2VenueIdHash,
  type ObservedAllowanceIdentity,
  type UnsignedUserTransaction,
} from '../v2ExecutionBinding'
import {
  V2_CTA_DECISION,
  V2_PLAN_REASON,
  V2_PUBLIC_ACTION,
  V2_TEST_ONLY_CTA_EXECUTION_GATE,
  V2_USER_LOCAL_NONCE_SOURCE,
  buildV2UserExecutionPlan,
  consumePreparedV2UserPlan,
  currentRequestKeyOf,
  nextV2UserLocalNonce,
  resolveSmartSwapCtaDecision,
  selectSmartSwapCtaExecution,
  type V2ShadowRuntimeFacts,
  type V2UserExecutionPlan,
} from '../v2UserExecutionPlan'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const NOW = '2026-08-20T00:00:05.000Z'
const GROSS_INPUT = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = '0x3333333333333333333333333333333333333333'
const TEAM = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const DEADLINE = 1_893_456_000
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
const ANVIL_PORT = 18557
const ERC20_VIEW = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
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
    requestId: 'v2-cta-bsc-erc20',
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
    requestId: 'v2-cta-bsc-native',
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
    requestId: 'v2-cta-uni-erc20',
    network: evmNetwork(1),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function testExecutorTable(chainId: number, executor = EXECUTOR): V2ExecutorConfigTable {
  return {
    [chainId]: {
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: true,
      executorAddress: executor,
    },
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

function readyShadow(request: SmartSwapRequest, winner: ShadowCandidate): V2ShadowRuntimeFacts {
  return {
    status: 'ready',
    requestKey: currentRequestKeyOf(request),
    winner,
    v2Available: true,
  }
}

function planArgs(
  request: SmartSwapRequest,
  winner: ShadowCandidate,
  extra: Partial<Parameters<typeof buildV2UserExecutionPlan>[0]> = {},
) {
  const nativeIn = request.inputAsset.location.kind === 'native'
  return buildV2UserExecutionPlan({
    user: USER,
    walletChainId: request.network.domain === 'EVM' ? request.network.chainId : 0,
    request,
    requestKey: currentRequestKeyOf(request),
    shadow: readyShadow(request, winner),
    observedAllowance: nativeIn
      ? undefined
      : request.network.domain === 'EVM' && request.network.chainId === 1
        ? {
            chainId: 1,
            token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            owner: USER,
            spender: EXECUTOR,
            amountRaw: GROSS_INPUT,
          }
        : allowance(GROSS_INPUT),
    allowanceReadStatus: nativeIn ? 'native' : 'ok',
    nowIso: NOW,
    deadline: DEADLINE,
    nonce: nextV2UserLocalNonce(Date.parse(NOW)),
    executorConfigByChain: testExecutorTable(request.network.domain === 'EVM' ? request.network.chainId : 0),
    ...extra,
  })
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

function decodeExecute(data: string) {
  return new Interface(EXECUTOR_V2_EXECUTE_FRAGMENT).decodeFunctionData('execute', data)
}

function publicDecision(plan: V2UserExecutionPlan, gate: boolean = V2_TEST_ONLY_CTA_EXECUTION_GATE) {
  return resolveSmartSwapCtaDecision({
    planOk: plan.ok,
    cutoverAllowed: isProductionCutoverAllowed(),
    testOnlyExecutionGate: gate,
    planReason: plan.reason,
  })
}

describe('SmartSwap V2 user-only CTA binding', () => {
  it('production executor config is NOT_CONFIGURED on BSC and Ethereum', () => {
    expect(V2_EXECUTION_RUNTIME_CONFIG[56]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
      enabled: false,
      executorAddress: null,
    })
    expect(V2_EXECUTION_RUNTIME_CONFIG[1]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
      enabled: false,
      executorAddress: null,
    })
    expect(resolveV2ExecutorConfig(56).status).toBe(V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED)
    expect(resolveV2ExecutorConfig(1).enabled).toBe(false)
    expect(V2_TEST_ONLY_CTA_EXECUTION_GATE).toBe(false)
    const src = readFileSync(path.join(ENGINE, 'v2ExecutionRuntimeConfig.ts'), 'utf8')
    expect(src).not.toMatch(/process\.env/)
    expect(src).not.toMatch(/NEXT_PUBLIC_.*EXECUTOR/)
  })

  it('1: BSC Melega winner produces a complete V2 user plan', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await melegaWinner(request), { observedAllowance: allowance('0') })
    expect(plan.ok).toBe(true)
    expect(plan.decision).toBe(V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED)
    expect(plan.winnerVenueId).toBe('melega-dex')
    expect(plan.executorAddress).toBe(EXECUTOR)
    expect(plan.preparation?.swapTransaction.to).toBe(EXECUTOR)
    expect(decodeExecute(plan.preparation!.swapTransaction.data).intent.router).toBe(MELEGA_ROUTER)
    expect(plan.nonceSource).toBe(V2_USER_LOCAL_NONCE_SOURCE)
    expect(plan.nonce).toBe(nextV2UserLocalNonce(Date.parse(NOW)))
  })

  it('2: BSC Pancake winner produces a complete V2 user plan', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`))
    expect(plan.ok).toBe(true)
    expect(plan.winnerVenueId).toBe('pancakeswap')
    expect(decodeExecute(plan.preparation!.swapTransaction.data).intent.router).toBe(PANCAKE_ROUTER)
  })

  it('3: ETH Uniswap winner produces a complete V2 user plan', async () => {
    const { request, winner } = await uniswapWinner()
    const plan = planArgs(request, winner)
    expect(plan.ok).toBe(true)
    expect(plan.winnerVenueId).toBe('uniswap')
    expect(plan.preparation?.swapTransaction.chainId).toBe(1)
    expect(decodeExecute(plan.preparation!.swapTransaction.data).intent.router).toBe(UNISWAP_ROUTER)
    expect(decodeExecute(plan.preparation!.swapTransaction.data).intent.minUserOut.toString()).toBe(
      computeMinimumReceived('400000', 50),
    )
  })

  it('4/5: ERC20 insufficient allowance is approval→execute; sufficient is execute only', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const low = planArgs(request, winner, { observedAllowance: allowance('0') })
    expect(low.preparation?.approvalTransactions).toHaveLength(1)
    expect(decodeApprove(low.preparation!.approvalTransactions[0].data)).toEqual({
      spender: EXECUTOR,
      amount: GROSS_INPUT,
    })
    const enough = planArgs(request, winner, { observedAllowance: allowance(GROSS_INPUT) })
    expect(enough.preparation?.approvalTransactions).toEqual([])
  })

  it('6: native input is execute only with correct msg.value', async () => {
    const request = bscNativeInRequest()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`))
    expect(plan.ok).toBe(true)
    expect(plan.preparation?.approvalTransactions).toEqual([])
    expect(plan.preparation?.swapTransaction.value).toBe('0xf4240')
    expect(BigInt(plan.preparation!.swapTransaction.value)).toBe(BigInt(GROSS_INPUT))
    expect(plan.approvalSpender).toBeNull()
  })

  it('7/8: approval spender is ExecutorV2; Team/Treasury are never signer or spender', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await melegaWinner(request), { observedAllowance: allowance('0') })
    const approve = decodeApprove(plan.preparation!.approvalTransactions[0].data)
    expect(approve.spender).toBe(EXECUTOR)
    expect(approve.spender).not.toBe(getAddress(TEAM))
    expect(approve.spender).not.toBe(getAddress(CANONICAL_SMARTSWAP_FEE_BENEFICIARY))
    expect(plan.preparation!.swapTransaction.from).toBe(USER)
    expect(plan.preparation!.swapTransaction.from).not.toBe(getAddress(TEAM))
    expect(plan.preparation!.swapTransaction.to).not.toBe(getAddress(TEAM))
    expect(plan.preparation!.swapTransaction.to).not.toBe(getAddress(CANONICAL_SMARTSWAP_FEE_BENEFICIARY))
    expect(plan.teamIsSigner).toBe(false)
    expect(plan.teamIsSpender).toBe(false)
    expect(plan.treasuryIsSigner).toBe(false)
    expect(plan.treasuryIsSpender).toBe(false)
    expect(resolveV2ExecutorConfig(56, testExecutorTable(56, TEAM)).status).toBe(
      V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
    )
    expect(
      resolveV2ExecutorConfig(56, testExecutorTable(56, CANONICAL_SMARTSWAP_FEE_BENEFICIARY)).executorAddress,
    ).toBeNull()
  })

  it('9: stale or mismatched winner cannot execute V2', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const stale = planArgs(request, { ...winner, status: 'stale' })
    expect(stale.ok).toBe(false)
    expect(stale.decision).toBe(V2_CTA_DECISION.LEGACY)
    expect(stale.reason).toBe(V2_PLAN_REASON.SHADOW_STALE)
    const mismatched = planArgs(request, winner, {
      requestKey: '56:other:other:1:50',
    })
    expect(mismatched.ok).toBe(false)
    expect(mismatched.reason).toBe(V2_PLAN_REASON.REQUEST_MISMATCH)
    const otherAmount = planArgs(request, winner, {
      request: { ...request, inputAmountRaw: '999' },
      requestKey: currentRequestKeyOf({ ...request, inputAmountRaw: '999' }),
    })
    expect(otherAmount.ok).toBe(false)
  })

  it('10: wallet wrong-chain cannot execute V2', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`), {
      walletChainId: 1,
      executorConfigByChain: { ...testExecutorTable(56), ...testExecutorTable(1) },
    })
    expect(plan.ok).toBe(false)
    expect(plan.reason).toBe(V2_PLAN_REASON.CHAIN_MISMATCH)
    expect(plan.preparation).toBeNull()
  })

  it('11: missing executor config fail-closes and leaves legacy selectable', async () => {
    const productionHookPlan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request: null,
      requestKey: null,
      shadow: null,
      allowanceReadStatus: 'unread',
      nowIso: NOW,
      deadline: DEADLINE,
    })
    expect(productionHookPlan.ok).toBe(false)
    expect(productionHookPlan.reason).toBe(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED)
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const plan = planArgs(request, winner, { executorConfigByChain: undefined })
    expect(plan.ok).toBe(false)
    expect(plan.reason).toBe(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED)
    const legacyRun = async () => 'legacy-hash'
    const selected = selectSmartSwapCtaExecution({
      decision: publicDecision(plan, false),
      plan,
      legacyCallback: legacyRun,
      consumeV2: async () => 'v2-hash',
    })
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(await selected.run?.()).toBe('legacy-hash')
  })

  it('12: cutover=false keeps the production CTA on LEGACY even when a V2 plan is ready', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`))
    expect(plan.ok).toBe(true)
    expect(isProductionCutoverAllowed()).toBe(false)
    const decision = publicDecision(plan, false)
    expect(decision.decision).toBe(V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED)
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    const selected = selectSmartSwapCtaExecution({
      decision,
      plan,
      legacyCallback: async () => 'legacy-hash',
      consumeV2: async () => 'v2-hash',
    })
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(await selected.run?.()).toBe('legacy-hash')
  })

  it('13: test-only gate lets the existing CTA consume the prepared V2 plan', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`), {
      observedAllowance: allowance(GROSS_INPUT),
    })
    const decision = publicDecision(plan, true)
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const sent: UnsignedUserTransaction[] = []
    const selected = selectSmartSwapCtaExecution({
      decision,
      plan,
      legacyCallback: async () => 'legacy-hash',
      consumeV2: () =>
        consumePreparedV2UserPlan({
          plan,
          testOnlyExecutionGate: true,
          cutoverAllowed: false,
          submitUserTransaction: async (tx) => {
            sent.push(tx)
            return { hash: `0x${sent.length}` }
          },
          waitForReceipt: async () => ({ status: 1 }),
        }),
    })
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    expect(await selected.run?.()).toBe('0x1')
    expect(sent).toHaveLength(1)
    expect(sent[0]).toEqual(plan.preparation?.swapTransaction)
  })

  it('14: rejected approval does not submit execute', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`), {
      observedAllowance: allowance('0'),
    })
    const sent: string[] = []
    await expect(
      consumePreparedV2UserPlan({
        plan,
        testOnlyExecutionGate: true,
        cutoverAllowed: false,
        submitUserTransaction: async (tx) => {
          sent.push(tx.to)
          if (tx.to === WBNB_CHECKSUM) throw new Error('Transaction rejected.')
          return { hash: '0xexecute' }
        },
        waitForReceipt: async () => ({ status: 1 }),
      }),
    ).rejects.toThrow(/V2_APPROVAL_REJECTED/)
    expect(sent).toEqual([WBNB_CHECKSUM])
  })

  it('15: failed execute does not automatically run a second legacy swap', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`))
    let legacyCalls = 0
    const selected = selectSmartSwapCtaExecution({
      decision: publicDecision(plan, true),
      plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy-hash'
      },
      consumeV2: () =>
        consumePreparedV2UserPlan({
          plan,
          testOnlyExecutionGate: true,
          cutoverAllowed: false,
          submitUserTransaction: async () => ({ hash: '0xexec' }),
          waitForReceipt: async () => ({ status: 0 }),
        }),
    })
    await expect(selected.run?.()).rejects.toThrow('V2_EXECUTE_FAILED')
    expect(legacyCalls).toBe(0)
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
  })

  it('16: plan and CTA path have no server/platform signature fields', async () => {
    const request = bscErc20Request()
    const plan = planArgs(request, await melegaWinner(request))
    expect(JSON.stringify(plan)).not.toMatch(/engineSeal|intentSigner|"signature"|kms|relayer/i)
    expect(plan.binding && 'engineSeal' in plan.binding.intent).toBe(false)
    const src = [
      readFileSync(path.join(ENGINE, 'v2UserExecutionPlan.ts'), 'utf8'),
      readFileSync(path.join(ENGINE, 'v2ExecutionRuntimeConfig.ts'), 'utf8'),
      readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSmartSwapV2CtaBinding.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toMatch(/intentSigner|engineSeal|KMS|relayer/)
    expect(src).toContain(V2_USER_LOCAL_NONCE_SOURCE)
  })

  it('17: production modes and public CTA remain legacy', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)
    const commit = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx'), 'utf8')
    expect(commit).toContain('selectSmartSwapCtaExecution')
    expect(commit).toContain('useSmartSwapV2CtaBinding')
    expect(commit).toContain('useSmartSwapExecution')
    expect(commit).toContain('data-swap-action-cta')
    const callback = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(callback).toContain('prepareMelegaSmartRouterSwap')
    expect(callback).not.toContain('prepareV2UserTransactions')
    expect(callback).not.toContain('v2UserExecutionPlan')
  })

  it('unread ERC20 allowance and unread shadow fail closed to legacy', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const unread = planArgs(request, winner, { allowanceReadStatus: 'unread', observedAllowance: undefined })
    expect(unread.ok).toBe(false)
    expect(unread.reason).toBe(V2_PLAN_REASON.ALLOWANCE_UNREAD)
    const noShadow = planArgs(request, winner, { shadow: null })
    expect(noShadow.reason).toBe(V2_PLAN_REASON.SHADOW_NOT_READY)
  })
})

describe('local CTA proof: approval receipt then execute', () => {
  let anvil: ChildProcess | undefined
  let provider: JsonRpcProvider
  let owner: string
  let userA: string
  let executor: string

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

  async function rpc(method: string, params: unknown[] = []) {
    return provider.send(method, params)
  }

  beforeAll(async () => {
    execFileSync('which', ['anvil'])
    ensureCompiledExecutor()
    for (const rel of [
      'out/MockWBNB.sol/MockWBNB.json',
      'out/MockERC20.sol/MockERC20.json',
      'out/MockSmartSwapV2Router.sol/MockSmartSwapV2Router.json',
    ]) {
      if (!existsSync(path.join(REPO, rel))) {
        execSync('forge build', { cwd: REPO, stdio: 'pipe' })
        break
      }
    }
    anvil = spawn(
      'anvil',
      ['--host', ANVIL_HOST, '--port', String(ANVIL_PORT), '--chain-id', '56', '--accounts', '10'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    provider = new JsonRpcProvider({
      url: `http://${ANVIL_HOST}:${ANVIL_PORT}`,
      timeout: 1500,
      throttleLimit: 1,
    })
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
    const setCode = async (address: string, artifactRel: string) => {
      const artifact = JSON.parse(readFileSync(path.join(REPO, artifactRel), 'utf8'))
      await rpc('anvil_setCode', [address, artifact.deployedBytecode.object])
    }
    await setCode(WBNB_CHECKSUM, 'out/MockWBNB.sol/MockWBNB.json')
    await setCode(USDC_BSC_CHECKSUM, 'out/MockERC20.sol/MockERC20.json')
    await setCode(MELEGA_ROUTER, 'out/MockSmartSwapV2Router.sol/MockSmartSwapV2Router.json')
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
    const mint = new Interface(ERC20_VIEW)
    await rpc('eth_sendTransaction', [
      { from: owner, to: WBNB_CHECKSUM, data: mint.encodeFunctionData('mint', [userA, '100000000']) },
    ])
    await rpc('eth_sendTransaction', [
      { from: owner, to: USDC_BSC_CHECKSUM, data: mint.encodeFunctionData('mint', [MELEGA_ROUTER, '100000000']) },
    ])
  }, 90_000)

  afterAll(() => {
    if (anvil && !anvil.killed) anvil.kill('SIGTERM')
  })

  it('CTA consume: approval receipt then execute with prepared calldata', async () => {
    const request = bscErc20Request()
    const winner = await melegaWinner(request)
    const plan = planArgs(request, winner, {
      user: userA,
      observedAllowance: {
        chainId: 56,
        token: WBNB_CHECKSUM,
        owner: userA,
        spender: executor,
        amountRaw: '0',
      },
      executorConfigByChain: testExecutorTable(56, executor),
    })
    expect(plan.ok).toBe(true)
    expect(plan.preparation?.approvalTransactions).toHaveLength(1)
    expect(decodeApprove(plan.preparation!.approvalTransactions[0].data).spender).toBe(executor)
    const decision = publicDecision(plan, true)
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const selected = selectSmartSwapCtaExecution({
      decision,
      plan,
      legacyCallback: async () => 'legacy-hash',
      consumeV2: () =>
        consumePreparedV2UserPlan({
          plan,
          testOnlyExecutionGate: true,
          cutoverAllowed: false,
          submitUserTransaction: async (tx) => {
            const hash = await rpc('eth_sendTransaction', [
              { from: tx.from, to: tx.to, data: tx.data, value: tx.value },
            ])
            return { hash }
          },
          waitForReceipt: async (hash) => {
            const receipt = await provider.waitForTransaction(hash)
            if (!receipt) throw new Error('LOCAL_TX_NO_RECEIPT')
            return { status: receipt.status ?? 0 }
          },
        }),
    })
    const hash = await selected.run!()
    expect(hash).toMatch(/^0x/)
    const receipt = await provider.waitForTransaction(hash)
    expect(receipt?.status).toBe(1)
    const melegaIn = await rpc('eth_call', [
      { to: MELEGA_ROUTER, data: new Interface(ERC20_VIEW).encodeFunctionData('lastAmountIn', []) },
      'latest',
    ])
    expect(BigInt(melegaIn).toString()).toBe('998000')
    expect(provider.connection.url).toBe(`http://${ANVIL_HOST}:${ANVIL_PORT}`)
  }, 90_000)
})
