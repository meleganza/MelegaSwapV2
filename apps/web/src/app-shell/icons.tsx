import React from 'react'

export type MelegaNavIcon =
  | 'swap'
  | 'drop'
  | 'coins'
  | 'brain'
  | 'folder'
  | 'star'
  | 'rocket'
  | 'wallet'

export const ShellNavIcon: React.FC<{ name: MelegaNavIcon }> = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    {name === 'swap' && <path d="M7 10l3-3 3 3M17 14l-3 3-3-3" />}
    {name === 'drop' && <path d="M12 3c3 4 6 7 6 10a6 6 0 11-12 0c0-3 3-6 6-10z" />}
    {name === 'coins' && (
      <>
        <circle cx="9" cy="14" r="4" />
        <circle cx="15" cy="10" r="4" />
      </>
    )}
    {name === 'brain' && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </>
    )}
    {name === 'folder' && <path d="M4 7h6l2 2h8v9H4z" />}
    {name === 'star' && <path d="M12 3l2.4 5.6L20 9.3l-4.5 3.9 1.4 5.8L12 16.8 7.1 19l1.4-5.8L4 9.3l5.6-.7z" />}
    {name === 'rocket' && <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />}
    {name === 'wallet' && (
      <>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M16 12h4v4h-4z" />
      </>
    )}
  </svg>
)
