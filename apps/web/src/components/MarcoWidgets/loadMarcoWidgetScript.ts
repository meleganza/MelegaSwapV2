const scriptPromises = new Map<string, Promise<void>>()

/** Load an official MARCO widget once, only when its surface is rendered. */
export const loadMarcoWidgetScript = (
  src: string,
  ready: () => boolean,
  attributes: Record<string, string> = {},
): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('MARCO_WIDGET_BROWSER_REQUIRED'))
  if (ready()) return Promise.resolve()

  const pending = scriptPromises.get(src)
  if (pending) return pending

  const promise = new Promise<void>((resolve, reject) => {
    const selector = `script[data-marco-widget-src="${src}"]`
    const existing = document.querySelector<HTMLScriptElement>(selector)
    const script = existing ?? document.createElement('script')

    const onLoad = () => {
      if (ready()) resolve()
      else reject(new Error('MARCO_WIDGET_API_UNAVAILABLE'))
    }
    const onError = () => reject(new Error('MARCO_WIDGET_LOAD_FAILED'))

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })

    if (!existing) {
      script.src = src
      script.async = true
      script.defer = true
      script.dataset.marcoWidgetSrc = src
      Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value))
      document.head.appendChild(script)
    }
  }).catch((error) => {
    scriptPromises.delete(src)
    throw error
  })

  scriptPromises.set(src, promise)
  return promise
}
