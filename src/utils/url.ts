export type UrlMode = "encode" | "decode";
export type UrlScope = "component" | "full-url";

export type QueryParam = {
    key: string;
    value: string;
};

export type UrlAnalysis = {
    href: string;
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    queryParams: QueryParam[];
};

export function runUrlTool(
    input: string,
    mode: UrlMode,
    scope: UrlScope,
): string {
    if (!input) {
        return "";
    }

    try {
        if (mode === "encode" && scope === "component") {
            return encodeURIComponent(input);
        }

        if (mode === "encode" && scope === "full-url") {
            return encodeURI(input);
        }

        if (mode === "decode" && scope === "component") {
            return decodeURIComponent(input);
        }

        return decodeURI(input);
    } catch {
        throw new Error("Invalid URL encoding. Check for incomplete percent escapes like %2 or %ZZ.");
    }
}

export function parseQueryString(input: string): QueryParam[] {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        return [];
    }

    let queryString = trimmedInput;

    if (queryString.includes("?")) {
        queryString = queryString.slice(queryString.indexOf("?") + 1);
    }

    if (queryString.includes("#")) {
        queryString = queryString.slice(0, queryString.indexOf("#"));
    }

    if (queryString.startsWith("?")) {
        queryString = queryString.slice(1);
    }

    if (!queryString) {
        return [];
    }

    const params = new URLSearchParams(queryString);

    return Array.from(params.entries()).map(([key, value]) => ({
        key,
        value,
    }));
}

export function analyseUrl(input: string): UrlAnalysis | null {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        return null;
    }

    try {
        const url = new URL(trimmedInput);

        return {
            href: url.href,
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
            queryParams: Array.from(url.searchParams.entries()).map(
                ([key, value]) => ({
                    key,
                    value,
                }),
            ),
        };
    } catch {
        try {
            const url = new URL(trimmedInput, "https://example.com");

            return {
                href: trimmedInput,
                protocol: trimmedInput.startsWith("/") ? "(relative URL)" : "",
                hostname: trimmedInput.startsWith("/") ? "(current host)" : "",
                port: "",
                pathname: url.pathname,
                search: url.search,
                hash: url.hash,
                queryParams: Array.from(url.searchParams.entries()).map(
                    ([key, value]) => ({
                        key,
                        value,
                    }),
                ),
            };
        } catch {
            return {
                href: trimmedInput,
                protocol: "",
                hostname: "",
                port: "",
                pathname: "",
                search: "",
                hash: "",
                queryParams: parseQueryString(trimmedInput),
            };
        }
    }
}

export function buildQueryString(params: QueryParam[]): string {
    const searchParams = new URLSearchParams();

    for (const param of params) {
        if (!param.key) {
            continue;
        }

        searchParams.append(param.key, param.value);
    }

    return searchParams.toString();
}

export function getSampleUrl(): string {
    return "https://tools.yensch.com/search?q=hello world&category=security&redirect=/jwt#results";
}