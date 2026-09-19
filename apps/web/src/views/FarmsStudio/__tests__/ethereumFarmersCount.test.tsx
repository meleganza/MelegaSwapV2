import { renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { useUniqueFarmersCount } from '../modules/useUniqueFarmersCount'
let chainId = 1
let swrKey: unknown
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId }) }))
vi.mock('utils/addressHelpers', () => ({ getMasterChefAddress: () => '0xchef' }))
vi.mock('swr', () => ({
  default: (key: unknown) => {
    swrKey = key
    return { data: { status: 'ready', uniqueFarmers: 318 }, isValidating: false }
  },
}))
vi.mock('lib/yield-participants/useYieldParticipants', () => ({
  useYieldParticipants: () => ({ snapshot: { farmTotals: { '1:0xchef': { participants: 4 } } } }),
}))
beforeEach(() => {
  chainId = 1
  swrKey = undefined
})
it('uses Ethereum index, never the BSC aggregate', () => {
  const { result } = renderHook(useUniqueFarmersCount)
  expect(result.current.count).toBe(4)
  expect(swrKey).toBeNull()
})
it('preserves the BSC aggregate', () => {
  chainId = 56
  const { result } = renderHook(useUniqueFarmersCount)
  expect(result.current.count).toBe(318)
  expect(swrKey).toBe('farms-unique-farmers')
})
it('does not present BSC data for an unindexed chain', () => {
  chainId = 8453
  const { result } = renderHook(useUniqueFarmersCount)
  expect(result.current.count).toBeNull()
})
