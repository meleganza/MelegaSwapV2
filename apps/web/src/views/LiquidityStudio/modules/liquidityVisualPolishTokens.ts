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
  LiquidityHeroModule: 'caa864ad63614015622d146437c727609e48e1348d982fa7aaaf9eaa7b42f6db',
  LiquidityHeroArtwork: 'ee0bc5a66df5db37b3d0d323defaef5310a836cefb71dac2d529e367988dbea9',
  LiquidityHeroTrustPanel: 'd53f80dc0a97bdb24ab67838beda773a4b08ac5f456d2c0763b531e4734d3039',
  liquidityHeroTokens: '0626ad6995b16cf5bea1c4deed9c973016a3b1078c01619fe3bb8ab02d8b67e0',
} as const

export const LIQUIDITY_MODULE_002_FREEZE_SHA256 = {
  LiquidityActionsModule: '2ff31b501c9bd522145802e6f775c8854c767ae75bed513aef6c9b16f5b357cf',
  liquidityActionsTokens: '5e225af071869ec2b0f55fec980a57462ff1074315abf99a6c94187bddd4a3e4',
} as const

export const LIQUIDITY_MODULE_003_FREEZE_SHA256 = {
  LiquidityPoolDiscoveryModule: '6c4fe13353826b7a2dffb3f75995bd8b627a7713593e867c7d60a914c881e051',
  LiquidityPoolDiscoveryCard: '51d0444fcb305026cc464499caeeb509df28546935b98d6f1c8b356e1c6f35fa',
  liquidityPoolDiscoveryTokens: 'ec323177c584e7d9b42dc980ce32ba69f0048647f67bcbf3906ad844f54d46c4',
  liquidityPoolDiscoveryModel: 'eb2c7b03b036d8b01cde394f556a71298fff223f6e4f224ae248b6425bfd45c5',
  useLiquidityPoolDiscovery: '2d16c3a9aafb86d2335dee29a5753526b007da4d1d381c68edf312d51bba5271',
} as const

export const LIQUIDITY_MODULE_004_FREEZE_SHA256 = {
  LiquidityAddModule: 'd657a81be28640fb36124c2159fa356f88681415ffc6d3c4fd3abd06353bc162',
  liquidityAddTokens: '22b3377ce0787555685a5d6a2220332e3fa7121659a0080554dfd1c8394408b0',
  liquidityAddCta: '8e52413c0747a90d5efbc44d4a497ed0bd6e39fb22c51fbb690772c9fa17ddc8',
} as const

export const LIQUIDITY_MODULE_005_FREEZE_SHA256 = {
  LiquidityMarketSnapshotModule: '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  liquidityMarketSnapshotTokens: 'dc73dd4f2bd18ab063ef2614eabd763d62ec631b0d5bb73d19660ed2ac6834ca',
  buildLiquidityMarketSnapshot: '8ea9546d9cb1082d5bb130edc6e7605b558e758fcbc7ae000dfd781fbfa0db2b',
  useLiquidityMarketSnapshot: 'e519eba1919f426c9b7ded869fc0902d2ac29c21fc46310eda9d00cc9345401f',
} as const

export const LIQUIDITY_MODULE_006_FREEZE_SHA256 = {
  LiquidityMyPositionsModule: 'dd84879a02980bf0bf8da0f7ab7e1443ec695e5d2f39db33963196456926c80f',
  liquidityMyPositionsTokens: '4c7a4c3aa46394172f392150bde5a09821e2ba8266cd7ccf446b0c78ffcbd15c',
  liquidityMyPositionsModel: 'd5d84e53426afb8d870aae39cd9e0633a544b5adebe7047282b4f4a507b19139',
} as const

export const LIQUIDITY_MODULE_007_FREEZE_SHA256 = {
  LiquidityAnalyticsModule: 'ba1c06bfa3d7bfd49e75e89e4d9dd1b1fbd6518e52e20e8fef07d69db569e7e1',
  liquidityAnalyticsTokens: 'bb58485697bc946f7686cbc70927d4a742cbba1af7ea9a5ed1bbdb6505dd51df',
  buildLiquidityAnalytics: '5e302f2204c34184e4e9a4da4467ad0c15d453299955f83dee297f2b46c0a5be',
  useLiquidityAnalytics: 'a80da07df2c00ceac70491bd860bec1068668f490a6b45abee27676572c46e27',
} as const

export const LIQUIDITY_RUNTIME_FREEZE_SHA256 = {
  useLiquidityMintRuntime: 'e65b9d46ec6d0502fa1a7c7de9f44f334a5905bb5d09977aeb3cc4ae52a8b16b',
  LiquidityRuntimeContext: '1c17119c192b27c82e4c3d1b84a4be3c278740fc1d8ef63a18b5254de6521515',
} as const

export const LIQUIDITY_ARCHITECTURE_000_TIP = 'e9708c78' as const
export const LIQUIDITY_MODULE_007_TIP = '7de01db4' as const
