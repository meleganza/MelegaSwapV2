import memoize from 'lodash/memoize'
import { ContextApi } from '@pancakeswap/localization'
import { PageMeta } from './types'
import { ASSET_CDN } from './endpoints'

export const DEFAULT_META: PageMeta = {
  title: 'Melega',
  description:
    '',
  image: `${ASSET_CDN}/web/og/hero.jpg`,
}

interface PathList {
  paths: { [path: string]: { title: string; basePath?: boolean; description?: string; image?: string } }
  defaultTitleSuffix: string
}

const getPathList = (t: ContextApi['t']): PathList => {
  return {
    paths: {
      '/': { title: t('Home') },
      '/swap': { basePath: true, title: t('Swap'), image: `${ASSET_CDN}/web/og/swap.jpg` },
      // '/limit-orders': { basePath: true, title: t('Limit Orders'), image: `${ASSET_CDN}/web/og/limit.jpg` },
      '/add': { basePath: true, title: t('Add Liquidity'), image: `${ASSET_CDN}/web/og/liquidity.jpg` },
      '/remove': { basePath: true, title: t('Remove Liquidity'), image: `${ASSET_CDN}/web/og/liquidity.jpg` },
      '/liquidity': { basePath: true, title: t('Liquidity'), image: `${ASSET_CDN}/web/og/liquidity.jpg` },
      '/find': { basePath: true, title: t('Import Pool') },
      // '/competition': { title: t('Trading Battle') },
      // '/prediction': { title: t('Prediction'), image: `${ASSET_CDN}/web/og/prediction.jpg` },
      // '/prediction/leaderboard': { title: t('Leaderboard'), image: `${ASSET_CDN}/web/og/liquidity.jpg` },
      '/farms': { title: t('Farms'), image: `${ASSET_CDN}/web/og/farms.jpg` },
      '/farms/history': { title: t('Farms'), image: `${ASSET_CDN}/web/og/farms.jpg` },
      // '/farms/auction': { title: t('Farm Auctions'), image: `${ASSET_CDN}/web/og/liquidity.jpg` },
      '/pools': { title: t('Pools'), image: `${ASSET_CDN}/web/og/pools.jpg` },
      '/pools/history': { title: t('Pools'), image: `${ASSET_CDN}/web/og/pools.jpg` },
      // '/lottery': { title: t('Lottery'), image: `${ASSET_CDN}/web/og/lottery.jpg` },
      '/ilo': { title: t('Ilo'), image: `${ASSET_CDN}/web/og/ifo.jpg` },
      // '/teams': { basePath: true, title: t('Leaderboard'), image: `${ASSET_CDN}/web/og/teams.jpg` },
      // '/voting': { basePath: true, title: t('Voting'), image: `${ASSET_CDN}/web/og/voting.jpg` },
      // '/voting/proposal': { title: t('Proposals'), image: `${ASSET_CDN}/web/og/voting.jpg` },
      // '/voting/proposal/create': { title: t('Make a Proposal'), image: `${ASSET_CDN}/web/og/voting.jpg` },
      '/info': {
        title: `${t('Overview')} - ${t('Info')}`,
        description: 'View statistics for Melega exchanges.',
        image: `${ASSET_CDN}/web/og/info.jpg`,
      },
      '/info/pairs': {
        title: `${t('Pairs')} - ${t('Info')}`,
        description: 'View statistics for Melega exchanges.',
        image: `${ASSET_CDN}/web/og/info.jpg`,
      },
      '/info/tokens': {
        title: `${t('Tokens')} - ${t('Info')}`,
        description: 'View statistics for Melega exchanges.',
        image: `${ASSET_CDN}/web/og/info.jpg`,
      },
      '/nft': { title: t('NFT'), image: `${ASSET_CDN}/web/og/nft.jpg` },
      '/viewNFTs': { basePath: true, title: t('ViewNFTs'), image: `${ASSET_CDN}/web/og/nft.jpg` },
      '/nftmarket': { title: t('NFT Market'), image: `${ASSET_CDN}/web/og/nft.jpg` },
      // '/profile': { basePath: true, title: t('Profile') },
      // '/pancake-squad': { basePath: true, title: t('Pancake Squad') },
      // '/pottery': { basePath: true, title: t('Pottery'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/bridge': { basePath: true, title: t('Bridge'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/multisender': { basePath: true, title: t('Multisender'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/create-launchpad': { basePath: true, title: t('Launchpad'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/create-fairlaunch': { basePath: true, title: t('FairLaunch'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/create-token': { basePath: true, title: t('Create Token'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/launchpads': { basePath: true, title: t('Launchpad List'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
      // '/lock-list': { basePath: true, title: t('Locks'), image: `${ASSET_CDN}/web/og/pottery.jpg` },
    },
    defaultTitleSuffix: t('MelegaExchange'),
  }
}

export const getCustomMeta = memoize(
  (path: string, t: ContextApi['t'], _: string): PageMeta => {
    const pathList = getPathList(t)
    const pathMetadata =
      pathList.paths[path] ??
      pathList.paths[Object.entries(pathList.paths).find(([url, data]) => data.basePath && path.startsWith(url))?.[0]]

    if (pathMetadata) {
      return {
        title: `${pathMetadata.title}`,
        ...(pathMetadata.description && { description: pathMetadata.description }),
        image: pathMetadata.image,
      }
    }
    return null
  },
  (path, t, locale) => `${path}#${locale}`,
)
