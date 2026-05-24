export type JwtMode = "decode" | "encode";

export type JwtAlgorithm =
    | "none"
    | "HS256"
    | "HS384"
    | "HS512";

export type JwtHeaderValidation = {
    errors: string[];
    warnings: string[];
};

export type DecodedJwt = {
    header: unknown;
    payload: unknown;
    signature: string;
    signingInput: string;
    headerValidation: JwtHeaderValidation;
};

export type EncodedJwtResult = {
    token: string;
    finalHeader: Record<string, unknown>;
    headerValidation: JwtHeaderValidation;
};

export type JwtVerificationResult = {
    checked: boolean;
    valid: boolean;
    message: string;
};

export const SUPPORTED_ALGORITHMS: JwtAlgorithm[] = [
    "none",
    "HS256",
    "HS384",
    "HS512",
];

const HASH_BY_ALG: Record<Exclude<JwtAlgorithm, "none">, string> = {
    HS256: "SHA-256",
    HS384: "SHA-384",
    HS512: "SHA-512",
};

function isHmacAlgorithm(
    algorithm: JwtAlgorithm,
): algorithm is "HS256" | "HS384" | "HS512" {
    return algorithm.startsWith("HS");
}

export function isSupportedJwtAlgorithm(value: string): value is JwtAlgorithm {
    return SUPPORTED_ALGORITHMS.includes(value as JwtAlgorithm);
}

export function getJwtAlgorithm(header: unknown): JwtAlgorithm | null {
    if (
        header === null ||
        typeof header !== "object" ||
        Array.isArray(header)
    ) {
        return null;
    }

    const algorithm = (header as Record<string, unknown>).alg;

    if (typeof algorithm !== "string") {
        return null;
    }

    if (!isSupportedJwtAlgorithm(algorithm)) {
        return null;
    }

    return algorithm;
}

function textToBytes(input: string): Uint8Array {
    return new TextEncoder().encode(input);
}

function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function base64UrlToBytes(input: string): Uint8Array {
    const cleaned = input.trim();

    if (cleaned.length % 4 === 1) {
        throw new Error("Invalid Base64URL length.");
    }

    const padded = cleaned
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(cleaned.length / 4) * 4, "=");

    const binary = atob(padded);

    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function base64ToBytes(input: string): Uint8Array {
    const cleaned = input.trim().replace(/\s/g, "");
    const binary = atob(cleaned);

    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
        return false;
    }

    let result = 0;

    for (let i = 0; i < left.length; i++) {
        result |= left[i] ^ right[i];
    }

    return result === 0;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

export function base64UrlEncodeJson(value: unknown): string {
    const json = JSON.stringify(value);
    const bytes = textToBytes(json);

    return bytesToBase64Url(bytes);
}

export function base64UrlDecodeJson(input: string): unknown {
    const bytes = base64UrlToBytes(input);
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json);
}

export function formatJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

export function parseJsonObject(
    json: string,
    label: string,
): Record<string, unknown> {
    try {
        const parsed = JSON.parse(json);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            throw new Error(`${label} must be a JSON object.`);
        }

        return parsed as Record<string, unknown>;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`${label}: ${error.message}`);
        }

        throw new Error(`${label} is invalid JSON.`);
    }
}

export function validateJwtHeader(
    header: unknown,
): JwtHeaderValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (
        header === null ||
        typeof header !== "object" ||
        Array.isArray(header)
    ) {
        return {
            errors: ["Header must be a JSON object."],
            warnings,
        };
    }

    const headerObject = header as Record<string, unknown>;
    const algorithm = headerObject.alg;
    const type = headerObject.typ;

    if (typeof algorithm !== "string") {
        errors.push("Header must include an alg string.");
    } else if (!isSupportedJwtAlgorithm(algorithm)) {
        errors.push(`Unsupported alg: ${algorithm}.`);
    }

    if (type === undefined) {
        warnings.push("Header does not include typ. Most JWTs use typ: JWT.");
    } else if (typeof type !== "string") {
        warnings.push("Header typ should be a string.");
    } else if (type.toUpperCase() !== "JWT") {
        warnings.push(`Header typ is ${type}. Most JWTs use typ: JWT.`);
    }

    if (algorithm === "none") {
        warnings.push(
            "alg: none creates an unsigned JWT. This is useful for learning, but should not be trusted for authentication.",
        );
    }

    return {
        errors,
        warnings,
    };
}

function createEncodeHeaderValidation(
    originalHeader: Record<string, unknown>,
    finalHeader: Record<string, unknown>,
    selectedAlgorithm: JwtAlgorithm,
): JwtHeaderValidation {
    const validation = validateJwtHeader(finalHeader);
    const warnings = [...validation.warnings];

    if (
        typeof originalHeader.alg === "string" &&
        originalHeader.alg !== selectedAlgorithm
    ) {
        warnings.unshift(
            `Header alg was ${originalHeader.alg}, but the selected algorithm is ${selectedAlgorithm}. The generated JWT uses ${selectedAlgorithm}.`,
        );
    }

    if (originalHeader.alg === undefined) {
        warnings.unshift(
            `Header did not include alg. The generated JWT uses ${selectedAlgorithm}.`,
        );
    }

    return {
        errors: validation.errors,
        warnings,
    };
}

