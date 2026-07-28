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
  LiquidityHeroModule: '52a15f6e322863598a7a61b9450f13d792184dd02ebd6679d82bb22422ff823d',
  LiquidityHeroArtwork: '9cb813dabac35cc5bd7185223c119473ea61766e8e17d988dbd9a16ebbe553ee',
  LiquidityHeroTrustPanel: 'd53f80dc0a97bdb24ab67838beda773a4b08ac5f456d2c0763b531e4734d3039',
  liquidityHeroTokens: '1ea3821c2671f9517679cdb6cd49492bc96aa334c9a492c00cc84377b84de038',
} as const

export const LIQUIDITY_MODULE_002_FREEZE_SHA256 = {
  LiquidityActionsModule: '63e7d544cdbc6c45bba9aa561ede46fea31caa8e4bcd530d3dc7650c233cc44b',
  liquidityActionsTokens: '492fc8041d088721054d8b80f5ed39bf2dd9bd28a879fe1275437f6270fc38d2',
} as const

export const LIQUIDITY_MODULE_003_FREEZE_SHA256 = {
  LiquidityPoolDiscoveryModule: '222539c3eea7247a9b6044ea6c2595d49b8a641737d372e39f234e835e731110',
  LiquidityPoolDiscoveryCard: '81abbcadb15d771059b88029e9dca45a4bbe02134f110f7bdc7d7ea1b1478d92',
  liquidityPoolDiscoveryTokens: '050488ff324cf1dd821ef27120828f9fe0ef4c4760275918208dac5c478779d1',
  liquidityPoolDiscoveryModel: '1d99a2422e84e88910d019c13e926f9b903c64e37cf9a2e0047d5177581959de',
  useLiquidityPoolDiscovery: '2d16c3a9aafb86d2335dee29a5753526b007da4d1d381c68edf312d51bba5271',
} as const

export const LIQUIDITY_MODULE_004_FREEZE_SHA256 = {
  LiquidityAddModule: 'e57645b8b56c5e5530e4e7f357357656a70db39821ccade18aaffcc95a61113c',
  liquidityAddTokens: '84768fc3fd89c97e9838b1777c46d5ef9a5c5008aa75651eab63b6775e0812f9',
  liquidityAddCta: '8e52413c0747a90d5efbc44d4a497ed0bd6e39fb22c51fbb690772c9fa17ddc8',
} as const

export const LIQUIDITY_MODULE_005_FREEZE_SHA256 = {
  LiquidityMarketSnapshotModule: '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  liquidityMarketSnapshotTokens: '9c314542d9ca22a95e01c14cbb502fcd386970a9b369cdcf8eef1ff56638cdc3',
  buildLiquidityMarketSnapshot: '8ea9546d9cb1082d5bb130edc6e7605b558e758fcbc7ae000dfd781fbfa0db2b',
  useLiquidityMarketSnapshot: 'e519eba1919f426c9b7ded869fc0902d2ac29c21fc46310eda9d00cc9345401f',
} as const

export const LIQUIDITY_MODULE_006_FREEZE_SHA256 = {
  LiquidityMyPositionsModule: 'adf90fe72b8422d81675b916c44aba880df5f340d5c9aec00999fff0e17ad3dc',
  liquidityMyPositionsTokens: 'a96ebbf05e3b77f5f413bde9b8eea2795820fbcac50306eb3eff66805a1f0a8d',
  liquidityMyPositionsModel: 'd5d84e53426afb8d870aae39cd9e0633a544b5adebe7047282b4f4a507b19139',
} as const

export const LIQUIDITY_MODULE_007_FREEZE_SHA256 = {
  LiquidityAnalyticsModule: 'ba1c06bfa3d7bfd49e75e89e4d9dd1b1fbd6518e52e20e8fef07d69db569e7e1',
  liquidityAnalyticsTokens: '7971a348d9c1bc0bc806d2983ee8c83969aacabf19074d114cd598449ea52e80',
  buildLiquidityAnalytics: '5e302f2204c34184e4e9a4da4467ad0c15d453299955f83dee297f2b46c0a5be',
  useLiquidityAnalytics: 'a80da07df2c00ceac70491bd860bec1068668f490a6b45abee27676572c46e27',
} as const

export const LIQUIDITY_RUNTIME_FREEZE_SHA256 = {
  useLiquidityMintRuntime: 'e65b9d46ec6d0502fa1a7c7de9f44f334a5905bb5d09977aeb3cc4ae52a8b16b',
  LiquidityRuntimeContext: '1c17119c192b27c82e4c3d1b84a4be3c278740fc1d8ef63a18b5254de6521515',
} as const

export const LIQUIDITY_ARCHITECTURE_000_TIP = 'e9708c78' as const
export const LIQUIDITY_MODULE_007_TIP = '7de01db4' as const
