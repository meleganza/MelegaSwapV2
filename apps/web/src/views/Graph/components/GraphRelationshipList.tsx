import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { GRAPH_RELATION_LABELS } from 'registry/graph/constants'
import { GraphEdge } from 'registry/graph/types'

const List = styled(Flex)`
  flex-direction: column;
  gap: 8px;
`

const Row = styled(Flex)`
  flex-direction: column;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  gap: 4px;
`

interface GraphRelationshipListProps {
  edges: GraphEdge[]
  title?: string
}

const GraphRelationshipList: React.FC<GraphRelationshipListProps> = ({ edges, title }) => {
  const { t } = useTranslation()

  if (!edges.length) {
    return (
      <Text fontSize="12px" color="textDisabled">
        {t('Graph relationships not indexed')}
      </Text>
    )
  }

  return (
    <Flex flexDirection="column" style={{ gap: '12px' }}>
      {title && (
        <Heading as="h3" scale="sm" color="secondary">
          {title}
        </Heading>
      )}
      <List>
        {edges.map((edge) => (
          <Row key={`${edge.from.slug}-${edge.to.slug}-${edge.relation}`}>
            <Text fontSize="12px" color="textSubtle">
              {t(GRAPH_RELATION_LABELS[edge.relation])}
            </Text>
            <Text fontSize="12px" color="text">
              {edge.from.displayName} → {edge.to.displayName}
            </Text>
            <Text fontSize="11px" color="textDisabled">
              {t('Link status')}: {edge.status}
            </Text>
          </Row>
        ))}
      </List>
    </Flex>
  )
}

export default GraphRelationshipList
