/**
 * LIVE SECURITY CENTER — Audit Center V2 mount.
 */
import React from 'react'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import AuditCenterV2 from 'views/AuditStudio/AuditCenterV2'

const AuditPage: React.FC = () => (
  <>
    <PageMeta />
    <AuditCenterV2 />
  </>
)

AuditPage.chains = CHAIN_IDS

export default AuditPage
