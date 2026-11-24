import React, { useEffect, useState } from 'react'

/**
 * Renders children only after the client has mounted.
 *
 * Replaces `next/dynamic({ ssr: false })` for page screens: on Next 13 + React 18 that bailout is
 * raised during server rendering, so React reports #419 and re-renders the boundary on the client.
 * Gating on mount keeps the server HTML (shell, header, navigation) and hydrates without a
 * server/client mismatch, while the screen still loads only in the browser.
 */
export const ClientOnlyMount: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return <>{mounted ? children : fallback}</>
}

export default ClientOnlyMount
