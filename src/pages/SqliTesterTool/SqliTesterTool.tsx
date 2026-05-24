import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type SqliInput,
    type SqlDialect,
    analyseSqliResult,
    buildUnsafeSqlQuery,
    getInjectedNamesForToken,
    tokenOverlapsInjectedRange,
    tokenizeSql,
} from "../../utils/sqli";
import "../ToolPage/ToolPage.css";
import "./SqliTesterTool.css";

const DEFAULT_TEMPLATE =
    "SELECT * FROM login_details WHERE username = '?' AND password = '?'";

function createId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
}

export default function SqliTesterTool() {
    const [dialect, setDialect] = useState<SqlDialect>("mysql");
    const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
    const [inputs, setInputs] = useState<SqliInput[]>([
        {
            id: createId(),
            name: "username",
            value: "name",
        },
        {
            id: createId(),
            name: "password",
            value: "pass",
        },
    ]);

    const builtQuery = useMemo(() => {
        return buildUnsafeSqlQuery(template, inputs);
    }, [template, inputs]);

    const tokens = useMemo(() => {
        return tokenizeSql(builtQuery.query, dialect);
    }, [builtQuery.query, dialect]);

    const warnings = useMemo(() => {
        return analyseSqliResult(tokens, builtQuery.ranges);
    }, [tokens, builtQuery.ranges]);

    const updateInput = (
        id: string,
        field: "name" | "value",
        value: string,
    ) => {
        setInputs((currentInputs) =>
            currentInputs.map((input) =>
                input.id === id
                    ? {
                          ...input,
                          [field]: value,
                      }
                    : input,
            ),
        );
    };

    const addInput = () => {
        const nextNumber = inputs.length + 1;

        setInputs((currentInputs) => [
            ...currentInputs,
            {
                id: createId(),
                name: `input${nextNumber}`,
                value: "",
            },
        ]);
    };

    const removeInput = (id: string) => {
        setInputs((currentInputs) =>
            currentInputs.filter((input) => input.id !== id),
        );
    };

    const loadNormalExample = () => {
        setTemplate(DEFAULT_TEMPLATE);
        setInputs([
            {
                id: createId(),
                name: "username",
                value: "name",
            },
            {
                id: createId(),
                name: "password",
                value: "pass",
            },
        ]);
    };

    const loadInjectionExample = () => {
        setTemplate(DEFAULT_TEMPLATE);
        setInputs([
            {
                id: createId(),
                name: "username",
                value: "' OR 1=1 -- -",
            },
            {
                id: createId(),
                name: "password",
                value: "pass",
            },
        ]);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(builtQuery.query);
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Security</p>
                </div>

                <h1>SQL Injection Tester</h1>

                <p>
                    Build an unsafe SQL query from user inputs and visually see
                    how SQL injection changes the final query. This is a
                    learning tool only and does not connect to a database.
                </p>

                <div className="tool-page-tags">
                    <span>SQLi</span>
                    <span>MySQL</span>
                    <span>Cybersecurity</span>
                </div>
            </div>

            <div className="sqli-controls glass">
                <label className="sqli-control-label">
                    Dialect
                    <select
                        className="sqli-select"
                        value={dialect}
                        onChange={(event) =>
                            setDialect(event.target.value as SqlDialect)
                        }
                    >
                        <option value="mysql">MySQL</option>
                        <option value="postgres">PostgreSQL</option>
                        <option value="sqlite">SQLite</option>
                        <option value="mssql">MSSQL</option>
                    </select>
                </label>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={loadNormalExample}
                >
                    Normal Example
                </button>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={loadInjectionExample}
                >
                    Injection Example
                </button>
            </div>

            <div className="sqli-template-card glass">
                <div className="tool-panel-header">
                    <h2>Unsafe Query Template</h2>
                </div>

                <p className="sqli-help-text">
                    Use <code>?</code> as placeholders. Inputs are inserted in
                    order without escaping.
                </p>

                <textarea
                    className="tool-textarea sqli-template-input"
                    value={template}
                    onChange={(event) => setTemplate(event.target.value)}
                    spellCheck={false}
                />
            </div>

            <div className="sqli-inputs-card glass">
                <div className="tool-panel-header">
                    <h2>User Inputs</h2>

                    <button
                        className="tool-button glow-item"
                        type="button"
                        onClick={addInput}
                    >
                        Add Input
                    </button>
                </div>

                <div className="sqli-input-list">
                    {inputs.map((input, index) => (
                        <div className="sqli-input-row" key={input.id}>
                            <span className="sqli-input-order">
                                #{index + 1}
                            </span>

                            <input
                                className="sqli-name-input"
                                value={input.name}
                                onChange={(event) =>
                                    updateInput(
                                        input.id,
                                        "name",
                                        event.target.value,
                                    )
                                }
                                placeholder="input name"
                                spellCheck={false}
                            />

                            <input
                                className="sqli-value-input"
                                value={input.value}
                                onChange={(event) =>
                                    updateInput(
                                        input.id,
                                        "value",
                                        event.target.value,
                                    )
                                }
                                placeholder="input value"
                                spellCheck={false}
                            />

                            <button
                                className="tool-button glow-item"
                                type="button"
                                onClick={() => removeInput(input.id)}
                                disabled={inputs.length <= 1}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sqli-output-card glass">
                <div className="tool-panel-header">
                    <h2>Final Unsafe Query</h2>

                    <button
                        className="tool-button glow-item"
                        type="button"
                        onClick={handleCopy}
                    >
                        Copy
                    </button>
                </div>

                <pre className="sqli-highlighted-query">
                    {tokens.map((token, index) => {
                        const fromInput = tokenOverlapsInjectedRange(
                            token,
                            builtQuery.ranges,
                        );

                        const inputNames = getInjectedNamesForToken(
                            token,
                            builtQuery.ranges,
                        );

                        return (
                            <span
                                key={`${token.start}-${token.end}-${index}`}
                                className={[
                                    "sql-token",
                                    `sql-token-${token.type}`,
                                    fromInput ? "sql-token-injected" : "",
                                ].join(" ")}
                                title={
                                    inputNames.length > 0
                                        ? `From input: ${inputNames.join(", ")}`
                                        : undefined
                                }
                            >
                                {token.value}
                            </span>
                        );
                    })}
                </pre>
            </div>

            <div className="sqli-warning-grid">
                {warnings.map((warning, index) => (
                    <div
                        key={`${warning.level}-${index}`}
                        className={`sqli-warning-card glass ${warning.level}`}
                    >
                        <strong>{warning.level.toUpperCase()}</strong>
                        <p>{warning.message}</p>
                    </div>
                ))}

                {builtQuery.warnings.map((warning, index) => (
                    <div
                        key={`build-warning-${index}`}
                        className="sqli-warning-card glass warning"
                    >
                        <strong>WARNING</strong>
                        <p>{warning}</p>
                    </div>
                ))}
            </div>

            <div className="sqli-legend glass">
                <span>
                    <i className="legend-box keyword" /> SQL keyword
                </span>
                <span>
                    <i className="legend-box string" /> SQL string
                </span>
                <span>
                    <i className="legend-box comment" /> SQL comment
                </span>
                <span>
                    <i className="legend-box injected" /> From user input
                </span>
            </div>
        </section>
    );
}