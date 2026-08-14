import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  chainIdFromPath,
  canonicalTokenPath,
  resolveClaimedSlugForToken,
} from 'lib/projects/canonicalProjectHref'
import { canonicalProjectPath } from 'registry/projects/identity/normalizeProject'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import ProjectPageV7Shell from 'views/ProjectPage/v7/ProjectPageV7Shell'
import {
  buildUnclaimedMarketsDocument,
  resolveUnclaimedTokenIdentity,
  type UnclaimedTokenIdentity,
} from 'views/ProjectPage/v7/unclaimedIdentity'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'

interface UnclaimedTokenPageProps {
  identity: UnclaimedTokenIdentity | null
  marketsDocument: ProjectMarketsDocument | null
}

const UnclaimedTokenMeta = ({ identity }: UnclaimedTokenPageProps) => {
  if (!identity) return null
  const title = `${identity.name} (${identity.symbol}) | Melega DEX`
  const path = canonicalTokenPath(identity.chainId, identity.address)
  const canonicalAbs = `https://www.melega.finance${path}`
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content={`${identity.symbol} on Melega DEX. Unclaimed project page — verify contract before trading.`}
      />
      <link rel="canonical" href={canonicalAbs} />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={canonicalAbs} />
      <meta name="robots" content="index,follow" />
    </Head>
  )
}

const UnclaimedTokenPage = ({ identity, marketsDocument }: UnclaimedTokenPageProps) => {
  if (!identity || !marketsDocument) return <NotFound />

  return (
    <ProjectPageV7Shell mode="unclaimed" unclaimed={identity} marketsDocument={marketsDocument} />
  )
}

export const getServerSideProps: GetServerSideProps<UnclaimedTokenPageProps> = async ({ params }) => {
  const chainRaw = typeof params?.chain === 'string' ? params.chain : ''
  const addressRaw = typeof params?.address === 'string' ? params.address : ''
  const chainId = chainIdFromPath(chainRaw)
  const address = normalizeEvmAddress(addressRaw)

  if (chainId == null || !address) {
    return { notFound: true }
  }

  // Canonicalize chain path + address casing in the URL.
  const canonicalPath = canonicalTokenPath(chainId, address)
  const requestPath = `/token/${chainRaw}/${addressRaw}`
  if (requestPath.toLowerCase() !== canonicalPath.toLowerCase() || addressRaw !== address) {
    return {
      redirect: {
        destination: canonicalPath,
        permanent: true,
      },
    }
  }

  const claimedSlug = resolveClaimedSlugForToken(chainId, address)
  if (claimedSlug) {
    return {
      redirect: {
        destination: canonicalProjectPath(claimedSlug),
        permanent: true,
      },
    }
  }

  const identity = resolveUnclaimedTokenIdentity(chainRaw, address)
  if (!identity) return { notFound: true }

  return {
    props: {
      identity,
      marketsDocument: buildUnclaimedMarketsDocument(identity),
    },
  }
}

UnclaimedTokenPage.chains = CHAIN_IDS
UnclaimedTokenPage.Meta = UnclaimedTokenMeta

export default UnclaimedTokenPage
