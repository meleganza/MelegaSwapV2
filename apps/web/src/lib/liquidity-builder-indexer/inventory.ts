import { getAddress, isAddress } from '@ethersproject/address'
import type { LbIndexedProgram, LbProgramApiRow } from './types'
import type { LbProgramStore } from './store'

export function normalizeWallet(wallet: string): string | null {
  if (!wallet || !isAddress(wallet)) return null
  try {
    return getAddress(wallet).toLowerCase()
  } catch {
    return null
  }
}

export function normalizeProgramAddress(address: string): string | null {
  return normalizeWallet(address)
}

export function toApiRow(p: LbIndexedProgram): LbProgramApiRow {
  return {
    programAddress: p.programAddress,
    token: p.projectToken,
    quoteAsset: p.quoteAsset,
    pair: p.pair,
    reserve: p.reserveWei,
    remaining: p.remainingWei,
    status: p.status,
    strategy: p.strategy,
    goal: p.goal,
    timestamps: {
      createdAt: p.createdAt,
      activatedAt: p.activatedAt,
      pausedAt: p.pausedAt,
      stoppedAt: p.stoppedAt,
      updatedAt: p.updatedAt,
    },
    programId: p.programId,
    owner: p.owner,
    executionCount: p.executionCount,
    totalFeePaid: p.totalFeePaidWei,
    generation: p.generation,
  }
}

export async function listProgramsForOwner(
  store: LbProgramStore,
  wallet: string,
): Promise<{ ok: true; wallet: string; programs: LbProgramApiRow[] } | { ok: false; reason: string }> {
  const owner = normalizeWallet(wallet)
  if (!owner) return { ok: false, reason: 'INVALID_WALLET' }
  const doc = await store.load()
  const programs = doc.programs
    .filter((p) => p.owner.toLowerCase() === owner)
    .map(toApiRow)
    .sort((a, b) => (b.timestamps.updatedAt ?? 0) - (a.timestamps.updatedAt ?? 0))
  return { ok: true, wallet: owner, programs }
}

export async function getProgramDetail(
  store: LbProgramStore,
  address: string,
): Promise<
  | { ok: true; program: LbProgramApiRow; events: ReturnType<LbProgramStore['load']> extends Promise<infer D> ? D extends { events: infer E } ? E : never : never }
  | { ok: false; reason: string }
> {
  const programAddress = normalizeProgramAddress(address)
  if (!programAddress) return { ok: false, reason: 'INVALID_PROGRAM_ADDRESS' }
  const doc = await store.load()
  const found = doc.programs.find((p) => p.programAddress.toLowerCase() === programAddress)
  if (!found) return { ok: false, reason: 'PROGRAM_NOT_FOUND' }
  const events = doc.events
    .filter(
      (e) =>
        e.programAddress?.toLowerCase() === programAddress ||
        (found.programId && e.programId?.toLowerCase() === found.programId.toLowerCase()),
    )
    .sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)
  return { ok: true, program: toApiRow(found), events: events as any }
}
