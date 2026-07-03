import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { buildRc1OfflineDryRunHandoffFixture } from 'lib/execution-handoff-consumer/__fixtures__/rc1-offline-dry-run-handoff.fixture'
import {
  KERL_REGISTRY_HANDOFFS_DIR,
  KERL_REGISTRY_INDEX_FILE,
  KERL_REGISTRY_SEED_HANDOFF_FILE,
  KERL_REGISTRY_SEED_HANDOFF_ID,
  KERL_REGISTRY_VERSION,
  resolveKerlRegistryRoot,
} from '../constants'

describe('write KERL registry seed artifacts', () => {
  it('writes seed JSON and index to public/registry/kerl', () => {
    const root = resolveKerlRegistryRoot()
    const handoffRel = `${KERL_REGISTRY_HANDOFFS_DIR}/${KERL_REGISTRY_SEED_HANDOFF_FILE}`
    const handoffAbs = path.join(root, handoffRel)
    fs.mkdirSync(path.dirname(handoffAbs), { recursive: true })
    fs.writeFileSync(handoffAbs, `${JSON.stringify(buildRc1OfflineDryRunHandoffFixture(), null, 2)}\n`)

    const index = {
      registryVersion: KERL_REGISTRY_VERSION,
      purpose: 'KERL certified dry-run handoff packages — local, static, test-only',
      networkCommunication: false,
      executionMode: 'DRY_RUN_ONLY',
      handoffs: [
        {
          id: KERL_REGISTRY_SEED_HANDOFF_ID,
          path: handoffRel,
          handoffMode: 'dry_run',
          certified: true,
          testOnly: true,
        },
      ],
    }
    fs.writeFileSync(path.join(root, KERL_REGISTRY_INDEX_FILE), `${JSON.stringify(index, null, 2)}\n`)
    expect(fs.existsSync(handoffAbs)).toBe(true)
  })
})
