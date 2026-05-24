export type CompareMode = "word" | "char" | "line";

export type DiffType = "same" | "removed" | "added";

export type DiffPart = {
    value: string;
    type: DiffType;
}

export type TextCompareResult = {
    leftParts: DiffPart[];
    rightParts: DiffPart[];
    addedCount: number;
    removedCount: number;
};

function tokenize(text: string, mode: CompareMode): string[] {
    if (mode == "char") {
        return Array.from(text);
    }

    if (mode == "line") {
        return text.match(/[^\n]*\n|[^\n]+/g) ?? [];
    }

    return text.match(/\s+|[A-Za-z0-9_]+|[^\sA-Za-z0-9_]+/g) ?? [];
}

function buildLcsTable(left: string[], right: string[]): number[][] {
    const table = Array.from(
        { length: left.length + 1 },
        () => Array(right.length + 1).fill(0),
    );

    for (let i = left.length - 1; i >= 0; i--) {
        for (let j = right.length - 1; j >= 0; j--) {
            if (left[i] == right[i]) {
                table[i][j] = table[i + 1][j + 1] + 1;
            } else {
                table[i][j] = Math.max(table[i+1][j], table[i][j+1]);
            }
        }
    }

    return table;
}


export function compareTexts(leftText: string, rightText: string, mode: CompareMode): TextCompareResult {
    const leftTokens = tokenize(leftText, mode);
    const rightTokens = tokenize(rightText, mode);
    const table = buildLcsTable(leftTokens, rightTokens);

    const leftParts: DiffPart[] = [];
    const rightParts: DiffPart[] = [];

    let addedCount = 0;
    let removedCount = 0;

    let i = 0;
    let j = 0;

    while (i < leftTokens.length && j < rightTokens.length) {
        if (leftTokens[i] == rightTokens[i]) {
            leftParts.push({
                value: leftTokens[i],
                type: "same",
            });

            rightParts.push({
                value: rightTokens[j],
                type: "same",
            });

            i++;
            j++;
        } else if (table[i + 1][j] >= table[i][j + 1]) {
            leftParts.push({
                value: leftTokens[i],
                type: "removed",
            });

            removedCount++;
            i++;
        } else {
            rightParts.push({
                value: rightTokens[j],
                type: "added",
            });

            addedCount++;
            j++;
        }
    }

    while (i <= leftTokens.length) {
        leftParts.push({
            value: leftTokens[i],
            type: "removed",
        });

        removedCount++;
        i++;
    }

    while (j <= rightTokens.length) {
        rightParts.push({
            value: rightTokens[j],
            type: "added",
        });

        addedCount++;
        j++;
    }

    return {
        leftParts,
        rightParts,
        addedCount,
        removedCount,
    };
}