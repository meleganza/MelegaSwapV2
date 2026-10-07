import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSwitchNetwork } from '../useSwitchNetwork'

type SwitchState = {
  connected: boolean
  walletSwitch: ((chainId: number) => Promise<unknown>) | undefined
  toastError: ReturnType<typeof vi.fn>
}

function readSwitchState(): SwitchState {
  return (globalThis as unknown as { __switchState: SwitchState }).__switchState
}

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  const g = globalThis as { __switchState?: SwitchState }
  if (!g.__switchState) {
    g.__switchState = { connected: false, walletSwitch: undefined, toastError: vi.fn() }
  }
  const state = g.__switchState
  return {
    ...actual,
    useAccount: () => ({ isConnected: state.connected, connector: { id: 'injected' } }),
    useSwitchNetwork: () => ({
      switchNetworkAsync: state.walletSwitch,
      isLoading: false,
      switchNetwork: undefined,
    }),
  }
})

vi.mock('@pancakeswap/uikit', () => {
  const g = globalThis as { __switchState?: SwitchState }
  const state = g.__switchState ?? { connected: false, walletSwitch: undefined, toastError: vi.fn() }
  g.__switchState = state
  return {
    useToast: () => ({ toastError: state.toastError }),
  }
})

vi.mock('@pancakeswap/localization', () => ({
  useTranslation: () => ({ t: (value: string) => value }),
}))

vi.mock('@pancakeswap/utils/replaceBrowserHistory', () => ({
  default: vi.fn(),
}))

describe('useSwitchNetwork control flow', () => {
  beforeEach(() => {
    const state = readSwitchState()
    state.connected = false
    state.walletSwitch = undefined
    state.toastError.mockReset()
  })

  it('settles a disconnected session switch instead of leaving the promise pending', async () => {
    const { result } = renderHook(() => useSwitchNetwork())
    const outcome = await Promise.race([
      result.current.switchNetworkAsync(56).then((ok) => ({ ok, hung: false })),
      new Promise<{ ok: boolean; hung: boolean }>((resolve) => {
        setTimeout(() => resolve({ ok: false, hung: true }), 500)
      }),
    ])
    expect(outcome).toEqual({ ok: true, hung: false })
  })

  it('returns false when the connected wallet rejects the switch', async () => {
    const state = readSwitchState()
    state.connected = true
    state.walletSwitch = vi.fn().mockRejectedValue(new Error('user rejected'))
    const { result } = renderHook(() => useSwitchNetwork())
    let switched = true
    await act(async () => {
      switched = await result.current.switchNetworkAsync(56)
    })
    expect(switched).toBe(false)
    expect(state.toastError).toHaveBeenCalledTimes(1)
  })

  it('returns true only after the wallet switch resolves', async () => {
    const state = readSwitchState()
    state.connected = true
    state.walletSwitch = vi.fn().mockResolvedValue({ id: 56 })
    const { result } = renderHook(() => useSwitchNetwork())
    let switched = false
    await act(async () => {
      switched = await result.current.switchNetworkAsync(56)
    })
    expect(switched).toBe(true)
  })

  it('does not report success when a connected wallet cannot switch programmatically', async () => {
    const state = readSwitchState()
    state.connected = true
    state.walletSwitch = undefined
    const { result } = renderHook(() => useSwitchNetwork())
    await expect(result.current.switchNetworkAsync(56)).resolves.toBe(false)
  })
})
