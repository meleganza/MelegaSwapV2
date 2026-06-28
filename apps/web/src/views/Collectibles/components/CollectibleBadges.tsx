import React from 'react'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { COLLECTIBLE_STATUS_LABELS } from 'registry/collectibles/collectible-constants'
import { CollectibleStatus, MetadataStorageStatus } from 'registry/collectibles/collectible-types'

const Badge = styled.span<{ $tone: 'live' | 'planned' | 'external' | 'meta' }>`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ $tone }) =>
      ({
        live: 'rgba(49, 208, 170, 0.5)',
        planned: 'rgba(255, 193, 7, 0.4)',
        external: 'rgba(147, 130, 255, 0.4)',
        meta: 'rgba(255, 255, 255, 0.2)',
      })[$tone]};
  color: ${({ $tone }) =>
    ({
      live: '#31d0aa',
      planned: '#ffc107',
      external: '#9382ff',
      meta: '#a9a9a9',
    })[$tone]};
`

const statusTone = (status: CollectibleStatus): 'live' | 'planned' | 'external' => {
  if (status === 'live_or_legacy_existing') return 'live'
  if (status === 'planned_or_external') return 'external'
  return 'planned'
}

export const CollectibleStatusBadge: React.FC<{ status: CollectibleStatus }> = ({ status }) => (
  <Badge $tone={statusTone(status)}>{COLLECTIBLE_STATUS_LABELS[status]}</Badge>
)

export const MetadataStorageBadge: React.FC<{ storage: MetadataStorageStatus }> = ({ storage }) => {
  const { t } = useTranslation()
  const label =
    storage === 'not_indexed' ? t('Collectibles metadata not indexed') : t('Collectibles metadata indexed')
  return <Badge $tone="meta">{label}</Badge>
}
