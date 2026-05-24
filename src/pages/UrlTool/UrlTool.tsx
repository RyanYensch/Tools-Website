import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type QueryParam,
    type UrlMode,
    type UrlScope,
    analyseUrl,
    buildQueryString,
    getSampleUrl,
    runUrlTool,
} from "../../utils/url";
import "../ToolPage/ToolPage.css";
import "./UrlTool.css";

function QueryParamTable({
    params,
    onCopy,
}: {
    params: QueryParam[];
    onCopy: (value: string) => void;
}) {
    if (params.length === 0) {
        return (
            <p className="url-muted">
                No query parameters detected.
            </p>
        );
    }

    return (
        <div className="url-query-table">
            <div className="url-query-row header">
                <span>Key</span>
                <span>Value</span>
                <span />
            </div>

            {params.map((param, index) => (
                <div
                    key={`${param.key}-${param.value}-${index}`}
                    className="url-query-row"
                >
                    <code>{param.key}</code>
                    <code>{param.value}</code>

                    <button
                        className="tool-button glow-item"
                        type="button"
                        onClick={() => onCopy(`${param.key}=${param.value}`)}
                    >
                        Copy
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function UrlTool() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<UrlMode>("encode");
    const [scope, setScope] = useState<UrlScope>("component");

    const result = useMemo(() => {
        try {
            return {
                output: runUrlTool(input, mode, scope),
                error: "",
            };
        } catch (error) {
            return {
                output: "",
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not process URL.",
            };
        }
    }, [input, mode, scope]);

    const analysis = useMemo(() => {
        return analyseUrl(input);
    }, [input]);

    const encodedQueryString = useMemo(() => {
        if (!analysis?.queryParams.length) {
            return "";
        }

        return buildQueryString(analysis.queryParams);
    }, [analysis]);

    const handleCopy = async (value: string) => {
        if (!value) {
            return;
        }

        await navigator.clipboard.writeText(value);
    };

    const handleSwapMode = () => {
        if (result.output && !result.error) {
            setInput(result.output);
        }

        setMode((currentMode) =>
            currentMode === "encode" ? "decode" : "encode",
        );
    };

    const handleClear = () => {
        setInput("");
    };

    const handleLoadSample = () => {
        setInput(getSampleUrl());
        setMode("encode");
        setScope("full-url");
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Web</p>
                </div>

                <h1>URL Encoder / Decoder</h1>

                <p>
                    Encode, decode, and inspect URLs, URL components, and query
                    parameters.
                </p>

                <div className="tool-page-tags">
                    <span>URL</span>
                    <span>Encoding</span>
                    <span>Query Params</span>
                </div>
            </div>

            <div className="url-mode-card glass">
                <button
                    type="button"
                    className={`url-mode-button glow-item ${
                        mode === "encode" ? "active" : ""
                    }`}
                    onClick={() => setMode("encode")}
                >
                    Encode
                </button>

                <button
                    type="button"
                    className={`url-mode-button glow-item ${
                        mode === "decode" ? "active" : ""
                    }`}
                    onClick={() => setMode("decode")}
                >
                    Decode
                </button>

                <button
                    type="button"
                    className={`url-mode-button glow-item ${
                        scope === "component" ? "active" : ""
                    }`}
                    onClick={() => setScope("component")}
                    title="Encode or decode the entire input as one URL component."
                >
                    Component
                </button>

                <button
                    type="button"
                    className={`url-mode-button glow-item ${
                        scope === "full-url" ? "active" : ""
                    }`}
                    onClick={() => setScope("full-url")}
                    title="Preserve URL structure characters like :, /, ?, &, and #."
                >
                    Full URL
                </button>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleSwapMode}
                >
                    Swap
                </button>

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
                        <h2>Input</h2>

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={() => handleCopy(input)}
                            disabled={!input}
                        >
                            Copy
                        </button>
                    </div>

                    <textarea
                        className="tool-textarea url-textarea"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Paste a URL, query string, or URL component..."
                        spellCheck={false}
                    />
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Output</h2>

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={() => handleCopy(result.output)}
                            disabled={!result.output}
                        >
                            Copy
                        </button>
                    </div>

                    <pre className={`tool-output url-output ${result.error ? "error" : ""}`}>
                        {result.error ||
                            result.output ||
                            "Encoded or decoded output will appear here."}
                    </pre>
                </div>
            </div>

            <div className="url-details-grid">
                <div className="url-info-card glass">
                    <div className="tool-panel-header">
                        <h2>URL Parts</h2>
                    </div>

                    {analysis ? (
                        <div className="url-parts-list">
                            <div>
                                <span>Protocol</span>
                                <code>{analysis.protocol || "—"}</code>
                            </div>

                            <div>
                                <span>Host</span>
                                <code>{analysis.hostname || "—"}</code>
                            </div>

                            <div>
                                <span>Port</span>
                                <code>{analysis.port || "—"}</code>
                            </div>

                            <div>
                                <span>Path</span>
                                <code>{analysis.pathname || "—"}</code>
                            </div>

                            <div>
                                <span>Query</span>
                                <code>{analysis.search || "—"}</code>
                            </div>

                            <div>
                                <span>Hash</span>
                                <code>{analysis.hash || "—"}</code>
                            </div>
                        </div>
                    ) : (
                        <p className="url-muted">
                            URL details will appear here.
                        </p>
                    )}
                </div>

                <div className="url-info-card glass">
                    <div className="tool-panel-header">
                        <h2>Query Parameters</h2>

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={() => handleCopy(encodedQueryString)}
                            disabled={!encodedQueryString}
                        >
                            Copy Query
                        </button>
                    </div>

                    <QueryParamTable
                        params={analysis?.queryParams ?? []}
                        onCopy={handleCopy}
                    />
                </div>
            </div>

            <div className="url-note-card glass">
                <strong>Tip</strong>
                <p>
                    Use <code>Component</code> for values like search terms or
                    redirect paths. Use <code>Full URL</code> when you want to
                    preserve URL structure while encoding spaces and unsafe
                    characters.
                </p>
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