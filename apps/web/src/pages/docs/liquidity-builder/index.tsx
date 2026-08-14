import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const HUB_CARDS = [
  {
    href: '/docs/liquidity-builder/overview',
    title: 'Overview',
    body: 'What AI Liquidity Builder is, why liquidity matters, and who it is for.',
  },
  {
    href: '/docs/liquidity-builder/how-it-works',
    title: 'How it Works',
    body: 'From choosing a token to activating a program and monitoring your portfolio.',
  },
  {
    href: '/docs/liquidity-builder/token-reserve',
    title: 'Token Reserve',
    body: 'How much of your project token you allocate for automated liquidity growth.',
  },
  {
    href: '/docs/liquidity-builder/liquidity-goals',
    title: 'Liquidity Goals',
    body: 'Steady Growth, Deeper Market, and Launch Support — choose your market intent.',
  },
  {
    href: '/docs/liquidity-builder/strategies',
    title: 'Strategies',
    body: 'Conservative, Balanced, AI Optimized, and Aggressive execution styles.',
  },
  {
    href: '/docs/liquidity-builder/execution',
    title: 'Execution Model',
    body: 'How programs review markets and grow liquidity from real demand.',
  },
  {
    href: '/docs/liquidity-builder/fees',
    title: 'Fees',
    body: 'Protocol success fee path from program activity to MELEGA TREASURY.',
  },
  {
    href: '/docs/liquidity-builder/risk-safety',
    title: 'Risk & Safety',
    body: 'What Liquidity Builder does and does not guarantee — pause and safety controls.',
  },
  {
    href: '/docs/liquidity-builder/examples',
    title: 'Examples',
    body: 'New token launch and existing project multi-market setups.',
  },
]

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder"
    title="AI Liquidity Builder"
    lead="Automatically grow and optimize your token liquidity."
    showHeroEyebrow
    hubCards={HUB_CARDS}
    sections={[
      {
        title: 'Start here',
        body: (
          <>
            <p>
              This knowledge center explains AI Liquidity Builder in plain language so project founders can set up and
              manage liquidity programs without external support.
            </p>
            <p>Open a topic above, or go straight to the product to create your first program.</p>
          </>
        ),
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
