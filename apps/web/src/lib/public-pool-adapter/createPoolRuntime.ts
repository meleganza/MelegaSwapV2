import type { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import type { Provider, TransactionReceipt } from '@ethersproject/providers'
import { parseEther, parseUnits } from '@ethersproject/units'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
} from 'lib/deployment-orchestrator/founderDeployer'
import {
  LEGACY_SMARTCHEF_FACTORY_IFACE,
  PUBLIC_POOL_ADAPTER_IFACE,
  PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
  PUBLIC_POOL_ADAPTER_MARCO,
  buildPublicPoolAdapterArtifactGate,
  isPublicPoolAdapterAddress,
  maskedPublicPoolAdapterRuntimeHash,
  validatePublicPoolAdapterState,
  type PublicPoolAdapterOnChainState,
} from './publicPoolAdapterV1'

const ERC20_IFACE = [
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
]

export const BSC_BLOCKS_PER_DAY = 28_800
export const POOL_START_DELAY_BLOCKS = 20

export type PoolCreationInput = {
  creator: string
  stakedToken: string
  rewardToken: string
  rewardBudget: string
  rewardDecimals: number
  durationDays: number
  maxStake?: string
  stakedDecimals: number
  creationFeeBnb: string
}

export type PoolCreationPlan = {
  adapterAddress: string
  stakedToken: string
  rewardToken: string
  rewardBudget: BigNumber
  rewardPerBlock: BigNumber
  startBlock: number
  bonusEndBlock: number
  poolLimitPerUser: BigNumber
  creationFee: BigNumber
}

export type PoolCreationExecution = {
  adapterAddress: string
  poolAddress: string | null
  approvalTxHash: string | null
  creationTxHash: string
  receipt: TransactionReceipt
}

async function readAdapterState(provider: Provider, address: string): Promise<PublicPoolAdapterOnChainState> {
  const adapter = new Contract(address, PUBLIC_POOL_ADAPTER_IFACE.fragments, provider)
  const [owner, smartChefFactory, marcoToken, treasury, smartChefInitCodeHash, creationPaused] = await Promise.all([
    adapter.owner(),
    adapter.smartChefFactory(),
    adapter.marcoToken(),
    adapter.treasury(),
    adapter.smartChefInitCodeHash(),
    adapter.creationPaused(),
  ])
  return { owner, smartChefFactory, marcoToken, treasury, smartChefInitCodeHash, creationPaused }
}

/** Resolve the adapter from the production factory owner; no fabricated/static deployment address. */
export async function resolveActivePublicPoolAdapter(provider: Provider): Promise<string> {
  const factory = new Contract(
    PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
    LEGACY_SMARTCHEF_FACTORY_IFACE.fragments,
    provider,
  )
  const candidate = String(await factory.owner())
  if (candidate.toLowerCase() === AUTHORIZED_MELEGA_DEPLOYER.toLowerCase()) {
    throw new Error('Public Pool Adapter is awaiting Founder activation.')
  }
  if (!isPublicPoolAdapterAddress(candidate)) throw new Error('Production factory owner is invalid.')
  const code = await provider.getCode(candidate)
  if (!code || code === '0x') throw new Error('Production factory owner is not the Pool Adapter contract.')
  const gate = buildPublicPoolAdapterArtifactGate()
  if (!gate.ok) throw new Error('Pool Adapter certified artifact is unavailable.')
  const runtimeHash = maskedPublicPoolAdapterRuntimeHash(code)
  if (runtimeHash.toLowerCase() !== gate.expectedRuntimeBytecodeSha256.toLowerCase()) {
    throw new Error('Production Pool Adapter runtime checksum mismatch.')
  }
  const state = await readAdapterState(provider, candidate)
  const reasons = validatePublicPoolAdapterState(state)
  if (reasons.length) throw new Error(reasons[0])
  return candidate
}

