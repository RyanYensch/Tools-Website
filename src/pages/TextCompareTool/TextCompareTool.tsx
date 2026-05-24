import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type CompareMode,
    type DiffPart,
    compareTexts,
} from "../../utils/textCompare";
import "../ToolPage/ToolPage.css";
import "./TextCompareTool.css";

const COMPARE_MODES: {
    value: CompareMode;
    label: string;
    description: string;
}[] = [
    {
        value: "word",
        label: "Word",
        description: "Best for normal text and code-like snippets",
    },
    {
        value: "char",
        label: "Character",
        description: "Highlights every small character-level change",
    },
    {
        value: "line",
        label: "Line",
        description: "Best for larger blocks of text or code",
    },
];

function renderDiffParts(parts: DiffPart[]) {
    if (parts.length === 0) {
        return "Highlighted differences will appear here.";
    }

    return parts.map((part, index) => (
        <span
            key={`${part.type}-${index}-${part.value}`}
            className={`text-compare-token ${part.type}`}
        >
            {part.value}
        </span>
    ));
}

export default function TextCompareTool() {
    const [leftText, setLeftText] = useState("");
    const [rightText, setRightText] = useState("");
    const [mode, setMode] = useState<CompareMode>("word");

    const result = useMemo(() => {
        return compareTexts(leftText, rightText, mode);
    }, [leftText, rightText, mode]);

    const handleClear = () => {
        setLeftText("");
        setRightText("");
    };

    const handleSwap = () => {
        setLeftText(rightText);
        setRightText(leftText);
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Text</p>
                </div>

                <h1>Text Compare</h1>

                <p>
                    Paste two pieces of text and highlight the differences
                    between them.
                </p>

                <div className="tool-page-tags">
                    <span>Text</span>
                    <span>Diff</span>
                    <span>Compare</span>
                </div>
            </div>

            <div className="text-compare-controls glass">
                <div className="text-compare-mode-buttons">
                    {COMPARE_MODES.map((compareMode) => (
                        <button
                            key={compareMode.value}
                            type="button"
                            className={`text-compare-mode-button glow-item ${
                                mode === compareMode.value ? "active" : ""
                            }`}
                            onClick={() => setMode(compareMode.value)}
                            title={compareMode.description}
                        >
                            {compareMode.label}
                        </button>
                    ))}
                </div>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleSwap}
                >
                    Swap Texts
                </button>
            </div>

            <div className="tool-workspace text-compare-inputs">
                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Original Text</h2>
                    </div>

                    <textarea
                        className="tool-textarea"
                        value={leftText}
                        onChange={(event) => setLeftText(event.target.value)}
                        placeholder="Paste the original text here..."
                        spellCheck={false}
                    />
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Changed Text</h2>
                    </div>

                    <textarea
                        className="tool-textarea"
                        value={rightText}
                        onChange={(event) => setRightText(event.target.value)}
                        placeholder="Paste the changed text here..."
                        spellCheck={false}
                    />
                </div>
            </div>

            <div className="text-compare-summary glass">
                <span>
                    Removed: <strong>{result.removedCount}</strong>
                </span>

                <span>
                    Added: <strong>{result.addedCount}</strong>
                </span>

                <span>
                    Mode: <strong>{mode}</strong>
                </span>
            </div>

            <div className="tool-workspace text-compare-results">
                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Original Highlighted</h2>
                    </div>

                    <pre className="tool-output text-compare-output">
                        {renderDiffParts(result.leftParts)}
                    </pre>
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Changed Highlighted</h2>
                    </div>

                    <pre className="tool-output text-compare-output">
                        {renderDiffParts(result.rightParts)}
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
        </section>
    );
}