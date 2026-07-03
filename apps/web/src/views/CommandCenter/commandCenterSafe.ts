import type { AIRecommendation } from './commandCenterData'

export const safeArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : [])

export const safeSparklinePoints = (points: number[] | null | undefined): number[] => {
  const list = safeArray(points).filter((n) => typeof n === 'number' && Number.isFinite(n))
  if (list.length >= 2) return list
  return [0, 0]
}

export const safePct = (value: number | null | undefined, fallback = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.min(100, value))
}

export const recommendationIconTone = (icon: AIRecommendation['icon'] | undefined): string => {
  const tones: Record<AIRecommendation['icon'], string> = {
    rebalance: 'rgba(214,180,69,0.15)',
    claim: 'rgba(27,231,122,0.12)',
    pool: 'rgba(139,124,246,0.15)',
    radar: 'rgba(27,231,122,0.12)',
    audit: 'rgba(244,197,66,0.12)',
  }
  return icon ? tones[icon] ?? tones.rebalance : tones.rebalance
}

export const recommendationIconEmoji = (icon: AIRecommendation['icon'] | undefined): string => {
  const emojis: Record<AIRecommendation['icon'], string> = {
    rebalance: '⚖',
    claim: '💰',
    pool: '🏊',
    radar: '📡',
    audit: '📋',
  }
  return icon ? emojis[icon] ?? '•' : '•'
}
