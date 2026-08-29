import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

/** Certified Solana OFT program that owns the Wave-1 store. */
export const SOLANA_OFT_PROGRAM_ID = 'Gti4f873FUw5jpMa4wnRVcZDjr5YwonZ1FcY8vXu2Wnm'
export const SOLANA_LZ_ENDPOINT_PROGRAM_ID = '76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6'
export const SOLANA_OFT_ADMIN = 'BRhBJ8iX2wcMPKe4SqiPK2K3ZbegmVDEiWtiSFLJ1aRd'
export const SOLANA_OFT_PAUSER = '5Lah4wSAUUcfupdXR54RdVtt4ttxioJKGaDugjB2mXD'
/** Certified emergency/unpause authority on the live store. */
export const SOLANA_OFT_UNPAUSER = 'AxkKgEKrDPJoyfKHeBxp7MghM8jrL5efajYtWX8uxqep'
export const SOLANA_OFT_ESCROW = 'Cd1H2o5kcb2ZcpxcEJfiypPQvDKc2jA164bhmm51iS5'

export const SOLANA_UNPAUSE_ACTION = {
  network: 'solana',
  purpose: 'Unpause the certified MARCO OFT store so BNB↔Solana delivery can execute.',
  programId: SOLANA_OFT_PROGRAM_ID,
  store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
  mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
  signer: SOLANA_OFT_UNPAUSER,
  instruction: 'set_pause',
  paused: false,
  doNot: [
    'Do not redeploy the Solana OFT.',
    'Do not change peers.',
    'Do not change ULN/DVN/enforced options.',
    'Do not alter mint or freeze authority.',
  ],
} as const

export function solanaUnpauseOperatorMessage(): string {
  return [
    `Sign set_pause(paused=false) on Solana OFT program ${SOLANA_OFT_PROGRAM_ID}`,
    `store ${SOLANA_UNPAUSE_ACTION.store}`,
    `using unpauser ${SOLANA_OFT_UNPAUSER}.`,
    'Do not change peers, ULN/DVN, enforced options, mint, or freeze authority.',
  ].join(' ')
}
