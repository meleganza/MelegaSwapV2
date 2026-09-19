import { spawn, execFileSync, execSync, type ChildProcess } from 'child_process'
import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import net from 'net'
import path from 'path'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/keccak256'
import { JsonRpcProvider } from '@ethersproject/providers'
import { toUtf8Bytes } from '@ethersproject/strings'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS, evmNative } from '../assetIdentity'
import { evmNetwork } from '../domain'
import { computeFeeAmountRaw, computeNetVenueInput } from '../evaluateRevenuePolicy'
import { createFactualV2QuoteSource } from '../evmV2Quote'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { DEFAULT_LATENCY_BUDGET } from '../latency'
import { createMelegaDexAdapter } from '../melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { type SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import {
  prepareV2UserTransactions,
  v2VenueIdHash,
  type UnsignedUserTransaction,
} from '../v2ExecutionBinding'

const REPO = path.resolve(__dirname, '../../../../../..')
const PKG_DIR = path.join(REPO, 'deployments/smartswap-executor-v2')
const PKG_CREATION_SHA = '36d2503e328425ab66b61e384fa02418ec18c29df3e7966f01ece0c1e4422217'
const PKG_DEPLOYED_SHA = '4ccb42b71a9a7826715f14a234a68c71dda90859a1e70c0981bb4a8695594722'

const ANVIL_HOST = '127.0.0.1'
const BSC_PORT = 18557
const ETH_PORT = 18558
const TEAM = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const TREASURY = CANONICAL_SMARTSWAP_FEE_BENEFICIARY
const MELEGA_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const MELEGA_FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
const PANCAKE_FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
const UNISWAP_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDC_BSC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const GROSS_BSC = '50000000000000000'
const GROSS_ETH = '20000000000000000'
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const FORK_BUDGET = {
  ...DEFAULT_LATENCY_BUDGET,
  initialResponseMs: 8_000,
  quoteTimeoutMs: 20_000,
  fallbackWaitMs: 2_000,
  overallBudgetMs: 45_000,
}

const VIEW = new Interface([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function getPair(address tokenA, address tokenB) view returns (address)',
  'function deposit() payable',
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function wrappedNative() view returns (address)',
  'function usedNonce(address user, uint256 nonce) view returns (bool)',
  'function setRouter(address router, bytes32 venueId, bool allowed)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable',
])
const APPROVE_IFACE = new Interface(['function approve(address spender, uint256 amount)'])

const BSC_RPC_CANDIDATES = [
  process.env.BNB_MAINNET_RPC_URL,
  process.env.BSC_RPC_URL,
  process.env.NEXT_PUBLIC_BSC_RPC_URL,
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc-dataseed1.bnbchain.org',
  'https://bsc-dataseed2.binance.org',
].filter((row): row is string => Boolean(row && row.trim()))

const ETH_RPC_CANDIDATES = [
  process.env.ETHEREUM_RPC_URL,
  process.env.ETH_RPC_URL,
  'https://ethereum-rpc.publicnode.com',
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
  'https://rpc.flashbots.net',
  'https://eth.drpc.org',
  'https://eth.meowrpc.com',
  'https://eth-mainnet.public.blastapi.io',
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com',
  'https://cloudflare-eth.com',
].filter((row): row is string => Boolean(row && row.trim()))

const PROTECTED = new Set(
  [MELEGA_ROUTER, PANCAKE_ROUTER, UNISWAP_ROUTER, MELEGA_FACTORY, PANCAKE_FACTORY, UNISWAP_FACTORY, WBNB, USDC_BSC, WETH, USDC_ETH].map(
    (row) => row.toLowerCase(),
  ),
)

export const FORK_PROOF = {
  baseMainSha: '',
  melegaNative: false,
  melegaErc20: false,
  pancakeNative: false,
  pancakeErc20: false,
  bscCompetition: false,
  bscCompetitionWinner: '',
  uniswapNative: false,
  uniswapErc20: false,
  bsc: { rpc: '', block: '', hash: '', chainId: '' },
  eth: { rpc: '', block: '', hash: '', chainId: '' },
  calldata: [] as string[],
  errors: [] as string[],
  observed: [] as string[],
  negative: [] as string[],
}

function sha256Bytes(hex: string) {
  const raw = hex.startsWith('0x') ? hex.slice(2) : hex
  return createHash('sha256').update(Buffer.from(raw, 'hex')).digest('hex')
}

function toHex(value: bigint | string) {
  const n = BigInt(value)
  return n === 0n ? '0x0' : `0x${n.toString(16)}`
}

