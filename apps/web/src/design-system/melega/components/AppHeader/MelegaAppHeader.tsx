/**
 * DS001.2 — AppHeader re-exports the shared MelegaGlobalHeader.
 * Prefer importing MelegaGlobalHeader directly for new code.
 */
export {
  MelegaGlobalHeader as MelegaAppHeader,
  MELEGA_APP_HEADER_HEIGHT,
  type MelegaGlobalHeaderProps as MelegaAppHeaderProps,
} from '../GlobalHeader'
export { default } from '../GlobalHeader'
