/**
 * Founder canary activate flow — pure sequencing helpers.
 * Browser wallet only. Never fabricates success.
 */

import { getAddress } from '@ethersproject/address'
import { parseUnits } from '@ethersproject/units'

export const LB_SUCCESS_FEE_BPS = 1000 as const

/** Canonical canary references (mission config). */
export const LB_CANARY = {
  signer: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
  wbnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  usdt: '0x55d398326f99059fF775485246999027B3197955',
  wbnbUsdtPair: '0x94FADf053BaD0c9d0a3874F82b1a09001926A548',
  factory: '0xB9f3e3020141157C215902acC1fDF65e49bE4e82',
  budgetHuman: '0.01',
  successFeeBps: LB_SUCCESS_FEE_BPS,
} as const

export type StrategyModeInput = 'FULL_AI' | 'DYNAMIC_RANGE'

export type CreateProgramArgs = {
  projectToken: string
  quoteAsset: string
  pair: string
  strategy: { mode: number; minimumRateBps: number; maximumRateBps: number }
  epochDurationSeconds: number
}

export type FounderActivateStep =
  | 'IDLE'
  | 'CREATE_PROGRAM'
  | 'APPROVE'
  | 'DEPOSIT'
  | 'ACTIVATE'
  | 'ACTIVE'
  | 'REJECTED'
  | 'FAILED'

export type FounderActivateTxProof = {
  step: 'createProgram' | 'approve' | 'deposit' | 'activate'
  hash: string
  status: number | null
}

export type FounderActivateResult =
  | {
      ok: true
      programAddress: string
      programId: string | null
      txs: FounderActivateTxProof[]
      status: 'ACTIVE'
      successFeeBps: number
    }
  | { ok: false; reason: string; step: FounderActivateStep; txs: FounderActivateTxProof[] }

export type WalletTxResponse = {
  hash: string
  wait: () => Promise<{ status?: number | null; logs?: Array<{ topics: string[]; data: string; address: string }> }>
}

export type FounderActivateWallet = {
  createProgram: (args: CreateProgramArgs) => Promise<WalletTxResponse>
  approve: (token: string, spender: string, amountWei: string) => Promise<WalletTxResponse | null>
  depositBudget: (program: string, amountWei: string) => Promise<WalletTxResponse>
  activate: (program: string) => Promise<WalletTxResponse>
  readAllowance: (token: string, owner: string, spender: string) => Promise<string>
  parseProgramCreated: (receipt: {
    logs?: Array<{ topics: string[]; data: string; address: string }>
  }) => { program: string; programId: string } | null
}

const ALLOWED_EPOCHS = new Set([300, 900, 1800, 3600])

export function strategyTuple(mode: StrategyModeInput, minBps = 0, maxBps = 0) {
  if (mode === 'FULL_AI') return { mode: 0, minimumRateBps: 0, maximumRateBps: 0 }
  return { mode: 1, minimumRateBps: minBps, maximumRateBps: maxBps }
}

export function buildCreateProgramArgs(input: {
  projectToken: string
  quoteAsset: string
  pair: string
  strategyMode?: StrategyModeInput
  minimumRateBps?: number
  maximumRateBps?: number
  epochDurationSeconds?: number
}): CreateProgramArgs | { error: string } {
  try {
    const projectToken = getAddress(input.projectToken)
    const quoteAsset = getAddress(input.quoteAsset)
    const pair = getAddress(input.pair)
    if (projectToken === quoteAsset) return { error: 'PROJECT_EQUALS_QUOTE' }
    const epoch = input.epochDurationSeconds ?? 300
    if (!ALLOWED_EPOCHS.has(epoch)) return { error: 'INVALID_EPOCH' }
    return {
      projectToken,
      quoteAsset,
      pair,
      strategy: strategyTuple(
        input.strategyMode ?? 'FULL_AI',
        input.minimumRateBps ?? 0,
        input.maximumRateBps ?? 0,
      ),
      epochDurationSeconds: epoch,
    }
  } catch {
    return { error: 'INVALID_ADDRESS' }
  }
}

/**
 * On-chain depositBudget pulls projectToken.
 * Mission pair WBNB/USDT is executable as projectToken=USDT, quote=WBNB
 * (USDT quote policy is disabled on Factory).
 */
