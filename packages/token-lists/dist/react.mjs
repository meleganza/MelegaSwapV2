import {
  getVersionUpgrade
} from "./chunk-YBVZDUCZ.mjs";

// react/reducer.ts
import { createReducer } from "@reduxjs/toolkit";

// react/actions.ts
import { createAction } from "@reduxjs/toolkit";
var fetchTokenList = {
  pending: createAction("lists/fetchTokenList/pending"),
  fulfilled: createAction("lists/fetchTokenList/fulfilled"),
  rejected: createAction("lists/fetchTokenList/rejected")
};
var addList = createAction("lists/addList");
var removeList = createAction("lists/removeList");
var enableList = createAction("lists/enableList");
var disableList = createAction("lists/disableList");
var acceptListUpdate = createAction("lists/acceptListUpdate");
var rejectVersionUpdate = createAction("lists/rejectVersionUpdate");
var updateListVersion = createAction("lists/updateListVersion");

// react/reducer.ts
var NEW_LIST_STATE = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null
};
var createTokenListReducer = (initialState, DEFAULT_LIST_OF_LISTS, DEFAULT_ACTIVE_LIST_URLS) => createReducer(
  initialState,
  (builder) => builder.addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
    var _a, _b;
    const current = ((_a = state.byUrl[url]) == null ? void 0 : _a.current) ?? null;
    const pendingUpdate = ((_b = state.byUrl[url]) == null ? void 0 : _b.pendingUpdate) ?? null;
    state.byUrl[url] = {
      current,
      pendingUpdate,
      loadingRequestId: requestId,
      error: null
    };
  }).addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url } }) => {
    var _a, _b;
    const current = (_a = state.byUrl[url]) == null ? void 0 : _a.current;
    const loadingRequestId = (_b = state.byUrl[url]) == null ? void 0 : _b.loadingRequestId;
    if (current) {
      const upgradeType = getVersionUpgrade(current.version, tokenList.version);
      if (upgradeType === 0 /* NONE */)
        return;
      if (loadingRequestId === null || loadingRequestId === requestId) {
        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: null,
          current,
          pendingUpdate: tokenList
        };
      }
    } else {
      if (DEFAULT_ACTIVE_LIST_URLS.includes(url) && state.activeListUrls && !state.activeListUrls.includes(url)) {
        state.activeListUrls.push(url);
      }
      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: null,
        current: tokenList,
        pendingUpdate: null
      };
    }
  }).addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage } }) => {
    var _a;
    if (((_a = state.byUrl[url]) == null ? void 0 : _a.loadingRequestId) !== requestId) {
      return;
    }
    state.byUrl[url] = {
      ...state.byUrl[url],
      loadingRequestId: null,
      error: errorMessage,
      current: null,
      pendingUpdate: null
    };
  }).addCase(addList, (state, { payload: url }) => {
    if (!state.byUrl[url]) {
      state.byUrl[url] = NEW_LIST_STATE;
    }
  }).addCase(removeList, (state, { payload: url }) => {
    if (state.byUrl[url]) {
      delete state.byUrl[url];
    }
    if (state.activeListUrls && state.activeListUrls.includes(url)) {
      state.activeListUrls = state.activeListUrls.filter((u) => u !== url);
    }
  }).addCase(enableList, (state, { payload: url }) => {
    if (!state.byUrl[url]) {
      state.byUrl[url] = NEW_LIST_STATE;
    }
    if (state.activeListUrls && !state.activeListUrls.includes(url)) {
      state.activeListUrls.push(url);
    }
    if (!state.activeListUrls) {
      state.activeListUrls = [url];
    }
  }).addCase(disableList, (state, { payload: url }) => {
    if (state.activeListUrls && state.activeListUrls.includes(url)) {
      state.activeListUrls = state.activeListUrls.filter((u) => u !== url);
    }
  }).addCase(acceptListUpdate, (state, { payload: url }) => {
    var _a;
    if (!((_a = state.byUrl[url]) == null ? void 0 : _a.pendingUpdate)) {
      throw new Error("accept list update called without pending update");
    }
    state.byUrl[url] = {
      ...state.byUrl[url],
      pendingUpdate: null,
      current: state.byUrl[url].pendingUpdate
    };
  }).addCase(updateListVersion, (state) => {
    if (!state.lastInitializedDefaultListOfLists) {
      state.byUrl = initialState.byUrl;
      state.activeListUrls = initialState.activeListUrls;
    } else if (state.lastInitializedDefaultListOfLists) {
      const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce(
        (s, l) => s.add(l),
        /* @__PURE__ */ new Set()
      );
      const newListOfListsSet = DEFAULT_LIST_OF_LISTS.reduce((s, l) => s.add(l), /* @__PURE__ */ new Set());
      DEFAULT_LIST_OF_LISTS.forEach((listUrl) => {
        if (!lastInitializedSet.has(listUrl)) {
          state.byUrl[listUrl] = NEW_LIST_STATE;
        }
      });
      state.lastInitializedDefaultListOfLists.forEach((listUrl) => {
        if (!newListOfListsSet.has(listUrl)) {
          delete state.byUrl[listUrl];
        }
      });
    }
    state.lastInitializedDefaultListOfLists = DEFAULT_LIST_OF_LISTS;
    if (!state.activeListUrls) {
      state.activeListUrls = DEFAULT_ACTIVE_LIST_URLS;
      DEFAULT_ACTIVE_LIST_URLS.forEach((listUrl) => {
        if (!state.byUrl[listUrl]) {
          state.byUrl[listUrl] = NEW_LIST_STATE;
        }
        return true;
      });
    }
  })
);

