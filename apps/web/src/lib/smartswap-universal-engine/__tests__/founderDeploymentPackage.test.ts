import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'
import { Interface, defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { describe, expect, it } from 'vitest'
import {
  COMPILER_RUNTIME_TEMPLATE_SHA256,
  CREATION_BYTECODE_SHA256,
  PACKAGE_CHAIN_IMMUTABLES,
  derivePostConstructorRuntime,
} from '../immutableRuntimePatch'
import { V2_EXECUTION_RUNTIME_CONFIG, V2_EXECUTOR_CONFIG_STATUS } from '../v2ExecutionRuntimeConfig'

const PKG = path.resolve(__dirname, '../../../../../../deployments/smartswap-executor-v2/founder-deployment-package')
const CANON = path.resolve(__dirname, '../../../../../../deployments/smartswap-executor-v2')
const ABI_SHA = '9ec598d3a8b79b21e61cc184cc2fd8eb5df2384b355f39ad2620165da69e96c2'
const OWNER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const SET_ROUTER = new Interface(['function setRouter(address router, bytes32 venueId, bool allowed)'])
const BSC_POST = '81328ab7fcce60fedb386a41fb17adceffcf897b25530a4504a8cff5c389845a'
const ETH_POST = '98235593533c8543c09c5e122f27f5c26296a985f3af19e5b2f17beae27930ea'
const BSC_POST_KEC = '0x262bb476ce9ec68f74d9570b93e46cf9bd963bc6f0a6572d7b18d3b4e88f0f13'
const ETH_POST_KEC = '0x4efbb79f0bf7338c519dd471ba33b0cc0a6f59b98ce2dfe9ac3463a54126a8d9'

function load(name: string) {
  return JSON.parse(readFileSync(path.join(PKG, name), 'utf8'))
}

function sha256Hex(hex: string) {
  const raw = hex.startsWith('0x') ? hex.slice(2) : hex
  return createHash('sha256').update(Buffer.from(raw, 'hex')).digest('hex')
}

function walk(value: unknown, trail: string) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((row, index) => walk(row, `${trail}[${index}]`))
    return
  }
  const obj = value as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    expect(key, trail).not.toMatch(/private|seed|mnemonic|secret/i)
  }
  if ('rawTransaction' in obj) expect(obj.rawTransaction, trail).toBeNull()
  if ('signed' in obj) expect(obj.signed, trail).toBe(false)
  const transactional = 'calldata' in obj || ('data' in obj && 'from' in obj)
  if (transactional && 'status' in obj) expect(obj.status, trail).toBe('NOT_EXECUTED')
  for (const [key, child] of Object.entries(obj)) walk(child, `${trail}.${key}`)
}

