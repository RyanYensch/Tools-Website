export type JsonMode = "format" | "minify";

export type JsonStats = {
    objects: number;
    arrays: number;
    keys: number;
    strings: number;
    numbers: number;
    booleans: number;
    nulls: number;
    characters: number;
    lines: number;
};

export type JsonFormatResult = {
    output: string;
    stats: JsonStats;
};

export type JsonTokenType =
    | "key"
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "punctuation"
    | "whitespace"
    | "unknown";

export type JsonToken = {
    value: string;
    type: JsonTokenType;
};

const EMPTY_STATS: JsonStats = {
    objects: 0,
    arrays: 0,
    keys: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    characters: 0,
    lines: 0,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function sortJsonKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortJsonKeys);
    }

    if (isPlainObject(value)) {
        return Object.keys(value)
            .sort((a, b) => a.localeCompare(b))
            .reduce<Record<string, unknown>>((sortedObject, key) => {
                sortedObject[key] = sortJsonKeys(value[key]);
                return sortedObject;
            }, {});
    }

    return value;
}

function countJsonStats(value: unknown): Omit<JsonStats, "characters" | "lines"> {
    const stats = {
        objects: 0,
        arrays: 0,
        keys: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0,
    };

    function visit(item: unknown) {
        if (Array.isArray(item)) {
            stats.arrays++;

            for (const child of item) {
                visit(child);
            }

            return;
        }

        if (isPlainObject(item)) {
            stats.objects++;
            stats.keys += Object.keys(item).length;

            for (const child of Object.values(item)) {
                visit(child);
            }

            return;
        }

        if (typeof item === "string") {
            stats.strings++;
            return;
        }

        if (typeof item === "number") {
            stats.numbers++;
            return;
        }

        if (typeof item === "boolean") {
            stats.booleans++;
            return;
        }

        if (item === null) {
            stats.nulls++;
        }
    }

    visit(value);

    return stats;
}

export function runJsonFormatter(
    input: string,
    mode: JsonMode,
    sortKeys: boolean,
): JsonFormatResult {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        return {
            output: "",
            stats: EMPTY_STATS,
        };
    }

    const parsed = JSON.parse(trimmedInput);
    const finalValue = sortKeys ? sortJsonKeys(parsed) : parsed;

    const output =
        mode === "format"
            ? JSON.stringify(finalValue, null, 2)
            : JSON.stringify(finalValue);

    const countedStats = countJsonStats(finalValue);

    return {
        output,
        stats: {
            ...countedStats,
            characters: output.length,
            lines: output ? output.split("\n").length : 0,
        },
    };
}

export function getJsonErrorMessage(error: unknown): string {
    if (error instanceof SyntaxError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Invalid JSON.";
}

export function tokenizeJson(input: string): JsonToken[] {
    if (!input) {
        return [];
    }

    const tokens: JsonToken[] = [];
    const regex =
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?=\s*:)|"(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}:,]|\[|\]|\s+)/g;

    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
        if (match.index > cursor) {
            tokens.push({
                value: input.slice(cursor, match.index),
                type: "unknown",
            });
        }

        const value = match[0];

        let type: JsonTokenType = "unknown";

        if (/^\s+$/.test(value)) {
            type = "whitespace";
        } else if (/^"(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?=\s*:)/.test(value)) {
            type = "key";
        } else if (/^"/.test(value)) {
            type = "string";
        } else if (/^-?\d/.test(value)) {
            type = "number";
        } else if (value === "true" || value === "false") {
            type = "boolean";
        } else if (value === "null") {
            type = "null";
        } else if ("{}[],:".includes(value)) {
            type = "punctuation";
        }

        tokens.push({
            value,
            type,
        });

        cursor = match.index + value.length;
    }

    if (cursor < input.length) {
        tokens.push({
            value: input.slice(cursor),
            type: "unknown",
        });
    }

    return tokens;
}

export function getSampleJson(): string {
    return JSON.stringify(
        {
            game: "Crystal Realms",
            online: true,
            player: {
                name: "Aria",
                class: "Mage",
                level: 18,
                health: 120,
                inventory: ["Staff", "Mana Potion", "Silver Key"],
            },
            quest: {
                name: "The Lost Rune",
                completed: false,
                rewardGold: 750,
            },
            debugMode: null,
        },
        null,
        2,
    );
}