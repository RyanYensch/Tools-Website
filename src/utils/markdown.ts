export type InlineToken =
    | {
          type: "text";
          value: string;
      }
    | {
          type: "inline-code";
          value: string;
      }
    | {
          type: "bold";
          children: InlineToken[];
      }
    | {
          type: "italic";
          children: InlineToken[];
      }
    | {
          type: "link";
          children: InlineToken[];
          href: string;
          safeHref: string | null;
      };

export type MarkdownBlock =
    | {
          type: "heading";
          level: number;
          children: InlineToken[];
      }
    | {
          type: "paragraph";
          children: InlineToken[];
      }
    | {
          type: "unordered-list";
          items: InlineToken[][];
      }
    | {
          type: "ordered-list";
          items: InlineToken[][];
      }
    | {
          type: "blockquote";
          lines: InlineToken[][];
      }
    | {
          type: "code-block";
          language: string;
          code: string;
      }
    | {
          type: "horizontal-rule";
      };

export type MarkdownStats = {
    characters: number;
    words: number;
    lines: number;
    headings: number;
    links: number;
    codeBlocks: number;
};

const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:"]);

function containsControlCharacters(input: string): boolean {
    return /[\u0000-\u001F\u007F]/.test(input);
}

function getSchemeForHref(href: string): string | null {
    const match = href.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    return match ? `${match[1].toLowerCase()}:` : null;
}

function isSafeRelativeHref(href: string): boolean {
    return (
        href.startsWith("/") ||
        href.startsWith("./") ||
        href.startsWith("../") ||
        href.startsWith("?") ||
        href.startsWith("#")
    );
}

function getSafeHref(href: string): string | null {
    const trimmedHref = href.trim();

    if (!trimmedHref) {
        return null;
    }

    if (containsControlCharacters(trimmedHref)) {
        return null;
    }

    const schemeCheckHref = trimmedHref.replace(/\s+/g, "");
    const scheme = getSchemeForHref(schemeCheckHref);

    if (scheme) {
        if (!ALLOWED_SCHEMES.has(scheme)) {
            return null;
        }

        return trimmedHref;
    }

    if (trimmedHref.startsWith("//")) {
        return null;
    }

    if (isSafeRelativeHref(trimmedHref)) {
        return trimmedHref;
    }

    return null;
}

function findNextSpecialIndex(input: string, start: number): number {
    const specialCharacters = ["`", "*", "["];

    const indexes = specialCharacters
        .map((character) => input.indexOf(character, start))
        .filter((index) => index !== -1);

    if (indexes.length === 0) {
        return input.length;
    }

    return Math.min(...indexes);
}

export function parseInlineMarkdown(
    input: string,
    depth = 0,
): InlineToken[] {
    if (!input) {
        return [];
    }

    if (depth > 5) {
        return [
            {
                type: "text",
                value: input,
            },
        ];
    }

    const tokens: InlineToken[] = [];
    let index = 0;

    while (index < input.length) {
        const previousIndex = index;

        if (input[index] === "`") {
            const endIndex = input.indexOf("`", index + 1);

            if (endIndex !== -1) {
                tokens.push({
                    type: "inline-code",
                    value: input.slice(index + 1, endIndex),
                });

                index = endIndex + 1;
                continue;
            }
        }

        if (input.startsWith("**", index)) {
            const endIndex = input.indexOf("**", index + 2);

            if (endIndex !== -1) {
                tokens.push({
                    type: "bold",
                    children: parseInlineMarkdown(
                        input.slice(index + 2, endIndex),
                        depth + 1,
                    ),
                });

                index = endIndex + 2;
                continue;
            }
        }

        if (input[index] === "*") {
            const endIndex = input.indexOf("*", index + 1);

            if (endIndex !== -1 && endIndex > index + 1) {
                tokens.push({
                    type: "italic",
                    children: parseInlineMarkdown(
                        input.slice(index + 1, endIndex),
                        depth + 1,
                    ),
                });

                index = endIndex + 1;
                continue;
            }
        }

        if (input[index] === "[") {
            const labelEndIndex = input.indexOf("]", index + 1);

            if (labelEndIndex !== -1) {
                const hrefStartIndex = labelEndIndex + 1;

                if (input[hrefStartIndex] === "(") {
                    const hrefEndIndex = input.indexOf(")", hrefStartIndex + 1);

                    if (hrefEndIndex !== -1) {
                        const label = input.slice(index + 1, labelEndIndex);
                        const href = input.slice(
                            hrefStartIndex + 1,
                            hrefEndIndex,
                        );

                        tokens.push({
                            type: "link",
                            children: parseInlineMarkdown(label, depth + 1),
                            href,
                            safeHref: getSafeHref(href),
                        });

                        index = hrefEndIndex + 1;
                        continue;
                    }
                }
            }
        }

        const nextSpecialIndex = findNextSpecialIndex(input, index + 1);
        const endIndex = nextSpecialIndex > index ? nextSpecialIndex : index + 1;

        tokens.push({
            type: "text",
            value: input.slice(index, endIndex),
        });

        index = endIndex;

        if (index === previousIndex) {
            tokens.push({
                type: "text",
                value: input[index],
            });

            index++;
        }
    }

    return tokens.filter((token) => {
        if (token.type === "text") {
            return token.value.length > 0;
        }

        return true;
    });
}