export function decodeJwt(token: string): DecodedJwt {
    const parts = token.trim().split(".");

    if (parts.length !== 3) {
        throw new Error("A JWT must have 3 parts: header.payload.signature");
    }

    const [headerPart, payloadPart, signaturePart] = parts;

    if (!headerPart || !payloadPart) {
        throw new Error("JWT header and payload cannot be empty.");
    }

    const header = base64UrlDecodeJson(headerPart);
    const payload = base64UrlDecodeJson(payloadPart);
    const headerValidation = validateJwtHeader(header);

    return {
        header,
        payload,
        signature: signaturePart,
        signingInput: `${headerPart}.${payloadPart}`,
        headerValidation,
    };
}

async function signHmacBytes(
    signingInput: string,
    secretBytes: Uint8Array,
    algorithm: "HS256" | "HS384" | "HS512",
): Promise<Uint8Array> {
    if (!crypto.subtle) {
        throw new Error("Web Crypto is not available in this browser context.");
    }

    const key = await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(secretBytes),
        {
            name: "HMAC",
            hash: {
                name: HASH_BY_ALG[algorithm],
            },
        },
        false,
        ["sign"],
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        toArrayBuffer(textToBytes(signingInput)),
    );

    return new Uint8Array(signature);
}

export async function encodeJwt(
    headerJson: string,
    payloadJson: string,
    algorithm: JwtAlgorithm,
    secret: string,
    secretIsBase64: boolean,
): Promise<EncodedJwtResult> {
    const header = parseJsonObject(headerJson, "Header");
    const payload = parseJsonObject(payloadJson, "Payload");

    const finalHeader = {
        typ: "JWT",
        ...header,
        alg: algorithm,
    };

    const headerValidation = createEncodeHeaderValidation(
        header,
        finalHeader,
        algorithm,
    );

    if (headerValidation.errors.length > 0) {
        throw new Error(headerValidation.errors.join(" "));
    }

    const encodedHeader = base64UrlEncodeJson(finalHeader);
    const encodedPayload = base64UrlEncodeJson(payload);
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    if (algorithm === "none") {
        return {
            token: `${signingInput}.`,
            finalHeader,
            headerValidation,
        };
    }

    if (!secret.trim()) {
        throw new Error(`${algorithm} signing requires a secret.`);
    }

    const secretBytes = secretIsBase64
        ? base64ToBytes(secret)
        : textToBytes(secret);

    const signature = await signHmacBytes(
        signingInput,
        secretBytes,
        algorithm,
    );

    return {
        token: `${signingInput}.${bytesToBase64Url(signature)}`,
        finalHeader,
        headerValidation,
    };
}

export async function verifyJwt(
    token: string,
    secret: string,
    secretIsBase64: boolean,
): Promise<JwtVerificationResult> {
    try {
        const decoded = decodeJwt(token);
        const algorithm = getJwtAlgorithm(decoded.header);

        if (!algorithm) {
            return {
                checked: true,
                valid: false,
                message: "Could not verify because the JWT alg is missing or unsupported.",
            };
        }

        const [headerPart, payloadPart, signaturePart] = token.trim().split(".");
        const signingInput = `${headerPart}.${payloadPart}`;

        if (algorithm === "none") {
            return {
                checked: true,
                valid: signaturePart.length === 0,
                message:
                    signaturePart.length === 0
                        ? "Valid unsigned JWT using alg: none."
                        : "Invalid: alg is none but the JWT still has a signature.",
            };
        }

        if (!isHmacAlgorithm(algorithm)) {
            return {
                checked: true,
                valid: false,
                message: `Unsupported verification algorithm: ${algorithm}.`,
            };
        }

        if (!secret.trim()) {
            return {
                checked: false,
                valid: false,
                message: "Enter the secret to check whether the signature is valid.",
            };
        }

        if (!signaturePart) {
            return {
                checked: true,
                valid: false,
                message: "Invalid: this JWT does not have a signature.",
            };
        }

        const actualSignature = base64UrlToBytes(signaturePart);
        const secretBytes = secretIsBase64
            ? base64ToBytes(secret)
            : textToBytes(secret);

        const expectedSignature = await signHmacBytes(
            signingInput,
            secretBytes,
            algorithm,
        );

        const valid = timingSafeEqual(actualSignature, expectedSignature);

        return {
            checked: true,
            valid,
            message: valid
                ? "Valid signature. The secret matches this JWT."
                : "Invalid signature. The secret does not match this JWT.",
        };
    } catch (error) {
        return {
            checked: true,
            valid: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Could not verify JWT.",
        };
    }
}