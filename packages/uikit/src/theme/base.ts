import { breakpoints, mediaQueries, vars } from "@pancakeswap/ui";

export default {
  siteWidth: 1200,
  breakpoints: Object.values(breakpoints).map((bp) => `${bp}px`),
  mediaQueries,
  spacing: vars.space,
  shadows: vars.shadows,
  radii: vars.radii,
  /* Modal above Melega shell chrome (header 1000, TOP MOVERS 999). */
  zIndices: { ribbon: 9, dropdown: 10, modal: 1200 },
};
