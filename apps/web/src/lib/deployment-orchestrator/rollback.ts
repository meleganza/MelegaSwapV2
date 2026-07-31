import type { RollbackPlan, SubsystemId } from './types'

export function buildSubsystemRollback(id: SubsystemId): RollbackPlan {
  if (id === 'liquidity_builder') {
    return {
      subsystemId: id,
      trigger: 'LB broadcast, verification, or binding failure',
      steps: [
        'Stop further LB broadcasts',
        'Do not bind null or unverified addresses',
        'Inventory confirmed txs on BscScan — never invent addresses',
        'Leave frontend LB SSOTs null until a verified deploy succeeds',
        'Abort Create Token and Public Farm Factory sequences',
      ],
      preserve: ['Melega AMM factory/router addresses', 'fee-schedule.json', 'Treasury wallet'],
      forbid: ['Fabricating LB addresses', 'Flipping activationAuthorized without gates', 'Starting CT/Farm deploy'],
    }
  }
  if (id === 'create_token') {
    return {
      subsystemId: id,
      trigger: 'Create Token factory deploy/verify/bind failure after LB LIVE',
      steps: [
        'Keep Liquidity Builder LIVE bindings untouched',
        'Do not bind factoryAddress until BscScan verification succeeds',
        'Keep LIST_CREATE_TOKEN_AVAILABLE=false',
        'Abort Public Farm Factory sequence',
      ],
      preserve: ['LB bindings', 'creation fee SSOT (0.10 BNB)', 'Treasury recipient'],
      forbid: ['Overwriting LB SSOTs', 'Enabling Create Token UI without bind'],
    }
  }
  return {
    subsystemId: 'public_farm_factory',
    trigger: 'Public Farm Factory deploy/verify/bind failure',
    steps: [
      'Keep LB and Create Token bindings untouched',
      'Keep publicFarmFactory address null until verified',
      'Keep Create Farm wallet execution disabled',
      'Retain human Create Farm UX; do not expose protocol internals',
    ],
    preserve: ['LB LIVE', 'Create Token bind', 'fee schedule', 'MasterBuilder isolation'],
    forbid: ['Fabricating farm factory address', 'Exposing MasterBuilder', 'Enabling wallet create without bind'],
  }
}

export function buildGlobalRollback(): RollbackPlan {
  return {
    subsystemId: 'global',
    trigger: 'Any failure in the canonical LB → Create Token → Public Farm Factory pipeline',
    steps: [
      'Halt at the failing sequence — do not advance dependents',
      'Execute the subsystem rollback for the failing system',
      'Leave later systems unbound',
      'Re-run orchestrator status until blockers clear',
      'Resume only from the failed sequence after authority + verification recover',
    ],
    preserve: [
      'Certified product surfaces unrelated to deploy',
      'Fee schedule economics',
      'Canonical Treasury wallet',
      'Any already-LIVE prior subsystem bindings',
    ],
    forbid: [
      'Force-pushing fabricated addresses',
      'Reordering deployment sequence',
      'Deploying without production authority',
      'Merging incomplete binds to production frontend',
    ],
  }
}

export function buildAllRollbackPlans(): RollbackPlan[] {
  return [
    buildSubsystemRollback('liquidity_builder'),
    buildSubsystemRollback('create_token'),
    buildSubsystemRollback('public_farm_factory'),
    buildGlobalRollback(),
  ]
}
