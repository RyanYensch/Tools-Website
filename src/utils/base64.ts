export type Base64Mode = "encode" | "decode";

export function encodeBase64(input: string): string {
    const bytes = new TextEncoder().encode(input);

    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}

export function decodeBase64(input: string): string {
    const cleanedInput = input.trim().replace(/\s/g, "");

    if (cleanedInput.length === 0) {
        return "";
    }

    try {
        const binary = atob(cleanedInput);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

        return new TextDecoder().decode(bytes);
    } catch {
        throw new Error("Invalid Base64 input.");
    }
}

export function runBase64Tool(input: string, mode: Base64Mode): string {
    if (mode === "encode") {
        return encodeBase64(input);
    }

    return decodeBase64(input);
}