function withTimeout<T>(promise: Promise<T>, ms: number, code: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(code)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function topicAddress(topic: string) {
  return getAddress(`0x${topic.slice(26)}`)
}

const ERROR_STRING_SELECTOR = '0x08c379a0'
const EXECUTOR_CUSTOM_ERRORS = [
  'ZeroAddress',
  'Expired',
  'Replay',
  'WrongChain',
  'WrongUser',
  'WrongBeneficiary',
  'WrongFee',
  'WrongPolicy',
  'WrongRouter',
  'WrongRoute',
  'InvalidPath',
  'NativeValue',
  'FeeBypass',
  'UnsupportedToken',
  'UnknownVenue',
  'InvalidAmount',
] as const

type ExpectedRevert = { custom: string } | { stringIncludes: string }

interface RevertEvidence {
  source: 'receipt-status-0' | 'provider-failed-receipt' | 'rpc-revert-data'
  status: 0
  hash?: string
  selector: string
  custom: string | null
  message: string | null
}

interface RevertTransport {
  sendTransaction: (tx: UnsignedUserTransaction) => Promise<string>
  waitForReceipt: (hash: string) => Promise<{ status?: number; transactionHash?: string } | null>
  ethCall: (tx: UnsignedUserTransaction) => Promise<string>
}

function customErrorSelector(name: string) {
  return keccak256(toUtf8Bytes(`${name}()`)).slice(0, 10)
}

function errorText(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  const record = error as Error & { code?: unknown; reason?: unknown; body?: unknown; error?: unknown; status?: unknown }
  return [record.message, record.code, record.reason, record.body, JSON.stringify(record.error ?? null), record.status]
    .filter((row) => row != null && row !== '')
    .join(' ')
}

function isTimeoutError(error: unknown): boolean {
  const code = (error as { code?: string })?.code
  return code === 'TIMEOUT' || /TIMEOUT|ETIMEDOUT|AbortError|timed out/i.test(errorText(error))
}

function isRateLimitError(error: unknown): boolean {
  const status = (error as { status?: number })?.status
  return status === 429 || /\b429\b|Too Many Requests|rate limit/i.test(errorText(error))
}

function isTransportError(error: unknown): boolean {
  if (isTimeoutError(error) || isRateLimitError(error)) return true
  const code = (error as { code?: string })?.code
  if (code === 'NETWORK_ERROR') return true
  return /ECONNREFUSED|ENOTFOUND|ECONNRESET|ENETUNREACH|socket hang up|fetch failed/i.test(errorText(error))
}

function extractRevertHex(error: unknown): string | null {
  const seen = new Set<unknown>()
  const walk = (value: unknown): string | null => {
    if (value == null || seen.has(value)) return null
    if (typeof value === 'string') {
      const match = value.match(/0x[0-9a-fA-F]{8,}/)
      if (match && (match[0].startsWith('0x08c379a0') || match[0].length >= 10)) return match[0]
      try {
        return walk(JSON.parse(value))
      } catch {
        return null
      }
    }
    if (typeof value !== 'object') return null
    seen.add(value)
    const record = value as Record<string, unknown>
    if (typeof record.data === 'string' && record.data.startsWith('0x') && record.data.length >= 10) return record.data
    if (record.data && typeof record.data === 'object') {
      const nested = walk(record.data)
      if (nested) return nested
    }
    for (const key of ['error', 'body', 'reason', 'originalError']) {
      const nested = walk(record[key])
      if (nested) return nested
    }
    return null
  }
  return walk(error)
}

function extractFailedReceipt(error: unknown): { status: 0; transactionHash?: string } | null {
  const receipt = (error as { receipt?: { status?: number | string; transactionHash?: string } })?.receipt
  if (!receipt) return null
  if (receipt.status === 0 || receipt.status === '0x0') {
    return { status: 0, transactionHash: receipt.transactionHash }
  }
  return null
}

function parseRevertData(data: string): { selector: string; custom: string | null; message: string | null } {
  const selector = data.slice(0, 10).toLowerCase()
  for (const name of EXECUTOR_CUSTOM_ERRORS) {
    if (customErrorSelector(name) === selector) return { selector, custom: name, message: null }
  }
  if (selector === ERROR_STRING_SELECTOR) {
    try {
      const message = defaultAbiCoder.decode(['string'], `0x${data.slice(10)}`)[0] as string
      return { selector, custom: null, message }
    } catch {
      return { selector, custom: null, message: null }
    }
  }
  return { selector, custom: null, message: null }
}

function matchExpectedRevert(
  parsed: { selector: string; custom: string | null; message: string | null },
  expected: ExpectedRevert,
): void {
  if ('custom' in expected) {
    if (parsed.custom !== expected.custom) {
      throw new Error(
        `REVERT_REASON_MISMATCH:want=${expected.custom}:have=${parsed.custom ?? parsed.message ?? parsed.selector}`,
      )
    }
    return
  }
  if (!parsed.message || !parsed.message.includes(expected.stringIncludes)) {
    throw new Error(
      `REVERT_REASON_MISMATCH:want=${expected.stringIncludes}:have=${parsed.custom ?? parsed.message ?? parsed.selector}`,
    )
  }
}

function throwIfTransport(error: unknown): void {
  if (isTimeoutError(error)) throw new Error(`REVERT_HELPER_TRANSPORT:TIMEOUT:${errorText(error)}`)
  if (isRateLimitError(error)) throw new Error(`REVERT_HELPER_TRANSPORT:RATE_LIMIT:${errorText(error)}`)
  if (isTransportError(error)) throw new Error(`REVERT_HELPER_TRANSPORT:${errorText(error)}`)
}

async function revertDataViaCall(transport: RevertTransport, tx: UnsignedUserTransaction): Promise<string> {
  try {
    const result = await transport.ethCall(tx)
    if (typeof result === 'string' && result.startsWith('0x') && result.length >= 10 && result !== '0x') return result
    throw new Error('REVERT_HELPER_MISSING_REVERT_DATA')
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('REVERT_HELPER_')) throw error
    throwIfTransport(error)
    const data = extractRevertHex(error)
    if (data) return data
    throw error instanceof Error ? error : new Error(String(error))
  }
}

function evidenceFromData(
  source: RevertEvidence['source'],
  data: string,
  expected: ExpectedRevert,
  hash?: string,
): RevertEvidence {
  const parsed = parseRevertData(data)
  matchExpectedRevert(parsed, expected)
  return { source, status: 0, hash, selector: parsed.selector, custom: parsed.custom, message: parsed.message }
}

async function sendExpectRevertWith(
  transport: RevertTransport,
  tx: UnsignedUserTransaction,
  expected: ExpectedRevert,
): Promise<RevertEvidence> {
  let hash: string | undefined
  try {
    hash = await transport.sendTransaction(tx)
  } catch (error) {
    throwIfTransport(error)
    const failedReceipt = extractFailedReceipt(error)
    if ((error as { receipt?: { status?: number } })?.receipt && !failedReceipt) {
      const status = (error as { receipt: { status?: number } }).receipt.status
      if (status === 1) throw new Error('REVERT_HELPER_SUCCEEDED:provider-receipt')
    }
    const data = extractRevertHex(error)
    if (failedReceipt) {
      const revertData = data ?? (await revertDataViaCall(transport, tx))
      return evidenceFromData('provider-failed-receipt', revertData, expected, failedReceipt.transactionHash)
    }
    if (data) return evidenceFromData('rpc-revert-data', data, expected)
    if (/execution reverted|VM Exception while processing transaction/i.test(errorText(error))) {
      const viaCall = await revertDataViaCall(transport, tx)
      return evidenceFromData('rpc-revert-data', viaCall, expected)
    }
    throw error instanceof Error ? error : new Error(String(error))
  }

  const receipt = await transport.waitForReceipt(hash)
  if (receipt == null) throw new Error('REVERT_HELPER_NULL_RECEIPT')
  if (receipt.status === 1) throw new Error(`REVERT_HELPER_SUCCEEDED:${hash}`)
  if (receipt.status !== 0) throw new Error(`REVERT_HELPER_UNEXPECTED_STATUS:${String(receipt.status)}`)
  const revertData = await revertDataViaCall(transport, tx)
  return evidenceFromData('receipt-status-0', revertData, expected, receipt.transactionHash ?? hash)
}

function isPortOccupied(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: ANVIL_HOST, port })
    const finish = (occupied: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(occupied)
    }
    socket.setTimeout(400)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(true))
    socket.once('error', (error: NodeJS.ErrnoException) => {
      finish(error.code !== 'ECONNREFUSED')
    })
  })
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

function ensureReleaseExecutor() {
  try {
    const art = compiledExecutorArtifact()
    if (sha256Bytes(art.bytecode.object) === PKG_CREATION_SHA && sha256Bytes(art.deployedBytecode.object) === PKG_DEPLOYED_SHA) {
      return art
    }
  } catch {
    // rebuild below
  }
  execSync('FOUNDRY_PROFILE=smartswap_executor_release forge build', { cwd: REPO, stdio: 'pipe' })
  const art = compiledExecutorArtifact()
  if (sha256Bytes(art.bytecode.object) !== PKG_CREATION_SHA) {
    throw new Error(`EXECUTOR_V2_CREATION_MISMATCH:${sha256Bytes(art.bytecode.object)}`)
  }
  if (sha256Bytes(art.deployedBytecode.object) !== PKG_DEPLOYED_SHA) {
    throw new Error(`EXECUTOR_V2_DEPLOYED_MISMATCH:${sha256Bytes(art.deployedBytecode.object)}`)
  }
  return art
}

async function publicRpc(
  url: string,
  method: string,
  params: unknown[] = [],
  timeoutMs = 8_000,
): Promise<{ http: number; result?: string; error?: string; bodyHead: string }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: ctrl.signal,
    })
    const text = await response.text()
    let payload: { result?: string; error?: { message?: string } } | null = null
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
    return {
      http: response.status,
      result: payload?.result,
      error: payload?.error?.message,
      bodyHead: text.slice(0, 160).replace(/\s+/g, ' '),
    }
  } catch (error) {
    return { http: 0, error: error instanceof Error ? `${error.name}: ${error.message}` : String(error), bodyHead: '' }
  } finally {
    clearTimeout(timer)
  }
}

