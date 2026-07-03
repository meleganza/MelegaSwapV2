import { createExecutionId } from '../../execution-contract'
import { buildExecutionReport } from '../../execution-contract/report'
import { mapTransactionToExecutionEvidence } from '../../execution-contract/evidence'
import type { ExecutionInstruction } from '../../execution-layer/types'
import { dispatchExecutionInstruction } from '../../execution-ingress/dispatch'
import type { IngressAdapterHandlers } from '../../execution-ingress/types'
import { getExecutionTracker } from '../../execution-tracker/tracker'
import {
  ACTIVATION_LIFECYCLE_DRY_RUN,
  ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ACTIVE,
  ACTIVATION_LIFECYCLE_TESTNET_RECEIPT_CAPTURE,
} from '../activation-lifecycle'
import { rollbackActivationToDryRun } from '../rollback'
import { setActivationLifecycleForHarness } from '../config'
import { buildSettlementEventCandidate, type SettlementEventCandidate } from './buildSettlementEventCandidate'
import {
  observeEconomicMemory,
  observeKcis,
  observeMissionDirector,
  type CivilizationObservationRecord,
} from './civilization-observers'
import { evaluateTestnetExecutionPreconditions, type PreconditionEvaluation } from './evaluatePreconditions'
import type { GenesisAdapterReceipt } from './genesisTestnetAdapter'

export type FirstTestnetExecutionVerdict =
  | 'KERL_FIRST_TESTNET_EXECUTION_SUCCESS'
  | 'KERL_FIRST_TESTNET_EXECUTION_ABORTED'
  | 'KERL_FIRST_TESTNET_EXECUTION_FAILED'

export interface FirstTestnetExecutionResult {
  verdict: FirstTestnetExecutionVerdict
  preconditions: PreconditionEvaluation
  transactionHash: string | null
  blockNumber: number | null
  gasUsed: string | null
  receiptTimestamp: string | null
  executionReport: ReturnType<typeof buildExecutionReport> | null
  executionEvidence: ReturnType<typeof mapTransactionToExecutionEvidence> | null
  settlementCandidate: SettlementEventCandidate | null
  missionDirector: CivilizationObservationRecord
  kcis: CivilizationObservationRecord
  economicMemory: CivilizationObservationRecord
  rollbackStatus: string
  warnings: string[]
  trackerLifecycle: string[]
  error?: string
}

let genesisExecutionAttempted = false

export function resetGenesisExecutionAttemptFlag(): void {
  genesisExecutionAttempted = false
}

