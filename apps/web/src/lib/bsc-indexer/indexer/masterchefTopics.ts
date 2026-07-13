import { MELEGA_MASTERCHEF_BSC } from '../constants'

/** PancakeSwap MasterChef V2 event signatures — verified 32-byte topic0 hashes. */
export const MASTERCHEF_DEPOSIT_TOPIC =
  '0x90890809c654f11f630942b0e6f67ee8cb438cbdfb1d1f45533e7576391dc195'
export const MASTERCHEF_WITHDRAW_TOPIC =
  '0x884edad9d98d948abe3ec11b0219356438e6b1a3177dd72c77492e294984e937'
export const MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC =
  '0x692a3d7b60c25ad266c2e35b7d0894e6fe081d9121eb2f2b6d690c84242e8a85'

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
} as const
