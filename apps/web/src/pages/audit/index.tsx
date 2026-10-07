/**
 * LIVE SECURITY CENTER — Audit Center V2 mount.
 */

import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import AuditCenterV2 from 'views/AuditStudio/AuditCenterV2'
import type { NextPageWithLayout } from 'app-runtime/appTypes'

const AuditPage: NextPageWithLayout = () => (
  <>
    <PageMeta />
    <AuditCenterV2 />
  </>
)

AuditPage.chains = CHAIN_IDS

export default AuditPage