// react/lists.ts
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import localForage from "localforage";
function noop() {
}
var noopStorage = {
  getItem: noop,
  setItem: noop,
  removeItem: noop,
  keys: [],
  getAllKeys: noop
};
var EMPTY = Symbol();
var createListsAtom = (storeName, reducer, initialState) => {
  function IndexedDBStorage(dbName) {
    if (typeof window !== "undefined") {
      const db = localForage.createInstance({
        name: dbName,
        storeName
      });
      return {
        db,
        getItem: async (key) => {
          const value = await db.getItem(key);
          if (value) {
            return value;
          }
          return initialState;
        },
        setItem: (k, v) => {
          if (v === EMPTY)
            return;
          return db.setItem(k, v);
        },
        removeItem: db.removeItem,
        delayInit: true
      };
    }
    return noopStorage;
  }
  const listsStorageAtom = atomWithStorage(
    "lists",
    EMPTY,
    IndexedDBStorage("lists")
  );
  const defaultStateAtom = atom(
    (get) => {
      const got = get(listsStorageAtom);
      if (got === EMPTY) {
        return initialState;
      }
      return got;
    },
    (get, set, action) => {
      set(listsStorageAtom, reducer(get(defaultStateAtom), action));
    }
  );
  const isReadyAtom = atom((get) => get(listsStorageAtom) !== EMPTY);
  function useListState() {
    return useAtom(defaultStateAtom);
  }
  function useListStateReady() {
    return useAtomValue(isReadyAtom);
  }
  return {
    listsAtom: defaultStateAtom,
    useListStateReady,
    useListState
  };
};

// react/useFetchListCallback.ts
import { nanoid } from "@reduxjs/toolkit";
import { useCallback } from "react";
function useFetchListCallback(dispatch) {
  return useCallback(
    async (listUrl, sendDispatch = true) => {
      const requestId = nanoid();
      if (sendDispatch) {
        dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      }
      const getTokenList = (await import("./getTokenList-T45DK2AY.mjs")).default;
      return getTokenList(listUrl).then((tokenList) => {
        if (sendDispatch) {
          dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }));
        }
        return tokenList;
      }).catch((error) => {
        console.error(`Failed to get list at url ${listUrl}`, error);
        if (sendDispatch) {
          dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }));
        }
        throw error;
      });
    },
    [dispatch]
  );
}
var useFetchListCallback_default = useFetchListCallback;
export {
  NEW_LIST_STATE,
  acceptListUpdate,
  addList,
  createListsAtom,
  createTokenListReducer,
  disableList,
  enableList,
  fetchTokenList,
  rejectVersionUpdate,
  removeList,
  updateListVersion,
  useFetchListCallback_default as useFetchListCallback
};
