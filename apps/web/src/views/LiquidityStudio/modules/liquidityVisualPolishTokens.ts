/**
 * LIQUIDITY_MODULE_008 — Final Visual Polish tokens + freeze guards.
 * Style layer only. No geometry tokens that alter Modules 001–007 boxes.
 */

import { LIQUIDITY_FOUNDER_MOCKUP } from '../liquidityArchitecture000Contracts'

export const liquidityVisualPolish = {
  moduleId: '008-visual-polish',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  mockupSha256: LIQUIDITY_FOUNDER_MOCKUP.sha256,

  /** Restrained gold (Pools / Farms / Smart Swap parity) — focus / accent only */
  gold: '#C9A84A',
  goldHover: '#D4B45C',
  goldFocus: 'rgba(201, 168, 74, 0.55)',
  goldFocusSoft: 'rgba(201, 168, 74, 0.45)',

  canvas: '#0D0D0D',
  cardBg: 'rgba(18, 18, 18, 0.98)',
  borderSoft: 'rgba(255, 255, 255, 0.05)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  insetHighlight: 'rgba(255, 255, 255, 0.03)',
  cardShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
  cardRadius: '14px',

  transitionMs: '120ms',
  transitionEase: 'ease',

  focusOutline: '2px solid rgba(201, 168, 74, 0.55)',
  focusOffset: '2px',

  scope: '[data-liquidity-studio-screen]',
} as const

/** Frozen Module 001 sources (byte-identical at Module 007 tip). */
export const LIQUIDITY_MODULE_001_FREEZE_SHA256 = {
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  LiquidityHeroArtwork: '34e498efc7dc9f658109284b65c4334712affacb40ba3309cc00efe23f59b0d4',
  LiquidityHeroTrustPanel: 'd53f80dc0a97bdb24ab67838beda773a4b08ac5f456d2c0763b531e4734d3039',
  liquidityHeroTokens: '1ea3821c2671f9517679cdb6cd49492bc96aa334c9a492c00cc84377b84de038',
} as const

export const LIQUIDITY_MODULE_002_FREEZE_SHA256 = {
  LiquidityActionsModule: '98a6bf8243c57841959b6fff3d2110fd03ee9a8065de2c30f95c7d9a65c36b80',
  liquidityActionsTokens: '2913c12cc629f7eda2ca85ac1762ab5a760eedec6c09a7c776833b86b7fd6c54',
} as const

export const LIQUIDITY_MODULE_003_FREEZE_SHA256 = {
  LiquidityPoolDiscoveryModule: '574a3fc626f9219d5cdfa155b7daec2beffaacd8c1fd52211dac472c9ddaf2d9',
  LiquidityPoolDiscoveryCard: 'd2eeb8cf7a3af2b18d82ecbb22e1a3077a385bf3a582693bc9ef382f7363e8b1',
  liquidityPoolDiscoveryTokens: '6b97bbabf738fd6044a89430cbc06374e1321e10542b05dd0b8be2dfbc557648',
  liquidityPoolDiscoveryModel: '7611bdbf9aad0ee8d53d615a82427282e8430e2f09500a5375211646c8b70bb0',
  useLiquidityPoolDiscovery: '63c17d0851fbd057875a7575be853a15631f16e1ba3b6d90f13a16d25dc38407',
} as const

export const LIQUIDITY_MODULE_004_FREEZE_SHA256 = {
  LiquidityAddModule: '905d9fedce79455de9e46b50e1077aa5e2098a6a76c73705e96d4117730eeeb5',
  liquidityAddTokens: '5377efc9eaa232b6aa891aca95739e6e14b5ed9cca998f376071e5412fdb0c4a',
  liquidityAddCta: '8e52413c0747a90d5efbc44d4a497ed0bd6e39fb22c51fbb690772c9fa17ddc8',
} as const

export const LIQUIDITY_MODULE_005_FREEZE_SHA256 = {
  LiquidityMarketSnapshotModule: '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  liquidityMarketSnapshotTokens: 'c131932841f7dd37c423725aba37aabeb1e84a3ab6f562c1f8ab61937ee46bfb',
  buildLiquidityMarketSnapshot: '462f558ff46095d01ecc4d66d60296526aafc89221d4529e7de10c94a963d6f3',
  useLiquidityMarketSnapshot: 'f8713ef2a30e6a3b92ebad6db648888cae99b81bce9dc88c6d6c56b8716f3bf1',
} as const

export const LIQUIDITY_MODULE_006_FREEZE_SHA256 = {
  LiquidityMyPositionsModule: '2f3c1c799bc8828dc76a20dad70905b6750918639dc781d351f5f0e71a71c137',
  liquidityMyPositionsTokens: '33b081dfd9552b681cde226f42ee838366a31fbe6fd7d4b7e3c6de85309c13b3',
  liquidityMyPositionsModel: 'd5d84e53426afb8d870aae39cd9e0633a544b5adebe7047282b4f4a507b19139',
} as const

export const LIQUIDITY_MODULE_007_FREEZE_SHA256 = {
  LiquidityAnalyticsModule: 'ba1c06bfa3d7bfd49e75e89e4d9dd1b1fbd6518e52e20e8fef07d69db569e7e1',
  liquidityAnalyticsTokens: 'cd4539fff150f95e0091c32a47855c57526c3c3095619b395152e6ff997a110e',
  buildLiquidityAnalytics: '5e302f2204c34184e4e9a4da4467ad0c15d453299955f83dee297f2b46c0a5be',
  useLiquidityAnalytics: 'a80da07df2c00ceac70491bd860bec1068668f490a6b45abee27676572c46e27',
} as const

export const LIQUIDITY_RUNTIME_FREEZE_SHA256 = {
  useLiquidityMintRuntime: 'e65b9d46ec6d0502fa1a7c7de9f44f334a5905bb5d09977aeb3cc4ae52a8b16b',
  LiquidityRuntimeContext: '1c17119c192b27c82e4c3d1b84a4be3c278740fc1d8ef63a18b5254de6521515',
} as const

export const LIQUIDITY_ARCHITECTURE_000_TIP = 'e9708c78' as const
export const LIQUIDITY_MODULE_007_TIP = '7de01db4' as const
