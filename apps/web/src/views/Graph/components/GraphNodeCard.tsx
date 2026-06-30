import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { GraphNodeRef } from 'registry/graph/types'

const StyledCard = styled(Card)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(49, 208, 170, 0.4);
  }
`

const Mono = styled(Text)`
  font-family: monospace;
  font-size: 11px;
  word-break: break-all;
`

const TYPE_LABELS: Record<GraphNodeRef['type'], string> = {
  project: 'Project',
  asset: 'Asset',
  venue: 'Venue',
  event: 'Event',
}

interface GraphNodeCardProps {
  node: GraphNodeRef
}

const GraphNodeCard: React.FC<GraphNodeCardProps> = ({ node }) => {
  const { t } = useTranslation()

  return (
    <Link href={node.href} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '8px' }}>
          <Text fontSize="11px" color="textDisabled" textTransform="uppercase">
            {t(TYPE_LABELS[node.type])}
          </Text>
          <Heading as="h3" scale="md" color="secondary">
            {node.displayName}
          </Heading>
          <Mono color="textSubtle">{node.identity}</Mono>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default GraphNodeCard
