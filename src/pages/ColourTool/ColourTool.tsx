import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type ColourOutput,
    createColourOutput,
    formatHex,
} from "../../utils/colour";
import "../ToolPage/ToolPage.css";
import "./ColourTool.css";

function ColourValueCard({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy: (value: string) => void;
}) {
    return (
        <div className="colour-value-card glass">
            <div className="colour-value-header">
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

            <pre className="colour-value-output">
                {value || "Output will appear here."}
            </pre>
        </div>
    );
}

function ColourSlider({
    label,
    value,
    max,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="colour-slider-label">
            <span>
                {label}: <strong>{Math.round(value)}</strong>
            </span>

            <input
                type="range"
                min="0"
                max={max}
                value={Math.round(value)}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </label>
    );
}

export default function ColourTool() {
    const [input, setInput] = useState("#38BDF8");

    const result = useMemo(() => {
        try {
            return {
                output: createColourOutput(input),
                error: "",
            };
        } catch (error) {
            return {
                output: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not parse colour.",
            };
        }
    }, [input]);

    const handleCopy = async (value: string) => {
        if (!value) {
            return;
        }

        await navigator.clipboard.writeText(value);
    };

    const handlePickerChange = (value: string) => {
        setInput(value);
    };

    const handleRgbChange = (
        channel: "r" | "g" | "b",
        value: number,
        output: ColourOutput,
    ) => {
        setInput(
            formatHex({
                ...output.rgb,
                [channel]: value,
                a: 1,
            }),
        );
    };

    const handleLoadSample = () => {
        setInput("#8B5CF6");
    };

    const handleClear = () => {
        setInput("");
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Design</p>
                </div>

                <h1>Colour Converter</h1>

                <p>
                    Pick a colour and convert between HEX, RGB, HSL, HSV, and
                    CSS formats.
                </p>

                <div className="tool-page-tags">
                    <span>Colour</span>
                    <span>HEX</span>
                    <span>RGB</span>
                    <span>HSL</span>
                </div>
            </div>

            <div className="colour-input-card glass">
                <label className="colour-picker-label">
                    Colour Picker
                    <input
                        className="colour-picker-input"
                        type="color"
                        value={result.output?.hex ?? "#38BDF8"}
                        onChange={(event) =>
                            handlePickerChange(event.target.value)
                        }
                    />
                </label>

                <label className="colour-text-label">
                    Colour Value
                    <input
                        className="colour-text-input"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="#38BDF8, rgb(56, 189, 248), hsl(199, 95%, 61%)"
                        spellCheck={false}
                    />
                </label>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleLoadSample}
                >
                    Sample
                </button>
            </div>

            {result.error && (
                <div className="colour-error-card glass">
                    {result.error}
                </div>
            )}

            {result.output && (
                <>
                    <div className="colour-preview-grid">
                        <div className="colour-preview-card glass">
                            <div className="tool-panel-header">
                                <h2>Preview</h2>

                                <button
                                    className="tool-button glow-item"
                                    type="button"
                                    onClick={() => handleCopy(result.output!.hex)}
                                >
                                    Copy HEX
                                </button>
                            </div>

                            <div
                                className="colour-preview-box"
                                style={{
                                    background: result.output.hex,
                                    color: result.output.contrastTextHex,
                                }}
                            >
                                <strong>{result.output.hex}</strong>
                                <span>{result.output.contrastTextLabel}</span>
                            </div>
                        </div>

                        <div className="colour-preview-card glass">
                            <div className="tool-panel-header">
                                <h2>RGB Sliders</h2>
                            </div>

                            <div className="colour-slider-list">
                                <ColourSlider
                                    label="Red"
                                    value={result.output.rgb.r}
                                    max={255}
                                    onChange={(value) =>
                                        handleRgbChange("r", value, result.output!)
                                    }
                                />

                                <ColourSlider
                                    label="Green"
                                    value={result.output.rgb.g}
                                    max={255}
                                    onChange={(value) =>
                                        handleRgbChange("g", value, result.output!)
                                    }
                                />

                                <ColourSlider
                                    label="Blue"
                                    value={result.output.rgb.b}
                                    max={255}
                                    onChange={(value) =>
                                        handleRgbChange("b", value, result.output!)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="colour-value-grid">
                        <ColourValueCard
                            label="HEX"
                            value={result.output.hex}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="HEX + Alpha"
                            value={result.output.hexWithAlpha}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="RGB"
                            value={result.output.rgbText}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="RGBA"
                            value={result.output.rgbaText}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="HSL"
                            value={result.output.hslText}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="HSLA"
                            value={result.output.hslaText}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="HSV"
                            value={result.output.hsvText}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="CSS Variable"
                            value={result.output.cssVariable}
                            onCopy={handleCopy}
                        />

                        <ColourValueCard
                            label="Contrast"
                            value={`${result.output.contrastTextLabel} · ${result.output.contrastRatio}`}
                            onCopy={handleCopy}
                        />
                    </div>

                    <div className="colour-palette-card glass">
                        <div className="tool-panel-header">
                            <h2>Palette</h2>
                        </div>

                        <div className="colour-palette-grid">
                            {result.output.palette.map((colour) => (
                                <button
                                    key={colour.name}
                                    className="colour-palette-item glow-item"
                                    type="button"
                                    onClick={() => handleCopy(colour.hex)}
                                    title="Click to copy"
                                >
                                    <span
                                        className="colour-palette-swatch"
                                        style={{
                                            background: colour.hex,
                                        }}
                                    />

                                    <span>{colour.name}</span>
                                    <code>{colour.hex}</code>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

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