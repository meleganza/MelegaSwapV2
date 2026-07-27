/**
 * FARMS_MODULE_006 — Yield Advisor geometry + freeze guards.
 * Desktop slot matches Module 003 reserved 424×360.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { farmsExplore } from './farmsExploreFarmsTokens'
import { farmsFinished } from './farmsFinishedFarmsTokens'

export const farmsYieldAdvisor = {
  moduleId: '006-yield-advisor',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,
  module004MockupSha256: farmsExplore.mockupSha256,
  module005MockupSha256: farmsFinished.mockupSha256,

  slotW: '424px',
  slotH: '360px',
  maxVisible: 4,

  radius: '16px',
  border: '1px solid rgba(255,255,255,0.085)',
  bg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  shadow: '0 16px 36px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.025)',

  headerH: '72px',
  titleSize: '16px',
  titleLine: '22px',
  titleWeight: 750,
  titleColor: '#F5F5F5',
  subtitleSize: '11px',
  subtitleLine: '15px',
  subtitleColor: 'rgba(255,255,255,0.50)',

  cardW: '390px',
  cardH: '64px',
  cardPad: '0 12px',
  cardGap: '8px',
  cardRadius: '10px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'rgba(22,22,22,0.96)',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobileContent390: '358px',
  slotSelector: '[data-farms-module-006-slot="reserved"]',
} as const

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'a1360aff6d765b740e63a3b018b649d3ef17c83067531c7b787f718a3b19de43',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: '93b9ff921b308fffc36a40a94dc48c8f7c85582fcf35f12c895bb9180137bbd2',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '188d495c6a192db43e8e5a8464b333b5c624e5010a2e78a7ebb204677c11c9f2',
  farmsOverviewKpisTokens: '1c0696ef2bb9e5ff9189376bf0152b275e6d61a62de8a3a1e534621cbc4567f7',
  buildFarmsOverviewKpis: '987ddde0b6f5d54c2c62b71d6bcca976cecea020533c8a9d35c896c72da3418f',
  useFarmsOverviewKpis: '8a77b200ad62225d0d0c775a378dfcfe69b7c0a8e99115a1737451dfeadd8ec9',
  farmsOverviewKpisTypes: '95dc90670e30f7780e0c226bf1f92a691e4a31fa580489d34081b9e7d77e0129',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'b2669f7571a39f86d668e53cd68a4b5989e6f7708a7ec2bfe8ab8e6c1382f0f2',
  farmsMyFarmsTokens: '18f7ef12d54e064bcf199f6c5c8183224e44b79ae7c12b078787ca850ceded10',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: '7c2d2cf8852a97e5e16f4c45413f7088bf8c552a7ca7f420ccf18ca6d6743842',
  FarmsExploreFarmCard: 'fe29452f96a35809893a0308b5248161096da9feefec9bfa4ec94893bdaaece7',
  farmsExploreFarmsTokens: '8e499948c5ce252b4a106d3650f56e492e26a5c7d3c8d67b40a47ccdcd9592ce',
  farmsExploreFarmsTypes: '314564befa19bd0e5c0dbbb4ac082e282ae0541ff854a321628f5564644c37ee',
  buildFarmsExploreFarms: '64eda6a26b12412b1dd20ba3d3014da6a2961b1c5837c4237074173eb62ddc1e',
  useFarmsExploreFarms: '0c3ca423e00dbf24037e82c14f1c6e3b5dd5931bbd944086bc6f6c79854ff8e0',
} as const

export const FARMS_MODULE_005_FREEZE_SHA256 = {
  FarmsFinishedFarmsModule: '0fb2efe12d6eeef7e7896c4071e356cfd4efe7f75054af3622f941e837364bcf',
  FarmsFinishedFarmCard: '3d7f6ce136a9c469df142900add0712496cca4640d0e23a0dcc4efbd50366eaa',
  farmsFinishedFarmsTokens: 'd46a377e61ae9080a3bb180dcf4f3eafce8f007147c00c606c5aa6b130d0c878',
  farmsFinishedFarmsTypes: '395114197f8c111479dd1486ea21df5707d16f2d480390a4a6adeb164757d4fc',
  buildFarmsFinishedFarms: '6507c580589af70bed9381fd242569dc824627df1a72a5f7f04a0d1f91b8a9fd',
  useFarmsFinishedFarms: '163703cb9671d3ea2bccac5a9f618f00993f53be3fbf009835315bc86cc3653d',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_005_TIP = '640e1e6d14b6fc5bbc331f5a692226c481bc9ff1' as const
