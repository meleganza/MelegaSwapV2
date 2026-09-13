import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { PANCAKE_SWAP_VENUE, UNISWAP_VENUE, VENUE_SUPPORT } from '../certifiedVenues'
import { computeStructuralRouteCost } from '../costTaxonomy'
import { EVM_CHAIN_IDS, solanaExecutionEnabled } from '../domain'
import {
  DETERMINISTIC_BYTECODE,
  DETERMINISTIC_COMPILER_LOCK,
  EXECUTOR_RECERTIFICATION_BROADCAST,
  EXECUTOR_SOURCE_GIT_BLOB,
  EXECUTOR_SOURCE_SHA256,
  SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS,
} from '../executorDeterministicArtifact'
import { assertExecutionIntent, authorizedSmartSwapFeeBps, sealExecutionIntent } from '../executionIntent'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable } from '../fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import {
  PRODUCTION_EXECUTION_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import { UNISWAP_CANARY_NEXT_GATE, firstCanonicalUniswapShadowRequest } from '../uniswapShadowQuoteReadiness'
import {
  BSC_CERTIFIED_DEPLOYER,
  EXECUTOR_REUSE_PATH,
  UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED,
  UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED,
  UNISWAP_ETHEREUM_CANARY_PREP_ID,
  UNISWAP_ETHEREUM_CANARY_PREP_VERDICT,
  UNISWAP_ETHEREUM_DEPLOYER_UNDEFINED,
  assertCanonicalEthereumWrappedNative,
  assertUniswapCatalogRouterUnchanged,
  buildEthereumUnsignedCanaryIntentPackage,
  buildEthereumUnsignedCreatePackage,
  buildEthereumUnsignedSetRouterPackage,
  certifyUniswapEthereumCanaryPrep,
  inspectCertifiedEthereumCanaryPair,
  predictCreateAddress,
  previewOnlyFeeCannotBeProductionCapable,
  sealUniswapEthereumCanaryIntent,
  sealUniswapEthereumSimulationIntent,
  shadowQuoteExampleIsNotCanaryPair,
  uniswapEthereumSmartSwapFeeBps,
  uniswapEthereumStructuralRouteCostBps,
} from '../uniswapEthereumCanaryPrep'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { VENUE_FEE_ENFORCEMENT_FUTURE } from '../venueFeeEnforcementFuture'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const EXECUTOR = path.join(REPO, 'contracts/smartswap/SmartSwapExecutorV1.sol')
const FOUNDRY = path.join(REPO, 'foundry.toml')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')
const ARTIFACT = path.join(REPO, 'deployments/smartswap-executor-v1/smart-swap-executor-v1-artifact.json')
const COMPILER_INPUT = path.join(REPO, 'deployments/smartswap-executor-v1/compiler-input.json')
const EVIDENCE = path.join(WEB, 'docs/runtime/smartswap-uniswap-ethereum-canary-prep/uniswap-ethereum-canary-prep.json')

const USER = '0x1111111111111111111111111111111111111111'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const NOW = 1_777_000_000

