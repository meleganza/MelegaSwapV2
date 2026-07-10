import { isTreasuryRuntimeConfigured } from '../../treasury-handoff/config'
import { getKerlRegistryVersion } from '../registry/kerlRegistry'
import { readSmartRouterChainProfile } from '../registry/smartRouterRegistry'
import { readTreasuryRuntimeCollector } from '../registry/runtimeRegistry'
import { MELEGA_SMART_ROUTER_ARCHITECTURE } from '../types'
import type { BlockerAuditRow } from './types'

/** Phase 0 — hard blocker audit. Truth-first; no fabricated readiness. */
export function buildBlockerAuditTable(): BlockerAuditRow[] {
  const kerlVersion = getKerlRegistryVersion()
  const treasuryRuntimeConfigured = isTreasuryRuntimeConfigured()
  const testnetProfile = readSmartRouterChainProfile(97)
  const testnetWrapper = testnetProfile?.wrapperAddress ?? null
  const testnetCollector = readTreasuryRuntimeCollector(97)
  const mainnetCollector = readTreasuryRuntimeCollector(56)

  return [
    {
      phase: 'Phase 0',
      requirement: 'Deployable wrapper contract (Solidity)',
      status: 'PARTIAL',
      evidence:
        'MelegaSmartRouterWrapper.sol + 39 Foundry tests (R736); not deployed; external audit pending',
      nextRequiredAction: 'Complete external audit; deploy after Treasury Intake publication',
    },
    {
      phase: 'Phase 0',
      requirement: 'Deployer keys / deploy toolchain',
      status: 'PARTIAL',
      evidence:
        'foundry.toml RPC/etherscan mapping + DeployMelegaSmartRouterWrapper.s.sol (R738); deploy credentials unset',
      nextRequiredAction: 'Provision TESTNET_DEPLOYER / MAINNET_DEPLOYER and Treasury Intake addresses',
    },
    {
      phase: 'Phase 0',
      requirement: 'BNB Testnet RPC + chain config',
      status: 'READY',
      evidence: 'BSC_TESTNET_RPC_URLS in config/constants/rpc.ts; chainId 97 in resolution env keys',
      nextRequiredAction: 'Wire chain 97 into smart-router registry with verified underlying router address',
    },
    {
      phase: 'Phase 0',
      requirement: 'BNB Mainnet RPC + chain config',
      status: 'READY',
      evidence: 'BSC RPC URLs + wagmi chain 56; underlying router 0xC6665d98Efd81f47B03801187eB46cbC63F328B0',
      nextRequiredAction: 'Publish treasury collector + deploy wrapper for canonical mainnet routing',
    },
    {
      phase: 'Phase 0',
      requirement: 'MARCO address registered per chain',
      status: 'PARTIAL',
      evidence:
        'Chain 56 + 97 active (R744B Treasury Runtime confirmed MARCO testnet 0x963556de0eb8138E97A85F0A86eE0acD159D210b)',
      nextRequiredAction: 'Publish treasury collector per chain; deploy wrapper when unblocked',
    },
    {
      phase: 'Phase 0',
      requirement: 'Treasury Collector registered per chain',
      status: mainnetCollector.available && testnetCollector.available ? 'READY' : 'BLOCKED',
      evidence: mainnetCollector.available
        ? '/registry/treasury/index.json — collectors published for chains 56 and 97'
        : testnetCollector.available
          ? '/registry/treasury/index.json — chain 97 collector active_testnet; chain 56 collector null'
          : '/registry/treasury/index.json — collector null for chains 56 and 97',
      nextRequiredAction: mainnetCollector.available
        ? 'None — collectors indexed'
        : 'Treasury Runtime must publish BNB Chain mainnet collector address',
    },
    {
      phase: 'Phase 0',
      requirement: 'KERL registry writable',
      status: 'BLOCKED',
      evidence: `KERL v${kerlVersion} — static JSON read-only; intake is dry-run only`,
      nextRequiredAction: 'Treasury Runtime / KERL operator publishes registry updates externally',
    },
    {
      phase: 'Phase 0',
      requirement: 'Treasury Runtime intake endpoint',
      status: treasuryRuntimeConfigured ? 'PARTIAL' : 'BLOCKED',
      evidence: treasuryRuntimeConfigured
        ? 'TREASURY_RUNTIME_URL configured — POST /api/treasury/settlement-events proxy live'
        : 'TREASURY_RUNTIME_URL unset — proxy returns 503',
      nextRequiredAction: 'Configure TREASURY_RUNTIME_URL in Vercel and verify intake accepts handoffs',
    },
    {
      phase: 'Phase 0',
      requirement: 'Labs route schemas',
      status: 'PARTIAL',
      evidence: 'melega.smart-router.labs-integration.v1 published; swap schemas only',
      nextRequiredAction: 'Extend Labs integration when NARRATIVE_TRADE route is executable',
    },
    {
      phase: 'Phase 0',
      requirement: 'Narrative Trade schemas',
      status: 'BLOCKED',
      evidence: 'NARRATIVE_TRADE route type absent from executable adapter; Labs execution_enabled: false',
      nextRequiredAction: 'Define executable narrative handoff + wrapper route entrypoint',
    },
    {
      phase: 'Phase 0',
      requirement: 'D90 / D99 schemas',
      status: 'BLOCKED',
      evidence: 'NOT_DEFINED_IN_DEX — codex has D87, FSC-01, SRD-01 only',
      nextRequiredAction: 'Treasury Runtime / Labs must publish D90 and D99 codex entries',
    },
    {
      phase: 'Phase 1',
      requirement: 'Wrapper deployed on-chain',
      status: testnetWrapper ? 'PARTIAL' : 'BLOCKED',
      evidence: testnetWrapper
        ? `Chain 97 wrapper V2 ${testnetWrapper} active_testnet validated; chain 56 wrapper null — architecture ${MELEGA_SMART_ROUTER_ARCHITECTURE}`
        : `Architecture ${MELEGA_SMART_ROUTER_ARCHITECTURE}; wrapper.address null in registry`,
      nextRequiredAction: testnetWrapper
        ? 'Deploy and validate wrapper on BNB Chain mainnet (56) after audit'
        : 'Deploy wrapper after audit + collector publication',
    },
  ]
}
