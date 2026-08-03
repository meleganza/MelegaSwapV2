import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/execution"
    title="Execution Model"
    lead="How AI Liquidity Builder operates day to day — without the deep technical internals."
    sections={[
      {
        title: 'How it operates',
        body: (
          <p>
            Once active, your program reviews market conditions and grows liquidity from your Token Reserve
            according to your goal and strategy. You do not manually rebalance each step — you monitor progress
            in the portfolio and can pause when needed.
          </p>
        ),
      },
      {
        title: 'Key ideas (plain language)',
        body: (
          <ul>
            <li>
              <strong>Execution</strong> — when the program acts to add or adjust liquidity using reserve.
            </li>
            <li>
              <strong>Market conditions</strong> — trading volume, volatility, and how deep the pair already is.
            </li>
            <li>
              <strong>Liquidity depth</strong> — how much size traders can move with less slippage.
            </li>
            <li>
              <strong>Price impact</strong> — how much a trade moves the price; strategies trade off speed vs impact.
            </li>
          </ul>
        ),
      },
      {
        title: 'What this is not',
        body: (
          <p>
            Execution optimizes liquidity growth under your settings. It does not control or guarantee token
            price. See Risk &amp; Safety for more.
          </p>
        ),
        expandable: true,
        summary: 'Price vs liquidity',
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
