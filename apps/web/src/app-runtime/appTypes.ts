import type { NextPage } from 'next'

export type NextPageWithLayout = NextPage & {
  Layout?: React.FC<React.PropsWithChildren<unknown>>
  pure?: true
  hideMenu?: true
  hideNetworkModal?: true
  /** Skip Providers, vanilla-extract CSS, AppShell — inline-only emergency surface */
  barePage?: true
  mp?: boolean
  chains?: number[]
  isShowScrollToTopButton?: true
  /** Client-updating pages that must not hydrate inside a dehydrated Suspense boundary. */
  disablePageSuspense?: true
  Meta?: React.FC<any>
}
