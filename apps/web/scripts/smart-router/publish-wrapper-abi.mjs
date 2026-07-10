#!/usr/bin/env node
/** Copy compiled wrapper ABI from Foundry artifact to draft ABI path. */
import { PATHS, writeJson, assertForgeArtifactExists, loadJson, todayIso } from './_deployEnv.mjs'

assertForgeArtifactExists()
const artifact = loadJson(PATHS.forgeArtifact)
if (!Array.isArray(artifact.abi)) {
  throw new Error('Forge artifact missing abi array')
}

writeJson(PATHS.abiDraft, artifact.abi)

console.log(
  JSON.stringify(
    {
      ok: true,
      action: 'publish-wrapper-abi',
      entries: artifact.abi.length,
      target: PATHS.abiDraft,
      asOf: todayIso(),
    },
    null,
    2,
  ),
)