async function pickForkSource(label: string, urls: string[], expectedChainId: string, codeAddresses: string[]) {
  const attempts: string[] = []
  for (const url of urls) {
    const chain = await publicRpc(url, 'eth_chainId', [])
    if (chain.result !== expectedChainId) {
      attempts.push(
        `${url} method=eth_chainId expected=${expectedChainId} http=${chain.http} result=${chain.result ?? ''} error=${chain.error ?? chain.bodyHead}`,
      )
      continue
    }
    const latest = await publicRpc(url, 'eth_blockNumber', [])
    if (!latest.result || !latest.result.startsWith('0x')) {
      attempts.push(`${url} method=eth_blockNumber http=${latest.http} error=${latest.error ?? latest.bodyHead}`)
      continue
    }
    const pinNumber = `0x${(BigInt(latest.result) - 2n).toString(16)}`
    const block = await publicRpc(url, 'eth_getBlockByNumber', [pinNumber, false])
    const hash = (block.result as unknown as { hash?: string; timestamp?: string } | undefined)?.hash
    if (!hash) {
      attempts.push(`${url} method=eth_getBlockByNumber block=${pinNumber} http=${block.http} error=${block.error ?? block.bodyHead}`)
      continue
    }
    let codesOk = true
    for (const address of codeAddresses) {
      const code = await publicRpc(url, 'eth_getCode', [address, pinNumber])
      if (!code.result || code.result === '0x') {
        attempts.push(`${url} method=eth_getCode address=${address} block=${pinNumber} http=${code.http} error=${code.error ?? 'empty-code'}`)
        codesOk = false
        break
      }
    }
    if (!codesOk) continue
    const storage = await publicRpc(url, 'eth_getStorageAt', [codeAddresses[0], '0x0', pinNumber])
    if (storage.error || storage.result == null) {
      attempts.push(`${url} method=eth_getStorageAt address=${codeAddresses[0]} block=${pinNumber} http=${storage.http} error=${storage.error ?? storage.bodyHead}`)
      continue
    }
    return {
      url,
      chainId: expectedChainId,
      block: pinNumber,
      hash,
      latest: latest.result,
      attempts,
      label,
    }
  }
  throw new Error(`${label}_RPC_UNAVAILABLE ${attempts.join(' || ')}`)
}

function providerFetch(provider: JsonRpcProvider): typeof fetch {
  return async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { method: string; params?: unknown[] }
    try {
      const result = await provider.send(body.method, body.params ?? [])
      return { ok: true, json: async () => ({ result }) } as Response
    } catch (error) {
      return {
        ok: true,
        json: async () => ({ error: { message: error instanceof Error ? error.message : String(error) } }),
      } as Response
    }
  }
}

interface ForkCtx {
  label: string
  chainId: number
  port: number
  anvil?: ChildProcess
  provider: JsonRpcProvider
  owner: string
  users: string[]
  dumper: string
  executor: string
  wrapped: string
  source: { url: string; block: string; hash: string; chainId: string }
  pair: string
  setCodeCalls: string[]
}

