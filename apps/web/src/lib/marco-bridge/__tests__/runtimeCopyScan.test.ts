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
  'src/lib/marco-bridge/simulate.ts',
  'src/lib/marco-bridge/solanaStoreRead.ts',
  'src/pages/api/marco-bridge/quote.ts',
  'src/pages/api/marco-bridge/route-state.ts',
  'src/pages/api/marco-bridge/track.ts',
  'src/pages/api/marco-bridge/build.ts',
  'src/pages/api/marco-bridge/simulate.ts',
]

/** Any runtime instruction to set_pause / unpause / recover. Historical unpauseTx audit fields are stripped first. */
const FORBIDDEN = /solanaUnpauseOperatorMessage|set_pause|\bunpause\b|recovery[- ]required/i

function runtimeSource(relative: string): string {
  return readFileSync(join(WEB_ROOT, relative), 'utf8')
    .replace(/export function operationalCopyMustNotRequireUnpause[\s\S]*?\n\}/, '')
    .replace(/unpauseTx:\s*'[^']+',?/g, '')
}

describe('runtime bridge copy', () => {
  it('does not import or show set_pause / unpause / recovery-required copy', () => {
    for (const relative of RUNTIME_FILES) {
      const source = runtimeSource(relative)
      expect(FORBIDDEN.test(source), `${relative} still contains obsolete pause-recovery copy`).toBe(false)
      expect(operationalCopyMustNotRequireUnpause(source)).toBe(true)
    }
  })
})
