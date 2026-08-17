import { getMarcoPayApplicationRef } from 'lib/marco-pay/contract'
import { resolveMarcoPayReadiness } from 'lib/marco-pay/readiness'
import { buildDexManifest, type DexManifest } from './document'

export { DEX_MANIFEST_CALLBACK_URL, DEX_MANIFEST_SCHEMA, buildDexManifest, type DexManifest } from './document'

export async function resolveDexManifest(): Promise<DexManifest> {
  const applicationRef = getMarcoPayApplicationRef()
  try {
    const readiness = await resolveMarcoPayReadiness()
    return buildDexManifest({
      applicationRef: readiness.applicationRef ?? applicationRef,
      executable: Boolean(readiness.executable),
    })
  } catch {
    return buildDexManifest({ applicationRef, executable: false })
  }
}
