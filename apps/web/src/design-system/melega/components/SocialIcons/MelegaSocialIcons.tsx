import React from 'react'
import styled from 'styled-components'
import { colors } from '../../tokens'
import { MELEGA_SOCIAL_LINKS } from 'config/constants/social'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: 40px;
`

const Link = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  text-decoration: none;
  background: transparent;
  transition: color 150ms ease;

  &:hover {
    color: ${colors.gold};
  }

  svg {
    width: 18px;
    height: 18px;
    line-height: 1;
  }
`

const Telegram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const Instagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7.8 2h8.4A5.8 5.8 0 0122 7.8v8.4A5.8 5.8 0 0116.2 22H7.8A5.8 5.8 0 012 16.2V7.8A5.8 5.8 0 017.8 2zm0 2A3.8 3.8 0 004 7.8v8.4A3.8 3.8 0 007.8 20h8.4a3.8 3.8 0 003.8-3.8V7.8A3.8 3.8 0 0016.2 4H7.8zm9.65 1.5a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
)

export const MelegaSocialIcons: React.FC = () => (
  <Row data-melega-social-icons>
    {MELEGA_SOCIAL_LINKS.map((social) => (
      <Link key={social.id} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
        {social.id === 'telegram' ? <Telegram /> : social.id === 'x' ? <XIcon /> : <Instagram />}
      </Link>
    ))}
  </Row>
)

export default MelegaSocialIcons
