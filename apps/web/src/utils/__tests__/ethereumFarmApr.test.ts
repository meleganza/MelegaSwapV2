import { expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import { getFarmApr } from '../apr'
it('uses 12-second Ethereum blocks and preserves BSC reward annualization', () => {
  const input = [new BigNumber(1), new BigNumber(1), new BigNumber(100), '0xpool', 0.01] as const
  expect(getFarmApr(1, ...input).cakeRewardsApr).toBe(26280)
  expect(getFarmApr(56, ...input).cakeRewardsApr).toBe(105120)
})

import { formatHumanMarcoAmount } from '../../lib/data-truth/masterChefEmissionMath'
it('does not round positive Ethereum emissions to an unavailable zero', () => {
  expect(formatHumanMarcoAmount(0.003)).toBe('0.00300 MARCO')
  expect(formatHumanMarcoAmount(12)).toBe('12.00 MARCO')
})

import { cardToFarmsWalletPosition } from '../../views/FarmsStudio/modules/buildFarmsWalletPositions'
it('formats Ethereum pending rewards using its canonical MARCO decimals', () => {
  const card = {
    id: 'farm-1',
    pid: 1,
    status: 'live',
    tokens: ['MARCO', 'WETH'],
    rewardToken: 'MARCO',
    userStaked: new BigNumber('14850049499999999998'),
    pendingReward: new BigNumber('1910000000000000000'),
    rawFarm: { pid: 1, token: { symbol: 'MARCO', decimals: 18 }, quoteToken: { symbol: 'WETH', decimals: 18 } },
  } as any
  const position = cardToFarmsWalletPosition(card, { wallet: '0xholder', chainId: 1 })!
  expect(position.pendingFormatted).toBe('1.91 MARCO')
  expect(position.rewardToken.address).toBe('0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76')
})
