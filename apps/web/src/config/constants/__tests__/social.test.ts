import { describe, expect, it } from 'vitest'
import { MELEGA_SOCIAL_LINKS, getMelegaSocialLink } from '../social'

describe('MELEGA_SOCIAL_LINKS R757', () => {
  it('exposes exactly Telegram, X, and Instagram', () => {
    expect(MELEGA_SOCIAL_LINKS.map((l) => l.id)).toEqual(['telegram', 'x', 'instagram'])
  })

  it('uses canonical URLs', () => {
    expect(getMelegaSocialLink('telegram').href).toBe('https://t.me/melegacommunity')
    expect(getMelegaSocialLink('x').href).toBe('https://x.com/meleganews')
    expect(getMelegaSocialLink('instagram').href).toBe('https://www.instagram.com/melega.finance/')
  })

  it('does not include Discord', () => {
    const hrefs = MELEGA_SOCIAL_LINKS.map((l) => l.href).join(' ')
    expect(hrefs).not.toMatch(/discord/i)
  })
})
