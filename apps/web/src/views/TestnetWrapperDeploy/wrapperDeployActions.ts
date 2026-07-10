import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { getAddress } from '@ethersproject/address'
import wrapperAbi from 'lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json'
import {
  WRAPPER_CONSTRUCTOR,
  WRAPPER_CREATION_ARTIFACT_URL,
  WRAPPER_DEPLOY_CHAIN_HEX,
  WRAPPER_DEPLOY_CHAIN_ID,
  WRAPPER_IMMUTABLE_EXPECT,
} from './wrapperDeployConfig'

export { WRAPPER_DEPLOY_CHAIN_ID, WRAPPER_DEPLOY_CHAIN_HEX } from './wrapperDeployConfig'

export const BNB_TESTNET_CHAIN_NAME = 'BNB Smart Chain Testnet'
export const BNB_TESTNET_RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'
export const BNB_TESTNET_EXPLORER = 'https://testnet.bscscan.com'

export const DEPLOY_GAS_MARGIN_NUM = 130
export const DEPLOY_GAS_MARGIN_DEN = 100
export const DEPLOY_MIN_GAS_LIMIT = 1_300_000
export const DEPLOY_MAX_GAS_LIMIT = 3_000_000

export function isBnbTestnetChain(chainId: number | null | undefined): boolean {
  return chainId === WRAPPER_DEPLOY_CHAIN_ID
}

export type DeployStatus = 'idle' | 'preparing' | 'wallet_open' | 'submitted' | 'confirmed' | 'failed' | 'verified'

export type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: () => void) => void
  removeListener?: (event: string, handler: () => void) => void
}

export type CreationArtifact = {
  contractName: string
  solcVersion: string
  sourcePath: string
  bytecodeHash: string
  bytecode: string
}

export type ConstructorPreview = {
  underlyingRouter: string
  treasuryIntake: string
  marcoToken: string
  pricingRefHash: string
  treasuryPolicyRefHash: string
  owner: string
  bytecodeHash: string
  encodedConstructor: string
  deployDataLength: number
}

export type ImmutableVerification = {
  underlyingRouter: string
  treasuryCollector: string
  marcoToken: string
  pricingRefHash: string
  treasuryPolicyRefHash: string
  standardFeeBps: number
  buyMarcoFeeBps: number
  standardFeeQuoteBps: number
  buyMarcoFeeQuoteBps: number
  pass: boolean
  failures: string[]
}

export type DeployReceiptResult = {
  success: boolean
  contractAddress: string | null
  gasUsed: string | null
  failureReason: string | null
}

export type DeployCallbacks = {
  onStatus: (status: DeployStatus) => void
  onGasPreview: (estimate: string, limit: string) => void
  onTxHash: (hash: string) => void
  onReceipt: (result: DeployReceiptResult) => void
  onVerification: (result: ImmutableVerification) => void
}

export function getEthereum(): EthProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { ethereum?: EthProvider }).ethereum
}

export async function getReadProvider() {
  const { JsonRpcProvider } = await import('@ethersproject/providers')
  return new JsonRpcProvider(BNB_TESTNET_RPC_URL, WRAPPER_DEPLOY_CHAIN_ID)
}

export function refHashes() {
  return {
    pricingRefHash: keccak256(toUtf8Bytes(WRAPPER_CONSTRUCTOR.pricingRefLabel)),
    treasuryPolicyRefHash: keccak256(toUtf8Bytes(WRAPPER_CONSTRUCTOR.treasuryPolicyRefLabel)),
  }
}

export function capDeployGasLimit(estimated: BigNumber): BigNumber {
  const withMargin = estimated.mul(DEPLOY_GAS_MARGIN_NUM).div(DEPLOY_GAS_MARGIN_DEN)
  const floored = withMargin.lt(DEPLOY_MIN_GAS_LIMIT) ? BigNumber.from(DEPLOY_MIN_GAS_LIMIT) : withMargin
  return floored.gt(DEPLOY_MAX_GAS_LIMIT) ? BigNumber.from(DEPLOY_MAX_GAS_LIMIT) : floored
}

export function isDeployReceiptSuccess(receipt: {
  status?: number | null
  contractAddress?: string | null
}): boolean {
  if (receipt.status === 0) return false
  if (receipt.status === 1) return true
  return Boolean(receipt.contractAddress)
}

