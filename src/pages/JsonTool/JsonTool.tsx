import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type JsonMode,
    getJsonErrorMessage,
    getSampleJson,
    runJsonFormatter,
    tokenizeJson,
} from "../../utils/json";
import "../ToolPage/ToolPage.css";
import "./JsonTool.css";

export default function JsonTool() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<JsonMode>("format");
    const [sortKeys, setSortKeys] = useState(false);

    const result = useMemo(() => {
        try {
            return {
                output: runJsonFormatter(input, mode, sortKeys),
                error: "",
            };
        } catch (error) {
            return {
                output: null,
                error: getJsonErrorMessage(error),
            };
        }
    }, [input, mode, sortKeys]);

    const highlightedTokens = useMemo(() => {
        return tokenizeJson(result.output?.output ?? "");
    }, [result.output]);

    const handleCopy = async () => {
        if (!result.output?.output) {
            return;
        }

        await navigator.clipboard.writeText(result.output.output);
    };

    const handleCopyInput = async () => {
        if (!input) {
            return;
        }

        await navigator.clipboard.writeText(input);
    };

    const handleClear = () => {
        setInput("");
    };

    const handleLoadSample = () => {
        setInput(getSampleJson());
        setMode("format");
    };

    const handleUseOutputAsInput = () => {
        if (!result.output?.output) {
            return;
        }

        setInput(result.output.output);
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Data</p>
                </div>

                <h1>JSON Formatter</h1>

                <p>
                    Format, minify, validate, and inspect JSON locally in your
                    browser.
                </p>

                <div className="tool-page-tags">
                    <span>JSON</span>
                    <span>Formatter</span>
                    <span>Validator</span>
                </div>
            </div>

            <div className="json-mode-card glass">
                <button
                    type="button"
                    className={`json-mode-button glow-item ${
                        mode === "format" ? "active" : ""
                    }`}
                    onClick={() => setMode("format")}
                >
                    Format
                </button>

                <button
                    type="button"
                    className={`json-mode-button glow-item ${
                        mode === "minify" ? "active" : ""
                    }`}
                    onClick={() => setMode("minify")}
                >
                    Minify
                </button>

                <label className="json-checkbox-label">
                    <input
                        type="checkbox"
                        checked={sortKeys}
                        onChange={(event) => setSortKeys(event.target.checked)}
                    />
                    Sort keys
                </label>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleLoadSample}
                >
                    Sample
                </button>
            </div>

            <div className="tool-workspace">
                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>JSON Input</h2>

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={handleCopyInput}
                            disabled={!input}
                        >
                            Copy
                        </button>
                    </div>

                    <textarea
                        className="tool-textarea json-textarea"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder='Paste JSON here, e.g. {"name":"Ryan","admin":false}'
                        spellCheck={false}
                    />
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>JSON Output</h2>

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={handleCopy}
                            disabled={!result.output?.output}
                        >
                            Copy
                        </button>
                    </div>

                    <pre
                        className={`tool-output json-output ${
                            result.error ? "error" : ""
                        }`}
                    >
                        {result.error
                            ? result.error
                            : highlightedTokens.length > 0
                                ? highlightedTokens.map((token, index) => (
                                    <span
                                        key={`${token.type}-${index}-${token.value}`}
                                        className={`json-token json-token-${token.type}`}
                                    >
                                        {token.value}
                                    </span>
                                ))
                                : "Formatted JSON will appear here."}
                    </pre>
                </div>
            </div>

            {result.output && !result.error && (
                <div className="json-stats-grid">
                    <div className="json-stat-card glass">
                        <span>Objects</span>
                        <strong>{result.output.stats.objects}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Arrays</span>
                        <strong>{result.output.stats.arrays}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Keys</span>
                        <strong>{result.output.stats.keys}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Strings</span>
                        <strong>{result.output.stats.strings}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Numbers</span>
                        <strong>{result.output.stats.numbers}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Booleans</span>
                        <strong>{result.output.stats.booleans}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Nulls</span>
                        <strong>{result.output.stats.nulls}</strong>
                    </div>

                    <div className="json-stat-card glass">
                        <span>Lines</span>
                        <strong>{result.output.stats.lines}</strong>
                    </div>
                </div>
            )}

            <div className="tool-actions">
                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleUseOutputAsInput}
                    disabled={!result.output?.output}
                >
                    Use Output as Input
                </button>

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