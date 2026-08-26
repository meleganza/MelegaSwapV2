/**
 * MELEGASWAP_V2_LIQUIDITY_STUDIO_RUNTIME_REMOVE_REPAIR — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_LIQUIDITY_STUDIO_RUNTIME_REMOVE_REPAIR', () => {
  const runtime = load('views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx')
  const positions = load('views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts')
  const factory = load('views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts')
  const removePanel = load('views/LiquidityStudio/v3/LiquidityRemovePanel.tsx')
  const removeModal = load('views/LiquidityStudio/v3/LiquidityRemoveConfirmModal.tsx')
  const myPos = load('views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx')

  it('burn percent dispatch uses Field.LIQUIDITY_PERCENT', () => {
    expect(runtime).toContain('onBurnInput(BurnField.LIQUIDITY_PERCENT, pct)')
    expect(runtime).toContain("onBurnInput(BurnField.LIQUIDITY_PERCENT, '50')")
    expect(runtime).not.toMatch(/onBurnInput\(\s*'50'\s*\)/)
    expect(runtime).not.toMatch(/onBurnInput\(\s*pct\s*\)/)
  })

  it('wallet-scoped factory indexer is chain-scoped and never hydrates one chain with another', () => {
    expect(factory).toContain('isSupportedFactoryChain')
    expect(factory).toContain("isMelegaCapabilityEnabled(chainId, 'swap')")
    expect(factory).toContain('FACTORY_FETCH_TIMEOUT_MS')
    expect(factory).toContain('/api/indexer/liquidity-positions?account=')
    expect(factory).toContain('factoryLpBalancesRaw')
    expect(factory).toContain('account')
    expect(positions).toContain(
      'useFactoryLiquidityTokenPairs(Boolean(effectiveAccount), chainId, effectiveAccount, retryNonce)',
    )
  })

  it('positions expose CONNECTING → FETCHING → READY → EMPTY lifecycle', () => {
    expect(positions).toContain(
      "type LiquidityPositionsPhase = 'connecting' | 'fetching' | 'ready' | 'empty' | 'error'",
    )
    expect(positions).toContain('POSITIONS_FETCH_TIMEOUT_MS')
    expect(positions).toContain('positionsPhase')
    expect(positions).toContain('retryPositions')
    expect(myPos).toContain('data-positions-phase')
    expect(myPos).toContain('emptyTimedOut')
    expect(myPos).toContain('liquidity-my-positions-retry')
  })

  it('remove confirm uses MelegaModal V3 (not You will receive pancake modal)', () => {
    expect(runtime).toContain('LiquidityRemoveConfirmModal')
    expect(runtime).toContain('LiquidityAddConfirmModal')
    expect(runtime).not.toContain('ConfirmAddLiquidityModal')
    expect(runtime).not.toContain("title={t('You will receive')}")
    expect(runtime).not.toContain('ConfirmLiquidityModal')
    expect(removeModal).toContain('Remove Liquidity')
    expect(removeModal).toContain('Review your liquidity withdrawal')
    expect(removeModal).toContain('Confirm Withdrawal')
    expect(removeModal).toContain('Waiting wallet confirmation')
    expect(removeModal).toContain('MelegaModal')
  })

  it('percentage selector wires LP removed + expected receive preview', () => {
    expect(removePanel).toContain('liquidity-remove-lp-pct')
    expect(removePanel).toContain('liquidity-remove-out-a')
    expect(removePanel).toContain('onRemovePercent(p)')
    expect(removePanel).toContain('data-remove-percent')
    expect(removePanel).toContain('removeConfirmModal')
  })

  it('cross-chain switch resumes Remove intent (not always Add)', () => {
    expect(myPos).toContain("intent: 'manage' | 'remove'")
    expect(myPos).toContain("intent === 'remove'")
    expect(myPos).toContain('proceedRemove')
  })

  it('position actions stay in the one-page workspace and reveal the editor', () => {
    expect(myPos).toContain("setMode('Add Liquidity', { syncUrl: false, preservePair: true })")
    expect(myPos).toContain("setMode('Remove Liquidity', { syncUrl: false })")
    expect(myPos).toContain('focusLiquidityEditor()')
    expect(myPos).toContain("getElementById('liquidity-add')")
  })

  it('confirm withdrawal calls wallet remove path with lifecycle', () => {
    expect(runtime).toContain("setRemoveTxLifecycle('waiting_wallet')")
    expect(runtime).toContain('confirmRemoveWithdrawal')
    expect(runtime).toContain('removeLiquidityETH')
    expect(runtime).toContain('removeLiquidity')
  })

  it('deep-link ?view=remove waits for query parse before hydrate', () => {
    const shell = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
    expect(shell).toContain("router.asPath.includes('view=') && view === undefined")
    expect(shell).toContain("view === 'remove' ? 'Remove Liquidity'")
    expect(shell).toContain('deferredDeepLinkScrollRef')
    expect(shell).toContain("positionsPhase === 'fetching'")
  })

  it('transaction workspace does not wait for terminal analytics', () => {
    const shell = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
    expect(shell).toContain('<LiquidityRuntimeProvider terminalEnabled={false}>')
  })
})
