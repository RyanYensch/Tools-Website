export type SqlDialect = "mysql" | "postgres" | "sqlite" | "mssql";

export type SqliInput = {
    id: string;
    name: string;
    value: string;
};

export type InjectedRange = {
    start: number;
    end: number;
    inputName: string;
};

export type SqlTokenType =
    | "keyword"
    | "identifier"
    | "string"
    | "unterminated-string"
    | "number"
    | "operator"
    | "punctuation"
    | "comment"
    | "whitespace"
    | "unknown";

export type SqlToken = {
    value: string;
    type: SqlTokenType;
    start: number;
    end: number;
};

export type SqliBuildResult = {
    query: string;
    ranges: InjectedRange[];
    replacementCount: number;
    warnings: string[];
};

export type SqliWarning = {
    level: "info" | "warning" | "danger";
    message: string;
};

const SQL_KEYWORDS = new Set([
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "NOT",
    "NULL",
    "IS",
    "LIKE",
    "IN",
    "BETWEEN",
    "UNION",
    "ORDER",
    "BY",
    "GROUP",
    "HAVING",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "CREATE",
    "ALTER",
    "TABLE",
    "DATABASE",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "OUTER",
    "ON",
    "AS",
    "LIMIT",
    "OFFSET",
    "TRUE",
    "FALSE",
]);

function isIdentifierStart(char: string): boolean {
    return /[A-Za-z_]/.test(char);
}

function isIdentifierPart(char: string): boolean {
    return /[A-Za-z0-9_]/.test(char);
}

function isWhitespace(char: string): boolean {
    return /\s/.test(char);
}

function rangeOverlapsToken(range: InjectedRange, token: SqlToken): boolean {
    return range.start < token.end && range.end > token.start;
}

export function tokenOverlapsInjectedRange(
    token: SqlToken,
    ranges: InjectedRange[],
): boolean {
    return ranges.some((range) => rangeOverlapsToken(range, token));
}

export function getInjectedNamesForToken(
    token: SqlToken,
    ranges: InjectedRange[],
): string[] {
    return ranges
        .filter((range) => rangeOverlapsToken(range, token))
        .map((range) => range.inputName);
}

export function buildUnsafeSqlQuery(
    template: string,
    inputs: SqliInput[],
): SqliBuildResult {
    let query = "";
    let inputIndex = 0;
    let replacementCount = 0;

    const ranges: InjectedRange[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < template.length; i++) {
        const char = template[i];

        if (char === "?") {
            const input = inputs[inputIndex];

            if (!input) {
                query += "?";
                warnings.push(`No input value was provided for placeholder ${inputIndex + 1}.`);
                inputIndex++;
                continue;
            }

            const start = query.length;
            query += input.value;
            const end = query.length;

            ranges.push({
                start,
                end,
                inputName: input.name || `input${inputIndex + 1}`,
            });

            inputIndex++;
            replacementCount++;
            continue;
        }

        query += char;
    }

    if (inputs.length > replacementCount) {
        warnings.push(
            `${inputs.length - replacementCount} input value(s) were not used because there were not enough ? placeholders.`,
        );
    }

    return {
        query,
        ranges,
        replacementCount,
        warnings,
    };
}

