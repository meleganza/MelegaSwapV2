/**
 * Post-deployment validation — bind only after bytecode + constructor checks pass.
 */
import type { SubsystemId } from './types'
import { FOUNDER_DEPLOY_CHAIN_ID, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'

export type PostDeployValidationInput = {
  subsystemId: SubsystemId
  chainId: number
  txHash: string
  contractAddress: string | null
  receiptStatus: 'success' | 'reverted' | 'pending' | 'unknown'
  runtimeBytecode: string | null
  expectedRuntimeBytecodeHash: string | null
  observedRuntimeBytecodeHash: string | null
  constructorStateOk: boolean
  treasuryOk: boolean
  feeOk: boolean
}

export type PostDeployOutcome =
  | {
      status: 'READY'
      bind: true
      verification: 'VERIFIED' | 'VERIFICATION_PENDING'
      contractAddress: string
    }
  | {
      status: 'QUARANTINED'
      bind: false
      reason: string
      contractAddress: string | null
      txHash: string
    }
  | {
      status: 'PENDING'
      bind: false
      reason: string
    }

export function validatePostDeployment(input: PostDeployValidationInput): PostDeployOutcome {
  if (!/^0x[a-fA-F0-9]{64}$/.test(input.txHash)) {
    return { status: 'PENDING', bind: false, reason: 'Invalid transaction hash.' }
  }
  if (input.chainId !== FOUNDER_DEPLOY_CHAIN_ID) {
    return {
      status: 'QUARANTINED',
      bind: false,
      reason: 'Wrong chainId — deployment not on BNB Chain 56.',
      contractAddress: input.contractAddress,
      txHash: input.txHash,
    }
  }
  if (input.receiptStatus === 'pending' || input.receiptStatus === 'unknown') {
    return { status: 'PENDING', bind: false, reason: 'Waiting for transaction receipt.' }
  }
  if (input.receiptStatus === 'reverted') {
    return {
      status: 'QUARANTINED',
      bind: false,
      reason: 'Transaction reverted.',
      contractAddress: input.contractAddress,
      txHash: input.txHash,
    }
  }
  if (!input.contractAddress || !/^0x[a-fA-F0-9]{40}$/.test(input.contractAddress)) {
    return {
      status: 'QUARANTINED',
      bind: false,
      reason: 'Missing contract address in receipt.',
      contractAddress: null,
      txHash: input.txHash,
    }
  }
  if (!input.runtimeBytecode || input.runtimeBytecode === '0x') {
    return {
      status: 'QUARANTINED',
      bind: false,
      reason: 'No runtime bytecode at deployed address.',
      contractAddress: input.contractAddress,
      txHash: input.txHash,
    }
  }
  if (
    input.expectedRuntimeBytecodeHash &&
    input.observedRuntimeBytecodeHash &&
    input.expectedRuntimeBytecodeHash.toLowerCase() !== input.observedRuntimeBytecodeHash.toLowerCase()
  ) {
    return {
      status: 'QUARANTINED',
      bind: false,
      reason: 'Runtime bytecode hash mismatch — not binding.',
      contractAddress: input.contractAddress,
      txHash: input.txHash,
    }
  }
  if (!input.constructorStateOk || !input.treasuryOk || !input.feeOk) {
    return {
      status: 'QUARANTINED',
      bind: false,
      reason: 'Constructor / Treasury / fee state validation failed.',
      contractAddress: input.contractAddress,
      txHash: input.txHash,
    }
  }

  return {
    status: 'READY',
    bind: true,
    verification: 'VERIFICATION_PENDING',
    contractAddress: input.contractAddress,
  }
}

export function extractContractAddressFromReceipt(receipt: {
  contractAddress?: string | null
  status?: number | string | null
}): { address: string | null; receiptStatus: PostDeployValidationInput['receiptStatus'] } {
  const statusRaw = receipt.status
  let receiptStatus: PostDeployValidationInput['receiptStatus'] = 'unknown'
  if (statusRaw === 1 || statusRaw === '0x1' || statusRaw === 'success') receiptStatus = 'success'
  else if (statusRaw === 0 || statusRaw === '0x0' || statusRaw === 'reverted') receiptStatus = 'reverted'

  const address =
    receipt.contractAddress && /^0x[a-fA-F0-9]{40}$/.test(receipt.contractAddress)
      ? receipt.contractAddress
      : null
  return { address, receiptStatus }
}

export const FOUNDER_TREASURY = FOUNDER_TREASURY_DESTINATION
