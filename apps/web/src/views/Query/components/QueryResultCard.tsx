import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { QueryResultItem } from 'registry/query/types'

const StyledCard = styled(Card)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
`

interface QueryResultCardProps {
  item: QueryResultItem
}

const QueryResultCard: React.FC<QueryResultCardProps> = ({ item }) => {
  const { t } = useTranslation()
  const href = item.href.startsWith('/') && !item.href.endsWith('.json') ? item.href : item.href

  const content = (
    <StyledCard style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Text fontSize="11px" color="textDisabled" textTransform="uppercase">
          {item.nodeType}
        </Text>
        <Heading as="h3" scale="md" color="secondary">
          {item.displayName}
        </Heading>
        <Text fontSize="11px" color="textSubtle" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {item.identity}
        </Text>
        <Text fontSize="11px" color="textDisabled">
          {t('Link status')}: {item.status}
        </Text>
        {item.notes && (
          <Text fontSize="11px" color="textDisabled">
            {item.notes}
          </Text>
        )}
      </Flex>
    </StyledCard>
  )

  if (item.href.startsWith('/') && !item.href.endsWith('.json')) {
    return (
      <Link href={href} passHref legacyBehavior>
        {content}
      </Link>
    )
  }

  return (
    <a href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </a>
  )
}

export default QueryResultCard
