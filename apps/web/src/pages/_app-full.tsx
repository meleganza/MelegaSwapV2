import '@pancakeswap/ui/css/reset.css'
import ResetCSS from '@pancakeswap/uikit/src/ResetCSS'
import ScrollToTopButtonV2 from '@pancakeswap/uikit/src/components/ScrollToTopButton/ScrollToTopButtonV2'
import ToastListener from '@pancakeswap/uikit/src/contexts/ToastsContext/Listener'
import BigNumber from 'bignumber.js'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Script from 'next/script'
import { Fragment, useEffect, useState } from 'react'
import { DefaultSeo } from 'next-seo'
import PageMeta from 'components/Layout/PageMeta'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, useStore } from 'state'
import Blocklist from 'app-shell/Blocklist'
import WalletSessionRuntime from 'app-shell/WalletSessionRuntime'
import { SEO } from '../../next-seo.config'
import { SentryErrorBoundary } from '../components/ErrorBoundary'
import SuspenseWithChunkError from '../components/SuspenseWithChunkError'
import Menu from '../components/Menu'
import Providers from '../Providers'
import GlobalStyle from '../style/Global'
import R107GlobalVisualStyle from 'design-system/melega/R107GlobalVisualStyle'
import MelegaUIKitOverrides from '../style/MelegaUIKitOverrides'
import MelegaTradingOverrides from '../style/MelegaTradingOverrides'
import { CHAIN_IDS } from 'utils/wagmi'
import { useRouteTransitionRecovery } from 'hooks/useRouteTransitionRecovery'
import type { NextPageWithLayout } from './_app-types'

const GlobalRuntimeHooks = dynamic(() => import('app-shell/GlobalRuntimeHooks'), { ssr: false })
const NetworkModal = dynamic(() => import('components/NetworkModal').then((module) => module.NetworkModal), {
  ssr: false,
})
const TransactionsDetailModal = dynamic(() => import('components/TransactionDetailModal'), { ssr: false })
const GlobalUpdaters = dynamic(() => import('app-shell/GlobalUpdaters'), { ssr: false })

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
  clientRuntimeReady: boolean
}

const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? SentryErrorBoundary : Fragment

const App = ({ Component, pageProps, clientRuntimeReady }: AppPropsWithLayout) => {
  useRouteTransitionRecovery()
  const hideMenu = Component.hideMenu || Component.pure

  if (hideMenu) {
    return (
      <ProductionErrorBoundary>
        <SuspenseWithChunkError fallback={null}>
          <Component {...pageProps} />
        </SuspenseWithChunkError>
        <ToastListener />
        {clientRuntimeReady && !Component.hideNetworkModal ? (
          <NetworkModal pageSupportedChains={Component.chains ?? CHAIN_IDS} />
        ) : null}
        {clientRuntimeReady ? <TransactionsDetailModal /> : null}
      </ProductionErrorBoundary>
    )
  }

  const Layout = Component.Layout || Fragment
  const ShowMenu = Component.mp ? Fragment : Menu
  const isShowScrollToTopButton = Component.isShowScrollToTopButton ?? true

  return (
    <ProductionErrorBoundary>
      <ShowMenu>
        <Layout>
          <SuspenseWithChunkError fallback={null}>
            <Component {...pageProps} />
          </SuspenseWithChunkError>
        </Layout>
      </ShowMenu>
      <ToastListener />
      {clientRuntimeReady ? <NetworkModal pageSupportedChains={Component.chains ?? CHAIN_IDS} /> : null}
      {clientRuntimeReady ? <TransactionsDetailModal /> : null}
      {isShowScrollToTopButton && <ScrollToTopButtonV2 />}
    </ProductionErrorBoundary>
  )
}

export default function FullMyApp(props: AppProps<{ initialReduxState: any }>) {
  const { pageProps, Component } = props
  const store = useStore(pageProps.initialReduxState)
  const [globalRuntimeReady, setGlobalRuntimeReady] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.melegaHydrated = 'true'
    return () => {
      delete document.documentElement.dataset.melegaHydrated
    }
  }, [])

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(() => setGlobalRuntimeReady(true), { timeout: 1200 })
      return () => idleWindow.cancelIdleCallback?.(idleHandle)
    }

    const timeoutHandle = window.setTimeout(() => setGlobalRuntimeReady(true), 250)
    return () => window.clearTimeout(timeoutHandle)
  }, [])

  const app = <App {...props} clientRuntimeReady={globalRuntimeReady} />

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
          <WalletSessionRuntime miniProgram={Boolean(Component.mp)} />
          {globalRuntimeReady ? <GlobalRuntimeHooks miniProgram={Boolean(Component.mp)} /> : null}
          <ResetCSS />
          <GlobalStyle />
          <R107GlobalVisualStyle />
          <MelegaUIKitOverrides />
          <MelegaTradingOverrides />
          {globalRuntimeReady ? (
            <PersistGate loading={null} persistor={persistor}>
              <GlobalUpdaters />
            </PersistGate>
          ) : null}
          {app}
        </Blocklist>
      </Providers>
      {process.env.NEXT_PUBLIC_GTAG ? (
        <Script
          strategy="lazyOnload"
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
      ) : null}
    </>
  )
}