async function waitForAnvil(
  provider: JsonRpcProvider,
  expectedChainId: string,
  expectedBlock?: { number: string; hash: string },
) {
  for (let i = 0; i < 180; i += 1) {
    try {
      const chain = await provider.send('eth_chainId', [])
      if (chain !== expectedChainId) {
        await new Promise((resolve) => setTimeout(resolve, 250))
        continue
      }
      if (!expectedBlock) return
      const pinned = await provider.send('eth_getBlockByNumber', [expectedBlock.number, false])
      if (pinned?.hash && String(pinned.hash).toLowerCase() === expectedBlock.hash.toLowerCase()) return
      const latest = await provider.send('eth_getBlockByNumber', ['latest', false])
      if (latest?.hash && String(latest.hash).toLowerCase() === expectedBlock.hash.toLowerCase()) return
    } catch {
      // still booting or remote fork fetch in flight
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`ANVIL_NOT_READY:${expectedChainId}`)
}

async function startFork(input: {
  label: string
  chainId: number
  port: number
  expectedChainHex: string
  urls: string[]
  codeAddresses: string[]
  wrapped: string
  routers: Array<{ address: string; venue: 'melega-dex' | 'pancakeswap' | 'uniswap' }>
}): Promise<ForkCtx> {
  execFileSync('which', ['anvil'])
  if (await isPortOccupied(input.port)) throw new Error(`PORT_IN_USE:${input.port}`)
  const source = await pickForkSource(input.label, input.urls, input.expectedChainHex, input.codeAddresses)
  const anvil = spawn(
    'anvil',
    [
      '--host',
      ANVIL_HOST,
      '--port',
      String(input.port),
      '--fork-url',
      source.url,
      '--fork-block-number',
      String(BigInt(source.block)),
      '--accounts',
      '12',
      '--no-rate-limit',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let anvilLog = ''
  anvil.stderr?.on('data', (chunk) => {
    anvilLog += String(chunk)
  })
  anvil.stdout?.on('data', (chunk) => {
    anvilLog += String(chunk)
  })
  const provider = new JsonRpcProvider({
    url: `http://${ANVIL_HOST}:${input.port}`,
    timeout: 20_000,
    throttleLimit: 1,
  })
  try {
    if (anvil.exitCode != null) {
      if (/already in use/i.test(anvilLog)) throw new Error(`PORT_IN_USE:${input.port}`)
      throw new Error(`${input.label}_ANVIL_EXIT:${anvil.exitCode}:${anvilLog.slice(-400)}`)
    }
    await waitForAnvil(provider, input.expectedChainHex, { number: source.block, hash: source.hash })
  } catch (error) {
    if (anvil && !anvil.killed) anvil.kill('SIGKILL')
    throw error
  }
  const forkBlock =
    (await provider.send('eth_getBlockByNumber', [source.block, false])) ||
    (await provider.send('eth_getBlockByNumber', ['latest', false]))
  if (!forkBlock?.hash) throw new Error(`${input.label}_FORK_BLOCK_MISSING`)
  if (String(forkBlock.hash).toLowerCase() !== source.hash.toLowerCase()) {
    anvil.kill('SIGTERM')
    throw new Error(`${input.label}_FORK_HASH_MISMATCH have=${forkBlock.hash} want=${source.hash}`)
  }
  const setCodeCalls: string[] = []
  const rpc = async (method: string, params: unknown[] = []) => {
    if (method === 'anvil_setCode') {
      const target = String(params[0] ?? '').toLowerCase()
      setCodeCalls.push(target)
      if (PROTECTED.has(target)) throw new Error(`FORBIDDEN_SETCODE:${target}`)
    }
    return provider.send(method, params)
  }
  const accounts: string[] = (await rpc('eth_accounts')).map((row: string) => getAddress(row))
  const owner = accounts[0]
  expect(owner).not.toBe(getAddress(TEAM))
  expect(owner).not.toBe(getAddress(TREASURY))
  for (const address of input.codeAddresses) {
    const code = await rpc('eth_getCode', [address, 'latest'])
    if (!code || code === '0x') throw new Error(`${input.label}_MISSING_CODE:${address}`)
  }
  const artifact = ensureReleaseExecutor()
  const ctor = new Interface(artifact.abi).encodeDeploy([TREASURY, input.wrapped, owner])
  const deployHash = await rpc('eth_sendTransaction', [
    { from: owner, data: `${artifact.bytecode.object}${ctor.slice(2)}`, gas: toHex(6_000_000n) },
  ])
  const deployReceipt = await provider.waitForTransaction(deployHash)
  if (!deployReceipt?.contractAddress) throw new Error(`${input.label}_EXECUTOR_DEPLOY_FAILED`)
  const executor = getAddress(deployReceipt.contractAddress)
  expect(executor).not.toBe(getAddress(TEAM))
  const onOwner = await rpc('eth_call', [{ to: executor, data: VIEW.encodeFunctionData('owner', []) }, 'latest'])
  expect(getAddress(`0x${onOwner.slice(-40)}`)).toBe(owner)
  expect(getAddress(`0x${onOwner.slice(-40)}`)).not.toBe(getAddress(TEAM))
  for (const row of input.routers) {
    await rpc('eth_sendTransaction', [
      {
        from: owner,
        to: executor,
        data: VIEW.encodeFunctionData('setRouter', [row.address, v2VenueIdHash(row.venue), true]),
        gas: toHex(500_000n),
      },
    ])
  }
  const pairData = await rpc('eth_call', [
    {
      to: input.chainId === 56 ? PANCAKE_FACTORY : UNISWAP_FACTORY,
      data: VIEW.encodeFunctionData('getPair', [
        input.chainId === 56 ? WBNB : WETH,
        input.chainId === 56 ? USDC_BSC : USDC_ETH,
      ]),
    },
    'latest',
  ])
  const pair = getAddress(`0x${pairData.slice(-40)}`)
  if (pair === '0x0000000000000000000000000000000000000000') throw new Error(`${input.label}_PAIR_MISSING`)
  PROTECTED.add(pair.toLowerCase())
  if (input.chainId === 56) {
    const melegaPairData = await rpc('eth_call', [
      { to: MELEGA_FACTORY, data: VIEW.encodeFunctionData('getPair', [WBNB, USDC_BSC]) },
      'latest',
    ])
    const melegaPair = getAddress(`0x${melegaPairData.slice(-40)}`)
    if (melegaPair !== '0x0000000000000000000000000000000000000000') PROTECTED.add(melegaPair.toLowerCase())
  }
  for (const user of accounts.slice(1)) {
    await rpc('anvil_setBalance', [user, toHex(10_000n * 10n ** 18n)])
  }
  return {
    label: input.label,
    chainId: input.chainId,
    port: input.port,
    anvil,
    provider,
    owner,
    users: accounts.slice(1, 10),
    dumper: accounts[10],
    executor,
    wrapped: input.wrapped,
    source: { url: source.url, block: source.block, hash: source.hash, chainId: source.chainId },
    pair,
    setCodeCalls,
  }
}

function stopFork(ctx?: ForkCtx) {
  if (ctx?.anvil && !ctx.anvil.killed) ctx.anvil.kill('SIGKILL')
}

async function rpc(ctx: ForkCtx, method: string, params: unknown[] = []) {
  if (method === 'anvil_setCode') {
    const target = String(params[0] ?? '').toLowerCase()
    ctx.setCodeCalls.push(target)
    if (PROTECTED.has(target)) throw new Error(`FORBIDDEN_SETCODE:${target}`)
  }
  return ctx.provider.send(method, params)
}

async function balanceOf(ctx: ForkCtx, token: string, who: string) {
  const raw = await rpc(ctx, 'eth_call', [{ to: token, data: VIEW.encodeFunctionData('balanceOf', [who]) }, 'latest'])
  return BigInt(raw)
}

async function allowanceOf(ctx: ForkCtx, token: string, owner: string, spender: string) {
  const raw = await rpc(ctx, 'eth_call', [
    { to: token, data: VIEW.encodeFunctionData('allowance', [owner, spender]) },
    'latest',
  ])
  return BigInt(raw)
}

async function usedNonce(ctx: ForkCtx, user: string, nonce: number) {
  const raw = await rpc(ctx, 'eth_call', [
    { to: ctx.executor, data: VIEW.encodeFunctionData('usedNonce', [user, nonce]) },
    'latest',
  ])
  return Boolean(Number(raw))
}

async function wrapNative(ctx: ForkCtx, user: string, amount: string) {
  const hash = await withTimeout(
    rpc(ctx, 'eth_sendTransaction', [
      {
        from: user,
        to: ctx.wrapped,
        data: VIEW.encodeFunctionData('deposit', []),
        value: toHex(amount),
        gas: toHex(200_000n),
      },
    ]),
    20_000,
    `${ctx.label}_DEPOSIT_TIMEOUT`,
  )
  const receipt = await withTimeout(ctx.provider.waitForTransaction(hash), 20_000, `${ctx.label}_DEPOSIT_RECEIPT_TIMEOUT`)
  if (!receipt || receipt.status !== 1) throw new Error(`${ctx.label}_DEPOSIT_FAILED`)
}

async function sendExact(ctx: ForkCtx, tx: UnsignedUserTransaction) {
  const hash = await withTimeout(
    rpc(ctx, 'eth_sendTransaction', [
      { from: tx.from, to: tx.to, data: tx.data, value: tx.value, gas: toHex(3_500_000n) },
    ]),
    20_000,
    `${ctx.label}_SEND_TIMEOUT`,
  )
  const receipt = await withTimeout(ctx.provider.waitForTransaction(hash), 20_000, `${ctx.label}_RECEIPT_TIMEOUT`)
  if (!receipt) throw new Error('LOCAL_TX_NO_RECEIPT')
  if (receipt.status !== 1) throw new Error(`LOCAL_TX_REVERTED:${tx.to}`)
  return receipt
}

async function sendExpectRevert(
  ctx: ForkCtx,
  tx: UnsignedUserTransaction,
  expected: ExpectedRevert,
): Promise<RevertEvidence> {
  return sendExpectRevertWith(
    {
      sendTransaction: (row) =>
        rpc(ctx, 'eth_sendTransaction', [
          { from: row.from, to: row.to, data: row.data, value: row.value, gas: toHex(3_500_000n) },
        ]),
      waitForReceipt: (hash) => ctx.provider.waitForTransaction(hash),
      ethCall: (row) =>
        rpc(ctx, 'eth_call', [{ from: row.from, to: row.to, data: row.data, value: row.value }, 'latest']),
    },
    tx,
    expected,
  )
}

async function assertFailedExecute(
  ctx: ForkCtx,
  tx: UnsignedUserTransaction,
  expected: ExpectedRevert,
  input: { user: string; nonce: number; nonceUsed: boolean; inputToken: string; outputToken: string; label: string },
): Promise<RevertEvidence> {
  const treasuryBefore = await balanceOf(ctx, ctx.wrapped, TREASURY)
  const userInBefore = await balanceOf(ctx, input.inputToken, input.user)
  const userOutBefore = await balanceOf(ctx, input.outputToken, input.user)
  const evidence = await sendExpectRevert(ctx, tx, expected)
  expect(await usedNonce(ctx, input.user, input.nonce)).toBe(input.nonceUsed)
  expect(await balanceOf(ctx, ctx.wrapped, TREASURY)).toBe(treasuryBefore)
  expect(await balanceOf(ctx, input.inputToken, input.user)).toBe(userInBefore)
  expect(await balanceOf(ctx, input.outputToken, input.user)).toBe(userOutBefore)
  FORK_PROOF.negative.push(
    `${input.label} source=${evidence.source} selector=${evidence.selector} custom=${evidence.custom ?? ''} message=${evidence.message ?? ''}`,
  )
  return evidence
}

function decodeApprove(data: string) {
  const decoded = APPROVE_IFACE.decodeFunctionData('approve', data)
  return { spender: getAddress(decoded.spender), amount: decoded.amount.toString() }
}

function venueAdapters(ctx: ForkCtx, venues: Array<'melega-dex' | 'pancakeswap' | 'uniswap'>) {
  const source = createFactualV2QuoteSource({
    rpcUrlByChain: { [ctx.chainId]: `http://${ANVIL_HOST}:${ctx.port}` },
    fetchImpl: providerFetch(ctx.provider),
  })
  return venues.map((venue) => {
    if (venue === 'melega-dex') return createMelegaDexAdapter(null, { quoteSource: source })
    if (venue === 'pancakeswap') return createPancakeSwapVenueAdapter(source)
    return createUniswapVenueAdapter(source)
  })
}

function bscRequest(kind: 'native' | 'erc20', amount = GROSS_BSC, slippageBps = 50): SmartSwapRequest {
  return {
    requestId: `fork-bsc-${kind}`,
    network: evmNetwork(56),
    inputAsset: kind === 'native' ? evmNative(56, 'BNB', 18) : CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: amount,
    exactOut: false,
    slippageBps,
  }
}

function ethRequest(kind: 'native' | 'erc20', amount = GROSS_ETH, slippageBps = 50): SmartSwapRequest {
  return {
    requestId: `fork-eth-${kind}`,
    network: evmNetwork(1),
    inputAsset: kind === 'native' ? evmNative(1, 'ETH', 18) : CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw: amount,
    exactOut: false,
    slippageBps,
  }
}

async function compete(ctx: ForkCtx, request: SmartSwapRequest, venues: Array<'melega-dex' | 'pancakeswap' | 'uniswap'>) {
  const nowIso = new Date().toISOString()
  const result = await withTimeout(
    runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: venueAdapters(ctx, venues),
      nowIso,
      budget: FORK_BUDGET,
    }),
    30_000,
    `${ctx.label}_COMPETE_TIMEOUT:${venues.join(',')}`,
  )
  return { result, nowIso }
}

async function dumpPool(ctx: ForkCtx, router: string, path: string[], valueWei: bigint) {
  const deadline = Math.floor(Date.now() / 1000) + 8_000_000
  const data = VIEW.encodeFunctionData('swapExactETHForTokens', [0, path, ctx.dumper, deadline])
  const send = (async () => {
    const hash = await rpc(ctx, 'eth_sendTransaction', [
      { from: ctx.dumper, to: router, data, value: toHex(valueWei), gas: toHex(1_500_000n) },
    ])
    const receipt = await ctx.provider.waitForTransaction(hash)
    if (!receipt || receipt.status !== 1) throw new Error(`${ctx.label}_DUMP_FAILED`)
  })()
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`${ctx.label}_DUMP_TIMEOUT`)), 25_000)
  })
  await Promise.race([send, timeout])
}

