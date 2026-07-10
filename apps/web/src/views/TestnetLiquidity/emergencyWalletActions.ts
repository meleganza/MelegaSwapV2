import { BigNumber } from '@ethersproject/bignumber'
import { Interface } from '@ethersproject/abi'
import { MaxUint256 } from '@ethersproject/constants'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

export const TESTNET_CHAIN_ID = 97
export const TESTNET_CHAIN_HEX = '0x61'
export const DEFAULT_MARCO_AMOUNT = '100000'
export const DEFAULT_TBNB_AMOUNT = '0.25'
export const MAX_GAS_LIMIT = 3_000_000n
export const SAFE_FALLBACK_GAS = 800_000n
export const GAS_MARGIN_NUM = 120n
export const GAS_MARGIN_DEN = 100n

const ZERO = '0x0000000000000000000000000000000000000000'

export type ActionStatus =
  | 'connect_wallet'
  | 'switch_chain'
  | 'approve_marco'
  | 'create_pair'
  | 'add_liquidity'

export type AddLiquidityStatus = 'idle' | 'preparing' | 'wallet_open' | 'submitted' | 'confirmed' | 'failed'

export type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: () => void) => void
  removeListener?: (event: string, handler: () => void) => void
}

export type ParsedAmounts = {
  marcoWei: BigNumber
  tbnbWei: BigNumber
  marcoHuman: string
  tbnbHuman: string
}

export type AddLiquidityPreview = {
  marcoAmountWei: string
  tbnbAmountWei: string
  router: string
  token: string
  recipient: string
  deadline: number
  gasEstimate: string | null
  gasLimit: string | null
}

export type PairSnapshot = {
  pairAddress: string | null
  exists: boolean
  reserve0: string | null
  reserve1: string | null
  token0: string | null
  lpBalance: string | null
}

export function getEthereum(): EthProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { ethereum?: EthProvider }).ethereum
}

export function parseAmounts(marcoHuman: string, tbnbHuman: string): ParsedAmounts {
  return {
    marcoHuman,
    tbnbHuman,
    marcoWei: parseUnits(marcoHuman || '0', 18),
    tbnbWei: parseUnits(tbnbHuman || '0', 18),
  }
}

export function txExplorerUrl(txHash: string) {
  return `${BSC_TESTNET_ADDRESSES.explorer}/tx/${txHash}`
}

export function addressExplorerUrl(address: string) {
  return `${BSC_TESTNET_ADDRESSES.explorer}/address/${address}`
}

const ERC20_IFACE = new Interface([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
])

const FACTORY_IFACE = new Interface([
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
  'function createPair(address tokenA, address tokenB) returns (address pair)',
])

const PAIR_IFACE = new Interface([
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
])

const ROUTER_IFACE = new Interface([
  'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint amountToken, uint amountETH, uint liquidity)',
])

function toHexQuantity(value: BigNumber | bigint): string {
  const bn = BigNumber.isBigNumber(value) ? value : BigNumber.from(value.toString())
  return bn.toHexString()
}

export function capGasLimit(estimated: bigint): string {
  const withMargin = (estimated * GAS_MARGIN_NUM) / GAS_MARGIN_DEN
  const capped = withMargin > MAX_GAS_LIMIT ? MAX_GAS_LIMIT : withMargin
  return `0x${capped.toString(16)}`
}

export async function estimateGas(eth: EthProvider, tx: Record<string, string>): Promise<bigint> {
  const gasHex = (await eth.request({ method: 'eth_estimateGas', params: [tx] })) as string
  return BigInt(gasHex)
}

export async function waitForReceipt(
  eth: EthProvider,
  txHash: string,
  timeoutMs = 180_000,
): Promise<{ success: boolean; blockNumber: string | null }> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const receipt = (await eth.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })) as { status?: string; blockNumber?: string } | null
    if (receipt) {
      const status = receipt.status ?? '0x1'
      return { success: status === '0x1', blockNumber: receipt.blockNumber ?? null }
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error('Transaction receipt timeout')
}

