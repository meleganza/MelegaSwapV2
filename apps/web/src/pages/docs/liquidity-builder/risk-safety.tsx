import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/risk-safety"
    title="Risk & Safety"
    lead="Liquidity growth is not a price guarantee. Know the limits and safety controls."
    sections={[
      {
        title: 'What Liquidity Builder does not guarantee',
        body: (
          <ul>
            <li>Liquidity does not guarantee price appreciation.</li>
            <li>Market conditions change — volume and volatility can shift quickly.</li>
            <li>Strategies optimize execution and liquidity growth, not token price.</li>
          </ul>
        ),
      },
      {
        title: 'Pause / safety mechanisms',
        body: (
          <p>
            Programs can be paused or stopped from the product when you need to halt further activity. Use pause when
            market conditions are uncertain or you want to review settings before continuing. Always confirm wallet
            transactions yourself.
          </p>
        ),
      },
      {
        title: 'Founder checklist',
        body: (
          <ul>
            <li>Size Token Reserve carefully.</li>
            <li>Match goal and strategy to your stage (launch vs deepen).</li>
            <li>Monitor the portfolio after activation.</li>
            <li>Pause if something looks wrong.</li>
          </ul>
        ),
        expandable: true,
        summary: 'Practical safety habits',
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
