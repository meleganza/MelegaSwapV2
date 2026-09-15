import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  beginMarcoPayIsolation,
  endMarcoPayIsolation,
  isMarcoPayIsolationActive,
  isMarcoPayWalletFlightActive,
  runMarcoPaySingleFlight,
} from '../approval'

const WEB = path.resolve(__dirname, '../../../')

describe('MARCO Pay production UX guards', () => {
  afterEach(() => {
    endMarcoPayIsolation()
    endMarcoPayIsolation()
  })

  it('keeps payment CTA single-flight so repeated clicks cannot start a second wallet request', async () => {
    let started = 0
    let resolveFirst: () => void = () => undefined
    const first = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })
    const a = runMarcoPaySingleFlight(async () => {
      started += 1
      await first
      return 'one'
    })
    const b = runMarcoPaySingleFlight(async () => {
      started += 1
      return 'two'
    })
    expect(isMarcoPayWalletFlightActive()).toBe(true)
    expect(await b).toBeNull()
    resolveFirst()
    expect(await a).toBe('one')
    expect(started).toBe(1)
  })

  it('does not auto-open MARCO Connect or Passport during Pay', () => {
    const checkout = readFileSync(path.join(WEB, 'views/shared/monetization/CommercialCheckoutModal.tsx'), 'utf8')
    const connect = readFileSync(path.join(WEB, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')
    const pay = readFileSync(path.join(WEB, 'components/MarcoWidgets/MarcoPay.tsx'), 'utf8')
    const documentSource = readFileSync(path.join(WEB, 'pages/_document.tsx'), 'utf8')
    expect(checkout).not.toContain('openMarcoPassport')
    expect(checkout).not.toContain('widgets/marco.js')
    expect(checkout).not.toContain('widgets/marco-connect')
    expect(pay).not.toContain('openMarcoPassport')
    expect(pay).not.toContain('widgets/marco.js')
    expect(connect).toContain('defaultOpen: false')
    expect(connect).toContain('isMarcoPayIsolationActive()')
    expect(documentSource).not.toContain('https://marco.melega.ai/widgets/marco.js')
  })

  it('does not disconnect the DEX wallet from a payment isolation window', () => {
    const connect = readFileSync(path.join(WEB, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')
    expect(connect).toContain('if (isMarcoPayIsolationActive()) return')
    beginMarcoPayIsolation()
    expect(isMarcoPayIsolationActive()).toBe(true)
    endMarcoPayIsolation()
    expect(isMarcoPayIsolationActive()).toBe(false)
  })

  it('creates one MARCO Pay intent path and never routes M-Credits through it', () => {
    const checkout = readFileSync(path.join(WEB, 'views/shared/monetization/CommercialCheckoutModal.tsx'), 'utf8')
    const orders = readFileSync(path.join(WEB, 'pages/api/marco-pay/orders.ts'), 'utf8')
    expect(checkout).toContain('runMarcoPaySingleFlight')
    expect(checkout).toContain('signer.sendTransaction')
    expect(checkout).toContain("pay === 'MARCO_PAY'")
    expect(checkout).toContain('/api/mcredits/orders')
    expect(orders).toContain('createMarcoPayPaymentSession')
    expect(orders).toContain('buildMarcoPayWalletTransfer')
    expect(orders).toContain('wallet:')
  })
})
