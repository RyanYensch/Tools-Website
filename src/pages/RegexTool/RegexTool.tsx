import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type RegexMatch, getRegexMatches, replaceRegexMatches } from "../../utils/regex";
import "../ToolPage/ToolPage.css"
import "./RegexTool.css"

const FLAG_OPTIONS = [
    {
        value: "g",
        label: "Global",
        description: "Final all matches",
    }, {
        value: "i",
        label: "Ignore Case",
        description: "Case-insensitive matching",
    }, {
        value: "m",
        label: "Multiline",
        description: "^ and $ match each line",
    }, {
        value: "s",
        label: "Dot ALl",
        description: ". matches newlines",
    }, {
        value: "U",
        label: "Unicode",
        description: "Unicode-aware matching",
    }
] as const;

type RegexFlag = (typeof FLAG_OPTIONS)[number]["value"];

type HighlightPart = {
    text: string;
    highlighted: boolean;
    key: string;
};

function buildHighlightedParts(text: string, matches: RegexMatch[]): HighlightPart[] {
    const parts: HighlightPart[] = [];
    const visibleMatches = matches.filter((match) => match.value.length > 0).sort((a,b) => a.index - b.index);

    let cursor = 0;

    visibleMatches.forEach((match, matchIndex) => {
        if (match.index < cursor) {
            return;
        }

        if (cursor < match.index) {
            parts.push({
                text: text.slice(cursor, match.index),
                highlighted: false,
                key: `text-${matchIndex}-${cursor}`,
            });
        }

        parts.push({
            text: match.value,
            highlighted: true,
            key: `match-${matchIndex}-${cursor}`,
        });

        cursor = match.index + match.value.length;
    });

    if (cursor < text.length) {
        parts.push({
            text: text.slice(cursor),
            highlighted: false,
            key: `text-end-${cursor}`,
        });
    }

    return parts;
}

export default function RegexTool() {
    const [pattern, setPattern] = useState("");
    const [testText, setTestText] = useState("");
    const [replacement, setReplacement] = useState("");
    const [selectedFlags, setSelectedFlags] = useState<RegexFlag[]>(["g"]);

    const flags = selectedFlags.join("");

    const regexResult = useMemo(() => {
        try {
            const matches = getRegexMatches(pattern, flags, testText);
            const replacedText = replaceRegexMatches(pattern, flags, testText, replacement);

            return {
                matches,
                replacedText,
                error: "",
            };
        } catch (error) {
            return {
                matches: [],
                replacedText: "",
                error: error instanceof Error ? error.message : "Invalid regex",
            };
        }
    }, [pattern, flags, testText, replacement]);

    const highlightedParts = useMemo(() => {
        return buildHighlightedParts(testText, regexResult.matches);
    }, [testText, regexResult.matches]);

    const toggleFlag = (flag: RegexFlag) => {
        setSelectedFlags((currentFlags) => {
            if (currentFlags.includes(flag)) {
                return currentFlags.filter((item) => item !== flag);
            }

            return [...currentFlags, flag];
        });
    };

    const handleClear = () => {
        setPattern("");
        setTestText("");
        setReplacement("");
        setSelectedFlags(["g"]);
    };

    const handleCopyReplacement = async () => {
        if (!regexResult.replacedText) {
            return;
        }

        await navigator.clipboard.writeText(regexResult.replacedText);
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Text</p>

                    <span className="tool-page-status available">Available</span>

                    <h1>Regex Tester</h1>

                    <p>
                        Test Regex expressions, highlight matches, and preview replacements.
                    </p>

                    <div className="tool-page-tags">
                        <span>Regex</span>
                        <span>Pattern Matching</span>
                        <span>Text</span>
                    </div>
                </div>

                <div className="regex-builder glass">
                    <label className="regex-label">
                        Pattern
                        <div className="regex-pattern-row">
                            <span className="rgex-slash">/</span>

                            <input
                                className="regex-input"
                                value={pattern}
                                onChange={(event) => setPattern(event.target.value)}
                                placeholder="example: \\b\w+@\\w\\.\\w+\\b" 
                                spellCheck={false}
                            />

                            <span className="regex-slash">/{flags}</span>
                        </div>
                    </label>

                    <div className="regex-flags">
                        {FLAG_OPTIONS.map((flag) => (
                            <button
                                key={flag.value}
                                type="button"
                                className={`regex-flag-button glow-item ${
                                    selectedFlags.includes(flag.value) ? "active" : ""
                                }`}
                                onClick={() => toggleFlag(flag.value)}
                                title={flag.description}>
                                    <span>{flag.value}</span>
                                    {flag.label}
                                </button>
                        ))}
                    </div>

                    {regexResult.error && (
                        <p className="regex-error">
                            {regexResult.error}
                        </p>
                    )}
                </div>

                <div className="tool-workspace">
                    <div className="tool-panel glass">
                        <div className="tool-panel-header">
                            <h2>Test Text</h2>
                        </div>

                        <textarea
                            className="tool-textarea"
                            value={testText}
                            onChange={(event) => setTestText(event.target.value)}
                            placeholder="Paste text to test your regex against..."
                            spellCheck={false}
                        />
                    </div>

                    <div className="tool-panel glass">
                        <div className="tool-panel-header">
                            <h2>
                                Matches: {regexResult.matches.length}
                            </h2>
                        </div>

                        <pre className={`tool-output regex-highlight-output ${
                            regexResult.error ? "error" : ""
                        }`}>
                            {regexResult.error
                                ? regexResult.error
                                : highlightedParts.length > 0
                                    ? highlightedParts.map((part) => (
                                        <span
                                            key={part.key}
                                            className={
                                                part.highlighted ? "regex-highlight" : undefined
                                            }
                                        >
                                            {part.text}
                                        </span>
                                    ))
                                    : "Highlighted matches will appear here."}
                        </pre>
                    </div>
                </div>

                <div className="regex-details-grid">
                    <div className="regex-info-panel glass">
                        <div className="tool-panel-header">
                            <h2>Match Details</h2>
                        </div>

                        {regexResult.matches.length === 0 ? (
                            <p className="regex-muted">
                                No matches yet.
                            </p>
                        ) : (
                            <div className="regex-match-list">
                                {regexResult.matches.map((match, index) => (
                                    <div 
                                        key={`${match.index}-${index}`}
                                        className="regex-match-item"
                                    >
                                        <div className="regex-match-top">
                                            <strong>Match {index + 1}</strong>
                                            <span>index {match.index}</span>
                                        </div>

                                        <code>{match.value || "(empty match)"}</code>

                                        {match.groups.length > 0 && (
                                            <div className="regex-groups">
                                                {match.groups.map((group, groupIndex) => (
                                                    <span key={groupIndex}>
                                                        Group {groupIndex + 1}:{" "}
                                                        <code>{group}</code>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="regex-info-panel glass">
                        <div className="tool-panel-header">
                            <h2>Replace Preview</h2>

                            <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={handleCopyReplacement}
                            disabled={!regexResult.replacedText || Boolean(regexResult.error)}
                            >
                                Copy
                            </button>
                        </div>

                        <input
                            className="regex-input replace"
                            value={replacement}
                            onChange={(event) => setReplacement(event.target.value)}
                            placeholder="Replacement text..."
                            spellCheck={false}
                        />

                        <pre className="tool-output regex-replace-output">
                            {regexResult.error
                                ? "Fix the regex to preview replacements."
                                : regexResult.replacedText || "Replacement output will appear here."}
                        </pre>
                    </div>
                </div>

                <div className="tool-actions">
                    <button
                        className="tool-button glow-item"
                        type="button"
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </section>
    );
}