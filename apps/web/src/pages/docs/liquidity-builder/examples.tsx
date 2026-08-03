import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/examples"
    title="Examples"
    lead="Two common setups founders use with AI Liquidity Builder."
    sections={[
      {
        title: 'Example 1 — New token launch',
        body: (
          <ul>
            <li>
              <strong>Token reserve:</strong> 1M TOKEN
            </li>
            <li>
              <strong>Market:</strong> TOKEN/WBNB
            </li>
            <li>
              <strong>Goal:</strong> Launch Support
            </li>
            <li>
              <strong>Typical strategy:</strong> Balanced or AI Optimized for early formation
            </li>
          </ul>
        ),
      },
      {
        title: 'Example 2 — Existing project',
        body: (
          <ul>
            <li>
              <strong>Markets:</strong> TOKEN/WBNB and TOKEN/USDT (separate programs)
            </li>
            <li>
              <strong>Goal:</strong> Deeper Market
            </li>
            <li>
              <strong>Intent:</strong> Reduce slippage and thicken books across quote assets
            </li>
          </ul>
        ),
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
