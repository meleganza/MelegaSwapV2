import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it } from 'vitest'
import { operationalCopyMustNotRequireUnpause } from '../bridgeActionState'

const WEB_ROOT = join(dirname(new URL(import.meta.url).pathname), '../../../..')

const RUNTIME_FILES = [
  'src/views/MarcoBridge/MarcoBridgeWorkspace.tsx',
  'src/lib/marco-bridge/bridgeActionState.ts',
  'src/lib/marco-bridge/lifecycle.ts',
  'src/lib/marco-bridge/walletSubmit.ts',
  'src/lib/marco-bridge/tracking.ts',
  'src/lib/marco-bridge/routeAuthority.ts',
  'src/lib/marco-bridge/canonicalBnbSolanaGate.ts',
  'src/lib/marco-bridge/executableRoutes.ts',
  'src/lib/marco-bridge/service.ts',
  'src/lib/marco-bridge/preflight.ts',
  'src/lib/marco-bridge/nativeFunds.ts',
  'src/pages/api/marco-bridge/quote.ts',
  'src/pages/api/marco-bridge/route-state.ts',
  'src/pages/api/marco-bridge/track.ts',
  'src/pages/api/marco-bridge/build.ts',
  'src/pages/api/marco-bridge/simulate.ts',
]

const FORBIDDEN = /solanaUnpauseOperatorMessage|set_pause|recovery[- ]required|unpause the certified/i

describe('runtime bridge copy', () => {
  it('does not import or show set_pause / unpause / recovery-required copy', () => {
    for (const relative of RUNTIME_FILES) {
      const source = readFileSync(join(WEB_ROOT, relative), 'utf8')
      expect(FORBIDDEN.test(source), `${relative} still contains obsolete pause-recovery copy`).toBe(false)
      expect(operationalCopyMustNotRequireUnpause(source)).toBe(true)
    }
  })
})
