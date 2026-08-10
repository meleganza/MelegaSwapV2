# CREATE_FARM_STABILITY

## Repro (before)

First Create Farm click could flash / bounce because:
1. `openCreate` set local state and `router.replace({ create: '1' })`
2. `useEffect` on `router.query.create` re-fired
3. `MelegaModal` unmounts children when `open=false`, remounting workspace

## Fix

File: `FarmsStudioScreen.tsx`

- `createOpenRef` guards double open
- Open sets local state first; shallow replace only if query lacks `create`
- Close strips query only when present
- Deep-link effect opens when `?create=1` / `#create-farm` after `router.isReady`
- Modal mounts after first open (`everOpened`) — no permanent page column
- `data-create-farm-first-open-stable="true"`

## Pair selector portal

File: `PublicFarmFactoryWorkspace.tsx`

- Dropdown portaled to `document.body`
- `melegaZIndex.overlayStacked`
- Anchored via `getBoundingClientRect`
- `data-testid="create-farm-pair-dropdown"`
- Token logos + factual TVL when available
- Search via `filterPairsForFarmFactory` (symbol / name / contract / LP; Melega chain only)

## Acceptance

1. First click opens Create Farm exactly once
2. No black flash / route bounce / modal close-reopen
3. Search → scroll → select → preview updates
4. No clipping inside modal accordion
