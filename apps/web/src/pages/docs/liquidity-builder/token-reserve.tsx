import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/token-reserve"
    title="Token Reserve"
    lead="Token Reserve is the amount of project token allocated to Liquidity Builder."
    sections={[
      {
        title: 'What Token Reserve means',
        body: (
          <>
            <p>
              Your <strong>Token Reserve</strong> is how many of your project tokens the program may use to grow
              liquidity. You choose the amount; the strategy decides how that reserve is applied over time.
            </p>
            <p>We call this Token Reserve only — not Budget, Liquidity Budget, or Capital.</p>
          </>
        ),
      },
      {
        title: 'Example',
        body: (
          <p>
            A founder allocates <strong>1,000,000 TOKEN</strong> as Token Reserve. That reserve is used according to the
            selected strategy (Conservative, Balanced, AI Optimized, or Aggressive) and liquidity goal.
          </p>
        ),
      },
      {
        title: 'How reserve is used',
        body: (
          <p>
            Reserve is deployed into liquidity according to your strategy and market conditions. Unused reserve stays
            available to the program until the strategy spends it or you pause/stop the program under the product rules.
          </p>
        ),
        expandable: true,
        summary: 'More detail on reserve usage',
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
