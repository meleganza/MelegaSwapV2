import { MELEGA_MASTERCHEF_BSC } from '../constants'

/**
 * Canonical Melega MasterChef / MasterBuilder event topic0 hashes.
 * Verified against `apps/web/src/config/abi/masterchef.json` signatures
 * `Deposit|Withdraw|EmergencyWithdraw(address,uint256,uint256)` via keccak256,
 * and confirmed by live eth_getLogs on 0x41D5487836452d23f2c467070244E5842B412794.
 *
 * NOTE: These differ from PancakeSwap MasterChef V2 topic0 values previously
 * stored here — those returned zero Melega farm events.
 */
export const MASTERCHEF_DEPOSIT_TOPIC =
  '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15'
export const MASTERCHEF_WITHDRAW_TOPIC =
  '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568'
export const MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC =
  '0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595'

export const MASTERCHEF_EVENT_SIGNATURES = {
  Deposit: 'Deposit(address,uint256,uint256)',
  Withdraw: 'Withdraw(address,uint256,uint256)',
  EmergencyWithdraw: 'EmergencyWithdraw(address,uint256,uint256)',
} as const

export const MASTERCHEF_ACTIVITY_TOPICS = [
  MASTERCHEF_DEPOSIT_TOPIC,
  MASTERCHEF_WITHDRAW_TOPIC,
  MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC,
] as const

export function isValidTopicHash(topic: string): boolean {
  return /^0x[0-9a-f]{64}$/i.test(topic)
}

export const MASTERCHEF_CANONICAL = {
  address: MELEGA_MASTERCHEF_BSC,
  chainId: 56,
  topics: MASTERCHEF_ACTIVITY_TOPICS,
  signatures: MASTERCHEF_EVENT_SIGNATURES,
  /** Factually resolved via eth_getTransactionReceipt of creation tx. */
  deploymentBlock: 20_330_833,
  creationTx: '0x3f270e4b4485d2a3023467a9cede6e8c39c5625250b10f2bcbfb01de80ee71f8',
} as const
