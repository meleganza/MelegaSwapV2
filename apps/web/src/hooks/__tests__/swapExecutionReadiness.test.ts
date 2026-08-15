import { BigNumber } from '@ethersproject/bignumber'
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { resolveTransactionDeadline } from 'utils/resolveTransactionDeadline'

describe('swap execution readiness', () => {
  it('creates a valid deadline before the block timestamp subscription hydrates', () => {
    expect(resolveTransactionDeadline(undefined, 1_200, 1_700_000_000)?.toString()).toBe('1700001200')
    expect(resolveTransactionDeadline(BigNumber.from(1_800_000_000), 1_200)?.toString()).toBe('1800001200')
  })

  it('keeps execution loading until an executable router call exists', () => {
    const web = path.resolve(__dirname, '../..')
    const classic = readFileSync(path.join(web, 'hooks/useSwapCallback.ts'), 'utf8')
    const smart = readFileSync(path.join(web, 'views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(classic).toContain('if (swapCalls.length === 0)')
    expect(smart).toContain('if (swapCalls.length === 0)')
  })
})
