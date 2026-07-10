#!/usr/bin/env node
/** Roll back smart-router registry to ADAPTER mode (wrapper address null). */
import { PATHS, loadJson, writeJson, optionalEnv, todayIso } from './_deployEnv.mjs'

const chainId = optionalEnv('WRAPPER_CHAIN_ID') ?? '56'
const index = loadJson(PATHS.registryIndex)
const chain = index.chains?.[chainId]
if (!chain) {
  throw new Error(`Chain ${chainId} not found in smart-router registry`)
}

chain.wrapperAddress = null
if (chain.wrapper) {
  chain.wrapper.address = null
  chain.wrapper.status = 'planned'
}
chain.status = chainId === '56' ? 'partial' : 'blocked'

const blockers = new Set(
  (chain.blockerReason ?? '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean),
)
blockers.add('BLOCKED_WRAPPER_NOT_DEPLOYED')
chain.blockerReason = [...blockers].join('; ')

index.currentArchitecture = 'ADAPTER'
index.asOf = todayIso()
writeJson(PATHS.registryIndex, index)

console.log(
  JSON.stringify(
    {
      ok: true,
      action: 'rollback-wrapper-to-adapter',
      chainId,
      currentArchitecture: index.currentArchitecture,
      wrapperAddress: null,
      registryPath: PATHS.registryIndex,
      note: 'Run regenerate-civilization-router-contract.mjs to sync machine contract',
    },
    null,
    2,
  ),
)