describe('Uniswap Ethereum canary preparation', () => {
  it('proves ExecutorV1 source/artifact reuse on Ethereum without source changes', () => {
    expect(existsSync(EXECUTOR)).toBe(true)
    expect(createHash('sha256').update(readFileSync(EXECUTOR)).digest('hex')).toBe(EXECUTOR_SOURCE_SHA256)
    expect(EXECUTOR_SOURCE_GIT_BLOB).toBe('7869980ca19ce62bebc99e17670c99cc7e637172')
    const source = readFileSync(EXECUTOR, 'utf8')
    expect(source).toContain('contract SmartSwapExecutorV1')
    expect(source).toContain('constructor(address treasury_, address intentSigner_, address wrappedNative_, address owner_)')
    expect(source).toContain('function setRouter(address router, bytes32 venueId, bool allowed)')
    expect(source).toContain('if (intent.chainId != block.chainid) revert WrongChain()')
    expect(source).toContain('function authorizedFeeBps(uint256 structuralRouteCostBps)')
    expect(source).not.toContain('chainid == 56')
    expect(source).not.toContain('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    expect(source).not.toContain('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')
    expect(EXECUTOR_REUSE_PATH.reusableWithoutSourceChange).toBe(true)
    expect(EXECUTOR_REUSE_PATH.sourceChangeRequired).toBe(false)
    expect(EXECUTOR_REUSE_PATH.newContractDesignRequired).toBe(false)
    expect(EXECUTOR_REUSE_PATH.exactInOnly).toBe(true)
  })

  it('reproduces deterministic artifact hashes', () => {
    const artifact = JSON.parse(readFileSync(ARTIFACT, 'utf8')) as {
      status: string
      creationBytecodeKeccak: string
      deployedBytecodeKeccak: string
      creationBytecodeLength: number
      deployedBytecodeLength: number
      compilerInputSha256: string
      sourceSha256: string
      sourceGitBlob: string
    }
    expect(artifact.status).toBe(SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS)
    expect(artifact.creationBytecodeKeccak).toBe(DETERMINISTIC_BYTECODE.creationKeccak)
    expect(artifact.deployedBytecodeKeccak).toBe(DETERMINISTIC_BYTECODE.deployedKeccak)
    expect(artifact.creationBytecodeLength).toBe(8584)
    expect(artifact.deployedBytecodeLength).toBe(8062)
    expect(artifact.sourceSha256).toBe(EXECUTOR_SOURCE_SHA256)
    expect(artifact.sourceGitBlob).toBe(EXECUTOR_SOURCE_GIT_BLOB)
    expect(createHash('sha256').update(readFileSync(COMPILER_INPUT)).digest('hex')).toBe(
      DETERMINISTIC_COMPILER_LOCK.compilerInputSha256,
    )
    const toml = readFileSync(FOUNDRY, 'utf8')
    expect(toml).toContain('[profile.smartswap_executor_release]')
    expect(toml).toContain('bytecode_hash = "none"')
    expect(toml).toContain('cbor_metadata = false')
  })

  it('keeps the certified Uniswap Ethereum router and does not invent a canary pair', () => {
    expect(assertUniswapCatalogRouterUnchanged()).toBe('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(assertCanonicalEthereumWrappedNative()).toBe('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
    expect(UNISWAP_VENUE.support[1]).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    const pair = inspectCertifiedEthereumCanaryPair()
    expect(pair.pair).toBeNull()
    expect(pair.inputAmountRaw).toBeNull()
    expect(pair.minUserOut).toBeNull()
    expect(pair.reason).toBe(UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED)
    expect(shadowQuoteExampleIsNotCanaryPair()).toBe(true)
    expect(firstCanonicalUniswapShadowRequest().inputAmountRaw).toBe('1000000000000000000')
    expect(CANONICAL_EXAMPLE_ASSETS.weth.location).toEqual({ kind: 'contract', address: WETH })
    expect(CANONICAL_EXAMPLE_ASSETS.usdcEthereum.location).toEqual({ kind: 'contract', address: USDC })
  })

  it('derives the Uniswap SmartSwap fee from factual V2 structural cost', () => {
    const structural = computeStructuralRouteCost({
      venueFeesBps: UNISWAP_VENUE.v2LpFeeBps,
      bridgeCostsBps: 0,
      gasCostBps: null,
      venueFeesEmbeddedInGross: true,
      bridgeCostsEmbeddedInGross: false,
    })
    expect(UNISWAP_VENUE.v2LpFeeBps).toBe(30)
    expect(structural.structuralRouteCostBps).toBe(30)
    expect(uniswapEthereumStructuralRouteCostBps()).toBe(30)
    expect(authorizedSmartSwapFeeBps(30)).toBe(15)
    expect(uniswapEthereumSmartSwapFeeBps()).toBe(15)
    expect(authorizedSmartSwapFeeBps(25)).toBe(20)
    expect(SMARTSWAP_REVENUE_POLICY_V1.bands.map((band) => band.feeBps)).toEqual([25, 20, 15, 10, 5])
  })

  it('seals simulation intents from policy and refuses to seal a canary without the pair decision', () => {
    const sealed = sealUniswapEthereumSimulationIntent({
      user: USER,
      inputAsset: WETH,
      outputAsset: USDC,
      inputAmount: '1000000',
      minUserOut: '1',
      path: [WETH, USDC],
      deadline: NOW + 30,
      nonce: '1',
    })
    expect(sealed.chainId).toBe(1)
    expect(sealed.venueId).toBe('uniswap')
    expect(sealed.feeBps).toBe(15)
    expect(sealed.feeAmount).toBe('1500')
    expect(sealed.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase())
    expect(sealed.router).toBe('0x7a250d5630b4cf539739df2c5dacb4c659f2488d')
    assertExecutionIntent(sealed, NOW, 1)
    expect(() =>
      sealExecutionIntent({
        chainId: 1,
        user: USER,
        inputAsset: WETH,
        outputAsset: USDC,
        inputAmount: '1000000',
        minUserOut: '1',
        venueId: 'uniswap',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        path: [WETH, USDC],
        structuralRouteCostBps: 30,
        deadline: NOW + 30,
        nonce: '2',
        nativeIn: false,
        nativeOut: false,
        feeBpsOverride: 20,
      }),
    ).toThrow('FEE_BYPASS_REJECTED')
    expect(() =>
      sealUniswapEthereumCanaryIntent({
        user: USER,
        inputAsset: WETH,
        outputAsset: USDC,
        inputAmount: '1000000',
        minUserOut: '1',
        path: [WETH, USDC],
        deadline: NOW + 30,
        nonce: '3',
      }),
    ).toThrow(UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED)
  })

  it('keeps unsigned packages nonce-bound, unsigned, and stale on nonce drift', () => {
    const create = buildEthereumUnsignedCreatePackage()
    expect(create.signed).toBe(false)
    expect(create.broadcast).toBe(false)
    expect(create.autoRetry).toBe(false)
    expect(create.staleOnNonceDrift).toBe(true)
    expect(create.chainId).toBe(1)
    expect(create.payload.deployer).toBeNull()
    expect(create.payload.nonce).toBeNull()
    expect(create.payload.predictedAddress).toBeNull()
    expect(create.payload.blocker).toBe(UNISWAP_ETHEREUM_DEPLOYER_UNDEFINED)
    expect(create.payload.bscDeployerMustNotBeAssumedOnEthereum).toBe(BSC_CERTIFIED_DEPLOYER)
    expect(predictCreateAddress(null, 0)).toBeNull()
    const setRouter = buildEthereumUnsignedSetRouterPackage()
    expect(setRouter.signed).toBe(false)
    expect(setRouter.autoRetry).toBe(false)
    expect(setRouter.staleOnNonceDrift).toBe(true)
    expect(setRouter.payload.router).toBe('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(setRouter.payload.execute).toBe(false)
    const intent = buildEthereumUnsignedCanaryIntentPackage()
    expect(intent.payload.blocker).toBe(UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED)
    expect(intent.payload.derivedSmartSwapFeeBps).toBe(15)
    expect(intent.payload.inputAmountRaw).toBeNull()
  })

  it('returns the exact blocked verdict and preserves global invariants', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe('LEGACY_PRODUCTION')
    expect(UNIVERSAL_ENGINE_MODE).toBe('SHADOW')
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(solanaExecutionEnabled()).toBe(false)
    expect(VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.implemented).toBe(false)
    expect(previewOnlyFeeCannotBeProductionCapable()).toBe(true)
    const preview = {
      state: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
      bps: 15,
      formulaId: SMARTSWAP_REVENUE_POLICY_V1.id,
      amountRaw: null,
      assetSymbol: null,
      recipient: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
      collectionProven: false,
      atomicWithSwap: false,
      productionExecutionEligible: false,
      gapCode: 'SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP',
    }
    expect(canMarkRouteProductionCapable(preview)).toBe(false)
    const cert = certifyUniswapEthereumCanaryPrep()
    expect(cert.id).toBe(UNISWAP_ETHEREUM_CANARY_PREP_ID)
    expect(cert.verdict).toBe(UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED)
    expect(UNISWAP_ETHEREUM_CANARY_PREP_VERDICT).toBe(UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED)
    expect(cert.blocker).toBe(UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED)
    expect(cert.subsequentMissingFacts).toEqual([UNISWAP_ETHEREUM_DEPLOYER_UNDEFINED])
    expect(cert.venue.canary).toBe(false)
    expect(cert.venue.executionEnabled).toBe(false)
    expect(cert.venue.productionEnabled).toBe(false)
    expect(cert.fee.hardcodedSmartSwapFee).toBe(false)
    expect(cert.fee.derivedSmartSwapFeeBps).toBe(15)
    expect(cert.fee.treasury).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(cert.nextGate).toBe(UNISWAP_CANARY_NEXT_GATE)
    expect(cert.artifact.ethereumOnchainRuntimeHash).toBeNull()
    expect(cert.production.pancakeBscUnchanged).toBe(true)
    expect(PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC]).toBe('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    expect(EXECUTOR_RECERTIFICATION_BROADCAST.deploy).toBe(false)
    const evidence = JSON.parse(readFileSync(EVIDENCE, 'utf8')) as { verdict: string; blocker: string }
    expect(evidence.verdict).toBe(UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED)
    expect(evidence.blocker).toBe(UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED)
  })

  it('keeps frozen SmartSwap UX at SHA-256 zero diff', () => {
    const manifest = JSON.parse(readFileSync(FREEZE_MANIFEST, 'utf8')) as { files: Record<string, string> }
    const current: Record<string, string> = {}
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
      current[rel] = createHash('sha256').update(readFileSync(abs)).digest('hex')
    }
    expect(current).toEqual(manifest.files)
  })
})
