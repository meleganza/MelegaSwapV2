import fs from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../..')

describe('Smart Swap wallet balance controls', () => {
  it('mounts factual wallet balances and 25/50/MAX controls in the canonical Smart Swap input', () => {
    const smartSwap = fs.readFileSync(path.join(WEB, 'views/Swap/SmartSwap/index.tsx'), 'utf8')
    const input = fs.readFileSync(path.join(WEB, 'components/CurrencyInputPanel/index.tsx'), 'utf8')

    expect(smartSwap).toContain('compactWalletControls')
    expect(smartSwap).toContain('maxAmount={maxAmountInput}')
    expect(smartSwap).toContain('onPercentInput={handlePercentInput}')
    expect(input).toContain('[25, 50].map')
    expect(input).toContain('data-testid={`${id}-percent-100`}')
    expect(input).toContain('selectedCurrencyBalance?.toSignificant(6)')
    expect(input).not.toContain('walletBalanceFallback')
  })
})