export function tokenizeSql(sql: string, dialect: SqlDialect): SqlToken[] {
    const tokens: SqlToken[] = [];
    let i = 0;

    while (i < sql.length) {
        const start = i;
        const char = sql[i];
        const next = sql[i + 1];

        if (isWhitespace(char)) {
            while (i < sql.length && isWhitespace(sql[i])) {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "whitespace",
                start,
                end: i,
            });

            continue;
        }

        if (
            char === "-" &&
            next === "-" &&
            (dialect !== "mysql" || sql[i + 2] === undefined || isWhitespace(sql[i + 2]))
        ) {
            i += 2;

            while (i < sql.length && sql[i] !== "\n") {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "comment",
                start,
                end: i,
            });

            continue;
        }

        if (dialect === "mysql" && char === "#") {
            i++;

            while (i < sql.length && sql[i] !== "\n") {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "comment",
                start,
                end: i,
            });

            continue;
        }

        if (char === "/" && next === "*") {
            i += 2;

            while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) {
                i++;
            }

            if (i < sql.length) {
                i += 2;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "comment",
                start,
                end: i,
            });

            continue;
        }

        if (char === "'") {
            i++;

            let closed = false;

            while (i < sql.length) {
                if (dialect === "mysql" && sql[i] === "\\") {
                    i += 2;
                    continue;
                }

                if (sql[i] === "'") {
                    if (sql[i + 1] === "'") {
                        i += 2;
                        continue;
                    }

                    i++;
                    closed = true;
                    break;
                }

                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: closed ? "string" : "unterminated-string",
                start,
                end: i,
            });

            continue;
        }

        if (char === "`" && dialect === "mysql") {
            i++;

            while (i < sql.length && sql[i] !== "`") {
                i++;
            }

            if (i < sql.length) {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "identifier",
                start,
                end: i,
            });

            continue;
        }

        if (char === '"' && (dialect === "postgres" || dialect === "sqlite")) {
            i++;

            while (i < sql.length && sql[i] !== '"') {
                i++;
            }

            if (i < sql.length) {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "identifier",
                start,
                end: i,
            });

            continue;
        }

        if (/[0-9]/.test(char)) {
            i++;

            while (i < sql.length && /[0-9.]/.test(sql[i])) {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "number",
                start,
                end: i,
            });

            continue;
        }

        if (isIdentifierStart(char)) {
            i++;

            while (i < sql.length && isIdentifierPart(sql[i])) {
                i++;
            }

            const value = sql.slice(start, i);
            const upperValue = value.toUpperCase();

            tokens.push({
                value,
                type: SQL_KEYWORDS.has(upperValue) ? "keyword" : "identifier",
                start,
                end: i,
            });

            continue;
        }

        if ("=<>!+-*/%|&".includes(char)) {
            i++;

            while (i < sql.length && "=<>!+-*/%|&".includes(sql[i])) {
                i++;
            }

            tokens.push({
                value: sql.slice(start, i),
                type: "operator",
                start,
                end: i,
            });

            continue;
        }

        if ("(),.;".includes(char)) {
            i++;

            tokens.push({
                value: sql.slice(start, i),
                type: "punctuation",
                start,
                end: i,
            });

            continue;
        }

        i++;

        tokens.push({
            value: sql.slice(start, i),
            type: "unknown",
            start,
            end: i,
        });
    }

    return tokens;
}

export function analyseSqliResult(
    tokens: SqlToken[],
    ranges: InjectedRange[],
): SqliWarning[] {
    const warnings: SqliWarning[] = [];

    const injectedComments = tokens.filter(
        (token) => token.type === "comment" && tokenOverlapsInjectedRange(token, ranges),
    );

    if (injectedComments.length > 0) {
        warnings.push({
            level: "danger",
            message:
                "An input created a SQL comment. This can cause the rest of the original query to be ignored.",
        });
    }

    const injectedLogicOperators = tokens.filter(
        (token) =>
            token.type === "keyword" &&
            ["OR", "AND", "UNION"].includes(token.value.toUpperCase()) &&
            tokenOverlapsInjectedRange(token, ranges),
    );

    if (injectedLogicOperators.length > 0) {
        warnings.push({
            level: "danger",
            message:
                "An input introduced SQL logic outside of a string. This means the input changed the meaning of the query.",
        });
    }

    const hasUnterminatedString = tokens.some((token) => token.type === "unterminated-string");

    if (hasUnterminatedString) {
        warnings.push({
            level: "warning",
            message:
                "The final query contains an unterminated string. The injected quote structure may have broken the query.",
        });
    }

    const nonWhitespaceTokens = tokens.filter((token) => token.type !== "whitespace");

    for (let i = 0; i < nonWhitespaceTokens.length - 3; i++) {
        const first = nonWhitespaceTokens[i];
        const second = nonWhitespaceTokens[i + 1];
        const third = nonWhitespaceTokens[i + 2];
        const fourth = nonWhitespaceTokens[i + 3];

        const startsWithOr = first.type === "keyword" && first.value.toUpperCase() === "OR";
        const sameComparison =
            second.value === fourth.value &&
            ["number", "string", "identifier"].includes(second.type) &&
            third.type === "operator" &&
            third.value.includes("=");

        if (startsWithOr && sameComparison) {
            warnings.push({
                level: "danger",
                message:
                    "The query appears to contain a tautology such as OR 1=1. This is a classic login-bypass pattern.",
            });
            break;
        }
    }

    if (warnings.length === 0) {
        warnings.push({
            level: "info",
            message:
                "No obvious injection pattern detected yet. Try adding quotes, OR conditions, or comments to see how the query changes.",
        });
    }

    return warnings;
}