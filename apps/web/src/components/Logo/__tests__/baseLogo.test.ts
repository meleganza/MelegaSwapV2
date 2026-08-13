import fs from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../..')

describe('Base logo', () => {
  it('uses the canonical Base mark and preserves its aspect ratio', () => {
    const currencyLogo = fs.readFileSync(path.join(WEB, 'components/Logo/CurrencyLogo.tsx'), 'utf8')
    const chainLogo = fs.readFileSync(path.join(WEB, 'components/Logo/ChainLogo.tsx'), 'utf8')

    expect(currencyLogo).toContain('/images/chains/8453-1.png')
    expect(chainLogo).toContain("objectFit: 'contain'")
    expect(chainLogo).toContain("borderRadius: '50%'")
  })
})
