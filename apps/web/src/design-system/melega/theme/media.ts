import { breakpoints } from './breakpoints'

export const media = {
  mobile: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  tabletUp: `@media (min-width: ${breakpoints.tablet}px)`,
  desktopUp: `@media (min-width: ${breakpoints.desktop}px)`,
} as const
