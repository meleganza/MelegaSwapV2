import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const webRoot = path.resolve(__dirname, '../../../..')
const read = (relative: string) => readFileSync(path.join(webRoot, relative), 'utf8')

describe('P0 technical performance boundary', () => {
  it('does not expose application implementation files as public pages', () => {
    expect(existsSync(path.join(webRoot, 'src/pages/_app-full.tsx'))).toBe(false)
    expect(existsSync(path.join(webRoot, 'src/pages/_app-types.ts'))).toBe(false)
    expect(read('src/pages/_app.tsx')).toContain("import('app-runtime/FullMyApp')")
    expect(read('src/pages/_app.tsx')).toContain('{ ssr: true }')
  })

  it('keeps advanced wallet SDKs out of the synchronous application graph', () => {
    const wagmi = read('src/utils/wagmi.ts')
    expect(wagmi).not.toMatch(/^import .*walletConnect/m)
    expect(wagmi).not.toMatch(/^import .*ledger/m)
    expect(wagmi).not.toMatch(/^import .*coinbaseWallet/m)
    expect(wagmi).toContain("import('wagmi/connectors/walletConnect')")
    expect(wagmi).toContain("import('wagmi/connectors/ledger')")
    expect(wagmi).toContain('loadWalletConnector')
    expect(wagmi).toContain('connectorLoaders')
    expect(wagmi).not.toContain('extendedWalletConnectorsPromise')
  })

  it('loads the wallet UI on intent and each advanced connector only after selection', () => {
    const button = read('src/components/ConnectWalletButton.tsx')
    const auth = read('src/hooks/useAuth.tsx')
    expect(button).toContain('preloadConnectWalletRuntime')
    expect(button).not.toContain('loadExtendedWalletConnectors')
    expect(auth).toContain('await loadWalletConnector(connectorID)')
    expect(button).not.toContain('requestIdleCallback')
    expect(button).not.toContain('window.setTimeout')
  })

  it('keeps Node crypto out of the browser artifact-integrity path', () => {
    const artifacts = read('src/lib/deployment-orchestrator/founderAvalancheRouterArtifacts.ts')
    expect(artifacts).toContain("import { sha256 } from '@ethersproject/sha2'")
    expect(artifacts).not.toContain("require('crypto')")
    expect(artifacts).not.toContain('Buffer.from')
  })

  it('stops background refresh for hidden and offline tabs', () => {
    const providers = read('src/Providers.tsx')
    expect(providers).toContain('refreshWhenHidden: false')
    expect(providers).toContain('refreshWhenOffline: false')
    expect(read('src/app-shell/GlobalUpdaters.tsx')).toContain("profile === 'static'")
  })
})
