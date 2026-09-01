import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { openMarcoPassport } from './MarcoConnect'
import {
  MARCO_CONNECT_FALLBACK_LABEL,
  onMarcoPassportDisconnect,
  resolveMarcoConnectNavbarState,
  shortenWagmiAddress,
} from './marcoConnectSession'

describe('openMarcoPassport', () => {
  it('connects the canonical session before opening Passport', async () => {
    const connect = vi.fn().mockResolvedValue(undefined)
    const open = vi.fn()
    const getState = vi.fn().mockReturnValueOnce({ connected: false }).mockReturnValue({ connected: true })

    await openMarcoPassport({ connect, getState, open })

    expect(connect).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledTimes(1)
    expect(connect.mock.invocationCallOrder[0]).toBeLessThan(open.mock.invocationCallOrder[0])
  })

  it('reuses an authenticated Passport session without another connection ceremony', async () => {
    const connect = vi.fn()
    const open = vi.fn()

    await openMarcoPassport({ connect, getState: () => ({ connected: true }), open })

    expect(connect).not.toHaveBeenCalled()
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('does not open a Passport panel when canonical authentication did not complete', async () => {
    const connect = vi.fn().mockResolvedValue(undefined)
    const open = vi.fn()

    await openMarcoPassport({ connect, getState: () => ({ connected: false }), open })

    expect(connect).toHaveBeenCalledTimes(1)
    expect(open).not.toHaveBeenCalled()
  })

  it('does not auto-open Passport when the header widget mounts', () => {
    const source = readFileSync(path.join(__dirname, 'MarcoConnect.tsx'), 'utf8')
    expect(source).toContain('defaultOpen: false')
    expect(source).not.toContain('widgets/marco.js')
  })

  it('keeps MARCO Connect in the app header and disables the SDK floating launcher', () => {
    const source = readFileSync(path.join(__dirname, 'MarcoConnect.tsx'), 'utf8')
    expect(source).toContain('launcher: false')
    expect(source).toContain('aria-label="MARCO Connect"')
  })
})

describe('MARCO Connect wallet ownership boundary', () => {
  const connected = '0x1111111111111111111111111111111111111111'

  it('never disconnects the wagmi/EVM session from a Passport or widget teardown', () => {
    const disconnectEvm = vi.fn()
    onMarcoPassportDisconnect(disconnectEvm)
    expect(disconnectEvm).not.toHaveBeenCalled()

    const source = readFileSync(path.join(__dirname, 'MarcoConnect.tsx'), 'utf8')
    expect(source).not.toContain('useDisconnect')
    expect(source).not.toContain('disconnectRef')
    expect(source).toContain('onMarcoPassportDisconnect()')
    expect(source).toContain('useAccount()')
  })

  it('renders the shortened wagmi address in the navbar when useAccount has an address', () => {
    const state = resolveMarcoConnectNavbarState(connected)
    expect(state).toEqual({ connected: true, label: shortenWagmiAddress(connected) })
    expect(state.label).toBe('0x1111…1111')
    expect(state.label).not.toBe(MARCO_CONNECT_FALLBACK_LABEL)

    const source = readFileSync(path.join(__dirname, 'MarcoConnect.tsx'), 'utf8')
    expect(source).toContain('resolveMarcoConnectNavbarState(address)')
    expect(source).toContain('data-testid="marco-connect-connected-address"')
    expect(source).not.toMatch(/shortAddress \?[\s\S]*MARCO CONNECT/)
  })

  it('keeps the disconnected fallback label and wallet modal launcher unchanged', () => {
    expect(resolveMarcoConnectNavbarState(undefined)).toEqual({
      connected: false,
      label: MARCO_CONNECT_FALLBACK_LABEL,
    })
    expect(resolveMarcoConnectNavbarState(null)).toEqual({
      connected: false,
      label: MARCO_CONNECT_FALLBACK_LABEL,
    })
    expect(MARCO_CONNECT_FALLBACK_LABEL).toBe('MARCO CONNECT')

    const source = readFileSync(path.join(__dirname, 'MarcoConnect.tsx'), 'utf8')
    expect(source).toContain('ConnectWalletButton')
    expect(source).toContain('MARCO_CONNECT_FALLBACK_LABEL')
    expect(source).toContain('aria-label="MARCO Connect"')
  })
})