async function advancePastDeadline(ctx: ForkCtx, deadline: number) {
  const forkTs = Number((await rpc(ctx, 'eth_getBlockByNumber', ['latest', false])).timestamp)
  await rpc(ctx, 'evm_increaseTime', [Math.max(deadline - forkTs + 45, 45)])
  await rpc(ctx, 'evm_mine', [])
}

async function warmForkReads(ctx: ForkCtx, tokens: string[], extra: string[]) {
  const holders = [TREASURY, ctx.owner, ctx.executor, ctx.dumper, ctx.pair, ...ctx.users, ...extra]
  for (const token of tokens) {
    for (const who of holders) {
      await balanceOf(ctx, token, who).catch(() => 0n)
      await allowanceOf(ctx, token, who, ctx.executor).catch(() => 0n)
    }
  }
}

async function proveHappyPath(
  ctx: ForkCtx,
  input: {
    request: SmartSwapRequest
    venues: Array<'melega-dex' | 'pancakeswap' | 'uniswap'>
    user: string
    nonce: number
    expectVenue?: string
  },
) {
  const nativeIn = input.request.inputAsset.location.kind === 'native'
  const inputToken = nativeIn ? ctx.wrapped : getAddress(input.request.inputAsset.location.kind === 'contract' ? input.request.inputAsset.location.address : ctx.wrapped)
  const outputToken = getAddress(
    input.request.outputAsset.location.kind === 'contract' ? input.request.outputAsset.location.address : ctx.wrapped,
  )
  if (!nativeIn) await wrapNative(ctx, input.user, input.request.inputAmountRaw)
  const { result, nowIso } = await compete(ctx, input.request, input.venues)
  const winner = result.shadowWinner
  expect(winner?.status).toBe('ok')
  expect(winner?.quote).toBeTruthy()
  if (input.expectVenue) expect(winner!.venueId).toBe(input.expectVenue)
  const feeBps = winner!.smartSwapFeeBps
  expect(feeBps).toBeTruthy()
  const expectedFee = computeFeeAmountRaw(input.request.inputAmountRaw, feeBps!)
  const expectedNet = computeNetVenueInput(input.request.inputAmountRaw, feeBps!).netVenueInputRaw
  expect(winner!.netVenueInputRaw).toBe(expectedNet)
  const block = await rpc(ctx, 'eth_getBlockByNumber', ['latest', false])
  const deadline = Number(block.timestamp) + 3_600
  const prepared = prepareV2UserTransactions({
    request: input.request,
    winner,
    user: input.user,
    deadline,
    nonce: input.nonce,
    nowIso,
    currentChainId: ctx.chainId,
    executorAddress: ctx.executor,
    observedAllowance: nativeIn
      ? undefined
      : {
          chainId: ctx.chainId,
          token: inputToken,
          owner: input.user,
          spender: ctx.executor,
          amountRaw: '0',
        },
  })
  const calldataHash = keccak256(prepared.swapTransaction.data)
  FORK_PROOF.calldata.push(`${ctx.label}:${winner!.venueId}:${nativeIn ? 'native' : 'erc20'}:${calldataHash}`)
  expect(prepared.swapTransaction.to).toBe(ctx.executor)
  expect(prepared.swapTransaction.to).not.toBe(getAddress(TEAM))
  expect(prepared.swapTransaction.to).not.toBe(getAddress(TREASURY))
  expect(prepared.productionExecutionCapable).toBe(false)
  for (const row of prepared.approvalTransactions) {
    const decoded = decodeApprove(row.data)
    expect(decoded.spender).toBe(ctx.executor)
    expect(decoded.spender).not.toBe(getAddress(TEAM))
    expect(decoded.spender).not.toBe(getAddress(TREASURY))
    expect(row.to).toBe(inputToken)
  }
  const feeToken = ctx.wrapped
  const pairForWinner = await rpc(ctx, 'eth_call', [
    {
      to: ctx.chainId === 56 ? (winner!.venueId === 'melega-dex' ? MELEGA_FACTORY : PANCAKE_FACTORY) : UNISWAP_FACTORY,
      data: VIEW.encodeFunctionData('getPair', [ctx.wrapped, outputToken]),
    },
    'latest',
  ])
  const pair = getAddress(`0x${pairForWinner.slice(-40)}`)
  const treasuryFeeBefore = await balanceOf(ctx, feeToken, TREASURY)
  const treasuryOutBefore = await balanceOf(ctx, outputToken, TREASURY)
  const userInBefore = nativeIn ? BigInt(await rpc(ctx, 'eth_getBalance', [input.user, 'latest'])) : await balanceOf(ctx, inputToken, input.user)
  const userOutBefore = await balanceOf(ctx, outputToken, input.user)
  const pairInBefore = await balanceOf(ctx, inputToken, pair)
  const executorInBefore = await balanceOf(ctx, inputToken, ctx.executor)
  const executorOutBefore = await balanceOf(ctx, outputToken, ctx.executor)
  for (const tx of prepared.approvalTransactions) {
    expect((await sendExact(ctx, tx)).status).toBe(1)
  }
  const receipt = await sendExact(ctx, prepared.swapTransaction)
  expect(receipt.status).toBe(1)
  const treasuryFeeAfter = await balanceOf(ctx, feeToken, TREASURY)
  const treasuryOutAfter = await balanceOf(ctx, outputToken, TREASURY)
  const userInAfter = nativeIn ? BigInt(await rpc(ctx, 'eth_getBalance', [input.user, 'latest'])) : await balanceOf(ctx, inputToken, input.user)
  const userOutAfter = await balanceOf(ctx, outputToken, input.user)
  const pairInAfter = await balanceOf(ctx, inputToken, pair)
  const executorInAfter = await balanceOf(ctx, inputToken, ctx.executor)
  const executorOutAfter = await balanceOf(ctx, outputToken, ctx.executor)
  expect((treasuryFeeAfter - treasuryFeeBefore).toString()).toBe(expectedFee)
  expect((treasuryOutAfter - treasuryOutBefore).toString()).toBe('0')
  if (!nativeIn) {
    expect((userInBefore - userInAfter).toString()).toBe(input.request.inputAmountRaw)
  } else {
    expect(userInBefore - userInAfter >= BigInt(input.request.inputAmountRaw)).toBe(true)
  }
  expect(userOutAfter - userOutBefore >= BigInt(winner!.quote!.minimumReceivedRaw)).toBe(true)
  expect((pairInAfter - pairInBefore).toString()).toBe(expectedNet)
  expect(executorInAfter).toBe(executorInBefore)
  expect(executorOutAfter).toBe(executorOutBefore)
  const router = winner!.venueId === 'melega-dex' ? MELEGA_ROUTER : winner!.venueId === 'pancakeswap' ? PANCAKE_ROUTER : UNISWAP_ROUTER
  if (!nativeIn) expect(await allowanceOf(ctx, inputToken, ctx.executor, router)).toBe(0n)
  const transferToPair = receipt.logs.some((log) => {
    if (log.topics[0] !== TRANSFER_TOPIC || log.topics.length < 3) return false
    return (
      getAddress(log.address) === inputToken &&
      topicAddress(log.topics[2]) === pair &&
      BigInt(log.data).toString() === expectedNet
    )
  })
  expect(transferToPair).toBe(true)
  expect(await usedNonce(ctx, input.user, input.nonce)).toBe(true)
  FORK_PROOF.observed.push(
    `${ctx.label} ${winner!.venueId} ${nativeIn ? 'native-in' : 'erc20-in'} fee=${expectedFee} net=${expectedNet} userOut+=${(userOutAfter - userOutBefore).toString()} calldata=${calldataHash}`,
  )
  return { prepared, winner, receipt, router, inputToken, outputToken, expectedFee, expectedNet, pair }
}

