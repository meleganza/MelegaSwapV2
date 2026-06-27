import React from 'react'
import styled from 'styled-components'
import { Flex, Button, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { QUERY_PRESETS } from 'registry/query/constants'
import { QueryPresetId } from 'registry/query/types'

const List = styled(Flex)`
  flex-direction: column;
  gap: 8px;
`

interface QueryPresetListProps {
  activePresetId?: QueryPresetId
  onSelect: (presetId: QueryPresetId) => void
}

const QueryPresetList: React.FC<QueryPresetListProps> = ({ activePresetId, onSelect }) => {
  const { t } = useTranslation()

  return (
    <List>
      {QUERY_PRESETS.map((preset) => (
        <Button
          key={preset.id}
          variant={activePresetId === preset.id ? 'primary' : 'tertiary'}
          scale="sm"
          onClick={() => onSelect(preset.id)}
          style={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', padding: '12px 16px' }}
        >
          <Flex flexDirection="column" style={{ gap: '4px', alignItems: 'flex-start' }}>
            <Text fontSize="14px" fontWeight={600}>
              {t(preset.label)}
            </Text>
            <Text fontSize="11px" color="textSubtle">
              {t(preset.description)}
            </Text>
          </Flex>
        </Button>
      ))}
    </List>
  )
}

export default QueryPresetList
