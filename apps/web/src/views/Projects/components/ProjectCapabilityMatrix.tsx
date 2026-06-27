import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { CAPABILITY_LABELS } from 'registry/projects/constants'
import { getCapabilityStatusLabel } from 'registry/projects/capabilities'
import { ProjectCapabilities } from 'registry/projects/types'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

const Cell = styled(Flex)`
  flex-direction: column;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  min-height: 72px;
  flex: 1 1 200px;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.02);
`

interface ProjectCapabilityMatrixProps {
  capabilities: ProjectCapabilities
}

const ProjectCapabilityMatrix: React.FC<ProjectCapabilityMatrixProps> = ({ capabilities }) => {
  const { t } = useTranslation()
  const entries = Object.entries(capabilities) as [keyof ProjectCapabilities, ProjectCapabilities[keyof ProjectCapabilities]][]

  return (
    <Flex flexDirection="column" width="100%">
      <Heading as="h2" scale="md" color="secondary" mb="16px">
        {t('Capabilities')}
      </Heading>
      <Grid>
        {entries.map(([key, cell]) => (
          <Cell key={key}>
            <Text fontSize="14px" fontWeight={600} color="text" mb="4px">
              {t(CAPABILITY_LABELS[key])}
            </Text>
            <Text fontSize="12px" color="secondary" mb="4px">
              {t(getCapabilityStatusLabel(cell.status))}
            </Text>
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

export default ProjectCapabilityMatrix
