import * as _reduxjs_toolkit_dist_createReducer from '@reduxjs/toolkit/dist/createReducer';
import { a as TokenList, V as Version } from './types-c285eef5.js';
import * as _reduxjs_toolkit from '@reduxjs/toolkit';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import * as jotai from 'jotai';

interface ListsState {
    readonly byUrl: {
        readonly [url: string]: {
            readonly current: TokenList | null;
            readonly pendingUpdate: TokenList | null;
            readonly loadingRequestId: string | null;
            readonly error: string | null;
        };
    };
    readonly lastInitializedDefaultListOfLists?: string[];
    readonly activeListUrls: string[] | undefined;
}
type ListByUrlState = ListsState['byUrl'][string];
declare const NEW_LIST_STATE: ListByUrlState;
declare const createTokenListReducer: (initialState: ListsState, DEFAULT_LIST_OF_LISTS: string[], DEFAULT_ACTIVE_LIST_URLS: string[]) => _reduxjs_toolkit_dist_createReducer.ReducerWithInitialState<ListsState>;

declare const fetchTokenList: Readonly<{
    pending: ActionCreatorWithPayload<{
        url: string;
        requestId: string;
    }>;
    fulfilled: ActionCreatorWithPayload<{
        url: string;
        tokenList: TokenList;
        requestId: string;
    }>;
    rejected: ActionCreatorWithPayload<{
        url: string;
        errorMessage: string;
        requestId: string;
    }>;
}>;
declare const addList: ActionCreatorWithPayload<string, string>;
declare const removeList: ActionCreatorWithPayload<string, string>;
declare const enableList: ActionCreatorWithPayload<string, string>;
declare const disableList: ActionCreatorWithPayload<string, string>;
declare const acceptListUpdate: ActionCreatorWithPayload<string, string>;
declare const rejectVersionUpdate: ActionCreatorWithPayload<Version, string>;
declare const updateListVersion: _reduxjs_toolkit.ActionCreatorWithoutPayload<"lists/updateListVersion">;

declare const createListsAtom: (storeName: string, reducer: any, initialState: any) => {
    listsAtom: jotai.WritableAtom<ListsState, any, void>;
    useListStateReady: () => boolean;
    useListState: () => [ListsState, (update?: any) => void];
};

declare function useFetchListCallback(dispatch: (action?: unknown) => void): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList>;

export { ListsState, NEW_LIST_STATE, acceptListUpdate, addList, createListsAtom, createTokenListReducer, disableList, enableList, fetchTokenList, rejectVersionUpdate, removeList, updateListVersion, useFetchListCallback };
