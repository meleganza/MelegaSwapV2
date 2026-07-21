import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import { useProjectWalletRelationship } from '../useProjectWalletRelationship'
import { BodyText, Card, MutedText, SkeletonBlock } from './theme'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

/** Consumer wallet slot — minimal copy, no diagnostic dumps. */
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
      <Card aria-label="Wallet relationship loading">
        <SkeletonBlock />
      </Card>
    )
  }

  return (
    <Card aria-labelledby="wallet-relationship-heading">
      <BodyText id="wallet-relationship-heading" style={{ fontWeight: 600 }}>
        Your wallet
      </BodyText>

      {relationshipDocument.walletConnectionState === 'DISCONNECTED' ? (
        <Stack>
          <MutedText>Connect a wallet to see holdings and positions linked to this project.</MutedText>
          <ConnectWalletButton scale="sm" />
        </Stack>
      ) : null}

      {relationshipDocument.walletConnectionState === 'CONNECTED' && !loading ? (
        detected.length > 0 ? (
          <Stack as="ul" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {detected.slice(0, 4).map((row) => (
              <li key={row.relationshipId}>
                <BodyText style={{ fontSize: 15 }}>{row.displaySummary}</BodyText>
                {row.deepLink ? (
                  <a
                    href={row.deepLink.href}
                    style={{ color: '#d4af37', fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
                  >
                    {row.deepLink.label}
                  </a>
                ) : null}
              </li>
            ))}
          </Stack>
        ) : (
          <MutedText>No active relationship with this project was detected for your wallet.</MutedText>
        )
      ) : null}

      {(relationshipDocument.walletConnectionState === 'CONNECTING' ||
        relationshipDocument.walletConnectionState === 'RECONNECTING' ||
        loading) && relationshipDocument.walletConnectionState !== 'DISCONNECTED' ? (
        <MutedText role="status">Reading wallet relationship…</MutedText>
      ) : null}
    </Card>
  )
}

export default ProjectWalletConsumer