export async function readWalletChain(eth: EthProvider) {
  const accounts = (await eth.request({ method: 'eth_accounts' })) as string[]
  const chainHex = (await eth.request({ method: 'eth_chainId' })) as string
  const chainId = Number.parseInt(chainHex, 16)
  return { account: accounts[0] ?? null, chainId: Number.isFinite(chainId) ? chainId : null }
}

export async function readPairSnapshot(account?: string | null): Promise<PairSnapshot> {
  const { Contract } = await import('@ethersproject/contracts')
  const { JsonRpcProvider } = await import('@ethersproject/providers')
  const provider = new JsonRpcProvider(BSC_TESTNET_ADDRESSES.rpcUrls[0], TESTNET_CHAIN_ID)
  const factory = new Contract(BSC_TESTNET_ADDRESSES.factory, FACTORY_IFACE, provider)
  const pairAddress: string = await factory.getPair(BSC_TESTNET_ADDRESSES.marco, BSC_TESTNET_ADDRESSES.wbnb)
  if (!pairAddress || pairAddress === ZERO) {
    return { pairAddress: null, exists: false, reserve0: null, reserve1: null, token0: null, lpBalance: null }
  }
  const pair = new Contract(pairAddress, PAIR_IFACE, provider)
  const [reserve0, reserve1] = await pair.getReserves()
  const token0: string = await pair.token0()
  let lpBalance: string | null = null
  if (account) {
    const bal = await pair.balanceOf(account)
    lpBalance = formatUnits(bal, 18)
  }
  return {
    pairAddress,
    exists: true,
    reserve0: formatUnits(reserve0, 18),
    reserve1: formatUnits(reserve1, 18),
    token0,
    lpBalance,
  }
}

export async function readMarcoAllowance(eth: EthProvider, owner: string, required: BigNumber): Promise<boolean> {
  const data = ERC20_IFACE.encodeFunctionData('allowance', [owner, BSC_TESTNET_ADDRESSES.router])
  const result = (await eth.request({
    method: 'eth_call',
    params: [{ to: BSC_TESTNET_ADDRESSES.marco, data }, 'latest'],
  })) as string
  const decoded = ERC20_IFACE.decodeFunctionResult('allowance', result)
  return BigInt(decoded[0].toString()) >= BigInt(required.toString())
}

export function deriveActionStatus(input: {
  account: string | null
  chainId: number | null
  pairExists: boolean
  allowanceSufficient: boolean
  addLiquidityLocked: boolean
}): ActionStatus {
  if (!input.account) return 'connect_wallet'
  if (input.chainId !== TESTNET_CHAIN_ID) return 'switch_chain'
  if (!input.allowanceSufficient) return 'approve_marco'
  if (!input.pairExists) return 'create_pair'
  if (input.addLiquidityLocked) return 'add_liquidity'
  return 'add_liquidity'
}

export const ACTION_LABELS: Record<ActionStatus, string> = {
  connect_wallet: 'Connect Wallet',
  switch_chain: 'Switch to BNB Testnet',
  approve_marco: 'Approve MARCO',
  create_pair: 'Create Pair',
  add_liquidity: 'Add Liquidity',
}

export function buildAddLiquidityPreview(account: string, amounts: ParsedAmounts): AddLiquidityPreview {
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20
  return {
    marcoAmountWei: amounts.marcoWei.toString(),
    tbnbAmountWei: amounts.tbnbWei.toString(),
    router: BSC_TESTNET_ADDRESSES.router,
    token: BSC_TESTNET_ADDRESSES.marco,
    recipient: account,
    deadline,
    gasEstimate: null,
    gasLimit: null,
  }
}

export function buildAddLiquidityTx(account: string, amounts: ParsedAmounts, deadline: number) {
  const data = ROUTER_IFACE.encodeFunctionData('addLiquidityETH', [
    BSC_TESTNET_ADDRESSES.marco,
    amounts.marcoWei.toString(),
    amounts.marcoWei.toString(),
    amounts.tbnbWei.toString(),
    account,
    deadline,
  ])
  return {
    from: account,
    to: BSC_TESTNET_ADDRESSES.router,
    data,
    value: toHexQuantity(amounts.tbnbWei),
    chainId: TESTNET_CHAIN_HEX,
  }
}

