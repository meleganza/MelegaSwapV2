import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import {
  BABYMARCO_GENESIS_CANONICAL_SUPPLY,
  getBabyMarcoImageUri,
  getBabyMarcoMetadataUri,
} from 'registry/collectibles/babymarco-genesis-identity.config'
import { DETECTED_NFT_ROUTES } from 'registry/collectibles/collectible-constants'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import type { IdentityLevelProgress, PrivilegeDisplayStatus } from '../collectiblesRuntime/identityCapabilities'
import {
  CS_FONT_BODY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import {
  CsBody,
  CsLabel,
  CsOutlineBtn,
  CsPanel,
  CsPrimaryBtn,
  CsSectionTitle,
} from './collectiblesStudioPrimitives'

const YOUR_IDENTITY_HEIGHT = '220px'

const PanelInner = styled.div<{ $padding?: string }>`
  padding: ${({ $padding }) => $padding || collectiblesStudioLayout.cardPadding};
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const YourIdentityRow = styled.div`
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
  min-height: calc(${YOUR_IDENTITY_HEIGHT} - 56px);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Artwork = styled.div<{ $src?: string | null }>`
  width: 100%;
  min-height: 140px;
  border-radius: 16px;
  border: 1px solid ${collectiblesStudioColors.border};
  background: ${({ $src }) =>
    $src
      ? `url(${$src}) center/cover no-repeat, #0a0a0a`
      : 'radial-gradient(circle at 50% 40%, rgba(214,180,69,0.3), #0a0a0a)'};
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${collectiblesStudioColors.gold};
  background: ${collectiblesStudioColors.goldBg};
  color: ${collectiblesStudioColors.gold};
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MetaValue = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 15px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const PrivilegeChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.span<{ $status?: PrivilegeDisplayStatus | IdentityLevelProgress }>`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid
    ${({ $status }) => {
      if ($status === 'ACTIVE' || $status === 'current') return collectiblesStudioColors.gold
      if ($status === 'available') return collectiblesStudioColors.gold
      if ($status === 'LOCKED') return collectiblesStudioColors.border
      return collectiblesStudioColors.border
    }};
  background: ${({ $status }) => {
    if ($status === 'ACTIVE' || $status === 'current') return collectiblesStudioColors.goldBg
    if ($status === 'available') return 'transparent'
    return 'rgba(255,255,255,0.04)'
  }};
  color: ${({ $status }) => {
    if ($status === 'ACTIVE' || $status === 'current' || $status === 'available') return collectiblesStudioColors.gold
    return collectiblesStudioColors.label
  }};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
`

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const TierCard = styled.div`
  border: 1px solid ${collectiblesStudioColors.border};
  border-radius: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`

const TierTitle = styled.h3`
  margin: 0;
  font-family: ${CS_FONT_BODY};
  font-size: 18px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: ${collectiblesStudioColors.body};
`

const StatVal = styled.span`
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const CapabilityCard = styled.div`
  border: 1px solid ${collectiblesStudioColors.border};
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CollectionCard = styled(Link)<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? collectiblesStudioColors.gold : collectiblesStudioColors.border)};
  border-radius: 14px;
  padding: 16px;
  background: ${({ $active }) => ($active ? collectiblesStudioColors.goldBg : 'rgba(255,255,255,0.02)')};
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${collectiblesStudioColors.gold};
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`

const CollectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const ProgressTrack = styled.div`
  display: flex;
  gap: 10px;
  align-items: stretch;
  overflow-x: auto;
  padding-bottom: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const ProgressNode = styled.div<{ $progress: IdentityLevelProgress }>`
  flex: 1;
  min-width: 140px;
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ $progress }) =>
      $progress === 'current'
        ? collectiblesStudioColors.gold
        : $progress === 'available'
          ? collectiblesStudioColors.gold
          : collectiblesStudioColors.border};
  background: ${({ $progress }) =>
    $progress === 'current' ? collectiblesStudioColors.goldBg : 'rgba(255,255,255,0.02)'};
  opacity: ${({ $progress }) => ($progress === 'future' ? 0.55 : 1)};
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`

