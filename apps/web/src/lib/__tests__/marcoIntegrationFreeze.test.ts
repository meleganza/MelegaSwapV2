import { execSync } from 'child_process'
import { describe, expect, it } from 'vitest'

const FROZEN = [
  'apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx',
  'apps/web/src/components/MarcoWidgets/MarcoConnect.tsx',
  'apps/web/src/components/MarcoWidgets/MarcoPay.tsx',
  'apps/web/src/hooks/useEagerConnect.ts',
  'apps/web/src/views/Swap',
  'apps/web/src/views/Farms',
  'apps/web/src/pages/farms',
  'apps/web/src/pages/pools',
  'apps/web/src/pages/liquidity.tsx',
]

describe('MARCO integration non-regression freeze', () => {
  it('does not modify swap, liquidity, farms, pools, wallet, or checkout UX files', () => {
    const diff = execSync('git diff --name-only HEAD', {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    const unstaged = execSync('git status --porcelain', {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    const changed = new Set(
      `${diff}\n${unstaged}`
        .split('\n')
        .map((line) => line.replace(/^.. /, '').trim())
        .filter(Boolean),
    )
    for (const frozen of FROZEN) {
      for (const file of changed) {
        expect(file.startsWith(frozen) || file === frozen).toBe(false)
      }
    }
    expect([...changed].some((file) => /exchange\.ts$|contracts\.ts$|MasterChef/.test(file))).toBe(false)
  })
})
