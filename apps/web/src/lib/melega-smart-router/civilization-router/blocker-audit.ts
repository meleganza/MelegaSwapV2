import { isTreasuryRuntimeConfigured } from '../../treasury-handoff/config'
import { getKerlRegistryVersion } from '../registry/kerlRegistry'
import { MELEGA_SMART_ROUTER_ARCHITECTURE } from '../types'
import type { BlockerAuditRow } from './types'

/** Phase 0 — hard blocker audit. Truth-first; no fabricated readiness. */
export function buildBlockerAuditTable(): BlockerAuditRow[] {
  const kerlVersion = getKerlRegistryVersion()
  const treasuryRuntimeConfigured = isTreasuryRuntimeConfigured()

  return [
    {
      phase: 'Phase 0',
      requirement: 'Deployable wrapper contract (Solidity)',
      status: 'BLOCKED',
      evidence: 'ABI draft + spec only — no .sol in repo (wrapper/spec.ts)',
      nextRequiredAction: 'Implement and audit MelegaSmartRouterWrapper.sol; publish deployed address to registry',
    },
    {
      phase: 'Phase 0',
      requirement: 'Deployer keys / deploy toolchain',
      status: 'BLOCKED',
      evidence: 'No hardhat.config or foundry.toml; KERL testnet uses KERL_TESTNET_EXECUTOR_PRIVATE_KEY only',
      nextRequiredAction: 'Provision wrapper deploy toolchain and authorized deployer outside DEX repo',
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
      evidence: 'Chain 56 active in KERL (/registry/assets/marco.json); chain 97 not indexed',
      nextRequiredAction: 'Publish testnet MARCO asset in KERL or env NEXT_PUBLIC_MARCO_TOKEN_BSC_TESTNET',
    },
    {
      phase: 'Phase 0',
      requirement: 'Treasury Collector registered per chain',
      status: 'BLOCKED',
      evidence: '/registry/treasury/index.json — collector null for chains 56 and 97',
      nextRequiredAction: 'Treasury Runtime must publish collector addresses',
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
      status: 'BLOCKED',
      evidence: `Architecture ${MELEGA_SMART_ROUTER_ARCHITECTURE}; wrapper.address null in registry`,
      nextRequiredAction: 'Deploy wrapper after audit + collector publication',
    },
  ]
}