export async function connectWallet(eth: EthProvider) {
  await eth.request({ method: 'eth_requestAccounts' })
}

export async function switchToTestnet(eth: EthProvider) {
  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TESTNET_CHAIN_HEX }] })
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 4902) throw e
    await eth.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: TESTNET_CHAIN_HEX,
          chainName: 'BNB Smart Chain Testnet',
          nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
          rpcUrls: BSC_TESTNET_ADDRESSES.rpcUrls,
          blockExplorerUrls: [BSC_TESTNET_ADDRESSES.explorer],
        },
      ],
    })
  }
}

export function formatEthError(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const err = e as { message?: string; data?: { message?: string } }
    if (err.data?.message) return err.data.message
    if (err.message) return err.message
  }
  return 'transaction failed'
}

async function sendTx(eth: EthProvider, tx: Record<string, string>): Promise<string> {
  try {
    return (await eth.request({ method: 'eth_sendTransaction', params: [tx] })) as string
  } catch (e: unknown) {
    throw new Error(formatEthError(e))
  }
}

export async function approveMarco(eth: EthProvider, account: string) {
  const data = ERC20_IFACE.encodeFunctionData('approve', [BSC_TESTNET_ADDRESSES.router, MaxUint256])
  const txHash = await sendTx(eth, {
    from: account,
    to: BSC_TESTNET_ADDRESSES.marco,
    data,
    chainId: TESTNET_CHAIN_HEX,
  })
  await waitForReceipt(eth, txHash)
}

export async function createPair(eth: EthProvider, account: string) {
  const data = FACTORY_IFACE.encodeFunctionData('createPair', [
    BSC_TESTNET_ADDRESSES.marco,
    BSC_TESTNET_ADDRESSES.wbnb,
  ])
  const txHash = await sendTx(eth, {
    from: account,
    to: BSC_TESTNET_ADDRESSES.factory,
    data,
    chainId: TESTNET_CHAIN_HEX,
  })
  await waitForReceipt(eth, txHash)
}

export type AddLiquidityCallbacks = {
  onStatus: (status: AddLiquidityStatus) => void
  onPreview: (preview: AddLiquidityPreview) => void
  onTxHash: (hash: string) => void
  onReceipt: (success: boolean) => void
  onPairSnapshot: (snapshot: PairSnapshot) => void
}

export async function addLiquidityWithFlow(
  eth: EthProvider,
  account: string,
  amounts: ParsedAmounts,
  callbacks: AddLiquidityCallbacks,
) {
  callbacks.onStatus('preparing')
  const preview = buildAddLiquidityPreview(account, amounts)
  const txBase = buildAddLiquidityTx(account, amounts, preview.deadline)

  let gasLimitHex: string | undefined
  try {
    const estimated = await estimateGas(eth, txBase)
    gasLimitHex = capGasLimit(estimated)
    callbacks.onPreview({ ...preview, gasEstimate: estimated.toString(), gasLimit: gasLimitHex })
  } catch (e: unknown) {
    gasLimitHex = capGasLimit(SAFE_FALLBACK_GAS)
    callbacks.onPreview({
      ...preview,
      gasEstimate: null,
      gasLimit: `${gasLimitHex} (fallback — estimate failed: ${(e as Error)?.message ?? 'unknown'})`,
    })
    console.warn('[R745K] gas estimate failed, using safe fallback cap', (e as Error)?.message)
  }

  callbacks.onStatus('wallet_open')
  const txParams = { ...txBase, gas: gasLimitHex }
  const txHash = await sendTx(eth, txParams)
  callbacks.onStatus('submitted')
  callbacks.onTxHash(txHash)

  const receipt = await waitForReceipt(eth, txHash)
  if (!receipt.success) {
    callbacks.onStatus('failed')
    callbacks.onReceipt(false)
    throw new Error(`Add liquidity transaction reverted (tx: ${txHash})`)
  }

  callbacks.onStatus('confirmed')
  callbacks.onReceipt(true)
  const snapshot = await readPairSnapshot(account)
  callbacks.onPairSnapshot(snapshot)
}
