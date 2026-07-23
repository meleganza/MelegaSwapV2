/**
 * LIST_MODULE_002 — canonical listIntent via `/list?intent=…`
 * Remains on /list; back/forward preserved through the router.
 */
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { LIST_INTENTS, type ListIntent } from './listTokens'

function parseIntent(raw: unknown): ListIntent | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return null
  return (LIST_INTENTS as readonly string[]).includes(value) ? (value as ListIntent) : null
}

export function useListIntent() {
  const router = useRouter()
  const listIntent = useMemo(() => parseIntent(router.query.intent), [router.query.intent])

  const setListIntent = useCallback(
    (intent: ListIntent) => {
      const nextQuery = { ...router.query, intent }
      void router.push({ pathname: '/list', query: nextQuery }, undefined, { shallow: true, scroll: false })
    },
    [router],
  )

  const clearListIntent = useCallback(() => {
    const nextQuery = { ...router.query }
    delete nextQuery.intent
    void router.push({ pathname: '/list', query: nextQuery }, undefined, { shallow: true, scroll: false })
  }, [router])

  return { listIntent, setListIntent, clearListIntent }
}
