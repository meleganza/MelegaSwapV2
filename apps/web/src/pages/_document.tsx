/* eslint-disable jsx-a11y/iframe-has-title */
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

const StaticAppBootShell = () => (
  <div
    data-melega-app-boot-shell="true"
    role="status"
    aria-label="Loading Melega DEX"
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2147480000,
      display: 'grid',
      placeItems: 'center',
      background: '#050607',
      color: '#f4c430',
      fontFamily: 'Inter, system-ui, sans-serif',
      transition: 'opacity 160ms ease, visibility 160ms ease',
    }}
  >
    <style>{`
      html[data-melega-hydrated=true] [data-melega-app-boot-shell=true] {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
      @media (prefers-reduced-motion: reduce) {
        [data-melega-app-boot-shell=true] { transition: none !important; }
      }
    `}</style>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 700 }}>
      <img
        src="/images/melega.png"
        alt=""
        width="38"
        height="38"
        style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: '50%' }}
      />
      <span>
        Melega <span style={{ color: '#f4c430' }}>DEX</span>
      </span>
    </div>
  </div>
)

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      // eslint-disable-next-line no-param-reassign
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html translate="no">
        <Head>
          {process.env.NEXT_PUBLIC_NODE_PRODUCTION && (
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_NODE_PRODUCTION} />
          )}
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta
            name="description"
            content="Melega DEX — AI-native liquidity on BSC, Base, Ethereum, and Polygon. Swap, liquidity, farms, and pools with classic DEX compatibility."
          />

          {/* Open Graph tags */}
          <meta property="og:title" content="Melega DEX" />
          <meta
            property="og:description"
            content="Melega DEX — AI-native liquidity on BSC, Base, Ethereum, and Polygon. Swap, liquidity, farms, and pools with classic DEX compatibility."
          />
          <meta property="og:image" content="https://melega.finance/main.jpg" />
          <meta property="og:url" content="https://melega.finance" />
          <meta property="og:type" content="website" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Melega DEX" />
          <meta
            name="twitter:description"
            content="Melega DEX — AI-native liquidity on BSC, Base, Ethereum, and Polygon. Swap, liquidity, farms, and pools with classic DEX compatibility."
          />
          <meta name="twitter:image" content="https://melega.finance/main.jpg" />
          <meta name="twitter:url" content="https://melega.finance" />

          {/* Typography is served locally from /public/fonts to avoid render-blocking third-party requests. */}
          <link
            rel="preload"
            href="/fonts/inter/inter-v12-latin-regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/relative/relative-book-pro.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/main.jpg" />
          <link rel="manifest" href="/manifest.json" />
          <script
            src="https://marco.melega.ai/widgets/marco.js"
            data-marco-site="dsk_fcbd4464eb8347ae8ae7472700eec0d6"
            data-marco-widget-src="https://marco.melega.ai/widgets/marco.js"
            defer
          />
          <script
            src="https://marco.melega.ai/widgets/marco-pay-mark.v1.js"
            data-marco-widget-src="https://marco.melega.ai/widgets/marco-pay-mark.v1.js"
            defer
          />
        </Head>
        <body>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTAG}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          <Main />
          <StaticAppBootShell />
          <NextScript />
          <div id="portal-root" />
        </body>
      </Html>
    )
  }
}

export default MyDocument
