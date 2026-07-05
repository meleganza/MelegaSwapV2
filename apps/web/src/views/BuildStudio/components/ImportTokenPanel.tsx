import React, { useMemo } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { getPendingProjectRegistry } from 'registry/projects/pending'
import { formatPendingReviewStatusLabel } from 'registry/projects/pending/updatePendingReview'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { IconDownload, IconRadar } from './buildStudioIcons'
import { BsBody, BsCardTitle, BsPrimaryBtn, BsPanel } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: visible;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const RadarWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${buildStudioColors.green};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(27, 231, 122, 0.06);
`

const PendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 140px;
  overflow-y: auto;
`

const PendingRow = styled(Link)`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(214, 180, 69, 0.25);
  background: rgba(214, 180, 69, 0.05);
  text-decoration: none;
  color: inherit;
  font-family: ${BS_FONT_BODY};
  font-size: 12px;
`

const PendingName = styled.span`
  color: ${buildStudioColors.white};
  font-weight: 600;
`

const PendingStatus = styled.span`
  color: ${buildStudioColors.gold};
  white-space: nowrap;
`

export const ImportTokenPanel: React.FC = () => {
  const pendingRecords = useMemo(() => {
    if (typeof window === 'undefined') return []
    return getPendingProjectRegistry()
      .getAll()
      .filter((p) => p.status !== 'archived' && p.status !== 'rejected')
  }, [])

  return (
    <BsPanel
      data-bs-panel
      data-bs-import-token
      data-bs-primary-entry
      $emphasis="primary"
      $height={buildStudioLayout.importTokenH}
    >
      <Inner>
        <TitleRow>
          <RadarWrap data-bs-artwork>
            <IconRadar size={24} />
          </RadarWrap>
          <div>
            <BsCardTitle>Import Existing Token</BsCardTitle>
            <BsBody style={{ fontSize: 14, lineHeight: '22px', marginTop: 4 }}>
              Single import workflow — contract analysis, pending registry, and review live on Import Existing Token.
            </BsBody>
          </div>
        </TitleRow>

        <Link href="/build-studio#build-import" passHref legacyBehavior>
          <BsPrimaryBtn as="a" $width="100%" $height="56px" style={{ textDecoration: 'none' }}>
            <IconDownload size={16} color="#050505" />
            Open Import Workflow
          </BsPrimaryBtn>
        </Link>

        {pendingRecords.length > 0 ? (
          <div>
            <BsBody style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: buildStudioColors.gold }}>
              Pending in Build Studio ({pendingRecords.length})
            </BsBody>
            <PendingList data-bs-pending-list>
              {pendingRecords.map((pending) => (
                <PendingRow
                  key={pending.id}
                  href={`/build-studio?contract=${encodeURIComponent(pending.contract)}#build-import`}
                >
                  <PendingName>
                    {pending.symbol.available ? pending.symbol.value : pending.name.value ?? 'Unknown'}
                  </PendingName>
                  <PendingStatus>{formatPendingReviewStatusLabel(pending.status)}</PendingStatus>
                </PendingRow>
              ))}
            </PendingList>
          </div>
        ) : (
          <BsBody style={{ fontSize: 12, color: buildStudioColors.muted }}>
            No pending projects yet. Import a contract to create a pending registry profile.
          </BsBody>
        )}
      </Inner>
    </BsPanel>
  )
}

export default ImportTokenPanel
