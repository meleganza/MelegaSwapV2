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
  LiquidityHeroModule: '71a7ee43763f83d8b4f144cf7d6dd6e40777a7f3c4800b09ff070a707bfa55ab',
  LiquidityHeroArtwork: 'ee0bc5a66df5db37b3d0d323defaef5310a836cefb71dac2d529e367988dbea9',
  LiquidityHeroTrustPanel: 'd53f80dc0a97bdb24ab67838beda773a4b08ac5f456d2c0763b531e4734d3039',
  liquidityHeroTokens: 'ae84a154ea08b22539b9471329bda8bb972388db3a4f8f63f06425543cee1080',
} as const

export const LIQUIDITY_MODULE_002_FREEZE_SHA256 = {
  LiquidityActionsModule: '01d5fa4364085d252eacdd59986b524dfe11da59b49a6978c216f34bfab83cec',
  liquidityActionsTokens: 'f7cc179e4c8bf99d62f3a496458290e913c6d4957677fb82ff89073b9665dbda',
} as const

export const LIQUIDITY_MODULE_003_FREEZE_SHA256 = {
  LiquidityPoolDiscoveryModule: '3312204303acea13261064b882a821f3a3953a13cbbe8dd340e2f121e5aef297',
  LiquidityPoolDiscoveryCard: '3f04c6b3a416fda96cd8911c5058e68504c8ab43c56b33f8813cfc572093d5e4',
  liquidityPoolDiscoveryTokens: '1c149aebb0a885b5c1dd9d2796a714d6fecfc6dadf32546451e72959d7900965',
  liquidityPoolDiscoveryModel: 'eb2c7b03b036d8b01cde394f556a71298fff223f6e4f224ae248b6425bfd45c5',
  useLiquidityPoolDiscovery: '2d16c3a9aafb86d2335dee29a5753526b007da4d1d381c68edf312d51bba5271',
} as const

export const LIQUIDITY_MODULE_004_FREEZE_SHA256 = {
  LiquidityAddModule: '7ba813e525795cd713bfde53108d8fb189ca7691da454a9bef3f1a754beb8bbc',
  liquidityAddTokens: '0cd91ac81620d915b93af19da5023c8c62108b117310af26cf4f33d8b169ee9d',
  liquidityAddCta: '8e52413c0747a90d5efbc44d4a497ed0bd6e39fb22c51fbb690772c9fa17ddc8',
} as const

export const LIQUIDITY_MODULE_005_FREEZE_SHA256 = {
  LiquidityMarketSnapshotModule: '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  liquidityMarketSnapshotTokens: 'd72ed4be05f66023aecfab306a55d3e6773ff7432a8f3bc876ca5a0814e9b3bf',
  buildLiquidityMarketSnapshot: '8ea9546d9cb1082d5bb130edc6e7605b558e758fcbc7ae000dfd781fbfa0db2b',
  useLiquidityMarketSnapshot: 'e519eba1919f426c9b7ded869fc0902d2ac29c21fc46310eda9d00cc9345401f',
} as const

export const LIQUIDITY_MODULE_006_FREEZE_SHA256 = {
  LiquidityMyPositionsModule: '816a5b84a10476ed5847853085eef274d75e586567573b30790550a0d71e1004',
  liquidityMyPositionsTokens: '8f03801fbe14dfad95c2409b042ef95407fc8c35d88ddcd5966fcc0d9409e480',
  liquidityMyPositionsModel: 'd5d84e53426afb8d870aae39cd9e0633a544b5adebe7047282b4f4a507b19139',
} as const

export const LIQUIDITY_MODULE_007_FREEZE_SHA256 = {
  LiquidityAnalyticsModule: 'ba1c06bfa3d7bfd49e75e89e4d9dd1b1fbd6518e52e20e8fef07d69db569e7e1',
  liquidityAnalyticsTokens: 'b5daeebccac57d9d66d9fd6f5dcf76201f844b94887b20be94d025e2c6602cba',
  buildLiquidityAnalytics: '5e302f2204c34184e4e9a4da4467ad0c15d453299955f83dee297f2b46c0a5be',
  useLiquidityAnalytics: 'a80da07df2c00ceac70491bd860bec1068668f490a6b45abee27676572c46e27',
} as const

export const LIQUIDITY_RUNTIME_FREEZE_SHA256 = {
  useLiquidityMintRuntime: 'e65b9d46ec6d0502fa1a7c7de9f44f334a5905bb5d09977aeb3cc4ae52a8b16b',
  LiquidityRuntimeContext: '1c17119c192b27c82e4c3d1b84a4be3c278740fc1d8ef63a18b5254de6521515',
} as const

export const LIQUIDITY_ARCHITECTURE_000_TIP = 'e9708c78' as const
export const LIQUIDITY_MODULE_007_TIP = '7de01db4' as const