export async function buildPoolCreationPlan(provider: Provider, input: PoolCreationInput): Promise<PoolCreationPlan> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(input.stakedToken) || !/^0x[a-fA-F0-9]{40}$/.test(input.rewardToken)) {
    throw new Error('Select valid stake and reward tokens.')
  }
  if (input.stakedToken.toLowerCase() === input.rewardToken.toLowerCase()) {
    throw new Error('Stake and reward tokens must be different.')
  }
  if (!Number.isFinite(input.durationDays) || input.durationDays <= 0) {
    throw new Error('Enter a valid reward duration.')
  }
  const durationBlocks = Math.floor(input.durationDays * BSC_BLOCKS_PER_DAY)
  if (durationBlocks <= 0) throw new Error('Reward duration is too short.')
  const rewardBudget = parseUnits(input.rewardBudget.trim(), input.rewardDecimals)
  if (rewardBudget.lte(0)) throw new Error('Reward budget must be greater than zero.')
  const rewardPerBlock = rewardBudget.div(durationBlocks)
  if (rewardPerBlock.lte(0)) throw new Error('Reward budget is too small for this duration.')
  const currentBlock = await provider.getBlockNumber()
  const startBlock = currentBlock + POOL_START_DELAY_BLOCKS
  const bonusEndBlock = startBlock + durationBlocks
  const poolLimitPerUser = input.maxStake?.trim()
    ? parseUnits(input.maxStake.trim(), input.stakedDecimals)
    : BigNumber.from(0)
  const adapterAddress = await resolveActivePublicPoolAdapter(provider)

  if (
    input.rewardToken.toLowerCase() === PUBLIC_POOL_ADAPTER_MARCO.toLowerCase() &&
    input.creator.toLowerCase() !== AUTHORIZED_MELEGA_DEPLOYER.toLowerCase()
  ) {
    throw new Error('MARCO reward pools require the authorized MELEGA DEPLOYER.')
  }

  return {
    adapterAddress,
    stakedToken: input.stakedToken,
    rewardToken: input.rewardToken,
    rewardBudget,
    rewardPerBlock,
    startBlock,
    bonusEndBlock,
    poolLimitPerUser,
    creationFee: parseEther(input.creationFeeBnb || '0'),
  }
}

export async function executePoolCreation(
  signer: Signer,
  creator: string,
  plan: PoolCreationPlan,
  onStatus?: (status: string) => void,
): Promise<PoolCreationExecution> {
  const reward = new Contract(plan.rewardToken, ERC20_IFACE, signer)
  const allowance: BigNumber = await reward.allowance(creator, plan.adapterAddress)
  let approvalTxHash: string | null = null
  if (allowance.lt(plan.rewardBudget)) {
    onStatus?.('Confirm the exact reward-budget approval in your wallet.')
    const approval = await reward.approve(plan.adapterAddress, plan.rewardBudget)
    approvalTxHash = approval.hash
    onStatus?.('Waiting for reward-budget approval confirmation…')
    await approval.wait()
  }

  onStatus?.('Confirm pool creation and atomic reward funding in your wallet.')
  const adapter = new Contract(plan.adapterAddress, PUBLIC_POOL_ADAPTER_IFACE.fragments, signer)
  const transaction = await adapter.createPool(
    plan.stakedToken,
    plan.rewardToken,
    plan.rewardBudget,
    plan.rewardPerBlock,
    plan.startBlock,
    plan.bonusEndBlock,
    plan.poolLimitPerUser,
    { value: plan.creationFee },
  )
  onStatus?.('Pool creation submitted. Waiting for on-chain confirmation…')
  const receipt: TransactionReceipt = await transaction.wait()
  let poolAddress: string | null = null
  for (const log of receipt.logs) {
    try {
      const parsed = PUBLIC_POOL_ADAPTER_IFACE.parseLog(log)
      if (parsed.name === 'PoolCreated') {
        poolAddress = String(parsed.args.pool)
        break
      }
    } catch {
      // Ignore unrelated ERC-20 / ownership logs in the atomic transaction.
    }
  }
  return {
    adapterAddress: plan.adapterAddress,
    poolAddress,
    approvalTxHash,
    creationTxHash: transaction.hash,
    receipt,
  }
}
