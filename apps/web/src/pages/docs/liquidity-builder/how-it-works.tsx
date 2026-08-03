import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/how-it-works"
    title="How it Works"
    lead="Seven clear steps from token selection to portfolio monitoring."
    sections={[
      {
        title: '1. Choose Token to Grow',
        body: (
          <p>
            Search a listed Melega token or paste a contract address. This is the project token whose market
            you want to grow.
          </p>
        ),
      },
      {
        title: '2. Choose Market',
        body: (
          <p>
            Pick the quote asset to create market against: <strong>WBNB</strong>, <strong>USDT</strong>, or{' '}
            <strong>USDC</strong> (when enabled). Each pair (for example TOKEN/WBNB) can be its own program.
          </p>
        ),
      },
      {
        title: '3. Allocate Token Reserve',
        body: (
          <p>
            Enter how much of your project token the program may use. This is your <strong>Token Reserve</strong>
            — not a WBNB budget.
          </p>
        ),
      },
      {
        title: '4. Choose Goal',
        body: (
          <p>
            Select Steady Growth, Deeper Market, or Launch Support so the product can present the right intent
            for your stage.
          </p>
        ),
      },
      {
        title: '5. Choose Strategy',
        body: (
          <p>
            Pick Conservative, Balanced, AI Optimized, or Aggressive to control how assertively liquidity is
            deployed as markets move.
          </p>
        ),
      },
      {
        title: '6. Activate Program',
        body: (
          <p>
            Review your choices, then confirm the wallet steps: create the program, approve tokens, deposit
            reserve, and activate. You approve every step.
          </p>
        ),
      },
      {
        title: '7. Monitor Portfolio',
        body: (
          <p>
            After activation you return to <strong>My Liquidity Programs</strong>. Open any program to see
            reserve, strategy, status, and activity — or create another program for a different market.
          </p>
        ),
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