describe('sendExpectRevert helper regressions', () => {
  const tx: UnsignedUserTransaction = {
    from: '0x1111111111111111111111111111111111111111',
    to: '0x3333333333333333333333333333333333333333',
    chainId: 56,
    data: '0x',
    value: '0x0',
  }
  const expected: ExpectedRevert = { custom: 'Replay' }
  const replayData = customErrorSelector('Replay')
  const expiredData = customErrorSelector('Expired')

  it('rejects timeout and does not treat it as an EVM revert', async () => {
    await expect(
      sendExpectRevertWith(
        {
          sendTransaction: async () => {
            throw Object.assign(new Error('request timed out'), { code: 'TIMEOUT' })
          },
          waitForReceipt: async () => null,
          ethCall: async () => '0x',
        },
        tx,
        expected,
      ),
    ).rejects.toThrow(/REVERT_HELPER_TRANSPORT:TIMEOUT/)
  })

  it('rejects HTTP 429 and does not treat it as an EVM revert', async () => {
    await expect(
      sendExpectRevertWith(
        {
          sendTransaction: async () => {
            throw Object.assign(new Error('Too Many Requests'), { status: 429, code: 'SERVER_ERROR' })
          },
          waitForReceipt: async () => null,
          ethCall: async () => '0x',
        },
        tx,
        expected,
      ),
    ).rejects.toThrow(/REVERT_HELPER_TRANSPORT:RATE_LIMIT/)
  })

  it('rejects a null receipt', async () => {
    await expect(
      sendExpectRevertWith(
        {
          sendTransaction: async () => '0xabc0000000000000000000000000000000000000000000000000000000000001',
          waitForReceipt: async () => null,
          ethCall: async () => replayData,
        },
        tx,
        expected,
      ),
    ).rejects.toThrow('REVERT_HELPER_NULL_RECEIPT')
  })

  it('rejects a successful receipt status=1', async () => {
    await expect(
      sendExpectRevertWith(
        {
          sendTransaction: async () => '0xabc0000000000000000000000000000000000000000000000000000000000002',
          waitForReceipt: async () => ({
            status: 1,
            transactionHash: '0xabc0000000000000000000000000000000000000000000000000000000000002',
          }),
          ethCall: async () => replayData,
        },
        tx,
        expected,
      ),
    ).rejects.toThrow(/REVERT_HELPER_SUCCEEDED/)
  })

  it('accepts status=0 with the Replay selector and rejects Expired for a Replay case', async () => {
    const ok = await sendExpectRevertWith(
      {
        sendTransaction: async () => '0xabc0000000000000000000000000000000000000000000000000000000000003',
        waitForReceipt: async () => ({
          status: 0,
          transactionHash: '0xabc0000000000000000000000000000000000000000000000000000000000003',
        }),
        ethCall: async () => {
          throw Object.assign(new Error('execution reverted'), { data: replayData })
        },
      },
      tx,
      expected,
    )
    expect(ok.custom).toBe('Replay')
    expect(ok.selector).toBe(replayData)
    await expect(
      sendExpectRevertWith(
        {
          sendTransaction: async () => '0xabc0000000000000000000000000000000000000000000000000000000000004',
          waitForReceipt: async () => ({
            status: 0,
            transactionHash: '0xabc0000000000000000000000000000000000000000000000000000000000004',
          }),
          ethCall: async () => {
            throw Object.assign(new Error('execution reverted'), { data: expiredData })
          },
        },
        tx,
        expected,
      ),
    ).rejects.toThrow(/REVERT_REASON_MISMATCH:want=Replay:have=Expired/)
  })
})

