import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/overview"
    title="Overview"
    lead="AI Liquidity Builder helps you grow and optimize market liquidity for your token — automatically."
    sections={[
      {
        title: 'What is AI Liquidity Builder?',
        body: (
          <>
            <p>
              AI Liquidity Builder is a Melega product that turns your project token into a managed liquidity
              growth program. You allocate a <strong>Token Reserve</strong>, choose a market and strategy, and
              activate. The system then grows liquidity according to your goals — you keep ownership of LP.
            </p>
            <p>
              You deposit your token reserve. AI manages the liquidity growth strategy under the rules you set.
            </p>
          </>
        ),
      },
      {
        title: 'Why liquidity matters',
        body: (
          <p>
            Healthy liquidity makes it easier for people to buy and sell your token with less slippage. Thin
            markets frustrate traders and slow adoption. Liquidity Builder focuses on growing that market depth
            over time from real demand — not on promising price.
          </p>
        ),
      },
      {
        title: 'Who should use it',
        body: (
          <ul>
            <li>
              <strong>New token projects</strong> — form an initial market with Launch Support.
            </li>
            <li>
              <strong>Existing projects</strong> — deepen TOKEN/WBNB, TOKEN/USDT, or TOKEN/USDC markets.
            </li>
            <li>
              <strong>Ecosystem teams</strong> — run parallel programs across tokens in one portfolio.
            </li>
            <li>
              <strong>Liquidity managers</strong> — monitor multiple programs and pause when needed.
            </li>
          </ul>
        ),
      },
      {
        title: 'The simple idea',
        body: (
          <p>
            Choose Token to Grow → pick a quote market → allocate Token Reserve → set a Liquidity Goal and
            Strategy → activate → monitor in your AI Liquidity Portfolio.
          </p>
        ),
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
