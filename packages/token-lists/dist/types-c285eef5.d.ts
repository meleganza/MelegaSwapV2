type ExtensionValue = string | number | boolean | null | undefined;
interface TokenInfo {
    readonly chainId: number;
    readonly address: string;
    readonly name: string;
    readonly decimals: number;
    readonly symbol: string;
    readonly logoURI?: string;
    readonly tags?: string[];
    readonly extensions?: {
        readonly [key: string]: {
            [key: string]: {
                [key: string]: ExtensionValue;
            } | ExtensionValue;
        } | ExtensionValue;
    };
}
interface Version {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
}
interface Tags {
    readonly [tagId: string]: {
        readonly name: string;
        readonly description: string;
    };
}
interface TokenList {
    readonly name: string;
    readonly timestamp: string;
    readonly version: Version;
    readonly tokens: TokenInfo[];
    readonly keywords?: string[];
    readonly tags?: Tags;
    readonly logoURI?: string;
}

export { TokenInfo as T, Version as V, TokenList as a, Tags as b };
