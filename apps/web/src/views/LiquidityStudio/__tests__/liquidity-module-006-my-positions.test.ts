/**
 * LIQUIDITY_MODULE_006_MY_POSITIONS — wallet states, actions, freezes.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  LIQUIDITY_MODULE_001_005_FREEZE,
  LIQUIDITY_MY_POSITIONS_COPY,
  liquidityMyPositions,
} from '../modules/liquidityMyPositionsTokens'
import {
  formatPoolShare,
  formatPositionUsd,
  resolvePositionStatus,
} from '../modules/liquidityMyPositionsModel'
import { LIQUIDITY_MODULE_PLAN } from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

describe('LIQUIDITY_MODULE_006 My Positions', () => {
  it('keeps Modules 001–003 and 005 frozen (004 provider-hoist only)', () => {
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityHeroModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_005_FREEZE.LiquidityHeroModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityActionsModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_005_FREEZE.LiquidityActionsModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityPoolDiscoveryModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_005_FREEZE.LiquidityPoolDiscoveryModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityMarketSnapshotModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_005_FREEZE.LiquidityMarketSnapshotModule,
    )
  })

  it('locks full-width My Positions geometry (no RESERVED panel)', () => {
    expect(liquidityMyPositions.contentMax).toBe('1376px')
    expect(liquidityMyPositions.mainW).toBe('1376px')
    expect((liquidityMyPositions as { reservedW?: string }).reservedW).toBeUndefined()
    expect(LIQUIDITY_MY_POSITIONS_COPY).not.toHaveProperty('reservedLabel')

    const mod = load('modules/LiquidityMyPositionsModule.tsx')
    expect(mod).toContain('data-liquidity-positions-geometry="full-width"')
    expect(mod).toContain('repeat(3, minmax(0, 1fr))')
    expect(mod).not.toContain('liquidity-my-positions-reserved')
    expect(mod).not.toContain('RESERVED')
  })

  it('maps position status honestly (no false zero)', () => {
    expect(resolvePositionStatus({ hasLpBalance: true, hasValue: true, hasShare: true })).toBe('ACTIVE')
    expect(resolvePositionStatus({ hasLpBalance: true, hasValue: false, hasShare: true })).toBe('PARTIAL')
    expect(resolvePositionStatus({ hasLpBalance: false, hasValue: false, hasShare: false })).toBe('UNAVAILABLE')
    expect(formatPositionUsd(null)).toBe('—')
    expect(formatPositionUsd(0)).toBe('—')
    expect(formatPositionUsd(1500)).toBe('$1.5K')
    expect(formatPoolShare(null)).toBe('—')
    expect(formatPoolShare({ toFixed: () => '1.25' })).toBe('1.25%')
  })

  it('ships empty / disconnected copy and Add Liquidity CTA', () => {
    expect(LIQUIDITY_MY_POSITIONS_COPY.emptyConnected).toBe('No liquidity positions yet.')
    expect(LIQUIDITY_MY_POSITIONS_COPY.emptyDisconnected).toBe('Connect wallet to view positions.')
    const mod = load('modules/LiquidityMyPositionsModule.tsx')
    expect(mod).toContain('liquidity-my-positions-disconnected')
    expect(mod).toContain('liquidity-my-positions-empty')
    expect(mod).toContain('liquidity-my-positions-empty-add')
    expect(mod).toContain('ConnectWalletButton')
  })

  it('uses address logos and routes Manage / Remove through existing runtime', () => {
    const mod = load('modules/LiquidityMyPositionsModule.tsx')
    expect(mod).toContain('MelegaTokenAvatar')
    expect(mod).toContain('address={token0.address}')
    expect(mod).toContain('address={token1.address}')
    expect(mod).toContain('useLiquidityRuntime')
    expect(mod).toContain('useLiquidityPositionDetails')
    expect(mod).toContain("setMode('Remove Liquidity')")
    expect(mod).toContain("setMode('Add Liquidity')")
    expect(mod).toContain('setSelectedPositionId')
    expect(mod).toContain('ChainSwitchConfirmDialog')
    expect(mod).not.toContain('useLiquidityPositions()')
    expect(mod).not.toContain('addLiquidityETH')
    expect(mod).not.toContain('MasterChef')
    expect(mod).not.toMatch(/fake earnings|guaranteed fees/i)
  })

  it('shares one LiquidityRuntimeProvider with Module 004 (no nested second host)', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityStudioV3Shell')
    const shell = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx'), 'utf8')
    expect(shell).toContain('LiquidityRuntimeProvider')
    expect(shell).toContain('LiquidityMyPositionsModule')
    expect(shell).toContain('LiquidityAddModule')
    expect((shell.match(/<LiquidityRuntimeProvider>/g) || []).length).toBe(1)
    expect((shell.match(/<\/LiquidityRuntimeProvider>/g) || []).length).toBe(1)
    const add = load('modules/LiquidityAddModule.tsx')
    expect(add).not.toContain('LiquidityRuntimeProvider')
    const positions = load('modules/LiquidityMyPositionsModule.tsx')
    expect(positions).not.toContain('LiquidityRuntimeProvider')
  })

  it('V3 shell mounts positions panel via tabs', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityStudioV3Shell')
    const shell = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx'), 'utf8')
    expect(shell).toContain('data-liquidity-module-006="mounted"')
    expect(shell).toContain('liquidity-v3-panel-positions')
    expect(shell).toContain('LiquidityMyPositionsModule')
  })

  it('records ownership, plan certification, and evidence', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('LiquidityMyPositionsModule.tsx')
    expect(map).toContain('liquidity-module-006-my-positions')
    expect(LIQUIDITY_MODULE_PLAN.find((m) => m.id === '006-your-positions')?.phase).toBe(
      'certified-by-this-mission',
    )
    const evidence = path.join(WEB, 'docs/runtime/liquidity-module-006-my-positions')
    expect(existsSync(evidence)).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_006_MY_POSITIONS_REPORT.md'))).toBe(true)
    expect(existsSync(path.join(evidence, 'test-summary.json'))).toBe(true)
  })
})
