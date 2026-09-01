import { readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it } from 'vitest'
import { BRIDGE_COPY, operationalCopyMustNotRequireUnpause } from '../bridgeActionState'
import { MARCO_BRIDGE_DELIVERED_COPY, MARCO_BRIDGE_SUBMITTED_COPY } from '../lifecycle'

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
  'src/lib/marco-bridge/solanaOftProtocol.ts',
  'src/lib/marco-bridge/solanaQuote.ts',
  'src/lib/marco-bridge/solanaBrowserProtocol.ts',
  'src/lib/marco-bridge/solanaWalletAccounts.ts',
  'src/pages/api/marco-bridge/quote.ts',
  'src/pages/api/marco-bridge/route-state.ts',
  'src/pages/api/marco-bridge/track.ts',
  'src/pages/api/marco-bridge/build.ts',
  'src/pages/api/marco-bridge/simulate.ts',
]

/** Any runtime instruction to set_pause / unpause / recover. Historical unpauseTx audit fields are stripped first. */
const FORBIDDEN = /solanaUnpauseOperatorMessage|set_pause|\bunpause\b|recovery[- ]required/i
const OBSOLETE_FUNCTION = ['solanaUnpause', 'OperatorMessage'].join('')
const OBSOLETE_SIGN_LITERAL = ['Sign', ' set_pause'].join('')
const ASCII_SUBMITTED = "We're tracking delivery across chains"

function runtimeSource(relative: string): string {
  return readFileSync(join(WEB_ROOT, relative), 'utf8')
    .replace(/export function operationalCopyMustNotRequireUnpause[\s\S]*?\n\}/, '')
    .replace(/unpauseTx:\s*'[^']+',?/g, '')
}

function listTsFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) listTsFiles(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name) && entry.name !== 'runtimeCopyScan.test.ts') acc.push(full)
  }
  return acc
}

describe('runtime bridge copy', () => {
  it('does not import or show set_pause / unpause / recovery-required copy', () => {
    for (const relative of RUNTIME_FILES) {
      const source = runtimeSource(relative)
      expect(FORBIDDEN.test(source), `${relative} still contains obsolete pause-recovery copy`).toBe(false)
      expect(operationalCopyMustNotRequireUnpause(source)).toBe(true)
    }
  })

  it('proves the obsolete unpause operator message and Sign set_pause literal are gone', () => {
    const files = [
      ...listTsFiles(join(WEB_ROOT, 'src/lib/marco-bridge')),
      join(WEB_ROOT, 'src/views/MarcoBridge/MarcoBridgeWorkspace.tsx'),
    ]
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      expect(source.includes(OBSOLETE_FUNCTION), `${file} still exports or mentions ${OBSOLETE_FUNCTION}`).toBe(false)
      expect(source.includes(OBSOLETE_SIGN_LITERAL), `${file} still contains ${OBSOLETE_SIGN_LITERAL}`).toBe(false)
    }
  })

  it('normalizes submitted and delivered copy, including the curly apostrophe', () => {
    expect(MARCO_BRIDGE_SUBMITTED_COPY).toBe(
      'Your transaction was submitted successfully. We\u2019re tracking delivery across chains. Do not resend this transfer.',
    )
    expect(BRIDGE_COPY.submitted).toBe(MARCO_BRIDGE_SUBMITTED_COPY)
    expect(BRIDGE_COPY.submitted.includes('\u2019')).toBe(true)
    expect(BRIDGE_COPY.submitted.includes("'")).toBe(false)
    expect(BRIDGE_COPY.delivered).toBe(MARCO_BRIDGE_DELIVERED_COPY)
    expect(BRIDGE_COPY.delivered).toBe('MARCO was delivered successfully to the destination wallet.')

    for (const relative of RUNTIME_FILES) {
      const source = readFileSync(join(WEB_ROOT, relative), 'utf8')
      expect(source.includes(ASCII_SUBMITTED), `${relative} still uses a straight apostrophe in submitted copy`).toBe(
        false,
      )
    }
  })

  it('keeps unrequested quote fields neutral before the user enters bridge data', () => {
    const workspace = runtimeSource('src/views/MarcoBridge/MarcoBridgeWorkspace.tsx')
    expect(workspace).not.toContain('QUOTE UNAVAILABLE')
    expect(workspace.match(/: '—'/g)?.length).toBeGreaterThanOrEqual(5)
  })
})
