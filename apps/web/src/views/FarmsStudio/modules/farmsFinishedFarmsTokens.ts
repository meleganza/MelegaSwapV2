/**
 * FARMS_MODULE_005 — Finished Farms geometry + freeze guards.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { farmsExplore } from './farmsExploreFarmsTokens'

export const farmsFinished = {
  moduleId: '005-finished-farms',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,
  module004MockupSha256: farmsExplore.mockupSha256,

  contentMax: '1376px',
  topGapAfterExplore: '16px',
  headerH: '56px',

  titleSize: '18px',
  titleLine: '24px',
  titleWeight: 750,
  titleColor: '#F5F5F5',
  supportSize: '11px',
  supportLine: '15px',
  supportColor: 'rgba(255,255,255,0.50)',
  countSize: '11px',

  cardW: '446px',
  cardH: '250px',
  cardGapX: '19px',
  cardGapY: '18px',
  cardPad: '18px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'linear-gradient(145deg, rgba(19,19,19,0.98) 0%, rgba(13,13,13,0.98) 100%)',
  cardShadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',
  emergencyBorder: '1px solid rgba(255,138,101,0.35)',

  lpLogo: 34,
  rewardLogo: 22,
  logoOverlap: -9,

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobile390CardW: '326px',
  mobile430CardW: '366px',
  mobileContent390: '358px',
  mobileContent430: '398px',
  mobileCardMinH: '270px',
  mobileCardGap: '10px',
  tabletMinCardW: '340px',

  /** Factual history route already exists. */
  historyHref: '/farms/history',
} as const

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'b22879b18e899567942bc7db24339c2baf70c8997c579fcadef1ac90aa57de7b',
  FarmsHeroArtwork: '6f595886f997d06a6e72e02a7195476438fe7fc6fe5981363e1ea4c2ecfa47b7',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: 'f4672464d452b42d3a045dcd397616432190245fc5618fbf0174d2b2f58e7d26',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: 'ffa1aa87cf11f4ec824ebf4c010c58e871520111450f1ebee30da3d6346d01d5',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'cd0bd9fbfae31574cd08dc13f2a17815eb41b84dc2ad6d8f6d9789f5e1578dbb',
  farmsMyFarmsTokens: '46fed4b753b56740c6e18ed883608b6ee98e515f306ecaafc9c68b869ad98a87',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: '1f8aa38066a0a83c8bf58028cf55305999a4d68fd0dac830081cf37b45fff6b6',
  FarmsExploreFarmCard: '52e1fd0769fdf5f723c9f04871f9eae8ebda63db4a998e3137fc7960102f43d9',
  farmsExploreFarmsTokens: '933e96872888056854e89dfc5e57bf7cd9a7c8c9f9de8fd990afb56a6b3069ac',
  farmsExploreFarmsTypes: 'f7d40c5bbac21920a7c5c731eb828a395eda8421e9c6e6f9d9c98ccbc3ef24fb',
  buildFarmsExploreFarms: '64eda6a26b12412b1dd20ba3d3014da6a2961b1c5837c4237074173eb62ddc1e',
  useFarmsExploreFarms: 'aa38a2322e6022f52c5f4aaa20f64da62376590cdfb3fa7d0e4d01d0da5a0696',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_004_TIP = '115748611b3a6809c75c61efa66ac1d726b47675' as const