export async function runFirstTestnetExecution(input: {
  handoffJson: unknown
  account?: string
  walletFunded?: boolean
  adapters?: IngressAdapterHandlers
  chainId?: number
  onReceipt?: GenesisAdapterReceipt
  getReceipt?: () => GenesisAdapterReceipt | undefined
}): Promise<FirstTestnetExecutionResult> {
  const warnings: string[] = []
  const missionDirector = observeMissionDirector()
  const kcis = observeKcis()
  const economicMemory = observeEconomicMemory()

  if (genesisExecutionAttempted) {
    return abortResult(
      evaluateTestnetExecutionPreconditions(input.handoffJson, {
        account: input.account,
        walletFunded: input.walletFunded,
      }),
      missionDirector,
      kcis,
      economicMemory,
      'Exactly one genesis execution permitted per process — already attempted',
    )
  }

  const preconditions = evaluateTestnetExecutionPreconditions(input.handoffJson, {
    account: input.account,
    walletFunded: input.walletFunded,
  })

  if (!preconditions.passed || !preconditions.instruction) {
    rollbackActivationToDryRun()
    return {
      verdict: 'KERL_FIRST_TESTNET_EXECUTION_ABORTED',
      preconditions,
      transactionHash: null,
      blockNumber: null,
      gasUsed: null,
      receiptTimestamp: null,
      executionReport: null,
      executionEvidence: null,
      settlementCandidate: null,
      missionDirector,
      kcis,
      economicMemory,
      rollbackStatus: 'Rolled back to DRY_RUN — preconditions not satisfied',
      warnings,
      trackerLifecycle: [],
      error: preconditions.blocking.join('; '),
    }
  }

  genesisExecutionAttempted = true
  const instruction = preconditions.instruction
  const chainId = input.chainId ?? 97

  setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ACTIVE)

  const dispatch = await dispatchExecutionInstruction(instruction, {
    account: input.account,
    chainId,
    certifiedHandoff: true,
    adapters: input.adapters ?? {
      smartSwap: async () => {
        throw new Error('No adapter provided')
      },
      v2Swap: async () => {
        throw new Error('No adapter provided')
      },
      bridgeBurn: async () => {
        throw new Error('No adapter provided')
      },
    },
  })

  if (!dispatch.ok) {
    rollbackActivationToDryRun()
    return {
      verdict: 'KERL_FIRST_TESTNET_EXECUTION_FAILED',
      preconditions,
      transactionHash: null,
      blockNumber: null,
      gasUsed: null,
      receiptTimestamp: null,
      executionReport: dispatch.report ?? null,
      executionEvidence: null,
      settlementCandidate: null,
      missionDirector,
      kcis,
      economicMemory,
      rollbackStatus: 'Rolled back to DRY_RUN — dispatch failed before confirmed receipt',
      warnings,
      trackerLifecycle: [],
      error: dispatch.error?.message,
    }
  }

  const receipt = input.onReceipt ?? input.getReceipt?.()
  const txHash = receipt?.hash ?? (typeof dispatch.submitResult === 'object' && dispatch.submitResult && 'hash' in (dispatch.submitResult as object)
    ? String((dispatch.submitResult as { hash: string }).hash)
    : undefined) ?? null

  setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_RECEIPT_CAPTURE)

  const tracker = getExecutionTracker(input.account, chainId)
  const executionId = dispatch.executionId ?? createExecutionId(instruction.id)
  const record = tracker.getByInstructionId(instruction.id)

  if (txHash && record) {
    const txDetails = {
      hash: txHash,
      summary: 'Genesis TESTNET execution',
      addedTime: Date.now(),
      confirmedTime: receipt?.receiptTimestamp ? Date.parse(receipt.receiptTimestamp) : Date.now(),
      receipt: receipt
        ? {
            blockNumber: receipt.blockNumber,
            status: 1 as const,
            gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : undefined,
          }
        : undefined,
    }
    tracker.syncReceiptFromTransaction(record.executionId, instruction, txDetails as any, chainId)
  }

  const finalRecord = tracker.getByInstructionId(instruction.id)
  const trackerLifecycle = finalRecord?.events.map((e) => `${e.type}:${e.status}`) ?? []

  const evidence = finalRecord
    ? mapTransactionToExecutionEvidence(
        instruction,
        {
          hash: txHash ?? undefined,
          summary: 'Genesis TESTNET execution',
          addedTime: Date.now(),
          confirmedTime: receipt?.receiptTimestamp ? Date.parse(receipt.receiptTimestamp) : Date.now(),
          receipt: receipt
            ? { blockNumber: receipt.blockNumber, status: 1 as const }
            : undefined,
        } as any,
        executionId,
        chainId,
      )
    : null

  const report = evidence ? buildExecutionReport(evidence) : dispatch.report ?? null

  if (!txHash) {
    warnings.push('Transaction hash unavailable after dispatch')
  }

  const settlementCandidate = buildSettlementEventCandidate({
    instruction,
    executionId,
    evidence: evidence ?? undefined,
    report: report ?? undefined,
    txHash,
    blockNumber: receipt?.blockNumber ?? evidence?.blockNumber ?? null,
    gasUsed: receipt?.gasUsed ?? null,
    receiptTimestamp: receipt?.receiptTimestamp ?? evidence?.finalizedAt ?? null,
    warnings,
  })

  return {
    verdict: txHash ? 'KERL_FIRST_TESTNET_EXECUTION_SUCCESS' : 'KERL_FIRST_TESTNET_EXECUTION_FAILED',
    preconditions,
    transactionHash: txHash,
    blockNumber: receipt?.blockNumber ?? evidence?.blockNumber ?? null,
    gasUsed: receipt?.gasUsed ?? null,
    receiptTimestamp: receipt?.receiptTimestamp ?? evidence?.finalizedAt ?? null,
    executionReport: report,
    executionEvidence: evidence,
    settlementCandidate,
    missionDirector,
    kcis,
    economicMemory,
    rollbackStatus: 'No rollback after wallet submission — receipt lifecycle completed',
    warnings,
    trackerLifecycle,
  }
}

function abortResult(
  preconditions: PreconditionEvaluation,
  missionDirector: CivilizationObservationRecord,
  kcis: CivilizationObservationRecord,
  economicMemory: CivilizationObservationRecord,
  error: string,
): FirstTestnetExecutionResult {
  rollbackActivationToDryRun()
  return {
    verdict: 'KERL_FIRST_TESTNET_EXECUTION_ABORTED',
    preconditions,
    transactionHash: null,
    blockNumber: null,
    gasUsed: null,
    receiptTimestamp: null,
    executionReport: null,
    executionEvidence: null,
    settlementCandidate: null,
    missionDirector,
    kcis,
    economicMemory,
    rollbackStatus: 'Rolled back to DRY_RUN',
    warnings: [],
    trackerLifecycle: [],
    error,
  }
}
