import '@pancakeswap/ui/css/reset.css'
import { ResetCSS, ScrollToTopButtonV2, ToastListener } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { NetworkModal } from 'components/NetworkModal'
import TransactionsDetailModal from 'components/TransactionDetailModal'
import { useAccountEventListener } from 'hooks/useAccountEventListener'
import useEagerConnect from 'hooks/useEagerConnect'
import useEagerConnectMP from 'hooks/useEagerConnect.bmp'
import useSentryUser from 'hooks/useSentryUser'
import useThemeCookie from 'hooks/useThemeCookie'
import useUserAgent from 'hooks/useUserAgent'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Script from 'next/script'
import { Fragment } from 'react'
import { DefaultSeo } from 'next-seo'
import { PageMeta } from 'components/Layout/Page'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, useStore } from 'state'
import { usePollBlockNumber } from 'state/block/hooks'
import { Blocklist, Updaters } from '..'
import { SEO } from '../../next-seo.config'
import { SentryErrorBoundary } from '../components/ErrorBoundary'
import Menu from '../components/Menu'
import Providers from '../Providers'
import GlobalStyle from '../style/Global'
import R107GlobalVisualStyle from 'design-system/melega/R107GlobalVisualStyle'
import MelegaUIKitOverrides from '../style/MelegaUIKitOverrides'
import MelegaTradingOverrides from '../style/MelegaTradingOverrides'
import { BrowserRouter as Router } from 'react-router-dom'
import { CHAIN_IDS } from 'utils/wagmi'
import type { NextPageWithLayout } from './_app-types'

const EasterEgg = dynamic(() => import('components/EasterEgg'), { ssr: false })

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

function GlobalHooks() {
  usePollBlockNumber()
  useEagerConnect()
  useUserAgent()
  useAccountEventListener()
  useSentryUser()
  useThemeCookie()
  return null
}

function MPGlobalHooks() {
  usePollBlockNumber()
  useEagerConnectMP()
  useUserAgent()
  useAccountEventListener()
  useSentryUser()
  return null
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? SentryErrorBoundary : Fragment

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const hideMenu = Component.hideMenu || Component.pure

  if (hideMenu) {
    return (
      <ProductionErrorBoundary>
        <Component {...pageProps} />
        <ToastListener />
        {!Component.hideNetworkModal && (
          <NetworkModal pageSupportedChains={Component.chains ?? CHAIN_IDS} />
        )}
        <TransactionsDetailModal />
      </ProductionErrorBoundary>
    )
  }

  const Layout = Component.Layout || Fragment
  const ShowMenu = Component.mp ? Fragment : Menu
  const isShowScrollToTopButton = Component.isShowScrollToTopButton || true

  return (
    <ProductionErrorBoundary>
      <ShowMenu>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ShowMenu>
      <EasterEgg iterations={2} />
      <ToastListener />
      <NetworkModal pageSupportedChains={Component.chains} />
      <TransactionsDetailModal />
      {isShowScrollToTopButton && <ScrollToTopButtonV2 />}
    </ProductionErrorBoundary>
  )
}

export default function FullMyApp(props: AppProps<{ initialReduxState: any }>) {
  const { pageProps, Component } = props
  const store = useStore(pageProps.initialReduxState)

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Melega DEX — AI-native liquidity on BSC, Base, Ethereum, and Polygon. Swap, liquidity, farms, and pools with classic DEX compatibility."
        />
        <meta name="theme-color" content="#000000" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        {Component.mp && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script src="https://public.bnbstatic.com/static/js/mp-webview-sdk/webview-v1.0.0.min.js" id="mp-webview" />
        )}
        <meta name="twitter:image" content="https://melega.finance/main.jpg" />
      </Head>
      <DefaultSeo {...SEO} />
      <Providers store={store}>
        <PageMeta />
        {Component.Meta && <Component.Meta {...pageProps} />}
        <Blocklist>
          {Component.mp ? <MPGlobalHooks /> : <GlobalHooks />}
          <ResetCSS />
          <GlobalStyle />
          <R107GlobalVisualStyle />
          <MelegaUIKitOverrides />
          <MelegaTradingOverrides />
          <PersistGate loading={null} persistor={persistor}>
            <Updaters />
            <Router>
              <App {...props} />
            </Router>
          </PersistGate>
        </Blocklist>
      </Providers>
      <Script
        strategy="afterInteractive"
        id="google-tag"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${process.env.NEXT_PUBLIC_GTAG}');
          `,
        }}
      />
    </>
  )
}