const EmptyNote = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${collectiblesStudioColors.label};
`

export const YourIdentityPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()
  const view = babyMarco.yourIdentity
  const artwork =
    view.artworkUrl ??
    (view.primaryTokenId ? getBabyMarcoImageUri(view.primaryTokenId) : null)

  return (
    <CsPanel $height={YOUR_IDENTITY_HEIGHT} data-r400-your-identity id="your-identity">
      <PanelInner>
        <CsSectionTitle style={{ margin: 0, fontSize: 28 }}>Your Identity</CsSectionTitle>
        <YourIdentityRow>
          <Artwork $src={artwork} data-r400-identity-artwork />
          <div>
            <Badge data-r400-identity-badge>{view.identityBadge}</Badge>
            <MetaGrid style={{ marginTop: 12 }}>
              <MetaItem>
                <CsLabel>Current Identity</CsLabel>
                <MetaValue>{view.currentIdentity}</MetaValue>
              </MetaItem>
              <MetaItem>
                <CsLabel>Wallet</CsLabel>
                <MetaValue>
                  {view.walletConnected
                    ? `${view.walletAddress?.slice(0, 6)}…${view.walletAddress?.slice(-4)}`
                    : 'Not connected'}
                </MetaValue>
              </MetaItem>
              {view.ownedGenesis ? (
                <>
                  <MetaItem>
                    <CsLabel>Rarity</CsLabel>
                    <MetaValue>{view.rarityLabel ?? (view.metadataLoading ? 'Loading…' : '—')}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <CsLabel>Collection</CsLabel>
                    <MetaValue>{view.collectionName}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <CsLabel>Mint Date</CsLabel>
                    <MetaValue>{view.mintDate ?? '—'}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <CsLabel>Token</CsLabel>
                    <MetaValue>#{view.primaryTokenId}</MetaValue>
                  </MetaItem>
                </>
              ) : (
                <MetaItem style={{ gridColumn: '1 / -1' }}>
                  <CsBody>
                    Connect your wallet and own a BabyMARCO Genesis identity to unlock civilization privileges.
                  </CsBody>
                </MetaItem>
              )}
            </MetaGrid>
            {view.privileges.length > 0 ? (
              <PrivilegeChips style={{ marginTop: 12 }}>
                {view.privileges.map((p) => (
                  <Chip key={p.id} $status={p.status}>
                    {p.label}
                  </Chip>
                ))}
              </PrivilegeChips>
            ) : null}
          </div>
        </YourIdentityRow>
      </PanelInner>
    </CsPanel>
  )
}

export const IdentityCollectionsPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()

  return (
    <section data-r401-identity-collections id="identity-collections">
      <CsSectionTitle>Identity Collections</CsSectionTitle>
      <CsBody style={{ marginBottom: 16 }}>
        Civilization identity collections across Melega. Only BabyMARCO Genesis is active — planned collections have no
        mint surface in this build.
      </CsBody>
      <CollectionsGrid>
        {babyMarco.identityCollections.map((collection) => (
          <CollectionCard
            key={collection.id}
            href={`/collectibles/${collection.id}`}
            $active={collection.status === 'active'}
            data-r401-collection={collection.id}
          >
            <TierTitle>{collection.name}</TierTitle>
            <StatRow>
              <span>Status</span>
              <StatVal>{collection.statusLabel}</StatVal>
            </StatRow>
            <StatRow>
              <span>Role</span>
              <StatVal>{collection.role}</StatVal>
            </StatRow>
            <StatRow>
              <span>Supply</span>
              <StatVal>{collection.supply}</StatVal>
            </StatRow>
            <CsBody style={{ fontSize: 12, marginTop: 4, color: collectiblesStudioColors.gold }}>
              View Collection →
            </CsBody>
          </CollectionCard>
        ))}
      </CollectionsGrid>
    </section>
  )
}

export const GenesisIdentityCollectionPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()

  return (
    <section data-r401-genesis-identity-collection id="genesis-identity-collection">
      <CsSectionTitle>BabyMARCO Genesis Identities</CsSectionTitle>
      <CsBody style={{ marginBottom: 16 }}>
        Collection 01 — {babyMarco.collectionName}. Canonical supply {BABYMARCO_GENESIS_CANONICAL_SUPPLY}. Pricing in
        MARCO only; USD is informational.
      </CsBody>
      <TierGrid>
        {babyMarco.genesisTiers.map((tier) => (
          <TierCard key={tier.key} data-r400-tier={tier.key}>
            <TierTitle>{tier.label}</TierTitle>
            <StatRow>
              <span>Supply</span>
              <StatVal>{tier.supply}</StatVal>
            </StatRow>
            <StatRow>
              <span>Owned</span>
              <StatVal>{tier.owned}</StatVal>
            </StatRow>
            <StatRow>
              <span>Mint availability</span>
              <StatVal>{tier.mintAvailability}</StatVal>
            </StatRow>
            <StatRow>
              <span>Price</span>
              <StatVal>{tier.priceMarcoLabel}</StatVal>
            </StatRow>
            {tier.priceUsdApprox ? (
              <StatRow>
                <span>Approx USD</span>
                <StatVal>{tier.priceUsdApprox}</StatVal>
              </StatRow>
            ) : null}
          </TierCard>
        ))}
      </TierGrid>
    </section>
  )
}

export const IdentityPrivilegesPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()

  return (
    <section data-r400-privileges id="privileges">
      <CsSectionTitle>Privileges</CsSectionTitle>
      <CardGrid>
        {babyMarco.privileges.map((p) => (
          <CapabilityCard key={p.id}>
            <TierTitle>{p.label}</TierTitle>
            <CsBody>{p.description}</CsBody>
            <Chip $status={p.status}>{p.status}</Chip>
          </CapabilityCard>
        ))}
      </CardGrid>
    </section>
  )
}

export const IdentityCapabilitiesPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()

  return (
    <section data-r400-capabilities id="capabilities">
      <CsSectionTitle>Capabilities</CsSectionTitle>
      <CardGrid>
        {babyMarco.capabilities.map((c) => (
          <CapabilityCard key={c.id}>
            <TierTitle>{c.label}</TierTitle>
            <CsBody>{c.description}</CsBody>
            <Chip $status={c.status}>{c.status}</Chip>
          </CapabilityCard>
        ))}
      </CardGrid>
    </section>
  )
}

export const IdentityLevelsPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()

  return (
    <section data-r400-identity-levels id="identity-levels">
      <CsSectionTitle>Identity Levels</CsSectionTitle>
      <ProgressTrack>
        {babyMarco.identityLevels.map((level) => (
          <ProgressNode key={level.level} $progress={level.progress} data-r401-level={level.level}>
            <MetaValue>
              L{level.level} {level.title}
            </MetaValue>
            <EmptyNote>{level.requirement}</EmptyNote>
            <Chip $status={level.progress === 'current' ? 'ACTIVE' : level.progress === 'available' ? 'available' : 'COMING SOON'}>
              {level.progress === 'current' ? 'Current' : level.progress === 'available' ? 'Available' : 'Future'}
            </Chip>
          </ProgressNode>
        ))}
      </ProgressTrack>
    </section>
  )
}

export const IdentityActionsPanel: React.FC = () => {
  const { babyMarco } = useCollectiblesRuntime()
  const tokenId = babyMarco.yourIdentity.primaryTokenId
  const hasIdentity = Boolean(tokenId)

  return (
    <section data-r401-actions id="identity-actions">
      <CsSectionTitle>Identity Actions</CsSectionTitle>
      <CsBody style={{ marginBottom: 14 }}>
        Mint, inspect, and transfer civilization identities. No speculative charts or floor pricing.
      </CsBody>
      <ActionRow>
        <CsPrimaryBtn as={Link} href={DETECTED_NFT_ROUTES.mint} data-r401-action-mint>
          Mint Identity
        </CsPrimaryBtn>
        <CsOutlineBtn as="a" href="#your-identity" data-r401-action-view-identity>
          View Identity
        </CsOutlineBtn>
        {hasIdentity ? (
          <>
            <CsOutlineBtn
              as="a"
              href={getBabyMarcoMetadataUri(tokenId!)}
              target="_blank"
              rel="noopener noreferrer"
              data-r401-action-metadata
            >
              View Metadata
            </CsOutlineBtn>
            <CsOutlineBtn
              as="a"
              href={getBabyMarcoImageUri(tokenId!)}
              target="_blank"
              rel="noopener noreferrer"
              data-r401-action-ipfs
            >
              View IPFS
            </CsOutlineBtn>
          </>
        ) : (
          <>
            <CsOutlineBtn as="button" type="button" disabled data-r401-action-metadata-disabled>
              View Metadata
            </CsOutlineBtn>
            <CsOutlineBtn as="button" type="button" disabled data-r401-action-ipfs-disabled>
              View IPFS
            </CsOutlineBtn>
          </>
        )}
        <CsOutlineBtn as={Link} href={DETECTED_NFT_ROUTES.wallet} data-r401-action-transfer>
          Transfer Ownership
        </CsOutlineBtn>
      </ActionRow>
    </section>
  )
}

export const IdentityMachinePanel: React.FC = () => {
  const { machine, machineOpen, setMachineOpen } = useCollectiblesRuntime()

  return (
    <CsPanel data-collectibles-machine-panel id="machine-json">
      <PanelInner>
        <CsSectionTitle style={{ margin: 0, fontSize: 24 }}>Machine JSON</CsSectionTitle>
        <CsBody>Schema melega.surface.v1 — identity hub runtime nested in envelope.</CsBody>
        <CsOutlineBtn
          type="button"
          onClick={() => setMachineOpen(!machineOpen)}
          aria-expanded={machineOpen}
          $width="220px"
          $height="36px"
        >
          {machineOpen ? 'Collapse' : 'Expand'} machine-readable identity
        </CsOutlineBtn>
        {machineOpen ? (
          <pre
            data-collectibles-machine-json
            style={{
              margin: 0,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${collectiblesStudioColors.border}`,
              fontFamily: 'SF Mono, Menlo, monospace',
              fontSize: 11,
              lineHeight: 1.55,
              color: collectiblesStudioColors.label,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 320,
              overflowY: 'auto',
            }}
          >
            {JSON.stringify(machine, null, 2)}
          </pre>
        ) : null}
      </PanelInner>
    </CsPanel>
  )
}
