/**
 * RC2 User Journey definitions — product UX only.
 * No protocol / payment / contract changes.
 */

export type JourneyId = 'founder' | 'investor' | 'liquidity_manager'

export type JourneyStepId =
  | 'landing'
  | 'create_token'
  | 'liquidity'
  | 'create_farm'
  | 'featured'
  | 'trend_boost'
  | 'project_page'
  | 'done'
  | 'trending'
  | 'buy_token'
  | 'add_to_wallet'
  | 'farm'
  | 'pool'
  | 'portfolio'
  | 'programs'
  | 'analytics'
  | 'documentation'
  | 'create_program'

export type JourneyStep = {
  id: JourneyStepId
  label: string
  href: string
  hereCopy: string
  nextCopy: string
}

export type JourneyDefinition = {
  id: JourneyId
  title: string
  subtitle: string
  steps: JourneyStep[]
}

export const FOUNDER_JOURNEY: JourneyDefinition = {
  id: 'founder',
  title: 'Founder path',
  subtitle: 'Launch → seed → earn → promote → project page',
  steps: [
    {
      id: 'landing',
      label: 'Start',
      href: '/list',
      hereCopy: 'Choose how you want to list or create on Melega.',
      nextCopy: 'Create your token next.',
    },
    {
      id: 'create_token',
      label: 'Create Token',
      href: '/list',
      hereCopy: 'Configure and deploy your token on BNB Smart Chain.',
      nextCopy: 'Add liquidity so people can trade it.',
    },
    {
      id: 'liquidity',
      label: 'Liquidity',
      href: '/liquidity-studio',
      hereCopy: 'Seed a market with factual liquidity.',
      nextCopy: 'Create a farm to reward LPs.',
    },
    {
      id: 'create_farm',
      label: 'Create Farm',
      href: '/farms',
      hereCopy: 'Set up farming rewards for your LP.',
      nextCopy: 'Get Featured on Home for visibility.',
    },
    {
      id: 'featured',
      label: 'Featured',
      href: '/list',
      hereCopy: 'Optional Home Featured placement packages.',
      nextCopy: 'Boost Trending visibility next.',
    },
    {
      id: 'trend_boost',
      label: 'Trend Boost',
      href: '/list',
      hereCopy: 'Optional Trending surface boost packages.',
      nextCopy: 'Open your Project Page to finish.',
    },
    {
      id: 'project_page',
      label: 'Project Page',
      href: '/projects',
      hereCopy: 'Your public project home — trade, farms, and identity.',
      nextCopy: 'You’re set. Share your project page.',
    },
    {
      id: 'done',
      label: 'Done',
      href: '/projects',
      hereCopy: 'Launch path complete.',
      nextCopy: 'Explore Trending or manage liquidity anytime.',
    },
  ],
}

export const INVESTOR_JOURNEY: JourneyDefinition = {
  id: 'investor',
  title: 'Investor path',
  subtitle: 'Discover → project → buy → earn',
  steps: [
    {
      id: 'landing',
      label: 'Home',
      href: '/',
      hereCopy: 'Discover movers, Featured projects, and swap.',
      nextCopy: 'Open Trending to find live opportunities.',
    },
    {
      id: 'trending',
      label: 'Trending',
      href: '/trending',
      hereCopy: 'Live ranked assets from Melega markets.',
      nextCopy: 'Open a Project Page to learn more.',
    },
    {
      id: 'project_page',
      label: 'Project',
      href: '/projects',
      hereCopy: 'Review identity, market, and earn venues.',
      nextCopy: 'Buy the token when you’re ready.',
    },
    {
      id: 'buy_token',
      label: 'Buy',
      href: '/trade',
      hereCopy: 'Swap into the token on Melega.',
      nextCopy: 'Add the token to your wallet for easy access.',
    },
    {
      id: 'add_to_wallet',
      label: 'Wallet',
      href: '/project-hq/marco',
      hereCopy: 'Add contract to your wallet from the Project Page.',
      nextCopy: 'Stake in a Farm if rewards are live.',
    },
    {
      id: 'farm',
      label: 'Farm',
      href: '/farms',
      hereCopy: 'Earn rewards by farming LP.',
      nextCopy: 'Or stake in a Pool for single-sided yield.',
    },
    {
      id: 'pool',
      label: 'Pool',
      href: '/pools',
      hereCopy: 'Stake single assets in pools.',
      nextCopy: 'You’re earning. Check Passport anytime.',
    },
    {
      id: 'done',
      label: 'Done',
      href: '/passport',
      hereCopy: 'Positions and identity live in Passport.',
      nextCopy: 'Return to Trending for the next idea.',
    },
  ],
}