describe('SmartSwap V2 real-router local Anvil fork proof', () => {
  let bsc: ForkCtx
  let eth: ForkCtx

  beforeAll(async () => {
    ensureReleaseExecutor()
    const pkgCreation = readFileSync(path.join(PKG_DIR, 'creation.hex'), 'utf8').trim()
    const pkgDeployed = readFileSync(path.join(PKG_DIR, 'deployed.hex'), 'utf8').trim()
    expect(sha256Bytes(pkgCreation)).toBe(PKG_CREATION_SHA)
    expect(sha256Bytes(pkgDeployed)).toBe(PKG_DEPLOYED_SHA)
    bsc = await startFork({
      label: 'BSC',
      chainId: 56,
      port: BSC_PORT,
      expectedChainHex: '0x38',
      urls: BSC_RPC_CANDIDATES,
      codeAddresses: [MELEGA_ROUTER, PANCAKE_ROUTER, MELEGA_FACTORY, PANCAKE_FACTORY, WBNB, USDC_BSC],
      wrapped: WBNB,
      routers: [
        { address: MELEGA_ROUTER, venue: 'melega-dex' },
        { address: PANCAKE_ROUTER, venue: 'pancakeswap' },
      ],
    })
    FORK_PROOF.bsc = { rpc: bsc.source.url, block: bsc.source.block, hash: bsc.source.hash, chainId: '56' }
    const melegaPairData = await rpc(bsc, 'eth_call', [
      { to: MELEGA_FACTORY, data: VIEW.encodeFunctionData('getPair', [WBNB, USDC_BSC]) },
      'latest',
    ])
    await warmForkReads(bsc, [WBNB, USDC_BSC], [MELEGA_ROUTER, PANCAKE_ROUTER, getAddress(`0x${melegaPairData.slice(-40)}`)])
    eth = await startFork({
      label: 'ETH',
      chainId: 1,
      port: ETH_PORT,
      expectedChainHex: '0x1',
      urls: ETH_RPC_CANDIDATES,
      codeAddresses: [UNISWAP_ROUTER, UNISWAP_FACTORY, WETH, USDC_ETH],
      wrapped: WETH,
      routers: [{ address: UNISWAP_ROUTER, venue: 'uniswap' }],
    })
    FORK_PROOF.eth = { rpc: eth.source.url, block: eth.source.block, hash: eth.source.hash, chainId: '1' }
    await warmForkReads(eth, [WETH, USDC_ETH], [UNISWAP_ROUTER])
    expect(bsc.provider.connection.url).toBe(`http://${ANVIL_HOST}:${BSC_PORT}`)
    expect(eth.provider.connection.url).toBe(`http://${ANVIL_HOST}:${ETH_PORT}`)
  }, 240_000)

  afterAll(() => {
    stopFork(bsc)
    stopFork(eth)
  })

  it('release artifact matches #83 package', () => {
    const art = compiledExecutorArtifact()
    expect(sha256Bytes(art.bytecode.object)).toBe(PKG_CREATION_SHA)
    expect(sha256Bytes(art.deployedBytecode.object)).toBe(PKG_DEPLOYED_SHA)
    expect(bsc.owner).not.toBe(getAddress(TEAM))
    expect(eth.owner).not.toBe(getAddress(TEAM))
    expect(bsc.setCodeCalls).toEqual([])
    expect(eth.setCodeCalls).toEqual([])
  })

  it('BSC Melega native-in against real router', async () => {
    await proveHappyPath(bsc, {
      request: bscRequest('native'),
      venues: ['melega-dex'],
      user: bsc.users[0],
      nonce: 1,
      expectVenue: 'melega-dex',
    })
    FORK_PROOF.melegaNative = true
  }, 120_000)

  it('BSC Melega ERC20-in against real router', async () => {
    await proveHappyPath(bsc, {
      request: bscRequest('erc20'),
      venues: ['melega-dex'],
      user: bsc.users[1],
      nonce: 1,
      expectVenue: 'melega-dex',
    })
    FORK_PROOF.melegaErc20 = true
  }, 120_000)

  it('BSC Pancake native-in against real router', async () => {
    await proveHappyPath(bsc, {
      request: bscRequest('native'),
      venues: ['pancakeswap'],
      user: bsc.users[2],
      nonce: 1,
      expectVenue: 'pancakeswap',
    })
    FORK_PROOF.pancakeNative = true
  }, 120_000)

  it('BSC Pancake ERC20-in against real router', async () => {
    const happy = await proveHappyPath(bsc, {
      request: bscRequest('erc20'),
      venues: ['pancakeswap'],
      user: bsc.users[3],
      nonce: 1,
      expectVenue: 'pancakeswap',
    })
    await assertFailedExecute(bsc, happy.prepared.swapTransaction, { custom: 'Replay' }, {
      user: bsc.users[3],
      nonce: 1,
      nonceUsed: true,
      inputToken: WBNB,
      outputToken: USDC_BSC,
      label: 'BSC pancake replay',
    })
    FORK_PROOF.pancakeErc20 = true
  }, 120_000)

  it('BSC factual Melega vs Pancake competition does not force a winner', async () => {
    const request = bscRequest('erc20')
    await wrapNative(bsc, bsc.users[4], request.inputAmountRaw)
    const { result, nowIso } = await compete(bsc, request, ['melega-dex', 'pancakeswap'])
    expect(result.melega?.status).toBe('ok')
    expect(result.pancake?.status).toBe('ok')
    expect(result.shadowWinner?.status).toBe('ok')
    expect(['melega-dex', 'pancakeswap']).toContain(result.shadowWinner!.venueId)
    FORK_PROOF.bscCompetitionWinner = result.shadowWinner!.venueId
    const prepared = prepareV2UserTransactions({
      request,
      winner: result.shadowWinner,
      user: bsc.users[4],
      deadline: Number((await rpc(bsc, 'eth_getBlockByNumber', ['latest', false])).timestamp) + 3_600,
      nonce: 7,
      nowIso,
      currentChainId: 56,
      executorAddress: bsc.executor,
      observedAllowance: {
        chainId: 56,
        token: WBNB,
        owner: bsc.users[4],
        spender: bsc.executor,
        amountRaw: '0',
      },
    })
    for (const tx of prepared.approvalTransactions) expect((await sendExact(bsc, tx)).status).toBe(1)
    const receipt = await sendExact(bsc, prepared.swapTransaction)
    expect(receipt.status).toBe(1)
    FORK_PROOF.calldata.push(`BSC:competition:${result.shadowWinner!.venueId}:${keccak256(prepared.swapTransaction.data)}`)
    FORK_PROOF.bscCompetition = true
    FORK_PROOF.observed.push(`BSC competition winner=${result.shadowWinner!.venueId} melegaOut=${result.melega?.quote?.grossOutputRaw} pancakeOut=${result.pancake?.quote?.grossOutputRaw}`)
  }, 120_000)

  it('BSC expired / slippage collect no fee and consume no unused nonce', async () => {
    const isolated = await startFork({
      label: 'BSC-FAIL',
      chainId: 56,
      port: 18559,
      expectedChainHex: '0x38',
      urls: BSC_RPC_CANDIDATES,
      codeAddresses: [MELEGA_ROUTER, PANCAKE_ROUTER, MELEGA_FACTORY, PANCAKE_FACTORY, WBNB, USDC_BSC],
      wrapped: WBNB,
      routers: [
        { address: MELEGA_ROUTER, venue: 'melega-dex' },
        { address: PANCAKE_ROUTER, venue: 'pancakeswap' },
      ],
    })
    try {
      const user = isolated.users[0]
      const expiredReq = bscRequest('erc20')
      await wrapNative(isolated, user, expiredReq.inputAmountRaw)
      const expiredNow = new Date().toISOString()
      const expiredComp = await compete(isolated, expiredReq, ['melega-dex'])
      const expiredDeadline = Math.floor(Date.now() / 1000) + 90
      const expiredPrep = prepareV2UserTransactions({
        request: expiredReq,
        winner: expiredComp.result.shadowWinner,
        user,
        deadline: expiredDeadline,
        nonce: 12,
        nowIso: expiredNow,
        currentChainId: 56,
        executorAddress: isolated.executor,
        observedAllowance: { chainId: 56, token: WBNB, owner: user, spender: isolated.executor, amountRaw: '0' },
      })
      for (const tx of expiredPrep.approvalTransactions) expect((await sendExact(isolated, tx)).status).toBe(1)
      await advancePastDeadline(isolated, expiredDeadline)
      await assertFailedExecute(isolated, expiredPrep.swapTransaction, { custom: 'Expired' }, {
        user,
        nonce: 12,
        nonceUsed: false,
        inputToken: WBNB,
        outputToken: USDC_BSC,
        label: 'BSC melega expired',
      })

      const slipReq = bscRequest('erc20', GROSS_BSC, 1)
      await wrapNative(isolated, user, slipReq.inputAmountRaw)
      const slipNow = new Date().toISOString()
      const slipComp = await compete(isolated, slipReq, ['melega-dex'])
      const slipPrep = prepareV2UserTransactions({
        request: slipReq,
        winner: slipComp.result.shadowWinner,
        user,
        deadline: Math.floor(Date.now() / 1000) + 3_600,
        nonce: 13,
        nowIso: slipNow,
        currentChainId: 56,
        executorAddress: isolated.executor,
        observedAllowance: { chainId: 56, token: WBNB, owner: user, spender: isolated.executor, amountRaw: '0' },
      })
      for (const tx of slipPrep.approvalTransactions) expect((await sendExact(isolated, tx)).status).toBe(1)
      await dumpPool(isolated, MELEGA_ROUTER, [WBNB, USDC_BSC], 2n * 10n ** 18n)
      await assertFailedExecute(
        isolated,
        slipPrep.swapTransaction,
        { stringIncludes: 'INSUFFICIENT_OUTPUT_AMOUNT' },
        {
          user,
          nonce: 13,
          nonceUsed: false,
          inputToken: WBNB,
          outputToken: USDC_BSC,
          label: 'BSC melega slippage',
        },
      )
    } finally {
      stopFork(isolated)
    }
  }, 120_000)

  it('Ethereum Uniswap native-in against real router', async () => {
    await proveHappyPath(eth, {
      request: ethRequest('native'),
      venues: ['uniswap'],
      user: eth.users[0],
      nonce: 1,
      expectVenue: 'uniswap',
    })
    FORK_PROOF.uniswapNative = true
  }, 120_000)

  it('Ethereum Uniswap ERC20-in against real router', async () => {
    await proveHappyPath(eth, {
      request: ethRequest('erc20'),
      venues: ['uniswap'],
      user: eth.users[1],
      nonce: 1,
      expectVenue: 'uniswap',
    })
    FORK_PROOF.uniswapErc20 = true
  }, 120_000)

  it('Ethereum Uniswap replay / expired / slippage collect no fee and consume no unused nonce', async () => {
    const user = eth.users[2]
    const happy = await proveHappyPath(eth, {
      request: ethRequest('erc20'),
      venues: ['uniswap'],
      user,
      nonce: 21,
      expectVenue: 'uniswap',
    })
    await assertFailedExecute(eth, happy.prepared.swapTransaction, { custom: 'Replay' }, {
      user,
      nonce: 21,
      nonceUsed: true,
      inputToken: WETH,
      outputToken: USDC_ETH,
      label: 'ETH uniswap replay',
    })

    const expiredReq = ethRequest('erc20')
    await wrapNative(eth, user, expiredReq.inputAmountRaw)
    const expiredNow = new Date().toISOString()
    const expiredComp = await compete(eth, expiredReq, ['uniswap'])
    const expiredDeadline = Math.floor(Date.now() / 1000) + 90
    const expiredPrep = prepareV2UserTransactions({
      request: expiredReq,
      winner: expiredComp.result.shadowWinner,
      user,
      deadline: expiredDeadline,
      nonce: 22,
      nowIso: expiredNow,
      currentChainId: 1,
      executorAddress: eth.executor,
      observedAllowance: { chainId: 1, token: WETH, owner: user, spender: eth.executor, amountRaw: '0' },
    })
    for (const tx of expiredPrep.approvalTransactions) expect((await sendExact(eth, tx)).status).toBe(1)
    await advancePastDeadline(eth, expiredDeadline)
    await assertFailedExecute(eth, expiredPrep.swapTransaction, { custom: 'Expired' }, {
      user,
      nonce: 22,
      nonceUsed: false,
      inputToken: WETH,
      outputToken: USDC_ETH,
      label: 'ETH uniswap expired',
    })

    const slipReq = ethRequest('erc20', GROSS_ETH, 1)
    await wrapNative(eth, user, slipReq.inputAmountRaw)
    const slipNow = new Date().toISOString()
    const slipComp = await compete(eth, slipReq, ['uniswap'])
    const slipPrep = prepareV2UserTransactions({
      request: slipReq,
      winner: slipComp.result.shadowWinner,
      user,
      deadline: Number((await rpc(eth, 'eth_getBlockByNumber', ['latest', false])).timestamp) + 3_600,
      nonce: 23,
      nowIso: slipNow,
      currentChainId: 1,
      executorAddress: eth.executor,
      observedAllowance: { chainId: 1, token: WETH, owner: user, spender: eth.executor, amountRaw: '0' },
    })
    for (const tx of slipPrep.approvalTransactions) expect((await sendExact(eth, tx)).status).toBe(1)
    await dumpPool(eth, UNISWAP_ROUTER, [WETH, USDC_ETH], 150n * 10n ** 18n)
    await assertFailedExecute(
      eth,
      slipPrep.swapTransaction,
      { stringIncludes: 'INSUFFICIENT_OUTPUT_AMOUNT' },
      {
        user,
        nonce: 23,
        nonceUsed: false,
        inputToken: WETH,
        outputToken: USDC_ETH,
        label: 'ETH uniswap slippage',
      },
    )
  }, 240_000)

  it('production flags stay frozen and no global PASS if a venue is unverified', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)
    const required = {
      melegaNative: FORK_PROOF.melegaNative,
      melegaErc20: FORK_PROOF.melegaErc20,
      pancakeNative: FORK_PROOF.pancakeNative,
      pancakeErc20: FORK_PROOF.pancakeErc20,
      bscCompetition: FORK_PROOF.bscCompetition,
      uniswapNative: FORK_PROOF.uniswapNative,
      uniswapErc20: FORK_PROOF.uniswapErc20,
    }
    const missing = Object.entries(required).filter(([, ok]) => !ok).map(([name]) => name)
    expect(missing, `venues unverified: ${missing.join(',')}`).toEqual([])
    expect(bsc.setCodeCalls).toEqual([])
    expect(eth.setCodeCalls).toEqual([])
    // eslint-disable-next-line no-console
    console.log('FORK_PROOF', JSON.stringify(FORK_PROOF, null, 2))
  })
})
