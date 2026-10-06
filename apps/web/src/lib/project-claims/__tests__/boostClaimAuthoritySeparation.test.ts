import { describe, expect, it } from 'vitest'
import { classifyProjectOwner, decidePageClaimAuthority } from '../resolveContractAuthority'

const LIVE_OWNER = '0x1111111111111111111111111111111111111111'

describe('Boost access and Project Page claim authority', () => {
  it('keeps a live owner as the only owner authority', () => {
    expect(classifyProjectOwner(LIVE_OWNER)).toEqual({
      state: 'LIVE_OWNER',
      ownerAddress: LIVE_OWNER,
      authorities: [{ address: LIVE_OWNER, type: 'owner' }],
    })
  })

  it.each([
    '0x0000000000000000000000000000000000000000',
    '0x000000000000000000000000000000000000dEaD',
  ])('classifies canonical renounced/dead ownership without a signing owner (%s)', (owner) => {
    const decision = classifyProjectOwner(owner)
    expect(decision?.state).toBe('RENOUNCED_OR_DEAD')
    expect(decision?.authorities).toEqual([])
  })

  it('does not fabricate an owner from an unreadable value', () => {
    expect(classifyProjectOwner('not-an-address')).toBeNull()
  })

  it('allows the live owner to claim and denies a random wallet without affecting Boost eligibility', () => {
    const authority = classifyProjectOwner(LIVE_OWNER)!
    expect(decidePageClaimAuthority(authority, LIVE_OWNER).allowed).toBe(true)
    expect(decidePageClaimAuthority(authority, '0x2222222222222222222222222222222222222222').allowed).toBe(false)
  })

  it('allows public registration for renounced ownership without an owner signature', () => {
    const authority = classifyProjectOwner('0x0000000000000000000000000000000000000000')!
    expect(decidePageClaimAuthority(authority, '0x2222222222222222222222222222222222222222')).toEqual({
      allowed: true,
      authorityType: 'public_registration',
      ownerSignatureRequired: false,
    })
  })

  it('does not allow a random wallet to overwrite an existing claimed page', () => {
    const authority = classifyProjectOwner('0x0000000000000000000000000000000000000000')!
    expect(
      decidePageClaimAuthority(
        authority,
        '0x2222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333',
      ).allowed,
    ).toBe(false)
  })
})