export const LIQUIDITY_MANAGER_JOURNEY: JourneyDefinition = {
  id: 'liquidity_manager',
  title: 'Liquidity Manager path',
  subtitle: 'Portfolio → programs → analytics → docs → create',
  steps: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      href: '/liquidity-studio?view=building',
      hereCopy: 'See your Liquidity Builder programs and status.',
      nextCopy: 'Open a program to manage it.',
    },
    {
      id: 'programs',
      label: 'Programs',
      href: '/liquidity-studio?view=building',
      hereCopy: 'Manage active building programs.',
      nextCopy: 'Review analytics for performance.',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/liquidity-studio',
      hereCopy: 'Liquidity snapshot and position health.',
      nextCopy: 'Read documentation before creating a new program.',
    },
    {
      id: 'documentation',
      label: 'Docs',
      href: '/docs/liquidity-builder',
      hereCopy: 'How Liquidity Builder works, fees, and safety.',
      nextCopy: 'Create a new program when ready.',
    },
    {
      id: 'create_program',
      label: 'Create',
      href: '/liquidity-studio?view=building',
      hereCopy: 'Start a new Liquidity Builder program.',
      nextCopy: 'Return to Portfolio to monitor it.',
    },
  ],
}

export const ALL_JOURNEYS = [FOUNDER_JOURNEY, INVESTOR_JOURNEY, LIQUIDITY_MANAGER_JOURNEY] as const

export function getJourney(id: JourneyId): JourneyDefinition {
  if (id === 'founder') return FOUNDER_JOURNEY
  if (id === 'investor') return INVESTOR_JOURNEY
  return LIQUIDITY_MANAGER_JOURNEY
}

export function getJourneyStep(journey: JourneyDefinition, stepId: JourneyStepId): JourneyStep {
  return journey.steps.find((s) => s.id === stepId) ?? journey.steps[0]
}

export function getNextStep(journey: JourneyDefinition, stepId: JourneyStepId): JourneyStep | null {
  const idx = journey.steps.findIndex((s) => s.id === stepId)
  if (idx < 0 || idx >= journey.steps.length - 1) return null
  return journey.steps[idx + 1]
}

/** Map pathname → suggested journey + current step for auto rails. */
export function resolveJourneyContext(pathname: string): {
  journeyId: JourneyId
  stepId: JourneyStepId
} | null {
  const p = pathname.split('?')[0] || '/'
  if (p === '/list' || p.startsWith('/build-studio') || p === '/import-existing-token') {
    return { journeyId: 'founder', stepId: 'create_token' }
  }
  if (p.startsWith('/liquidity-studio') || p === '/liquidity') {
    return { journeyId: 'liquidity_manager', stepId: 'portfolio' }
  }
  if (p.startsWith('/docs/liquidity-builder') || p === '/docs') {
    return { journeyId: 'liquidity_manager', stepId: 'documentation' }
  }
  if (p.startsWith('/farms')) {
    return { journeyId: 'founder', stepId: 'create_farm' }
  }
  if (p.startsWith('/pools')) {
    return { journeyId: 'investor', stepId: 'pool' }
  }
  if (p === '/trending') {
    return { journeyId: 'investor', stepId: 'trending' }
  }
  if (p.startsWith('/project-hq') || p.startsWith('/projects') || p.startsWith('/@')) {
    return { journeyId: 'investor', stepId: 'project_page' }
  }
  if (p === '/trade' || p.startsWith('/trade/') || p === '/swap') {
    return { journeyId: 'investor', stepId: 'buy_token' }
  }
  if (p === '/' ) {
    return { journeyId: 'investor', stepId: 'landing' }
  }
  if (p.startsWith('/passport') || p.startsWith('/portfolio') || p.startsWith('/command-center')) {
    return { journeyId: 'investor', stepId: 'done' }
  }
  return null
}
