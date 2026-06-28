import { useCallback } from 'react'
import translations from 'config/localization/translations.json'

export const useCommandTranslation = () => {
  const t = useCallback((key: string) => (translations as Record<string, string>)[key] ?? key, [])
  return { t }
}
