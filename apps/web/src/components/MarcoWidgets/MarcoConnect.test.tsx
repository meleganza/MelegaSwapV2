import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { openMarcoPassport } from './MarcoConnect'

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
})
