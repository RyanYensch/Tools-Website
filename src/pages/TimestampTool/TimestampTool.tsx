import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type TimestampMode,
    type TimestampUnit,
    createTimestampOutput,
    formatDateTimeLocalInput,
    parseDateInput,
    parseTimestampInput,
} from "../../utils/timestamp";
import "../ToolPage/ToolPage.css";
import "./TimestampTool.css";

function OutputItem({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy: (value: string) => void;
}) {
    return (
        <div className="timestamp-output-item glass">
            <div className="timestamp-output-header">
                <h2>{label}</h2>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={() => onCopy(value)}
                    disabled={!value}
                >
                    Copy
                </button>
            </div>

            <pre className="timestamp-output-value">
                {value || "Output will appear here."}
            </pre>
        </div>
    );
}

export default function TimestampTool() {
    const now = new Date();

    const [mode, setMode] = useState<TimestampMode>("timestamp-to-date");
    const [timestampInput, setTimestampInput] = useState(
        Math.floor(now.getTime() / 1000).toString(),
    );
    const [timestampUnit, setTimestampUnit] =
        useState<TimestampUnit>("auto");

    const [dateInput, setDateInput] = useState(
        formatDateTimeLocalInput(now),
    );

    const result = useMemo(() => {
        try {
            const date =
                mode === "timestamp-to-date"
                    ? parseTimestampInput(timestampInput, timestampUnit)
                    : parseDateInput(dateInput);

            return {
                output: createTimestampOutput(date),
                error: "",
            };
        } catch (error) {
            return {
                output: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not convert timestamp.",
            };
        }
    }, [mode, timestampInput, timestampUnit, dateInput]);

    const handleCopy = async (value: string) => {
        if (!value) {
            return;
        }

        await navigator.clipboard.writeText(value);
    };

    const handleCopyAll = async () => {
        if (!result.output) {
            return;
        }

        const outputText = [
            `ISO: ${result.output.iso}`,
            `UTC: ${result.output.utc}`,
            `Local: ${result.output.local}`,
            `Unix Seconds: ${result.output.unixSeconds}`,
            `Unix Milliseconds: ${result.output.unixMilliseconds}`,
            `Timezone Offset: ${result.output.timezoneOffset}`,
            `Relative: ${result.output.relative}`,
        ].join("\n");

        await navigator.clipboard.writeText(outputText);
    };

    const handleUseCurrentTime = () => {
        const currentDate = new Date();

        setTimestampInput(
            Math.floor(currentDate.getTime() / 1000).toString(),
        );
        setDateInput(formatDateTimeLocalInput(currentDate));
    };

    const handleSwapMode = () => {
        if (result.output) {
            if (mode === "timestamp-to-date") {
                setDateInput(result.output.iso);
                setMode("date-to-timestamp");
            } else {
                setTimestampInput(result.output.unixSeconds);
                setMode("timestamp-to-date");
            }
            return;
        }

        setMode((currentMode) =>
            currentMode === "timestamp-to-date"
                ? "date-to-timestamp"
                : "timestamp-to-date",
        );
    };

    const handleClear = () => {
        setTimestampInput("");
        setDateInput("");
        setTimestampUnit("auto");
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Time</p>
                </div>

                <h1>Timestamp Converter</h1>

                <p>
                    Convert Unix timestamps into readable dates, or convert
                    dates back into Unix timestamps.
                </p>

                <div className="tool-page-tags">
                    <span>Unix</span>
                    <span>Timestamp</span>
                    <span>Date</span>
                    <span>Time</span>
                </div>
            </div>

            <div className="timestamp-mode-card glass">
                <button
                    type="button"
                    className={`timestamp-mode-button glow-item ${
                        mode === "timestamp-to-date" ? "active" : ""
                    }`}
                    onClick={() => setMode("timestamp-to-date")}
                >
                    Timestamp → Date
                </button>

                <button
                    type="button"
                    className={`timestamp-mode-button glow-item ${
                        mode === "date-to-timestamp" ? "active" : ""
                    }`}
                    onClick={() => setMode("date-to-timestamp")}
                >
                    Date → Timestamp
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
                    onClick={handleUseCurrentTime}
                >
                    Now
                </button>
            </div>

            <div className="timestamp-input-card glass">
                <div className="tool-panel-header">
                    <h2>
                        {mode === "timestamp-to-date"
                            ? "Timestamp Input"
                            : "Date Input"}
                    </h2>

                    <button
                        className="tool-button glow-item"
                        type="button"
                        onClick={handleCopyAll}
                        disabled={!result.output}
                    >
                        Copy All
                    </button>
                </div>

                {mode === "timestamp-to-date" ? (
                    <div className="timestamp-input-row">
                        <label className="timestamp-control-label">
                            Unit
                            <select
                                className="timestamp-select"
                                value={timestampUnit}
                                onChange={(event) =>
                                    setTimestampUnit(
                                        event.target.value as TimestampUnit,
                                    )
                                }
                            >
                                <option value="auto">Auto Detect</option>
                                <option value="seconds">Seconds</option>
                                <option value="milliseconds">
                                    Milliseconds
                                </option>
                            </select>
                        </label>

                        <label className="timestamp-control-label timestamp-main-input-label">
                            Unix Timestamp
                            <input
                                className="timestamp-input"
                                value={timestampInput}
                                onChange={(event) =>
                                    setTimestampInput(event.target.value)
                                }
                                placeholder="Example: 1710000000"
                                spellCheck={false}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="timestamp-input-row">
                        <label className="timestamp-control-label timestamp-main-input-label">
                            Date String
                            <input
                                className="timestamp-input"
                                value={dateInput}
                                onChange={(event) =>
                                    setDateInput(event.target.value)
                                }
                                placeholder="Example: 2026-05-25T10:30:00 or 2026-05-25"
                                spellCheck={false}
                            />
                        </label>
                    </div>
                )}

                {result.error && (
                    <div className="timestamp-error">
                        {result.error}
                    </div>
                )}
            </div>

            <div className="timestamp-output-grid">
                <OutputItem
                    label="Local Date"
                    value={result.output?.local ?? ""}
                    onCopy={handleCopy}
                />

                <OutputItem
                    label="UTC Date"
                    value={result.output?.utc ?? ""}
                    onCopy={handleCopy}
                />

                <OutputItem
                    label="ISO 8601"
                    value={result.output?.iso ?? ""}
                    onCopy={handleCopy}
                />

                <OutputItem
                    label="Unix Seconds"
                    value={result.output?.unixSeconds ?? ""}
                    onCopy={handleCopy}
                />

                <OutputItem
                    label="Unix Milliseconds"
                    value={result.output?.unixMilliseconds ?? ""}
                    onCopy={handleCopy}
                />

                <OutputItem
                    label="Relative Time"
                    value={result.output?.relative ?? ""}
                    onCopy={handleCopy}
                />

                <OutputItem
                    label="Timezone Offset"
                    value={result.output?.timezoneOffset ?? ""}
                    onCopy={handleCopy}
                />
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