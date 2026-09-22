import { spawn, execFileSync, type ChildProcess } from 'child_process'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import net from 'net'
import path from 'path'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { JsonRpcProvider } from '@ethersproject/providers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  COMPILER_RUNTIME_TEMPLATE_SHA256,
  PACKAGE_CHAIN_IMMUTABLES,
  SMARTSWAP_EXECUTOR_V2_IMMUTABLE_AST_BINDINGS,
  SMARTSWAP_EXECUTOR_V2_IMMUTABLE_REFERENCES,
  derivePostConstructorRuntime,
  patchImmutableRuntime,
  sha256HexBytes,
} from '../immutableRuntimePatch'

const PKG = path.resolve(__dirname, '../../../../../../deployments/smartswap-executor-v2/founder-deployment-package')
const CANON = path.resolve(__dirname, '../../../../../../deployments/smartswap-executor-v2')
const ANVIL_HOST = '127.0.0.1'
const ANVIL_PORT = 18555
const OWNER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ALT_TREASURY = '0x1111111111111111111111111111111111111111'
const ALT_WRAPPED = '0x2222222222222222222222222222222222222222'
const ALT_OWNER = '0x3333333333333333333333333333333333333333'
const VIEW = new Interface([
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function wrappedNative() view returns (address)',
  'function paused() view returns (bool)',
])

const bscPkg = JSON.parse(readFileSync(path.join(PKG, 'bsc.json'), 'utf8'))
const ethPkg = JSON.parse(readFileSync(path.join(PKG, 'ethereum.json'), 'utf8'))
const deployedTemplate = readFileSync(path.join(CANON, 'deployed.hex'), 'utf8').trim()

function toHex(value: bigint | string) {
  const n = BigInt(value)
  return n === BigInt(0) ? '0x0' : `0x${n.toString(16)}`
}

function portBusy(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.connect({ host: ANVIL_HOST, port })
    const finish = (busy: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(busy)
    }
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.setTimeout(400, () => finish(false))
  })
}

describe('immutable runtime gate correction', () => {
  it('maps AST ids to treasury and wrappedNative with compiler offsets', () => {
    expect(SMARTSWAP_EXECUTOR_V2_IMMUTABLE_AST_BINDINGS).toEqual([
      { astId: '63', name: 'treasury', mutability: 'immutable', typeString: 'address' },
      { astId: '65', name: 'wrappedNative', mutability: 'immutable', typeString: 'address' },
    ])
    expect(SMARTSWAP_EXECUTOR_V2_IMMUTABLE_REFERENCES['63']).toHaveLength(5)
    expect(SMARTSWAP_EXECUTOR_V2_IMMUTABLE_REFERENCES['65']).toHaveLength(7)
    for (const sites of Object.values(SMARTSWAP_EXECUTOR_V2_IMMUTABLE_REFERENCES)) {
      for (const site of sites) expect(site.length).toBe(32)
    }
  })

  it('derives chain post-constructor runtime hashes from immutableReferences', () => {
    expect(sha256HexBytes(deployedTemplate)).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
    const bsc = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: PACKAGE_CHAIN_IMMUTABLES.bsc,
    })
    const eth = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: PACKAGE_CHAIN_IMMUTABLES.ethereum,
    })
    expect(bsc.sha256).toBe(bscPkg.creationTransaction.expectedPostConstructorRuntimeSha256)
    expect(bsc.keccak256).toBe(bscPkg.creationTransaction.expectedPostConstructorRuntimeKeccak256)
    expect(eth.sha256).toBe(ethPkg.creationTransaction.expectedPostConstructorRuntimeSha256)
    expect(eth.keccak256).toBe(ethPkg.creationTransaction.expectedPostConstructorRuntimeKeccak256)
    expect(bsc.sha256).toBe('81328ab7fcce60fedb386a41fb17adceffcf897b25530a4504a8cff5c389845a')
    expect(eth.sha256).toBe('98235593533c8543c09c5e122f27f5c26296a985f3af19e5b2f17beae27930ea')
  })

  it('OLD_GATE_REGRESSION: compiler template hash must not equal post-constructor hash', () => {
    const bsc = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: PACKAGE_CHAIN_IMMUTABLES.bsc,
    })
    expect(COMPILER_RUNTIME_TEMPLATE_SHA256).not.toBe(bsc.sha256)
    expect(bscPkg.creationTransaction.oldIncorrectGateSha256FromPr90).toBe(COMPILER_RUNTIME_TEMPLATE_SHA256)
    expect(bscPkg.creationTransaction.oldIncorrectGateSha256FromPr90).not.toBe(
      bscPkg.creationTransaction.expectedPostConstructorRuntimeSha256,
    )
  })

  it('changing treasury or wrappedNative changes runtime; owner does not', () => {
    const base = patchImmutableRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: { treasury: TREASURY, wrappedNative: WBNB },
    })
    const treasuryChanged = patchImmutableRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: { treasury: ALT_TREASURY, wrappedNative: WBNB },
    })
    const wrappedChanged = patchImmutableRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: { treasury: TREASURY, wrappedNative: ALT_WRAPPED },
    })
    // owner is not an input to the patcher — same immutables → identical runtime bytes
    const sameImmutablesDifferentOwnerStory = patchImmutableRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: { treasury: TREASURY, wrappedNative: WBNB },
    })
    expect(sha256HexBytes(base)).not.toBe(sha256HexBytes(treasuryChanged))
    expect(sha256HexBytes(base)).not.toBe(sha256HexBytes(wrappedChanged))
    expect(base).toBe(sameImmutablesDifferentOwnerStory)
    expect(ALT_OWNER.toLowerCase()).not.toBe(OWNER.toLowerCase())
  })
})

