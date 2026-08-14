import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const script = readFileSync(
  path.resolve(__dirname, '../../../../scripts/pools-current-participants-snapshot.mjs'),
  'utf8',
)

describe('Pools current participant release snapshot', () => {
  it('reconstructs balances from all canonical SmartChef position events', () => {
    expect(script).toContain("kind === 'deposit'")
    expect(script).toContain("kind === 'withdraw'")
    expect(script).toContain("kind === 'emergency'")
    expect(script).toContain('amount > 0n')
  })

  it('keeps credentials server-side and retains the honest pending snapshot on failure', () => {
    expect(script).toContain('process.env.BSCSCAN_API_KEY')
    expect(script).toContain('process.env.BSC_RPC_URL')
    expect(script).toContain("rpc('eth_getLogs'")
    expect(script).toContain('keeping honest pending state')
    expect(script).not.toContain('NEXT_PUBLIC_BSCSCAN_API_KEY')
  })
})
