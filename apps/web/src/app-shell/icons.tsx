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
  | 'sparkle'
  | 'command'
  | 'trade'
  | 'leaf'
  | 'portfolio'
  | 'search'

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
    {name === 'sparkle' && (
      <>
        <path d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z" />
        <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
      </>
    )}
    {name === 'command' && (
      <>
        <path d="M12 2l7.5 4.3v8.6L12 19.2 4.5 15V6.3z" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </>
    )}
    {name === 'trade' && <path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />}
    {name === 'leaf' && (
      <>
        <path d="M12 21v-7" strokeLinecap="round" />
        <path d="M12 14c0-5 3-8.5 8-9 .3 5.5-3 9-8 9z" strokeLinejoin="round" />
        <path d="M12 16c0-4-2.5-7-7-7.5-.3 4.5 2.5 7.5 7 7.5z" strokeLinejoin="round" />
      </>
    )}
    {name === 'portfolio' && (
      <>
        <path d="M4 8.5A2.5 2.5 0 016.5 6H18a2 2 0 012 2v10a2 2 0 01-2 2H6.5A2.5 2.5 0 014 17.5z" strokeLinejoin="round" />
        <path d="M4 8.5A2.5 2.5 0 016.5 11H20M16 3.5L6.5 6M15.5 15.5h1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
    {name === 'search' && (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5L20 20" strokeLinecap="round" />
      </>
    )}
  </svg>
)
