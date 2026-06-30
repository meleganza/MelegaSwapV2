import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'

const LinkRow = styled(Flex)`
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
`

interface PresenceExploreLinkProps {
  className?: string
}

const PresenceExploreLink: React.FC<PresenceExploreLinkProps> = ({ className }) => {
  const { t } = useTranslation()

  return (
    <Link href="/presence" passHref legacyBehavior>
      <LinkRow as="a" className={className} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
        <Text fontSize="12px" color="primary">
          {t('View economic presence registry')} →
        </Text>
      </LinkRow>
    </Link>
  )
}

export default PresenceExploreLink
