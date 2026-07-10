#!/usr/bin/env node
/** Publish deployed wrapper address to smart-router registry (post-deploy only). */
import {
  PATHS,
  loadJson,
  writeJson,
  requireAddress,
  optionalEnv,
  todayIso,
} from './_deployEnv.mjs'

const chainId = optionalEnv('WRAPPER_CHAIN_ID') ?? '56'
const wrapperAddress = requireAddress('WRAPPER_ADDRESS')

const index = loadJson(PATHS.registryIndex)
const chain = index.chains?.[chainId]
if (!chain) {
  throw new Error(`Chain ${chainId} not found in smart-router registry`)
}

chain.wrapperAddress = wrapperAddress
if (chain.wrapper) {
  chain.wrapper.address = wrapperAddress
  chain.wrapper.status = 'active'
}
chain.lastVerification = todayIso()

const blockers = (chain.blockerReason ?? '')
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s && s !== 'BLOCKED_WRAPPER_NOT_DEPLOYED')

chain.blockerReason = blockers.length ? blockers.join('; ') : null
if (!chain.blockerReason) {
  chain.status = chainId === '56' ? 'partial' : 'blocked'
}

index.asOf = todayIso()
writeJson(PATHS.registryIndex, index)

console.log(
  JSON.stringify(
    {
      ok: true,
      action: 'publish-wrapper-registry',
      chainId,
      wrapperAddress,
      registryPath: PATHS.registryIndex,
      note: 'currentArchitecture remains ADAPTER until frontend switch script is run',
    },
    null,
    2,
  ),
)
