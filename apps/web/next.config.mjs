/* eslint-disable @typescript-eslint/no-var-requires */
import { withSentryConfig } from '@sentry/nextjs'
import { withAxiom } from 'next-axiom'
import BundleAnalyzer from '@next/bundle-analyzer'
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = path.dirname(fileURLToPath(import.meta.url))
const localTokensPackage = path.resolve(webRoot, '../../packages/tokens')
const localUiWalletsPackage = path.resolve(webRoot, '../../packages/ui-wallets')
const localUikitPackage = path.resolve(webRoot, '../../packages/uikit')

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// const withTM = NextTranspileModules([])

const withVanillaExtract = createVanillaExtractPlugin()

const sentryWebpackPluginOptions =
  process.env.VERCEL_ENV === 'production'
    ? {
        // Additional config options for the Sentry Webpack plugin. Keep in mind that
        // the following options are set automatically, and overriding them is not
        // recommended:
        //   release, url, org, project, authToken, configFile, stripPrefix,
        //   urlPrefix, include, ignore
        silent: false, // Logging when deploying to check if there is any problem
        validate: true,
        // https://github.com/getsentry/sentry-webpack-plugin#options.
      }
    : {
        silent: true, // Suppresses all logs
        // dryRun: !process.env.SENTRY_AUTH_TOKEN,
        dryRun: false,
      }

/** @type {import('next').NextConfig} */
const config = {
  compiler: {
    styledComponents: true,
    // Strip diagnostic log/debug/info calls from production bundles. Warnings
    // and errors remain available for operational troubleshooting.
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  experimental: {
    scrollRestoration: true,
    // The lockfile pins Next 13.0.7, where workspace transpilation still lives
    // under `experimental`. Keeping it here also makes Vercel transpile the
    // source aliases below instead of trying to parse them as published JS.
    transpilePackages: [
      '@pancakeswap/ui',
      '@pancakeswap/uikit',
      '@pancakeswap/swap-sdk-core',
      '@pancakeswap/farms',
      '@pancakeswap/localization',
      '@pancakeswap/hooks',
      '@pancakeswap/multicall',
      '@pancakeswap/token-lists',
      '@pancakeswap/utils',
      '@pancakeswap/tokens',
      '@pancakeswap/smart-router',
      '@wagmi',
      'wagmi',
      '@ledgerhq',
      '@gnosis.pm/safe-apps-wagmi',
    ],
  },
  staticPageGenerationTimeout: 1000,
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-nft.pancakeswap.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      // PP001: canonical public Project Page `/@{slug}` → internal page route
      {
        source: '/@:slug',
        destination: '/project-hq/:slug',
      },
      {
        source: '/@:slug/',
        destination: '/project-hq/:slug/',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/main.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/images/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/fonts/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/banners/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/registry/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Performance cleanup: retire obsolete consumer surfaces instead of
      // mounting the legacy React Router compatibility runtime in every app.
      {
        source: '/ilo/:path*',
        destination: '/list',
        permanent: true,
      },
      {
        source: '/nft/:path*',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/nftmarket/:path*',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/viewNFTs/:path*',
        destination: '/projects',
        permanent: true,
      },
      // The approved contract-first List workspace replaces the old import
      // console, launch interstitial and generic Build Studio consumer pages.
      {
        source: '/import-existing-token',
        destination: '/list',
        permanent: true,
      },
      {
        source: '/launch',
        destination: '/list',
        permanent: true,
      },
      {
        source: '/build-studio',
        destination: '/list',
        permanent: true,
      },
      {
        source: '/farms/history/:path*',
        destination: '/farms?view=my',
        permanent: true,
      },
      {
        source: '/pools/history/:path*',
        destination: '/pools?view=my',
        permanent: true,
      },
      // Founder P0: /trade is the Swap shell (preserve query string).
      {
        source: '/trade',
        destination: '/swap',
        permanent: false,
      },
      {
        source: '/trade/',
        destination: '/swap',
        permanent: false,
      },
      {
        source: '/trade/:path*',
        destination: '/swap/:path*',
        permanent: false,
      },
      // Trending is a ranking layer inside Projects (honest public destination).
      {
        source: '/trending',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/trending/',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      // PP001: legacy project detail → canonical `/@{slug}`
      {
        source: '/projects/:slug',
        destination: '/@:slug',
        permanent: true,
      },
      {
        source: '/projects/:slug/',
        destination: '/@:slug/',
        permanent: true,
      },
      {
        source: '/send',
        destination: '/swap',
        permanent: true,
      },
      {
        source: '/swap/:outputCurrency',
        destination: '/swap?outputCurrency=:outputCurrency',
        permanent: true,
      },
      {
        source: '/create/:currency*',
        destination: '/add/:currency*',
        permanent: true,
      },
      {
        source: '/farms/archived',
        destination: '/farms?view=my',
        permanent: true,
      },
      {
        source: '/pool',
        destination: '/liquidity',
        permanent: true,
      },
      {
        source: '/staking',
        destination: '/pools',
        permanent: true,
      },
      {
        source: '/syrup',
        destination: '/pools',
        permanent: true,
      },
      {
        source: '/nfts',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/info/pools',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/info/pools/:address',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/info',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/info/:path*',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/dex-intelligence',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/dex-intelligence/:path*',
        destination: '/projects?sort=trending',
        permanent: false,
      },
      {
        source: '/radar',
        destination: '/projects?sort=trending',
        permanent: true,
      },
      {
        source: '/radar/:path*',
        destination: '/projects?sort=trending',
        permanent: true,
      },
    ]
  },
  webpack(webpackConfig) {
    // Recovery Wave 2: never bundle a workspace package through a stale
    // worktree symlink. A foreign @pancakeswap/tokens copy duplicated SDK,
    // JSBI, decimal and BN modules in every canonical route.
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@pancakeswap/tokens': localTokensPackage,
      '@pancakeswap/ui-wallets': localUiWalletsPackage,
      '@pancakeswap/uikit': localUikitPackage,
    }
    return webpackConfig
  },
  // webpack: (webpackConfig, { webpack }) => {
  //   // tree shake sentry tracing
  //   webpackConfig.plugins.push(
  //     new webpack.DefinePlugin({
  //       __SENTRY_DEBUG__: false,
  //       __SENTRY_TRACING__: false,
  //     }),
  //   )
  //   return webpackConfig
  // },
}

// export default withBundleAnalyzer(withVanillaExtract(withSentryConfig(withAxiom(config), sentryWebpackPluginOptions)))
export default withBundleAnalyzer(withVanillaExtract(config))
