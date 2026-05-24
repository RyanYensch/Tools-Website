export type RegexMatch = {
    value: string;
    index: number;
    groups: string[];
};

export function createRegex(pattern: string, flags: string): RegExp {
    return new RegExp(pattern, flags);
}

export function getRegexMatches(pattern: string, flags: string, text: string) {
    if (!pattern) return [];

    const regex = createRegex(pattern, flags);
    const matches: RegexMatch[] = [];

    if (regex.global) {
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            matches.push({
                value: match[0],
                index: match.index,
                groups: match.slice(1),
            });

            if (match[0] === "") {
                regex.lastIndex += 1;
            }
        }
    } else {
        const match = regex.exec(text);

        if (match) {
            matches.push({
                value: match[0],
                index: match.index,
                groups: match.slice(1),
            });
        }
    }

    return matches;
}


export function replaceRegexMatches(pattern: string, flags: string, text: string, replacement: string) {
    if (!pattern) return text;

    const regex = createRegex(pattern, flags);
    return text.replace(regex, replacement);
}