export async function loadCreationArtifact(): Promise<CreationArtifact> {
  const res = await fetch(WRAPPER_CREATION_ARTIFACT_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load creation artifact (${res.status})`)
  return res.json() as Promise<CreationArtifact>
}

export function buildConstructorPreview(artifact: CreationArtifact): ConstructorPreview {
  const { pricingRefHash, treasuryPolicyRefHash } = refHashes()
  const encodedConstructor = defaultAbiCoder.encode(
    ['address', 'address', 'address', 'bytes32', 'bytes32', 'address'],
    [
      WRAPPER_CONSTRUCTOR.underlyingRouter,
      WRAPPER_CONSTRUCTOR.treasuryIntake,
      WRAPPER_CONSTRUCTOR.marcoToken,
      pricingRefHash,
      treasuryPolicyRefHash,
      WRAPPER_CONSTRUCTOR.owner,
    ],
  )
  const deployData = artifact.bytecode + encodedConstructor.slice(2)
  return {
    underlyingRouter: WRAPPER_CONSTRUCTOR.underlyingRouter,
    treasuryIntake: WRAPPER_CONSTRUCTOR.treasuryIntake,
    marcoToken: WRAPPER_CONSTRUCTOR.marcoToken,
    pricingRefHash,
    treasuryPolicyRefHash,
    owner: WRAPPER_CONSTRUCTOR.owner,
    bytecodeHash: artifact.bytecodeHash,
    encodedConstructor,
    deployDataLength: deployData.length,
  }
}

export function formatEthError(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const err = e as { message?: string; data?: { message?: string }; reason?: string }
    if (err.data?.message) return err.data.message
    if (err.reason) return err.reason
    if (err.message) return err.message
  }
  return 'transaction failed'
}

export async function readWalletChain(eth: EthProvider) {
  const accounts = (await eth.request({ method: 'eth_accounts' })) as string[]
  const chainRaw = (await eth.request({ method: 'eth_chainId' })) as string | number
  let chainId: number | null = null
  if (typeof chainRaw === 'number' && Number.isFinite(chainRaw)) {
    chainId = chainRaw
  } else if (typeof chainRaw === 'string') {
    chainId = chainRaw.startsWith('0x') ? Number.parseInt(chainRaw, 16) : Number.parseInt(chainRaw, 10)
    if (!Number.isFinite(chainId)) chainId = null
  }
  return { account: accounts[0] ?? null, chainId }
}

export async function connectWallet(eth: EthProvider) {
  await eth.request({ method: 'eth_requestAccounts' })
}

export async function switchToTestnet(eth: EthProvider) {
  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: WRAPPER_DEPLOY_CHAIN_HEX }] })
  } catch (e: unknown) {
    const err = e as { code?: number }
    if (err?.code !== 4902) throw e
    await eth.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: WRAPPER_DEPLOY_CHAIN_HEX,
          chainName: BNB_TESTNET_CHAIN_NAME,
          nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
          rpcUrls: [BNB_TESTNET_RPC_URL],
          blockExplorerUrls: [BNB_TESTNET_EXPLORER],
        },
      ],
    })
  }
}

async function waitForDeployReceipt(
  eth: EthProvider,
  txHash: string,
  timeoutMs = 180_000,
): Promise<{ success: boolean; contractAddress: string | null; gasUsed: string | null; status: number | null }> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const receipt = (await eth.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })) as { status?: string; contractAddress?: string; gasUsed?: string } | null

    if (receipt) {
      const statusHex = receipt.status ?? '0x1'
      const status = Number.parseInt(statusHex, 16)
      const contractAddress = receipt.contractAddress ?? null
      const gasUsed = receipt.gasUsed ?? null
      const success = status !== 0 && Boolean(contractAddress)
      return { success, contractAddress, gasUsed, status: Number.isFinite(status) ? status : null }
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error('Deploy receipt timeout — check BscScan for transaction status')
}

async function hasContractBytecode(address: string): Promise<boolean> {
  const provider = await getReadProvider()
  const code = await provider.getCode(address)
  return code !== '0x' && code.length > 2
}

function toNum(value: unknown): number {
  if (typeof value === 'number') return value
  if (BigNumber.isBigNumber(value)) return value.toNumber()
  return Number(value)
}

export async function deployWrapperWithWallet(eth: EthProvider, callbacks: DeployCallbacks) {
  callbacks.onStatus('preparing')
  const artifact = await loadCreationArtifact()
  buildConstructorPreview(artifact)
  const { pricingRefHash, treasuryPolicyRefHash } = refHashes()

  const { Web3Provider } = await import('@ethersproject/providers')
  const { ContractFactory } = await import('@ethersproject/contracts')

  const provider = new Web3Provider(eth as unknown as import('@ethersproject/providers').ExternalProvider)
  const signer = provider.getSigner()
  const account = await signer.getAddress()
  const network = await provider.getNetwork()
  if (!isBnbTestnetChain(network.chainId)) {
    throw new Error(`Wrong chain ${network.chainId} — switch MetaMask to BNB Testnet (${WRAPPER_DEPLOY_CHAIN_ID})`)
  }

  const factory = new ContractFactory(wrapperAbi, artifact.bytecode, signer)
  const deployArgs = [
    WRAPPER_CONSTRUCTOR.underlyingRouter,
    WRAPPER_CONSTRUCTOR.treasuryIntake,
    WRAPPER_CONSTRUCTOR.marcoToken,
    pricingRefHash,
    treasuryPolicyRefHash,
    WRAPPER_CONSTRUCTOR.owner,
  ] as const

  let gasLimit = BigNumber.from(DEPLOY_MIN_GAS_LIMIT)
  try {
    const deployTx = factory.getDeployTransaction(...deployArgs)
    const estimated = await signer.estimateGas(deployTx)
    gasLimit = capDeployGasLimit(estimated)
    callbacks.onGasPreview(estimated.toString(), gasLimit.toString())
  } catch (e: unknown) {
    callbacks.onGasPreview('estimate_failed', gasLimit.toString())
    console.warn('[R746D] deploy gas estimate failed, using safe floor', formatEthError(e))
  }

  callbacks.onStatus('wallet_open')
  const contract = await factory.deploy(...deployArgs, { gasLimit })

  const txHash = contract.deployTransaction.hash
  if (!txHash) throw new Error('Deploy transaction hash missing')
  callbacks.onStatus('submitted')
  callbacks.onTxHash(txHash)

  let receiptResult: DeployReceiptResult | null = null
  try {
    const polled = await waitForDeployReceipt(eth, txHash)
    const bytecodeOk = polled.contractAddress ? await hasContractBytecode(polled.contractAddress) : false

    if (!polled.success || !bytecodeOk) {
      receiptResult = {
        success: false,
        contractAddress: polled.contractAddress,
        gasUsed: polled.gasUsed,
        failureReason: !bytecodeOk
          ? `Deployment reverted — no bytecode at ${polled.contractAddress ?? 'unknown address'}`
          : `Deployment reverted (receipt status ${polled.status ?? 'unknown'})`,
      }
      callbacks.onReceipt(receiptResult)
      callbacks.onStatus('failed')
      throw new Error(receiptResult.failureReason ?? 'Deployment reverted')
    }

    receiptResult = {
      success: true,
      contractAddress: getAddress(polled.contractAddress!),
      gasUsed: polled.gasUsed,
      failureReason: null,
    }
    callbacks.onReceipt(receiptResult)
    callbacks.onStatus('confirmed')
  } catch (e: unknown) {
    if (!receiptResult) {
      receiptResult = {
        success: false,
        contractAddress: null,
        gasUsed: null,
        failureReason: formatEthError(e),
      }
      callbacks.onReceipt(receiptResult)
      callbacks.onStatus('failed')
    }
    throw e
  }

  const wrapperAddress = receiptResult.contractAddress!
  let verification: ImmutableVerification | null = null
  try {
    verification = await verifyWrapperImmutables(wrapperAddress)
    callbacks.onVerification(verification)
    callbacks.onStatus(verification.pass ? 'verified' : 'failed')
    if (!verification.pass) {
      throw new Error(`Deploy succeeded but immutable verification failed: ${verification.failures.join('; ')}`)
    }
  } catch (e: unknown) {
    if (!verification) {
      callbacks.onVerification({
        underlyingRouter: '',
        treasuryCollector: '',
        marcoToken: '',
        pricingRefHash: '',
        treasuryPolicyRefHash: '',
        standardFeeBps: 0,
        buyMarcoFeeBps: 0,
        standardFeeQuoteBps: 0,
        buyMarcoFeeQuoteBps: 0,
        pass: false,
        failures: [formatEthError(e)],
      })
      callbacks.onStatus('failed')
    }
    throw e
  }

  return { txHash, wrapperAddress, deployer: account }
}

export async function verifyWrapperImmutables(wrapperAddress: string): Promise<ImmutableVerification> {
  const { Contract } = await import('@ethersproject/contracts')
  const { parseUnits } = await import('@ethersproject/units')
  const { BSC_TESTNET_ADDRESSES } = await import('config/constants/bscTestnet')
  const { pricingRefHash, treasuryPolicyRefHash } = refHashes()

  const provider = await getReadProvider()
  const wrapper = new Contract(wrapperAddress, wrapperAbi, provider)
  const failures: string[] = []

  const underlyingRouter: string = await wrapper.underlyingRouter()
  const treasuryCollector: string = await wrapper.treasuryCollector()
  const marcoToken: string = await wrapper.marcoToken()
  const onChainPricingRef: string = await wrapper.pricingRefHash()
  const onChainTreasuryRef: string = await wrapper.treasuryPolicyRefHash()
  const standardFeeBps = toNum(await wrapper.STANDARD_PROTOCOL_FEE_BPS())
  const buyMarcoFeeBps = toNum(await wrapper.BUY_MARCO_PROTOCOL_FEE_BPS())

  const sample = parseUnits('1', 18)
  const standardQuote = await wrapper.quoteProtocolFee(
    BSC_TESTNET_ADDRESSES.usdt,
    BSC_TESTNET_ADDRESSES.wbnb,
    sample,
  )
  const buyMarcoQuote = await wrapper.quoteProtocolFee(
    BSC_TESTNET_ADDRESSES.wbnb,
    BSC_TESTNET_ADDRESSES.marco,
    sample,
  )
  const standardFeeQuoteBps = toNum(standardQuote[2])
  const buyMarcoFeeQuoteBps = toNum(buyMarcoQuote[2])

  const eqAddr = (a: string, b: string, label: string) => {
    if (getAddress(a) !== getAddress(b)) failures.push(`${label}: expected ${b}, got ${a}`)
  }
  const eqHash = (a: string, b: string, label: string) => {
    if (a.toLowerCase() !== b.toLowerCase()) failures.push(`${label}: hash mismatch`)
  }

  eqAddr(underlyingRouter, WRAPPER_CONSTRUCTOR.underlyingRouter, 'underlyingRouter')
  eqAddr(treasuryCollector, WRAPPER_CONSTRUCTOR.treasuryIntake, 'treasuryCollector')
  eqAddr(marcoToken, WRAPPER_CONSTRUCTOR.marcoToken, 'marcoToken')
  eqHash(onChainPricingRef, pricingRefHash, 'pricingRefHash')
  eqHash(onChainTreasuryRef, treasuryPolicyRefHash, 'treasuryPolicyRefHash')

  if (standardFeeBps !== WRAPPER_IMMUTABLE_EXPECT.standardFeeBps) {
    failures.push(`STANDARD_PROTOCOL_FEE_BPS: expected ${WRAPPER_IMMUTABLE_EXPECT.standardFeeBps}, got ${standardFeeBps}`)
  }
  if (buyMarcoFeeBps !== WRAPPER_IMMUTABLE_EXPECT.buyMarcoFeeBps) {
    failures.push(`BUY_MARCO_PROTOCOL_FEE_BPS: expected ${WRAPPER_IMMUTABLE_EXPECT.buyMarcoFeeBps}, got ${buyMarcoFeeBps}`)
  }
  if (standardFeeQuoteBps !== WRAPPER_IMMUTABLE_EXPECT.standardFeeBps) {
    failures.push(`quoteProtocolFee standard: expected ${WRAPPER_IMMUTABLE_EXPECT.standardFeeBps}, got ${standardFeeQuoteBps}`)
  }
  if (buyMarcoFeeQuoteBps !== WRAPPER_IMMUTABLE_EXPECT.buyMarcoFeeBps) {
    failures.push(`quoteProtocolFee buy MARCO: expected ${WRAPPER_IMMUTABLE_EXPECT.buyMarcoFeeBps}, got ${buyMarcoFeeQuoteBps}`)
  }

  return {
    underlyingRouter,
    treasuryCollector,
    marcoToken,
    pricingRefHash: onChainPricingRef,
    treasuryPolicyRefHash: onChainTreasuryRef,
    standardFeeBps,
    buyMarcoFeeBps,
    standardFeeQuoteBps,
    buyMarcoFeeQuoteBps,
    pass: failures.length === 0,
    failures,
  }
}