describe('founder deployment package encoding', () => {
  const bsc = load('bsc.json')
  const eth = load('ethereum.json')
  const manifest = load('artifact-manifest.json')
  const immutables = load('immutable-references.json')
  const future = load('future-runtime-config-patch.NOT_APPLIED.json')
  const standard = load('verification-standard-json-input.json')
  const creation = readFileSync(path.join(CANON, 'creation.hex'), 'utf8').trim()
  const deployed = readFileSync(path.join(CANON, 'deployed.hex'), 'utf8').trim()

  it('matches the #83 and #84 artifact and does not invent an address', () => {
    expect(manifest.classification).toBe('ARTIFACT_MATCH')
    expect(manifest.creationBytecodeSha256).toBe(CREATION_BYTECODE_SHA256)
    expect(manifest.compilerRuntimeTemplateSha256).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
    expect(manifest.deployedBytecodeSha256).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
    expect(manifest.deployedBytecodeSha256_terminology).toMatch(/NOT the expected public eth_getCode/i)
    expect(manifest.abiSha256).toBe(ABI_SHA)
    expect(sha256Hex(creation)).toBe(CREATION_BYTECODE_SHA256)
    expect(sha256Hex(deployed)).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
    expect(manifest.solcVersion).toBe('0.8.20+commit.a1b79de6')
    expect(manifest.compilerSettings.viaIR).toBe(true)
    expect(manifest.compilerSettings.evmVersion).toBe('shanghai')
    expect(manifest.compilerSettings.optimizer).toEqual({ enabled: true, runs: 200 })
    expect(manifest.compilerSettings.metadata).toEqual({
      useLiteralContent: true,
      bytecodeHash: 'none',
      appendCBOR: false,
    })
    expect(bsc.executorAddress).toBe('NON_DEPLOYED / UNKNOWN')
    expect(eth.executorAddress).toBe('NON_DEPLOYED / UNKNOWN')
    expect(bsc.nonceFixed).toBe(false)
    expect(eth.nonceFixed).toBe(false)
  })

  it('records AST-mapped immutableReferences and post-constructor runtime gates', () => {
    expect(immutables.astBindings).toEqual([
      { astId: '63', name: 'treasury', mutability: 'immutable', typeString: 'address' },
      { astId: '65', name: 'wrappedNative', mutability: 'immutable', typeString: 'address' },
    ])
    expect(immutables.compilerImmutableReferences['63'].map((r: { start: number }) => r.start)).toEqual([
      1088, 1417, 2284, 2776, 3309,
    ])
    expect(immutables.compilerImmutableReferences['65'].map((r: { start: number }) => r.start)).toEqual([
      473, 2098, 2149, 2220, 2317, 4219, 4384,
    ])
    expect(manifest.expectedPostConstructorRuntime.bsc.sha256).toBe(BSC_POST)
    expect(manifest.expectedPostConstructorRuntime.bsc.keccak256).toBe(BSC_POST_KEC)
    expect(manifest.expectedPostConstructorRuntime.ethereum.sha256).toBe(ETH_POST)
    expect(manifest.expectedPostConstructorRuntime.ethereum.keccak256).toBe(ETH_POST_KEC)
    expect(manifest.expectedPostConstructorRuntime.ownerDoesNotAlterRuntimeImmutables).toBe(true)

    const bscDerived = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployed,
      immutables: PACKAGE_CHAIN_IMMUTABLES.bsc,
    })
    const ethDerived = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployed,
      immutables: PACKAGE_CHAIN_IMMUTABLES.ethereum,
    })
    expect(bscDerived.sha256).toBe(BSC_POST)
    expect(bscDerived.keccak256).toBe(BSC_POST_KEC)
    expect(ethDerived.sha256).toBe(ETH_POST)
    expect(ethDerived.keccak256).toBe(ETH_POST_KEC)
  })

  it('encodes canonical constructor args and creation payloads with corrected runtime gate', () => {
    for (const [doc, wrapped, postSha, postKec] of [
      [bsc, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', BSC_POST, BSC_POST_KEC],
      [eth, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', ETH_POST, ETH_POST_KEC],
    ] as const) {
      expect(doc.owner).toBe(OWNER)
      expect(doc.treasury).toBe(TREASURY)
      expect(doc.constructor.args).toEqual({
        treasury_: TREASURY,
        wrappedNative_: wrapped,
        owner_: OWNER,
      })
      const encoded = defaultAbiCoder.encode(['address', 'address', 'address'], [TREASURY, wrapped, OWNER])
      expect(doc.constructor.abiEncodedArguments.toLowerCase()).toBe(encoded.toLowerCase())
      const creationData = `0x${creation.replace(/^0x/, '')}${encoded.slice(2)}`
      expect(doc.creationTransaction.data.toLowerCase()).toBe(creationData.toLowerCase())
      expect(doc.creationTransaction.dataKeccak256.toLowerCase()).toBe(keccak256(creationData).toLowerCase())
      expect(doc.creationTransaction.compilerRuntimeTemplateSha256).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
      expect(doc.creationTransaction.expectedPostConstructorRuntimeSha256).toBe(postSha)
      expect(doc.creationTransaction.expectedPostConstructorRuntimeKeccak256).toBe(postKec)
      expect(doc.creationTransaction.oldIncorrectGateSha256FromPr90).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
      expect(doc.creationTransaction).not.toHaveProperty('expectedRuntimeBytecodeSha256')
      expect(doc.creationTransaction.status).toBe('NOT_EXECUTED')
      expect(sha256Hex(deployed)).toBe(doc.creationTransaction.compilerRuntimeTemplateSha256)
      expect(sha256Hex(deployed)).not.toBe(doc.creationTransaction.expectedPostConstructorRuntimeSha256)
      expect(doc.publicPostDeployVerification.neverCompareEthGetCodeTo).toBe('compilerRuntimeTemplateSha256')
      expect(doc.publicPostDeployVerification.algorithm).toEqual([
        'verify creationTransaction.data keccak256',
        'Founder signs CREATE',
        'receipt.status == 1',
        'obtain contractAddress',
        'eth_getCode(contractAddress)',
        'compare byte-for-byte / hash against EXPECTED_POST_CONSTRUCTOR_RUNTIME for THIS chain',
        'verify owner(), treasury(), wrappedNative(), paused()',
        'only after ALL pass may setRouter begin',
      ])
    }
  })

  it('encodes actual setRouter(address,bytes32,bool) calldata', () => {
    const expected = [
      { doc: bsc, venue: 'melega-dex', router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3', chainId: 56 },
      { doc: bsc, venue: 'pancakeswap', router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', chainId: 56 },
      { doc: eth, venue: 'uniswap', router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', chainId: 1 },
    ]
    for (const row of expected) {
      const call = row.doc.setRouterCalls.find((item: { venue: string }) => item.venue === row.venue)
      const venueHash = keccak256(toUtf8Bytes(row.venue))
      const data = SET_ROUTER.encodeFunctionData('setRouter', [row.router, venueHash, true])
      expect(call.functionSignature).toBe('setRouter(address,bytes32,bool)')
      expect(call.callerRequired).toBe('OWNER')
      expect(call.chainId).toBe(row.chainId)
      expect(call.router).toBe(row.router)
      expect(call.venueIdHash.toLowerCase()).toBe(venueHash.toLowerCase())
      expect(call.calldata.toLowerCase()).toBe(data.toLowerCase())
      expect(call.calldataKeccak256.toLowerCase()).toBe(keccak256(data).toLowerCase())
      expect(call.status).toBe('NOT_EXECUTED')
      const assertion = row.doc.postDeployAssertions.find(
        (item: { name: string; router?: string }) => item.name === 'allowedVenue(address)' && item.router === row.router,
      )
      expect(assertion.missionAliasNotPresent).toBe('allowedRouters')
      expect(assertion.expected.toLowerCase()).toBe(venueHash.toLowerCase())
    }
  })

  it('keeps gas observations internally consistent and unsigned', () => {
    walk(bsc, 'bsc')
    walk(eth, 'eth')
    for (const doc of [bsc, eth]) {
      const units = doc.gasEstimate.GAS_UNITS
      expect(units.total).toBe(units.deployment + units.setRouter.reduce((sum: number, gas: number) => sum + gas, 0))
      const raw = BigInt(units.total) * BigInt(doc.gasEstimate.OBSERVED_GAS_PRICE.wei)
      expect(doc.gasEstimate.RAW_ESTIMATE.wei).toBe(raw.toString())
      expect(doc.gasEstimate.RECOMMENDED_BUFFER.multiplier).toBe(2)
      expect(doc.gasEstimate.RECOMMENDED_BUFFER.wei).toBe((raw * BigInt(2)).toString())
      expect(doc.gasEstimate.status).toBe('NOT_A_GUARANTEE')
    }
  })

  it('records stopped-run reconciliation without public activity', () => {
    const stopped = bsc.stoppedRunReconciliation
    expect(stopped.PUBLIC_DEPLOY_TX).toBe('NONE')
    expect(stopped.FOUNDER_SIGNATURE).toBe('NONE')
    expect(stopped.SETROUTER_TX).toBe('NONE')
    expect(stopped.RUNTIME_CONFIG).toBe('NOT_CONFIGURED')
    expect(stopped.CANARY).toBe('NOT_STARTED')
    expect(stopped.CUTOVER).toBe(false)
    expect(stopped.ethereumAuthorization).toBe('NOT_AUTHORIZED')
    expect(stopped.noPublicTransactionExists).toBe(true)
    expect(stopped.observationsReadOnly.bsc.nonceLatest).toBe(3280)
    expect(stopped.observationsReadOnly.bsc.noncePending).toBe(3280)
  })

  it('keeps BSC CONFIGURED_DISABLED, Ethereum NOT_CONFIGURED, and future patch unapplied', () => {
    expect(V2_EXECUTION_RUNTIME_CONFIG[56]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: false,
      executorAddress: '0x7c07082839edd5797737640bba6af47992b9861e',
    })
    expect(V2_EXECUTION_RUNTIME_CONFIG[1]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
      enabled: false,
      executorAddress: null,
    })
    expect(future.status).toBe('NOT_APPLIED')
    expect(future.futurePatchAfterVerifiedPublicDeployment[56].enabled).toBe(false)
    expect(future.futurePatchAfterVerifiedPublicDeployment[1].enabled).toBe(false)
    expect(future.futurePatchAfterVerifiedPublicDeployment[56].executorAddress).toBe('NON_DEPLOYED / UNKNOWN')
    const runtime = readFileSync(
      path.resolve(__dirname, '../v2ExecutionRuntimeConfig.ts'),
      'utf8',
    )
    expect(runtime).toContain("status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED")
    expect(runtime).toContain("status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED")
    expect(runtime).not.toContain(bsc.creationTransaction.data.slice(0, 80))
  })

  it('ships a standard-json input with the release compiler settings and no libraries', () => {
    expect(standard.language).toBe('Solidity')
    expect(standard.settings.optimizer).toEqual({ enabled: true, runs: 200 })
    expect(standard.settings.viaIR).toBe(true)
    expect(standard.settings.evmVersion).toBe('shanghai')
    expect(standard.settings.metadata).toEqual({
      useLiteralContent: true,
      bytecodeHash: 'none',
      appendCBOR: false,
    })
    expect(standard.settings.libraries).toEqual({})
    expect(standard.sources['contracts/smartswap/SmartSwapExecutorV2.sol'].content).toContain(
      'contract SmartSwapExecutorV2',
    )
    expect(Object.keys(standard.sources)).not.toContain('test/smartswap/SmartSwapExecutorV2.t.sol')
  })
})
