import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useToken } from 'hooks/Tokens'
import { CHAIN_EXPLORER_TOKEN_URL, CHAIN_LABELS } from 'registry/projects/constants'
import { TokenRef } from 'registry/projects/types'
import { SmartSwapTokenWalletActions } from 'views/SmartSwapStudio/modules/SmartSwapTokenActions'

const Table = styled(Flex)`
  flex-direction: column;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  overflow: hidden;
`

const Row = styled(Flex)`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  gap: 8px;

  &:last-child {
    border-bottom: none;
  }
`

const Mono = styled(Text)`
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
`

interface ProjectTokenListProps {
  tokens: TokenRef[]
}

const ProjectTokenRow: React.FC<{ token: TokenRef }> = ({ token }) => {
  const { t } = useTranslation()
  const currency = useToken(token.address)
  const explorer = CHAIN_EXPLORER_TOKEN_URL[token.chainId]?.(token.address)

  return (
    <Row alignItems="center" justifyContent="space-between">
      <Flex flexDirection="column" style={{ minWidth: '120px' }}>
        <Text fontWeight={600}>{token.symbol}</Text>
        <Text fontSize="12px" color="textSubtle">
          {CHAIN_LABELS[token.chainId] ?? `Chain ${token.chainId}`}
        </Text>
      </Flex>
      <Mono color="textSubtle" style={{ flex: 1 }}>
        {token.address}
      </Mono>
      <Flex alignItems="center" style={{ gap: '12px' }}>
        <SmartSwapTokenWalletActions
          currency={currency ?? undefined}
          tokenRef={
            currency
              ? undefined
              : {
                  address: token.address,
                  symbol: token.symbol,
                  chainId: token.chainId,
                }
          }
          size={16}
          showLabels
        />
        {explorer && (
          <Link href={explorer} external>
            <Text fontSize="12px" color="primary">
              {t('View on Explorer')}
            </Text>
          </Link>
        )}
      </Flex>
    </Row>
  )
}

const ProjectTokenList: React.FC<ProjectTokenListProps> = ({ tokens }) => {
  const { t } = useTranslation()

  if (!tokens.length) {
    return (
      <Text color="textSubtle" textAlign="center">
        {t('No linked tokens')}
      </Text>
    )
  }

  return (
    <Flex flexDirection="column" width="100%">
      <Heading as="h2" scale="md" color="secondary" mb="16px">
        {t('Linked tokens')}
      </Heading>
      <Table>
        {tokens.map((token) => (
          <ProjectTokenRow key={token.ref} token={token} />
        ))}
      </Table>
    </Flex>
  )
}

export default ProjectTokenList