export function resolveCanaryOrientation(input: {
  projectToken: string
  quoteAsset: string
  quoteEnabled: boolean
}): { ok: true } | { ok: false; reason: string } {
  if (!input.quoteEnabled) {
    return {
      ok: false,
      reason:
        'UNSUPPORTED_QUOTE_ASSET — Factory quote policy disables this quote. Use WBNB as quoteAsset (enabled). For WBNB/USDT pair select USDT as project token.',
    }
  }
  try {
    const project = getAddress(input.projectToken)
    const quote = getAddress(input.quoteAsset)
    if (project === quote) return { ok: false, reason: 'PROJECT_EQUALS_QUOTE' }
    // Reject WBNB-as-project with USDT quote (mission naive orientation).
    if (
      project.toLowerCase() === LB_CANARY.wbnb.toLowerCase() &&
      quote.toLowerCase() === LB_CANARY.usdt.toLowerCase()
    ) {
      return {
        ok: false,
        reason:
          'CANARY_ORIENTATION_INVALID — WBNB cannot be projectToken with USDT quote (USDT quote disabled). Select USDT as project token; WBNB is quote.',
      }
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'INVALID_ADDRESS' }
  }
}

export function parseBudgetWei(human: string, decimals: number): string | null {
  try {
    if (!human || Number(human) <= 0) return null
    return parseUnits(human, decimals).toString()
  } catch {
    return null
  }
}

export function canSubmitFounderWalletActivate(input: {
  walletConnected: boolean
  correctChain: boolean
  factoryBound: boolean
}): { ok: boolean; reason: string | null } {
  if (!input.walletConnected) return { ok: false, reason: 'WALLET_NOT_CONNECTED' }
  if (!input.correctChain) return { ok: false, reason: 'WRONG_CHAIN' }
  if (!input.factoryBound) return { ok: false, reason: 'LB_FACTORY_MISSING' }
  return { ok: true, reason: null }
}

/**
 * Run createProgram → approve (if needed) → depositBudget → activate.
 * Each step awaits receipt. Wallet rejection → REJECTED. Never fakes ACTIVE.
 */
export async function runFounderActivateFlow(input: {
  owner: string
  createArgs: CreateProgramArgs
  amountWei: string
  projectToken: string
  wallet: FounderActivateWallet
}): Promise<FounderActivateResult> {
  const txs: FounderActivateTxProof[] = []

  try {
    const createTx = await input.wallet.createProgram(input.createArgs)
    const createReceipt = await createTx.wait()
    txs.push({ step: 'createProgram', hash: createTx.hash, status: createReceipt.status ?? null })
    if (createReceipt.status === 0) {
      return { ok: false, reason: 'CREATE_PROGRAM_REVERTED', step: 'FAILED', txs }
    }

    const created = input.wallet.parseProgramCreated(createReceipt)
    if (!created?.program) {
      return { ok: false, reason: 'PROGRAM_ADDRESS_NOT_IN_RECEIPT', step: 'FAILED', txs }
    }
    const programAddress = getAddress(created.program)

    const allowance = await input.wallet.readAllowance(input.projectToken, input.owner, programAddress)
    if (BigInt(allowance) < BigInt(input.amountWei)) {
      const approveTx = await input.wallet.approve(input.projectToken, programAddress, input.amountWei)
      if (!approveTx) {
        return { ok: false, reason: 'WALLET_REJECTED_APPROVE', step: 'REJECTED', txs }
      }
      const approveReceipt = await approveTx.wait()
      txs.push({ step: 'approve', hash: approveTx.hash, status: approveReceipt.status ?? null })
      if (approveReceipt.status === 0) {
        return { ok: false, reason: 'APPROVE_REVERTED', step: 'FAILED', txs }
      }
    }

    const depositTx = await input.wallet.depositBudget(programAddress, input.amountWei)
    const depositReceipt = await depositTx.wait()
    txs.push({ step: 'deposit', hash: depositTx.hash, status: depositReceipt.status ?? null })
    if (depositReceipt.status === 0) {
      return { ok: false, reason: 'DEPOSIT_REVERTED', step: 'FAILED', txs }
    }

    const activateTx = await input.wallet.activate(programAddress)
    const activateReceipt = await activateTx.wait()
    txs.push({ step: 'activate', hash: activateTx.hash, status: activateReceipt.status ?? null })
    if (activateReceipt.status === 0) {
      return { ok: false, reason: 'ACTIVATE_REVERTED', step: 'FAILED', txs }
    }

    return {
      ok: true,
      programAddress,
      programId: created.programId ?? null,
      txs,
      status: 'ACTIVE',
      successFeeBps: LB_SUCCESS_FEE_BPS,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const rejected =
      /user rejected|denied|ACTION_REJECTED|User rejected|rejected the request/i.test(message) ||
      (err as { code?: number | string })?.code === 4001 ||
      (err as { code?: number | string })?.code === 'ACTION_REJECTED'
    return {
      ok: false,
      reason: rejected ? 'WALLET_REJECTED' : message || 'ACTIVATE_FLOW_FAILED',
      step: rejected ? 'REJECTED' : 'FAILED',
      txs,
    }
  }
}
