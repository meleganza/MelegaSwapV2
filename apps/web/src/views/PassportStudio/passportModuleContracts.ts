/**
 * PASSPORT_ARCHITECTURE_000 — desktop/mobile measurement contracts.
 * Future module missions must validate rendered bounding boxes against these targets.
 */
import { PASSPORT_MODULE_ORDER, passportOne } from './passportTokens'

export type BoxContract = {
  module: string
  widthPx: number
  heightPx: number | null
  minHeightPx?: number
  gapAfterPx: number
  notes?: string
}

export const PASSPORT_DESKTOP_CONTRACTS: BoxContract[] = [
  {
    module: '001-hero-identity',
    widthPx: 1376,
    heightPx: 360,
    gapAfterPx: 16,
    notes: 'Left 616 + gap 40 + right 680',
  },
  {
    module: '002-portfolio',
    widthPx: 1376,
    heightPx: 176,
    gapAfterPx: 16,
  },
  {
    module: '003-assets',
    widthPx: 1376,
    heightPx: 176,
    gapAfterPx: 16,
  },
  {
    module: '004-projects',
    widthPx: 1376,
    heightPx: 176,
    gapAfterPx: 16,
  },
  {
    module: '005-liquidity',
    widthPx: 1376,
    heightPx: null,
    minHeightPx: 232,
    gapAfterPx: 16,
    notes: 'Dense rows; height grows with position count',
  },
  {
    module: '006-activity',
    widthPx: 680,
    heightPx: null,
    gapAfterPx: 0,
    notes: 'Bottom grid left column',
  },
  {
    module: '007-security',
    widthPx: 680,
    heightPx: null,
    gapAfterPx: 0,
    notes: 'Bottom grid right column; 680 + 16 + 680',
  },
]

export const PASSPORT_MOBILE_CONTRACT = {
  viewport: passportOne.mobileCanvas,
  contentWidthPx: 358,
  padXPx: 16,
  order: [
    'hero',
    'identity-card',
    'portfolio',
    'assets',
    'projects',
    'liquidity',
    'activity',
    'security',
  ] as const,
  minTextColumnPx: 280,
  minTouchPx: 44,
}

export const PASSPORT_PAGE_CONTRACT = {
  canvas: passportOne.canvas,
  contentMaxPx: 1376,
  pageInsetPx: 32,
  topAfterTrendingPx: 24,
  moduleGapPx: 16,
  pageBottomPadPx: 48,
  background: passportOne.pageBg,
  moduleOrder: PASSPORT_MODULE_ORDER,
}
