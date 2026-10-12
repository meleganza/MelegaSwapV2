import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'

type CreatedProvider = {
  url: unknown
  network: { chainId?: number; name?: string }
  send: ReturnType<typeof vi.fn>
}

const created: CreatedProvider[] = ((globalThis as { __idleRpcCreated?: CreatedProvider[] }).__idleRpcCreated ??= [])

vi.mock('@ethersproject/providers', () => ({
  StaticJsonRpcProvider: class {
    url: unknown
    network: { chainId?: number; name?: string }
    send = vi.fn()
    constructor(url: unknown, network: { chainId?: number; name?: string }) {
      this.url = url
      this.network = network
      const bucket = ((globalThis as { __idleRpcCreated?: CreatedProvider[] }).__idleRpcCreated ??= [])
      bucket.push(this)
    }
  },
}))

describe('chain rpc providers stay idle until that chain is read', () => {
  it('does not construct Ethereum, Base, or Polygon providers on import', async () => {
    created.length = 0
    const providers = await import('../providers')
    expect(created).toEqual([])
    expect(providers.ethRpcProvider).toBeTruthy()
    expect(providers.baseRpcProvider).toBeTruthy()
    expect(providers.polygonRpcProvider).toBeTruthy()
    expect(created).toEqual([])
  })

  it('constructs only the requested chain and pins its network so detectNetwork does not run', async () => {
    created.length = 0
    const { bscRpcProvider, ethRpcProvider } = await import('../providers')
    expect(bscRpcProvider.network).toMatchObject({ chainId: 56, name: 'bnb' })
    expect(created).toHaveLength(1)
    expect(created[0].send).not.toHaveBeenCalled()

    expect(ethRpcProvider.network).toMatchObject({ chainId: 1, name: 'homestead' })
    expect(created.map((entry) => entry.network.chainId)).toEqual([56, 1])
    expect(created[1].url).toBe('https://eth.llamarpc.com')
    expect(created[1].send).not.toHaveBeenCalled()
  })

  it('keeps homepage block polling tied to the active chain', () => {
    const root = path.resolve(__dirname, '../../..')
    const runtime = readFileSync(path.join(root, 'src/app-shell/GlobalRuntimeHooks.tsx'), 'utf8')
    const farms = readFileSync(path.join(root, 'src/views/Home/hooks/useGetTopFarmsByApr.tsx'), 'utf8')
    const pools = readFileSync(path.join(root, 'src/views/Home/hooks/useGetTopPoolsByApr.tsx'), 'utf8')
    expect(runtime).toContain('shouldRunBlockPolling')
    expect(runtime).toContain('key={chainId}')
    expect(farms).toContain('shouldCommitHomeChainFetch')
    expect(pools).toContain('shouldCommitHomeChainFetch')
  })
})
