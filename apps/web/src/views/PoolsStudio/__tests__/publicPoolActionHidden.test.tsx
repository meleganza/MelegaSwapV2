import React from 'react'
import { cleanup, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { writeFileSync } from 'fs'

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x0000000000000000000000000000000000001234' }),
  useNetwork: () => ({ chain: { id: 56 } }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, any>((props, ref) => <a ref={ref} {...props} />) }))
vi.mock('components/MyMelega/MyMelegaProvider', () => ({ useMyMelegaDrawer: () => ({ open: true, closeDrawer: vi.fn() }) }))
vi.mock('components/ConnectWalletButton', () => ({ default: () => <button>Connect Wallet</button> }))
vi.mock('components/Logo/MelegaExploreChainBadge', () => ({ MelegaExploreChainBadge: () => <span>BSC</span> }))
vi.mock('views/PortfolioStudio/helpers', () => ({ explorerAddressUrl: () => null, shortenAddress: () => '0x0000…1234' }))

import MyMelegaDrawer from 'components/MyMelega/MyMelegaDrawer'

afterEach(cleanup)
describe('Connected public My Melega actions', () => {
  it('retains working actions and staking positions without pool creation', () => {
    const screen = render(<MyMelegaDrawer />)
    const quick = within(screen.getByTestId('my-melega-quick'))
    expect(quick.queryByRole('link', { name: /Create Pool/i })).toBeNull()
    for (const name of [/Add Liquidity/i, /Create Farm/i, /Swap/i]) expect(quick.getByRole('link', { name })).toBeTruthy()
    expect(screen.getByTestId('my-melega-count-pools').getAttribute('href')).toContain('/pools')
    expect(screen.getByRole('button', { name: 'Close My Melega' })).toBeTruthy()
    expect(screen.getByTestId('my-melega-disconnect')).toBeTruthy()
    expect(screen.queryByText(/Final deployment requires/i)).toBeNull()
    // Optional visual fixture: real drawer styles, mocked wallet; never signs or connects.
    if (process.env.POOL_DRAWER_SNAPSHOT) {
      const css = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText)).join('\n')
      writeFileSync(process.env.POOL_DRAWER_SNAPSHOT, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#111}*{box-sizing:border-box}${css}</style>${document.body.innerHTML}`)
    }
  })
})
