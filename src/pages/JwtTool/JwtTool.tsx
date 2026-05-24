import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    type JwtAlgorithm,
    type JwtHeaderValidation,
    type JwtMode,
    type JwtVerificationResult,
    SUPPORTED_ALGORITHMS,
    decodeJwt,
    encodeJwt,
    formatJson,
    getJwtAlgorithm,
    verifyJwt,
} from "../../utils/jwt";
import "../ToolPage/ToolPage.css";
import "./JwtTool.css";

const DEFAULT_HEADER = `{
  "typ": "JWT",
  "alg": "HS256"
}`;

const DEFAULT_PAYLOAD = `{
  "name": "Ryan",
  "admin": false,
  "iat": 1710000000
}`;

function HeaderValidationBadge({
    validation,
}: {
    validation: JwtHeaderValidation;
}) {
    if (validation.errors.length > 0) {
        return (
            <span
                className="jwt-header-status error"
                title={validation.errors.join("\n")}
            >
                Header Invalid
            </span>
        );
    }

    if (validation.warnings.length > 0) {
        return (
            <span
                className="jwt-header-status warning"
                title={validation.warnings.join("\n")}
            >
                Header Warning
            </span>
        );
    }

    return (
        <span className="jwt-header-status valid">
            Header Looks Valid
        </span>
    );
}

function VerificationResultCard({
    result,
}: {
    result: JwtVerificationResult;
}) {
    if (!result.message) {
        return null;
    }

    const className = result.checked
        ? result.valid
            ? "valid"
            : "error"
        : "warning";

    return (
        <div className={`jwt-verification-result glass ${className}`}>
            {result.message}
        </div>
    );
}

