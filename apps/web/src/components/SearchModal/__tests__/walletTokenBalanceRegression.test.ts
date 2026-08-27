import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = path.resolve(__dirname, '../../..')

describe('wallet token balance regression', () => {
  it('resolves visible picker rows through the direct wallet balance path', () => {
    const list = readFileSync(path.join(SRC, 'components/SearchModal/CurrencyList.tsx'), 'utf8')
    const sorting = readFileSync(path.join(SRC, 'components/SearchModal/sorting.ts'), 'utf8')

    expect(list).toContain('useLiveCurrencyBalance(account ?? undefined, currency)')
    expect(list).toContain('account && loading')
    expect(list).toContain("t('Balance unavailable')")
    expect(list).not.toContain('account ? <CircleLoader /> : null')
    expect(sorting).not.toContain('useAllTokenBalances')
  })

  it('uses a direct RPC result with a legacy fallback and a terminal timeout', () => {
    const wallet = readFileSync(path.join(SRC, 'state/wallet/hooks.ts'), 'utf8')

    expect(wallet).toContain('const legacyBalance = useCurrencyBalance(account, currency)')
    expect(wallet).toContain('const balance = directBalance ?? legacyBalance')
    expect(wallet).toContain('window.setTimeout(() => setTimedOut(true), 12_000)')
    expect(wallet).toContain('query.isError || timedOut')
  })

  it('binds both swap amounts and visible controls to the resilient balance hook', () => {
    const swap = readFileSync(path.join(SRC, 'state/swap/hooks.ts'), 'utf8')
    const panel = readFileSync(path.join(SRC, 'components/CurrencyInputPanel/index.tsx'), 'utf8')
    const select = readFileSync(path.join(SRC, 'components/CurrencySelect/index.tsx'), 'utf8')

    expect(swap).toContain('const inputBalance = useLiveCurrencyBalance')
    expect(swap).toContain('const outputBalance = useLiveCurrencyBalance')
    expect(panel).toContain('const selectedCurrencyBalanceLoading = balanceLoading || liveCurrencyBalance.loading')
    expect(panel).toContain("selectedCurrencyBalanceLoading ? t('Loading') : '—'")
    expect(select).toContain("selectedCurrencyBalanceQuery.loading ? t('Loading') : '—'")
  })
})
