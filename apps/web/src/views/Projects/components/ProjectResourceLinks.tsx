import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Button } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { StaticProjectRecord } from 'registry/projects/types'

const LinksCard = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  gap: 12px;
`

interface ProjectResourceLinksProps {
  project: StaticProjectRecord
}

const ProjectResourceLinks: React.FC<ProjectResourceLinksProps> = ({ project }) => {
  const { t } = useTranslation()
  const { deepLinks, websiteUrl, docsUrl, spaceProfileUrl } = project
  const tokenAddress = project.resources.tokens[0]?.address
  const radarHref = tokenAddress ? `/radar?contract=${tokenAddress}` : undefined

  const platformLinks = [
    { label: t('Swap'), href: deepLinks.swap },
    { label: t('Liquidity'), href: deepLinks.liquidity },
    { label: t('Farms'), href: deepLinks.farms },
    { label: t('Pools'), href: deepLinks.pools },
    radarHref ? { label: t('Open Radar'), href: radarHref } : null,
    radarHref ? { label: t('Open Contract Intelligence'), href: radarHref } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item?.href))

  const externalLinks = [
    { label: t('Website'), href: websiteUrl },
    { label: t('Docs'), href: docsUrl },
    { label: t('Space'), href: spaceProfileUrl },
  ].filter((item) => Boolean(item.href))

  return (
    <Flex flexDirection="column" width="100%">
      <Heading as="h2" scale="md" color="secondary" mb="16px">
        {t('Explore')}
      </Heading>
      <LinksCard>
        {platformLinks.length > 0 && (
          <Flex flexWrap="wrap" style={{ gap: '8px' }}>
            {platformLinks.map((link) => (
              <Link key={link.label} href={link.href!} passHref legacyBehavior>
                <Button as="a" scale="sm" variant="secondary">
                  {link.label}
                </Button>
              </Link>
            ))}
          </Flex>
        )}
        {externalLinks.length > 0 && (
          <Flex flexDirection="column" style={{ gap: '8px' }}>
            {externalLinks.map((link) => (
              <Link key={link.label} href={link.href!} passHref legacyBehavior>
                <Text as="a" color="primary" fontSize="14px" style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                  {link.label}
                </Text>
              </Link>
            ))}
          </Flex>
        )}
        <Link href={`/registry/projects/${project.slug}.json`} passHref legacyBehavior>
          <Text as="a" color="textSubtle" fontSize="12px" style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            {t('Download machine manifest JSON')}
          </Text>
        </Link>
      </LinksCard>
    </Flex>
  )
}

export default ProjectResourceLinks
