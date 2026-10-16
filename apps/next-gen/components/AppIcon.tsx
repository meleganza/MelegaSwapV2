import React from 'react'

export type AppIconName = 'trade' | 'earn' | 'portfolio' | 'explore' | 'advanced' | 'shield' | 'arrow' | 'wallet'

const ICON_PATHS: Record<AppIconName, React.ReactNode> = {
  trade: <path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3 3m-3-3 3-3" />,
  earn: <path d="M12 3v18m5-14.5c0-1.9-2.2-3.2-5-3.2s-5 1.3-5 3.2 2.2 3.2 5 3.2 5 1.3 5 3.2-2.2 3.2-5 3.2-5-1.3-5-3.2" />,
  portfolio: <path d="M4 5.5h16v13H4zM8 5.5V4h8v1.5M4 10h16" />,
  explore: <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1ZM12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4Z" />,
  advanced: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M10 14v6" />,
  shield: <path d="M12 3.2 19 6v5.4c0 4.4-2.8 7.8-7 9.4-4.2-1.6-7-5-7-9.4V6l7-2.8Zm-3 8.6 2 2 4-4" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  wallet: <path d="M4 6.5h14.5a1.5 1.5 0 0 1 1.5 1.5v10H5.5A1.5 1.5 0 0 1 4 16.5v-10Zm0 0V5.5A1.5 1.5 0 0 1 5.5 4H17m0 7h3v4h-3a2 2 0 0 1 0-4Z" />,
}

export function AppIcon({ name }: { name: AppIconName }) {
  return (
    <svg className="app-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  )
}
