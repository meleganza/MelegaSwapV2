import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { VENUE_CAPABILITY_LABELS } from 'registry/venues/constants'
import { VenueCapabilities } from 'registry/venues/types'
import { mapCapabilityToDisplayStatus } from 'registry/projects/intelligence'
import CapabilityStatus from 'views/Projects/components/CapabilityStatus'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

const Cell = styled(Flex)`
  flex-direction: column;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  min-height: 88px;
  flex: 1 1 200px;
  background: rgba(255, 255, 255, 0.02);
  gap: 8px;
`

interface VenueCapabilityMatrixProps {
  capabilities: VenueCapabilities
}

const VenueCapabilityMatrix: React.FC<VenueCapabilityMatrixProps> = ({ capabilities }) => {
  const { t } = useTranslation()
  const entries = Object.entries(capabilities) as [keyof VenueCapabilities, VenueCapabilities[keyof VenueCapabilities]][]

  return (
    <Flex flexDirection="column" width="100%">
      <Heading as="h3" scale="sm" color="secondary" mb="16px">
        {t('Venue capability matrix')}
      </Heading>
      <Grid>
        {entries.map(([key, cell]) => (
          <Cell key={key}>
            <Text fontSize="14px" fontWeight={600}>
              {t(VENUE_CAPABILITY_LABELS[key])}
            </Text>
            <CapabilityStatus status={mapCapabilityToDisplayStatus(cell.status)} />
            {cell.notes && (
              <Text fontSize="11px" color="textSubtle">
                {cell.notes}
              </Text>
            )}
          </Cell>
        ))}
      </Grid>
    </Flex>
  )
}

export default VenueCapabilityMatrix
