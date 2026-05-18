import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type Base64Mode,
    runBase64Tool,
} from "../../utils/base64";
import "../ToolPage/ToolPage.css";

export default function Base64Tool() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<Base64Mode>("encode");

    const result = useMemo(() => {
        try {
            return {
                output: runBase64Tool(input, mode),
                error: "",
            };
        } catch (error) {
            return {
                output: "",
                error: error instanceof Error ? error.message : "Something went wrong.",
            };
        }
    }, [input, mode]);

    const handleCopy = async () => {
        if (!result.output) return;

        await navigator.clipboard.writeText(result.output);
    };

    const handleClear = () => {
        setInput("");
    };

    const handleSwapMode = () => {
        setMode((currentMode) => (
            currentMode === "encode" ? "decode" : "encode"
        ));

        if (result.output && !result.error) {
            setInput(result.output);
        }
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Encoding</p>
                </div>

                <h1>Base64 Encoder</h1>

                <p>
                    Encode plain text into Base64 or decode Base64 back into
                    readable text. Everything runs locally in your browser.
                </p>

                <div className="tool-page-tags">
                    <span>Base64</span>
                    <span>Encoding</span>
                    <span>Decoding</span>
                </div>
            </div>

            <div className="tool-mode-toggle glass">
                <button
                    type="button"
                    className={`tool-mode-button glow-item ${mode === "encode" ? "active" : ""}`}
                    onClick={() => setMode("encode")}
                >
                    Encode
                </button>

                <button
                    type="button"
                    className={`tool-mode-button glow-item ${mode === "decode" ? "active" : ""}`}
                    onClick={() => setMode("decode")}
                >
                    Decode
                </button>

                <button
                    type="button"
                    className="tool-button glow-item"
                    onClick={handleSwapMode}
                >
                    Swap
                </button>
            </div>

            <div className="tool-workspace">
                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>
                            {mode === "encode" ? "Text Input" : "Base64 Input"}
                        </h2>
                    </div>

                    <textarea
                        className="tool-textarea"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={
                            mode === "encode"
                                ? "Paste text to encode..."
                                : "Paste Base64 to decode..."
                        }
                    />
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>
                            {mode === "encode" ? "Base64 Output" : "Decoded Output"}
                        </h2>

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={handleCopy}
                            disabled={!result.output}
                        >
                            Copy
                        </button>
                    </div>

                    <pre className={`tool-output ${result.error ? "error" : ""}`}>
                        {result.error || result.output || "Tool output will appear here."}
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