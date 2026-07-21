import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import { useProjectWalletRelationship } from '../useProjectWalletRelationship'
import { MutedText, SkeletonBlock, SoftCard } from './theme'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const WalletShell = styled(SoftCard)`
  padding: 14px 16px;
  gap: 8px;
  border-color: rgba(255, 255, 255, 0.05);
  background: rgba(14, 14, 14, 0.55);
`

const WalletHeading = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #8f8f8f;
`

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

/** Consumer wallet slot — subtle, non-blocking relationship hint. */
const ProjectWalletConsumer: React.FC<Props> = ({ document, evidencePack }) => {
  const { relationshipDocument, loading } = useProjectWalletRelationship(document, evidencePack)

  const detected = relationshipDocument.relationships.filter((r) =>
    ['ASSET_HOLDING', 'LIQUIDITY_POSITION', 'FARM_POSITION', 'POOL_POSITION', 'CLAIMABLE_REWARD'].includes(
      r.relationshipType,
    ) &&
    (r.status === 'ACTIVE' || r.status === 'CLAIMABLE'),
  )

  if (loading && relationshipDocument.walletConnectionState !== 'DISCONNECTED') {
    return (
      <WalletShell aria-label="Wallet relationship loading">
        <SkeletonBlock style={{ minHeight: 48 }} />
      </WalletShell>
    )
  }

  if (relationshipDocument.walletConnectionState === 'DISCONNECTED' && detected.length === 0) {
    return (
      <WalletShell aria-labelledby="wallet-relationship-heading">
        <WalletHeading id="wallet-relationship-heading">Your wallet</WalletHeading>
        <Stack>
          <MutedText style={{ fontSize: 14 }}>
            Connect to see holdings linked to this project.
          </MutedText>
          <ConnectWalletButton scale="sm" />
        </Stack>
      </WalletShell>
    )
  }

  if (relationshipDocument.walletConnectionState === 'CONNECTED' && !loading && detected.length > 0) {
    return (
      <WalletShell aria-labelledby="wallet-relationship-heading">
        <WalletHeading id="wallet-relationship-heading">Your wallet</WalletHeading>
        <Stack as="ul" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {detected.slice(0, 3).map((row) => (
            <li key={row.relationshipId}>
              <MutedText style={{ fontSize: 14, color: '#c8c8c8' }}>{row.displaySummary}</MutedText>
              {row.deepLink ? (
                <a
                  href={row.deepLink.href}
                  style={{
                    color: '#d4af37',
                    fontSize: 13,
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {row.deepLink.label}
                </a>
              ) : null}
            </li>
          ))}
        </Stack>
      </WalletShell>
    )
  }

  if (
    (relationshipDocument.walletConnectionState === 'CONNECTING' ||
      relationshipDocument.walletConnectionState === 'RECONNECTING' ||
      loading) &&
    relationshipDocument.walletConnectionState !== 'DISCONNECTED'
  ) {
    return (
      <WalletShell>
        <MutedText role="status" style={{ fontSize: 14 }}>
          Checking your wallet…
        </MutedText>
      </WalletShell>
    )
  }

  return null
}

export default ProjectWalletConsumer
