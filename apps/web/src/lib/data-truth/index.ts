/**
 * Melega Global Data Truth Layer — public barrel.
 * Prefer imports from `lib/data-truth` for surface wiring.
 *
 * Note: `useGlobalDataTruth` lives in `./useGlobalDataTruth` (client hook)
 * and is not re-exported here to keep the barrel free of view-layer cycles.
 */
export * from './globalDataTruthLayer'
export { truthDash, truthNumberOrDash, isMissingTruthValue } from './truthDisplay'
export { compareYieldTruthDesc, GLOBAL_DATA_TRUTH_PIPELINE } from './yieldTruthRanking'