export default function JwtTool() {
    const [mode, setMode] = useState<JwtMode>("decode");

    const [tokenInput, setTokenInput] = useState("");
    const [verifySecret, setVerifySecret] = useState("");
    const [verifySecretIsBase64, setVerifySecretIsBase64] = useState(false);
    const [verificationResult, setVerificationResult] =
        useState<JwtVerificationResult>({
            checked: false,
            valid: false,
            message: "",
        });

    const [headerJson, setHeaderJson] = useState(DEFAULT_HEADER);
    const [payloadJson, setPayloadJson] = useState(DEFAULT_PAYLOAD);
    const [algorithm, setAlgorithm] = useState<JwtAlgorithm>("HS256");
    const [signingSecret, setSigningSecret] = useState("secret");
    const [signingSecretIsBase64, setSigningSecretIsBase64] = useState(false);

    const [encodedJwt, setEncodedJwt] = useState("");
    const [encodeError, setEncodeError] = useState("");
    const [encodeValidation, setEncodeValidation] =
        useState<JwtHeaderValidation>({
            errors: [],
            warnings: [],
        });

    const decodedResult = useMemo(() => {
        if (!tokenInput.trim()) {
            return {
                header: "",
                payload: "",
                signature: "",
                signingInput: "",
                algorithm: null as JwtAlgorithm | null,
                error: "",
                headerValidation: {
                    errors: [],
                    warnings: [],
                } as JwtHeaderValidation,
            };
        }

        try {
            const decoded = decodeJwt(tokenInput);
            const decodedAlgorithm = getJwtAlgorithm(decoded.header);

            return {
                header: formatJson(decoded.header),
                payload: formatJson(decoded.payload),
                signature: decoded.signature || "(empty signature)",
                signingInput: decoded.signingInput,
                algorithm: decodedAlgorithm,
                error: "",
                headerValidation: decoded.headerValidation,
            };
        } catch (error) {
            return {
                header: "",
                payload: "",
                signature: "",
                signingInput: "",
                algorithm: null as JwtAlgorithm | null,
                error: error instanceof Error ? error.message : "Invalid JWT.",
                headerValidation: {
                    errors: [],
                    warnings: [],
                } as JwtHeaderValidation,
            };
        }
    }, [tokenInput]);

    useEffect(() => {
        let cancelled = false;

        async function runVerification() {
            if (!tokenInput.trim() || decodedResult.error) {
                setVerificationResult({
                    checked: false,
                    valid: false,
                    message: "",
                });
                return;
            }

            const result = await verifyJwt(
                tokenInput,
                verifySecret,
                verifySecretIsBase64,
            );

            if (!cancelled) {
                setVerificationResult(result);
            }
        }

        runVerification();

        return () => {
            cancelled = true;
        };
    }, [
        tokenInput,
        verifySecret,
        verifySecretIsBase64,
        decodedResult.error,
    ]);

    useEffect(() => {
        let cancelled = false;

        async function buildToken() {
            try {
                const result = await encodeJwt(
                    headerJson,
                    payloadJson,
                    algorithm,
                    signingSecret,
                    signingSecretIsBase64,
                );

                if (!cancelled) {
                    setEncodedJwt(result.token);
                    setEncodeValidation(result.headerValidation);
                    setEncodeError("");
                }
            } catch (error) {
                if (!cancelled) {
                    setEncodedJwt("");
                    setEncodeValidation({
                        errors: [],
                        warnings: [],
                    });
                    setEncodeError(
                        error instanceof Error
                            ? error.message
                            : "Could not encode JWT.",
                    );
                }
            }
        }

        buildToken();

        return () => {
            cancelled = true;
        };
    }, [
        headerJson,
        payloadJson,
        algorithm,
        signingSecret,
        signingSecretIsBase64,
    ]);

    const handleCopy = async (text: string) => {
        if (!text) {
            return;
        }

        await navigator.clipboard.writeText(text);
    };

    const handleClear = () => {
        setTokenInput("");
        setVerifySecret("");
        setVerifySecretIsBase64(false);
        setHeaderJson(DEFAULT_HEADER);
        setPayloadJson(DEFAULT_PAYLOAD);
        setAlgorithm("HS256");
        setSigningSecret("secret");
        setSigningSecretIsBase64(false);
    };

    const handleUseEncodedAsInput = () => {
        if (!encodedJwt) {
            return;
        }

        setTokenInput(encodedJwt);
        setVerifySecret(signingSecret);
        setVerifySecretIsBase64(signingSecretIsBase64);
        setMode("decode");
    };

    const handleUseDecodedInEncoder = () => {
        if (decodedResult.error || !decodedResult.header || !decodedResult.payload) {
            return;
        }

        setHeaderJson(decodedResult.header);
        setPayloadJson(decodedResult.payload);

        if (decodedResult.algorithm) {
            setAlgorithm(decodedResult.algorithm);
        }

        setMode("encode");
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Security</p>

                    {mode === "decode" &&
                        tokenInput.trim() &&
                        !decodedResult.error && (
                            <HeaderValidationBadge
                                validation={decodedResult.headerValidation}
                            />
                        )}

                    {mode === "encode" && !encodeError && (
                        <HeaderValidationBadge
                            validation={encodeValidation}
                        />
                    )}
                </div>

                <h1>JWT Encoder / Decoder</h1>

                <p>
                    Decode, validate, verify, encode, and sign JSON Web Tokens.
                </p>

                <div className="tool-page-tags">
                    <span>JWT</span>
                    <span>Auth</span>
                    <span>Security</span>
                </div>
            </div>

            <div className="jwt-mode-card glass">
                <button
                    type="button"
                    className={`jwt-mode-button glow-item ${
                        mode === "decode" ? "active" : ""
                    }`}
                    onClick={() => setMode("decode")}
                >
                    Decode
                </button>

                <button
                    type="button"
                    className={`jwt-mode-button glow-item ${
                        mode === "encode" ? "active" : ""
                    }`}
                    onClick={() => setMode("encode")}
                >
                    Encode
                </button>
            </div>

            {mode === "decode" ? (
                <>
                    <div className="tool-panel glass jwt-wide-panel">
                        <div className="tool-panel-header">
                            <h2>JWT Input</h2>

                            <button
                                className="tool-button glow-item"
                                type="button"
                                onClick={handleUseDecodedInEncoder}
                                disabled={
                                    Boolean(decodedResult.error) ||
                                    !decodedResult.header ||
                                    !decodedResult.payload
                                }
                            >
                                Use in Encoder
                            </button>
                        </div>

                        <textarea
                            className="tool-textarea jwt-token-input"
                            value={tokenInput}
                            onChange={(event) => setTokenInput(event.target.value)}
                            placeholder="Paste a JWT here..."
                            spellCheck={false}
                        />
                    </div>

                    {decodedResult.error && (
                        <div className="jwt-error-card glass">
                            {decodedResult.error}
                        </div>
                    )}


                    <div className="jwt-decode-grid">
                        <div className="tool-panel glass">
                            <div className="tool-panel-header">
                                <h2>Header</h2>

                                <button
                                    className="tool-button glow-item"
                                    type="button"
                                    onClick={() => handleCopy(decodedResult.header)}
                                    disabled={!decodedResult.header}
                                >
                                    Copy
                                </button>
                            </div>

                            <pre className="tool-output jwt-output">
                                {decodedResult.header ||
                                    "Decoded header will appear here."}
                            </pre>
                        </div>

                        <div className="tool-panel glass">
                            <div className="tool-panel-header">
                                <h2>Payload</h2>

                                <button
                                    className="tool-button glow-item"
                                    type="button"
                                    onClick={() => handleCopy(decodedResult.payload)}
                                    disabled={!decodedResult.payload}
                                >
                                    Copy
                                </button>
                            </div>

                            <pre className="tool-output jwt-output">
                                {decodedResult.payload ||
                                    "Decoded payload will appear here."}
                            </pre>
                        </div>
                    </div>

                    <div className="tool-panel glass jwt-wide-panel">
                        <div className="tool-panel-header">
                            <h2>Signature</h2>

                            <button
                                className="tool-button glow-item"
                                type="button"
                                onClick={() => handleCopy(decodedResult.signature)}
                                disabled={!decodedResult.signature}
                            >
                                Copy
                            </button>
                        </div>

                        <pre className="tool-output jwt-signature-output">
                            {decodedResult.signature ||
                                "JWT signature will appear here."}
                        </pre>
                    </div>

                    {tokenInput.trim() && !decodedResult.error && (
                        <div className="jwt-verification-card glass">
                            <div className="tool-panel-header">
                                <h2>Signature Verification</h2>
                            </div>

                            <label className="jwt-control-label">
                                Secret
                                <input
                                    className="jwt-secret-input"
                                    value={verifySecret}
                                    onChange={(event) =>
                                        setVerifySecret(event.target.value)
                                    }
                                    placeholder={
                                        decodedResult.algorithm === "none"
                                            ? "No secret needed for alg: none."
                                            : "Enter HMAC secret..."
                                    }
                                    disabled={decodedResult.algorithm === "none"}
                                    spellCheck={false}
                                />
                            </label>

                            {decodedResult.algorithm !== "none" && (
                                <label className="jwt-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={verifySecretIsBase64}
                                        onChange={(event) =>
                                            setVerifySecretIsBase64(
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Secret is Base64 encoded
                                </label>
                            )}

                            <VerificationResultCard
                                result={verificationResult}
                            />
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="jwt-signing-card glass">
                        <label className="jwt-control-label">
                            Algorithm
                            <select
                                className="jwt-select"
                                value={algorithm}
                                onChange={(event) =>
                                    setAlgorithm(
                                        event.target.value as JwtAlgorithm,
                                    )
                                }
                            >
                                {SUPPORTED_ALGORITHMS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="jwt-control-label jwt-secret-label">
                            Secret
                            <input
                                className="jwt-secret-input"
                                value={signingSecret}
                                onChange={(event) =>
                                    setSigningSecret(event.target.value)
                                }
                                placeholder={
                                    algorithm === "none"
                                        ? "No secret needed for alg: none."
                                        : "Enter HMAC secret..."
                                }
                                disabled={algorithm === "none"}
                                spellCheck={false}
                            />
                        </label>

                        {algorithm !== "none" && (
                            <label className="jwt-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={signingSecretIsBase64}
                                    onChange={(event) =>
                                        setSigningSecretIsBase64(
                                            event.target.checked,
                                        )
                                    }
                                />
                                Secret is Base64 encoded
                            </label>
                        )}

                        <button
                            className="tool-button glow-item"
                            type="button"
                            onClick={handleUseEncodedAsInput}
                            disabled={!encodedJwt}
                        >
                            Decode Output
                        </button>
                    </div>

                    <div className="jwt-decode-grid">
                        <div className="tool-panel glass">
                            <div className="tool-panel-header">
                                <h2>Header JSON</h2>
                            </div>

                            <textarea
                                className="tool-textarea jwt-json-input"
                                value={headerJson}
                                onChange={(event) =>
                                    setHeaderJson(event.target.value)
                                }
                                spellCheck={false}
                            />
                        </div>

                        <div className="tool-panel glass">
                            <div className="tool-panel-header">
                                <h2>Payload JSON</h2>
                            </div>

                            <textarea
                                className="tool-textarea jwt-json-input"
                                value={payloadJson}
                                onChange={(event) =>
                                    setPayloadJson(event.target.value)
                                }
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {encodeError && (
                        <div className="jwt-error-card glass">
                            {encodeError}
                        </div>
                    )}

                    <div className="tool-panel glass jwt-wide-panel">
                        <div className="tool-panel-header">
                            <h2>Encoded JWT</h2>

                            <button
                                className="tool-button glow-item"
                                type="button"
                                onClick={() => handleCopy(encodedJwt)}
                                disabled={!encodedJwt}
                            >
                                Copy
                            </button>
                        </div>

                        <pre className="tool-output jwt-token-output">
                            {encodedJwt || "Encoded JWT will appear here."}
                        </pre>
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