function isHorizontalRule(line: string): boolean {
    const trimmedLine = line.trim();

    return (
        /^-{3,}$/.test(trimmedLine) ||
        /^\*{3,}$/.test(trimmedLine) ||
        /^_{3,}$/.test(trimmedLine)
    );
}

function isBlockStart(line: string): boolean {
    return (
        /^#{1,6}\s+/.test(line) ||
        /^>\s?/.test(line) ||
        /^\s*[-*+]\s+/.test(line) ||
        /^\s*\d+\.\s+/.test(line) ||
        /^```/.test(line) ||
        isHorizontalRule(line)
    );
}

export function parseMarkdown(input: string): MarkdownBlock[] {
    const lines = input.replace(/\r\n/g, "\n").split("\n");
    const blocks: MarkdownBlock[] = [];

    let index = 0;

    while (index < lines.length) {
        const line = lines[index];

        if (line.trim() === "") {
            index++;
            continue;
        }

        if (line.startsWith("```")) {
            const language = line.slice(3).trim();
            const codeLines: string[] = [];

            index++;

            while (index < lines.length && !lines[index].startsWith("```")) {
                codeLines.push(lines[index]);
                index++;
            }

            if (index < lines.length && lines[index].startsWith("```")) {
                index++;
            }

            blocks.push({
                type: "code-block",
                language,
                code: codeLines.join("\n"),
            });

            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);

        if (headingMatch) {
            blocks.push({
                type: "heading",
                level: headingMatch[1].length,
                children: parseInlineMarkdown(headingMatch[2]),
            });

            index++;
            continue;
        }

        if (isHorizontalRule(line)) {
            blocks.push({
                type: "horizontal-rule",
            });

            index++;
            continue;
        }

        if (/^>\s?/.test(line)) {
            const quoteLines: InlineToken[][] = [];

            while (index < lines.length && /^>\s?/.test(lines[index])) {
                quoteLines.push(
                    parseInlineMarkdown(lines[index].replace(/^>\s?/, "")),
                );
                index++;
            }

            blocks.push({
                type: "blockquote",
                lines: quoteLines,
            });

            continue;
        }

        if (/^\s*[-*+]\s+/.test(line)) {
            const items: InlineToken[][] = [];

            while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
                items.push(
                    parseInlineMarkdown(
                        lines[index].replace(/^\s*[-*+]\s+/, ""),
                    ),
                );
                index++;
            }

            blocks.push({
                type: "unordered-list",
                items,
            });

            continue;
        }

        if (/^\s*\d+\.\s+/.test(line)) {
            const items: InlineToken[][] = [];

            while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
                items.push(
                    parseInlineMarkdown(
                        lines[index].replace(/^\s*\d+\.\s+/, ""),
                    ),
                );
                index++;
            }

            blocks.push({
                type: "ordered-list",
                items,
            });

            continue;
        }

        const paragraphLines: string[] = [];

        while (
            index < lines.length &&
            lines[index].trim() !== "" &&
            !isBlockStart(lines[index])
        ) {
            paragraphLines.push(lines[index]);
            index++;
        }

        blocks.push({
            type: "paragraph",
            children: parseInlineMarkdown(paragraphLines.join(" ")),
        });
    }

    return blocks;
}

function countLinksInInlineTokens(tokens: InlineToken[]): number {
    return tokens.reduce((count, token) => {
        if (token.type === "link") {
            return count + 1 + countLinksInInlineTokens(token.children);
        }

        if (token.type === "bold" || token.type === "italic") {
            return count + countLinksInInlineTokens(token.children);
        }

        return count;
    }, 0);
}

export function getMarkdownStats(
    input: string,
    blocks: MarkdownBlock[],
): MarkdownStats {
    return {
        characters: input.length,
        words: input.trim() ? input.trim().split(/\s+/).length : 0,
        lines: input ? input.split(/\r\n|\r|\n/).length : 0,
        headings: blocks.filter((block) => block.type === "heading").length,
        links: blocks.reduce((count, block) => {
            if ("children" in block) {
                return count + countLinksInInlineTokens(block.children);
            }

            if ("items" in block) {
                return (
                    count +
                    block.items.reduce(
                        (itemCount, item) =>
                            itemCount + countLinksInInlineTokens(item),
                        0,
                    )
                );
            }

            if ("lines" in block) {
                return (
                    count +
                    block.lines.reduce(
                        (lineCount, line) =>
                            lineCount + countLinksInInlineTokens(line),
                        0,
                    )
                );
            }

            return count;
        }, 0),
        codeBlocks: blocks.filter((block) => block.type === "code-block").length,
    };
}

export function getSampleMarkdown(): string {
    return `# I hope this website is useful

Thanks for checking out my **developer tools** website.

You can also check out my portfolio here:

[Visit my portfolio](https://yensch.com)

## Features to try

- JSON formatting
- JWT decoding
- Regex testing
- Markdown previewing

> This previewer renders Markdown safely without executing raw HTML or scripts.

## Example code

\`\`\`ts
const website = "tools.yensch.com";
const useful = true;

if (useful) {
    console.log("Thanks for visiting!");
}
\`\`\`

You can also use inline code like \`npm run dev\`.

---

Have fun building cool things.`;
}