describe('immutable runtime Anvil CREATE cross-check', () => {
  let anvil: ChildProcess | undefined
  let provider: JsonRpcProvider

  beforeAll(async () => {
    execFileSync('which', ['anvil'])
    if (await portBusy(ANVIL_PORT)) throw new Error(`PORT_IN_USE:${ANVIL_PORT}`)
    anvil = spawn(
      'anvil',
      ['--host', ANVIL_HOST, '--port', String(ANVIL_PORT), '--accounts', '1'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    provider = new JsonRpcProvider({ url: `http://${ANVIL_HOST}:${ANVIL_PORT}`, timeout: 20_000 })
    for (let i = 0; i < 40; i += 1) {
      try {
        await provider.send('eth_chainId', [])
        break
      } catch (error) {
        if (i === 39) throw error
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
    }
  }, 30_000)

  afterAll(async () => {
    anvil?.kill('SIGTERM')
  })

  async function deployExact(label: 'BSC' | 'ETH', pkg: typeof bscPkg, expectedHex: string, wrapped: string) {
    await provider.send('anvil_setBalance', [OWNER, toHex(BigInt('1000000000000000000'))])
    await provider.send('anvil_impersonateAccount', [OWNER])
    const hash = await provider.send('eth_sendTransaction', [{
      from: OWNER,
      data: pkg.creationTransaction.data,
      gas: toHex(BigInt(3_000_000)),
    }])
    const receipt = await provider.waitForTransaction(hash)
    expect(receipt?.status).toBe(1)
    const localExecutor = getAddress(receipt!.contractAddress!)
    const code: string = await provider.send('eth_getCode', [localExecutor, 'latest'])
    const codeHex = code.startsWith('0x') ? code : `0x${code}`
    const expected = expectedHex.startsWith('0x') ? expectedHex : `0x${expectedHex}`
    expect(codeHex.toLowerCase()).toBe(expected.toLowerCase())
    expect(createHash('sha256').update(Buffer.from(codeHex.slice(2), 'hex')).digest('hex')).toBe(
      pkg.creationTransaction.expectedPostConstructorRuntimeSha256,
    )
    const owner = getAddress(`0x${(await provider.send('eth_call', [{ to: localExecutor, data: VIEW.getSighash('owner()') }, 'latest'])).slice(-40)}`)
    const treasury = getAddress(`0x${(await provider.send('eth_call', [{ to: localExecutor, data: VIEW.getSighash('treasury()') }, 'latest'])).slice(-40)}`)
    const wrappedNative = getAddress(`0x${(await provider.send('eth_call', [{ to: localExecutor, data: VIEW.getSighash('wrappedNative()') }, 'latest'])).slice(-40)}`)
    const pausedWord: string = await provider.send('eth_call', [{ to: localExecutor, data: VIEW.getSighash('paused()') }, 'latest'])
    expect(owner).toBe(getAddress(OWNER))
    expect(treasury).toBe(getAddress(TREASURY))
    expect(wrappedNative).toBe(getAddress(wrapped))
    expect(BigInt(pausedWord)).toBe(BigInt(0))
    await provider.send('anvil_stopImpersonatingAccount', [OWNER])
    // Disposable local address — never treat as public executor.
    expect(localExecutor).not.toBe(getAddress(OWNER))
    expect(localExecutor).not.toBe(getAddress(TREASURY))
    return { label, localExecutor, byteForByteEqual: true as const }
  }

  it('BSC: exact #90 creation payload matches derived post-constructor runtime byte-for-byte', async () => {
    const derived = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: PACKAGE_CHAIN_IMMUTABLES.bsc,
    })
    const result = await deployExact('BSC', bscPkg, derived.runtimeHex, WBNB)
    expect(result.byteForByteEqual).toBe(true)
  }, 60_000)

  it('ETH: exact #90 creation payload matches derived post-constructor runtime byte-for-byte', async () => {
    const derived = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: PACKAGE_CHAIN_IMMUTABLES.ethereum,
    })
    const result = await deployExact('ETH', ethPkg, derived.runtimeHex, WETH)
    expect(result.byteForByteEqual).toBe(true)
  }, 60_000)

  it('OWNER_STORAGE_PROOF: different owner yields same runtime bytes for identical immutables', async () => {
    const accounts: string[] = (await provider.send('eth_accounts', [])).map((row: string) => getAddress(row))
    const localOwner = accounts[0]
    expect(localOwner).not.toBe(getAddress(OWNER))
    const { defaultAbiCoder } = await import('@ethersproject/abi')
    const creation = readFileSync(path.join(CANON, 'creation.hex'), 'utf8').trim()
    const encoded = defaultAbiCoder.encode(['address', 'address', 'address'], [TREASURY, WBNB, localOwner])
    const data = `0x${creation.replace(/^0x/, '')}${encoded.slice(2)}`
    const gasPrice = await provider.send('eth_gasPrice', [])
    const hash = await provider.send('eth_sendTransaction', [{
      from: localOwner, data, gas: toHex(BigInt(3_000_000)), gasPrice,
    }])
    const receipt = await provider.waitForTransaction(hash)
    expect(receipt?.status).toBe(1)
    const code: string = await provider.send('eth_getCode', [receipt!.contractAddress, 'latest'])
    const derived = derivePostConstructorRuntime({
      compilerRuntimeTemplateHex: deployedTemplate,
      immutables: { treasury: TREASURY, wrappedNative: WBNB },
    })
    expect(code.toLowerCase()).toBe(derived.runtimeHex.toLowerCase())
    const onchainOwner = getAddress(`0x${(await provider.send('eth_call', [{ to: receipt!.contractAddress, data: VIEW.getSighash('owner()') }, 'latest'])).slice(-40)}`)
    expect(onchainOwner).toBe(localOwner)
    expect(onchainOwner).not.toBe(getAddress(OWNER))
  }, 60_000)
})
