import { spawn, execFileSync, type ChildProcess } from 'child_process'
import { readFileSync } from 'fs'
import net from 'net'
import path from 'path'
import { Interface, defaultAbiCoder } from '@ethersproject/abi'
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
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { type SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import { prepareV2UserTransactions, type UnsignedUserTransaction } from '../v2ExecutionBinding'

const PKG = path.resolve(__dirname, '../../../../../../deployments/smartswap-executor-v2/founder-deployment-package')
const CANON_CREATION = readFileSync(
  path.resolve(__dirname, '../../../../../../deployments/smartswap-executor-v2/creation.hex'),
  'utf8',
).trim()
const ANVIL_HOST = '127.0.0.1'
const OWNER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const TREASURY = CANONICAL_SMARTSWAP_FEE_BENEFICIARY
const MELEGA = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const PANCAKE = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const UNISWAP = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC_BSC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const USDC_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const GROSS_BSC = '50000000000000000'
const GROSS_ETH = '20000000000000000'
const EXECUTED = keccak256(
  toUtf8Bytes('SmartSwapExecuted(bytes32,bytes32,address,address,uint256,uint256,address,uint256,address)'),
)
const ENFORCED_PAUSE = keccak256(toUtf8Bytes('EnforcedPause()')).slice(0, 10)
const UNAUTHORIZED = keccak256(toUtf8Bytes('OwnableUnauthorizedAccount(address)')).slice(0, 10)
const VIEW = new Interface([
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function wrappedNative() view returns (address)',
  'function allowedVenue(address) view returns (bytes32)',
  'function paused() view returns (bool)',
  'function usedNonce(address,uint256) view returns (bool)',
  'function deposit() payable',
])
const APPROVE = new Interface(['function approve(address spender, uint256 amount)'])
const BUDGET = { ...DEFAULT_LATENCY_BUDGET, initialResponseMs: 8_000, quoteTimeoutMs: 20_000, overallBudgetMs: 45_000 }

const bscPkg = JSON.parse(readFileSync(path.join(PKG, 'bsc.json'), 'utf8'))
const ethPkg = JSON.parse(readFileSync(path.join(PKG, 'ethereum.json'), 'utf8'))

interface Fork {
  label: string
  chainId: number
  provider: JsonRpcProvider
  anvil: ChildProcess
  owner: string
  user: string
  userB: string
  executor: string
  wrapped: string
  setCodeCalls: string[]
}

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

async function pickRpc(urls: string[], chainHex: string, code: string[]) {
  const errors: string[] = []
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      })
      const payload = await response.json()
      if (String(payload.result).toLowerCase() !== chainHex) throw new Error(`chain ${payload.result}`)
      const blockRes = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBlockByNumber', params: ['latest', false] }),
      })
      const block = (await blockRes.json()).result
      for (const address of code) {
        const codeRes = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [address, 'latest'] }),
        })
        const deployed = (await codeRes.json()).result
        if (!deployed || deployed === '0x') throw new Error(`no code ${address}`)
      }
      return { url, block: block.number as string, hash: block.hash as string }
    } catch (error) {
      errors.push(`${url} ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  throw new Error(errors.join(' | '))
}

async function startFork(input: {
  label: string
  port: number
  chainHex: string
  chainId: number
  urls: string[]
  wrapped: string
  code: string[]
  pkg: typeof bscPkg
}): Promise<Fork> {
  execFileSync('which', ['anvil'])
  if (await portBusy(input.port)) throw new Error(`PORT_IN_USE:${input.port}`)
  const source = await pickRpc(input.urls, input.chainHex, input.code)
  const anvil = spawn(
    'anvil',
    [
      '--host', ANVIL_HOST, '--port', String(input.port), '--fork-url', source.url,
      '--fork-block-number', String(BigInt(source.block)), '--accounts', '4', '--no-rate-limit',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
  const provider = new JsonRpcProvider({ url: `http://${ANVIL_HOST}:${input.port}`, timeout: 20_000 })
  const setCodeCalls: string[] = []
  const rpc = async (method: string, params: unknown[] = []) => {
    if (method === 'anvil_setCode') {
      setCodeCalls.push(String(params[0] ?? '').toLowerCase())
      throw new Error(`FORBIDDEN_SETCODE:${params[0]}`)
    }
    return provider.send(method, params)
  }
  for (let i = 0; i < 40; i += 1) {
    try {
      await rpc('eth_chainId')
      break
    } catch (error) {
      if (i === 39) throw error
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
  const accounts: string[] = (await rpc('eth_accounts')).map((row: string) => getAddress(row))
  const owner = accounts[0]
  expect(getAddress(owner)).not.toBe(getAddress(OWNER))
  expect(getAddress(owner)).not.toBe(getAddress(TREASURY))
  const ctor = defaultAbiCoder.encode(['address', 'address', 'address'], [TREASURY, input.wrapped, owner])
  const canonicalCtor = input.pkg.constructor.abiEncodedArguments as string
  const localData = `0x${CANON_CREATION.replace(/^0x/, '')}${ctor.slice(2)}`
  const canonicalData = input.pkg.creationTransaction.data as string
  expect(localData.slice(0, localData.length - 64).toLowerCase()).toBe(canonicalData.slice(0, canonicalData.length - 64).toLowerCase())
  expect(canonicalData.slice(-40).toLowerCase()).toBe(OWNER.slice(2).toLowerCase())
  expect(canonicalCtor.toLowerCase()).not.toBe(ctor.toLowerCase())
  const gasPrice = await rpc('eth_gasPrice')
  const deployHash = await rpc('eth_sendTransaction', [{ from: owner, data: localData, gas: toHex(BigInt(8000000)), gasPrice }])
  const deployReceipt = await provider.waitForTransaction(deployHash)
  if (!deployReceipt?.contractAddress || deployReceipt.status !== 1) throw new Error(`${input.label}_DEPLOY_FAILED`)
  const executor = getAddress(deployReceipt.contractAddress)
  for (const call of input.pkg.setRouterCalls) {
    const hash = await rpc('eth_sendTransaction', [{
      from: owner, to: executor, data: call.calldata, gas: toHex(BigInt(500000)), gasPrice,
    }])
    const receipt = await provider.waitForTransaction(hash)
    expect(receipt?.status).toBe(1)
    expect(Number(receipt?.gasUsed)).toBe(call.venue === 'melega-dex' || call.venue === 'pancakeswap' || call.venue === 'uniswap'
      ? input.pkg.gasEstimate.GAS_UNITS.setRouter[input.pkg.setRouterCalls.indexOf(call)]
      : Number(receipt?.gasUsed))
  }
  for (const user of accounts.slice(1)) await rpc('anvil_setBalance', [user, toHex(BigInt('1000000000000000000000'))])
  return {
    label: input.label, chainId: input.chainId, provider, anvil, owner, user: accounts[1], userB: accounts[2],
    executor, wrapped: input.wrapped, setCodeCalls,
  }
}

async function call(fork: Fork, to: string, data: string, from?: string) {
  return fork.provider.send('eth_call', [{ to, data, from }, 'latest'])
}

async function wordAddress(fork: Fork, to: string, data: string) {
  return getAddress(`0x${(await call(fork, to, data)).slice(-40)}`)
}

async function balance(fork: Fork, token: string, who: string) {
  return BigInt(await call(fork, token, VIEW.encodeFunctionData('balanceOf', [who])))
}

async function allowance(fork: Fork, token: string, owner: string, spender: string) {
  return BigInt(await call(fork, token, VIEW.encodeFunctionData('allowance', [owner, spender])))
}

function providerFetch(provider: JsonRpcProvider): typeof fetch {
  return async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { method: string; params?: unknown[] }
    try {
      const result = await provider.send(body.method, body.params ?? [])
      return { ok: true, json: async () => ({ result }) } as Response
    } catch (error) {
      return { ok: true, json: async () => ({ error: { message: error instanceof Error ? error.message : String(error) } }) } as Response
    }
  }
}

async function send(fork: Fork, tx: UnsignedUserTransaction) {
  const hash = await fork.provider.send('eth_sendTransaction', [{
    from: tx.from, to: tx.to, data: tx.data, value: tx.value, gas: toHex(BigInt(3500000)),
  }])
  const receipt = await fork.provider.waitForTransaction(hash)
  if (!receipt || receipt.status !== 1) throw new Error(`LOCAL_TX_REVERTED:${tx.to}`)
  return receipt
}

async function executeVenue(fork: Fork, kind: 'native' | 'erc20', venue: 'melega-dex' | 'pancakeswap' | 'uniswap', user: string, nonce: number) {
  const request: SmartSwapRequest = {
    requestId: `pkg-${fork.chainId}-${venue}-${kind}`,
    network: evmNetwork(fork.chainId),
    inputAsset: kind === 'native'
      ? evmNative(fork.chainId, fork.chainId === 56 ? 'BNB' : 'ETH', 18)
      : fork.chainId === 56 ? CANONICAL_EXAMPLE_ASSETS.wbnb : CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: fork.chainId === 56 ? CANONICAL_EXAMPLE_ASSETS.usdcBnb : CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw: fork.chainId === 56 ? GROSS_BSC : GROSS_ETH,
    exactOut: false,
    slippageBps: 50,
  }
  const inputToken = kind === 'native' ? fork.wrapped : getAddress(kind === 'erc20' && fork.chainId === 56 ? WBNB : WETH)
  const outputToken = fork.chainId === 56 ? USDC_BSC : USDC_ETH
  if (kind === 'erc20') {
    await send(fork, {
      from: user, to: fork.wrapped, chainId: fork.chainId,
      data: VIEW.encodeFunctionData('deposit', []), value: toHex(request.inputAmountRaw),
    })
  }
  const source = createFactualV2QuoteSource({
    rpcUrlByChain: { [fork.chainId]: fork.provider.connection.url },
    fetchImpl: providerFetch(fork.provider),
  })
  const adapters = venue === 'melega-dex'
    ? [createMelegaDexAdapter(null, { quoteSource: source })]
    : venue === 'pancakeswap'
      ? [createPancakeSwapVenueAdapter(source)]
      : [createUniswapVenueAdapter(source)]
  const nowIso = new Date().toISOString()
  const result = await runEvmShadowCompetition({ request, productionQuote: null, adapters, nowIso, budget: BUDGET })
  const winner = result.shadowWinner
  expect(winner?.status).toBe('ok')
  expect(winner?.venueId).toBe(venue)
  const feeBps = winner!.smartSwapFeeBps!
  expect(feeBps).toBe(venue === 'uniswap' ? 15 : 20)
  const fee = computeFeeAmountRaw(request.inputAmountRaw, feeBps)
  const net = computeNetVenueInput(request.inputAmountRaw, feeBps).netVenueInputRaw
  const block = await fork.provider.getBlock('latest')
  const deadline = Math.max(Number(block.timestamp), Math.floor(Date.now() / 1000)) + 3600
  const prepared = prepareV2UserTransactions({
    request, winner, user, deadline, nonce, nowIso, currentChainId: fork.chainId, executorAddress: fork.executor,
    observedAllowance: kind === 'native' ? undefined : {
      chainId: fork.chainId, token: inputToken, owner: user, spender: fork.executor, amountRaw: '0',
    },
  })
  expect(prepared.productionExecutionCapable).toBe(false)
  expect(prepared.swapTransaction.from).toBe(getAddress(user))
  expect(prepared.swapTransaction.to).toBe(fork.executor)
  expect(prepared.swapTransaction.data.startsWith('0x4bce4501')).toBe(true)
  expect(prepared.swapTransaction.from).not.toBe(getAddress(OWNER))
  expect(prepared.swapTransaction.from).not.toBe(getAddress(TREASURY))
  for (const approval of prepared.approvalTransactions) {
    const decoded = APPROVE.decodeFunctionData('approve', approval.data)
    expect(getAddress(decoded.spender)).toBe(fork.executor)
    expect(approval.from).toBe(getAddress(user))
    expect(approval.to).not.toBe(fork.executor)
  }
  return { prepared, fee, net, inputToken, outputToken, request }
}

describe('founder deployment package local fork rehearsal', () => {
  let bsc: Fork
  let eth: Fork

  beforeAll(async () => {
    bsc = await startFork({
      label: 'BSC', port: 18573, chainHex: '0x38', chainId: 56, wrapped: WBNB, pkg: bscPkg,
      urls: ['https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.bnbchain.org', 'https://bsc-dataseed1.defibit.io'],
      code: [MELEGA, PANCAKE, WBNB, USDC_BSC],
    })
    eth = await startFork({
      label: 'ETH', port: 18574, chainHex: '0x1', chainId: 1, wrapped: WETH, pkg: ethPkg,
      urls: ['https://rpc.flashbots.net', 'https://mainnet.gateway.tenderly.co', 'https://eth.merkle.io'],
      code: [UNISWAP, WETH, USDC_ETH],
    })
  }, 180_000)

  afterAll(() => {
    bsc?.anvil.kill('SIGKILL')
    eth?.anvil.kill('SIGKILL')
  })

  async function assertIdentity(fork: Fork, pkg: typeof bscPkg) {
    expect(await wordAddress(fork, fork.executor, '0x8da5cb5b')).toBe(fork.owner)
    expect(await wordAddress(fork, fork.executor, '0x61d027b3')).toBe(getAddress(TREASURY))
    expect(await wordAddress(fork, fork.executor, '0xeb6d3a11')).toBe(getAddress(pkg.wrappedNative.address))
    expect(await call(fork, fork.executor, '0x5c975abb')).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    for (const row of pkg.setRouterCalls) {
      const stored = await call(fork, fork.executor, VIEW.encodeFunctionData('allowedVenue', [row.router]))
      expect(stored.toLowerCase()).toBe(row.venueIdHash.toLowerCase())
    }
    expect(fork.setCodeCalls).toEqual([])
  }

  it('BSC getters, owner-only setRouter, pause, and Melega plus Pancake flows', async () => {
    await assertIdentity(bsc, bscPkg)
    const gasPrice = await bsc.provider.send('eth_gasPrice', [])
    const deniedHash = await bsc.provider.send('eth_sendTransaction', [{
      from: bsc.user, to: bsc.executor, data: bscPkg.setRouterCalls[0].calldata, gas: toHex(BigInt(200000)), gasPrice,
    }])
    expect((await bsc.provider.waitForTransaction(deniedHash))?.status).toBe(0)
    await expect(call(bsc, bsc.executor, bscPkg.setRouterCalls[0].calldata, bsc.user)).rejects.toThrow(/OwnableUnauthorizedAccount|0x118cdaa7/i)
    expect(UNAUTHORIZED).toBe('0x118cdaa7')

    const native = await executeVenue(bsc, 'native', 'melega-dex', bsc.user, 1)
    const pauseHash = await bsc.provider.send('eth_sendTransaction', [{
      from: bsc.owner, to: bsc.executor, data: bscPkg.rollbackPause.calldata, gas: toHex(BigInt(200000)), gasPrice,
    }])
    expect((await bsc.provider.waitForTransaction(pauseHash))?.status).toBe(1)
    const treasuryBefore = await balance(bsc, WBNB, TREASURY)
    const pausedHash = await bsc.provider.send('eth_sendTransaction', [{
      from: native.prepared.swapTransaction.from,
      to: native.prepared.swapTransaction.to,
      data: native.prepared.swapTransaction.data,
      value: native.prepared.swapTransaction.value,
      gas: toHex(BigInt(3500000)),
    }])
    expect((await bsc.provider.waitForTransaction(pausedHash))?.status).toBe(0)
    let pauseEvidence = ''
    try {
      pauseEvidence = await bsc.provider.call({
        from: native.prepared.swapTransaction.from,
        to: native.prepared.swapTransaction.to,
        data: native.prepared.swapTransaction.data,
        value: native.prepared.swapTransaction.value,
      })
    } catch (error) {
      pauseEvidence = error instanceof Error ? `${error.message} ${JSON.stringify(error)}` : String(error)
    }
    expect(pauseEvidence.toLowerCase()).toContain(ENFORCED_PAUSE)
    expect(ENFORCED_PAUSE).toBe('0xd93c0665')
    expect(await call(bsc, bsc.executor, VIEW.encodeFunctionData('usedNonce', [bsc.user, 1]))).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
    expect(await balance(bsc, WBNB, TREASURY)).toBe(treasuryBefore)
    const unpauseHash = await bsc.provider.send('eth_sendTransaction', [{
      from: bsc.owner, to: bsc.executor, data: bscPkg.rollbackUnpause.calldata, gas: toHex(BigInt(200000)), gasPrice,
    }])
    expect((await bsc.provider.waitForTransaction(unpauseHash))?.status).toBe(1)
    const nativeReceipt = await send(bsc, native.prepared.swapTransaction)
    expect(await balance(bsc, WBNB, TREASURY) - treasuryBefore).toBe(BigInt(native.fee))
    expect(nativeReceipt.logs.some((log) => getAddress(log.address) === bsc.executor && log.topics[0] === EXECUTED)).toBe(true)
    expect(await call(bsc, bsc.executor, VIEW.encodeFunctionData('usedNonce', [bsc.user, 1]))).not.toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    const erc20 = await executeVenue(bsc, 'erc20', 'pancakeswap', bsc.userB, 2)
    const userBefore = await balance(bsc, WBNB, bsc.userB)
    const treasuryErcBefore = await balance(bsc, WBNB, TREASURY)
    const outBefore = await balance(bsc, USDC_BSC, bsc.userB)
    for (const tx of erc20.prepared.approvalTransactions) expect((await send(bsc, tx)).status).toBe(1)
    const ercReceipt = await send(bsc, erc20.prepared.swapTransaction)
    expect(userBefore - (await balance(bsc, WBNB, bsc.userB))).toBe(BigInt(erc20.request.inputAmountRaw))
    expect((await balance(bsc, WBNB, TREASURY)) - treasuryErcBefore).toBe(BigInt(erc20.fee))
    expect((await balance(bsc, USDC_BSC, bsc.userB)) - outBefore > BigInt(0)).toBe(true)
    expect(await allowance(bsc, WBNB, bsc.executor, PANCAKE)).toBe(BigInt(0))
    expect(ercReceipt.logs.some((log) => getAddress(log.address) === bsc.executor && log.topics[0] === EXECUTED)).toBe(true)
    expect([native.prepared.swapTransaction.to, erc20.prepared.swapTransaction.to]).toEqual([bsc.executor, bsc.executor])
  }, 180_000)

  it('ETH getters and Uniswap native plus ERC20 flows', async () => {
    await assertIdentity(eth, ethPkg)
    const gasPrice = await eth.provider.send('eth_gasPrice', [])
    const deniedHash = await eth.provider.send('eth_sendTransaction', [{
      from: eth.user, to: eth.executor, data: ethPkg.setRouterCalls[0].calldata, gas: toHex(BigInt(200000)), gasPrice,
    }])
    expect((await eth.provider.waitForTransaction(deniedHash))?.status).toBe(0)
    const native = await executeVenue(eth, 'native', 'uniswap', eth.user, 7)
    const treasuryBefore = await balance(eth, WETH, TREASURY)
    const outBefore = await balance(eth, USDC_ETH, eth.user)
    const nativeReceipt = await send(eth, native.prepared.swapTransaction)
    expect((await balance(eth, WETH, TREASURY)) - treasuryBefore).toBe(BigInt(native.fee))
    expect((await balance(eth, USDC_ETH, eth.user)) - outBefore > BigInt(0)).toBe(true)
    expect(nativeReceipt.logs.some((log) => getAddress(log.address) === eth.executor && log.topics[0] === EXECUTED)).toBe(true)

    const erc20 = await executeVenue(eth, 'erc20', 'uniswap', eth.userB, 8)
    const userBefore = await balance(eth, WETH, eth.userB)
    const treasuryErcBefore = await balance(eth, WETH, TREASURY)
    for (const tx of erc20.prepared.approvalTransactions) expect((await send(eth, tx)).status).toBe(1)
    await send(eth, erc20.prepared.swapTransaction)
    expect(userBefore - (await balance(eth, WETH, eth.userB))).toBe(BigInt(erc20.request.inputAmountRaw))
    expect((await balance(eth, WETH, TREASURY)) - treasuryErcBefore).toBe(BigInt(erc20.fee))
    expect(await allowance(eth, WETH, eth.executor, UNISWAP)).toBe(BigInt(0))
  }, 180_000)
})
