import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/strategies"
    title="Strategies"
    lead="Strategies control how assertively Token Reserve is used as markets move."
    sections={[
      {
        title: 'Conservative',
        body: (
          <ul>
            <li>Lower execution frequency</li>
            <li>Stability focused</li>
            <li>Prefer slower, careful liquidity deployment</li>
          </ul>
        ),
      },
      {
        title: 'Balanced',
        body: (
          <ul>
            <li>Liquidity growth + stability</li>
            <li>Default middle path for most projects</li>
          </ul>
        ),
      },
      {
        title: 'AI Optimized',
        body: (
          <>
            <p>Dynamic adaptation based on:</p>
            <ul>
              <li>volume</li>
              <li>volatility</li>
              <li>liquidity conditions</li>
            </ul>
          </>
        ),
      },
      {
        title: 'Aggressive',
        body: (
          <ul>
            <li>Faster liquidity deployment</li>
            <li>Higher market impact tolerance</li>
          </ul>
        ),
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
