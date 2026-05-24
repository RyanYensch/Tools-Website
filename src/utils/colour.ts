export type RgbColour = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export type HslColour = {
    h: number;
    s: number;
    l: number;
    a: number;
};

export type HsvColour = {
    h: number;
    s: number;
    v: number;
    a: number;
};

export type PaletteColour = {
    name: string;
    hex: string;
};

export type ColourOutput = {
    rgb: RgbColour;
    hsl: HslColour;
    hsv: HsvColour;
    hex: string;
    hexWithAlpha: string;
    rgbText: string;
    rgbaText: string;
    hslText: string;
    hslaText: string;
    hsvText: string;
    cssVariable: string;
    contrastTextHex: string;
    contrastTextLabel: string;
    contrastRatio: string;
    palette: PaletteColour[];
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function round(value: number, decimals = 0): number {
    const multiplier = 10 ** decimals;
    return Math.round(value * multiplier) / multiplier;
}

function normaliseHue(hue: number): number {
    return ((hue % 360) + 360) % 360;
}

function toHexByte(value: number): string {
    return clamp(Math.round(value), 0, 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
}

function parseAlpha(value: string | undefined): number {
    if (value === undefined) {
        return 1;
    }

    const trimmed = value.trim();

    if (trimmed.endsWith("%")) {
        return clamp(Number.parseFloat(trimmed) / 100, 0, 1);
    }

    return clamp(Number.parseFloat(trimmed), 0, 1);
}

function parseRgbChannel(value: string): number {
    const trimmed = value.trim();

    if (trimmed.endsWith("%")) {
        return clamp((Number.parseFloat(trimmed) / 100) * 255, 0, 255);
    }

    return clamp(Number.parseFloat(trimmed), 0, 255);
}

function parsePercentage(value: string): number {
    const trimmed = value.trim();

    if (trimmed.endsWith("%")) {
        return clamp(Number.parseFloat(trimmed), 0, 100);
    }

    return clamp(Number.parseFloat(trimmed), 0, 100);
}

function parseHexColour(input: string): RgbColour {
    const cleaned = input.trim().replace(/^#/, "");

    if (![3, 4, 6, 8].includes(cleaned.length)) {
        throw new Error("HEX colours must be #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
    }

    const expanded =
        cleaned.length === 3 || cleaned.length === 4
            ? cleaned
                  .split("")
                  .map((character) => character + character)
                  .join("")
            : cleaned;

    if (!/^[0-9a-fA-F]+$/.test(expanded)) {
        throw new Error("HEX colour contains invalid characters.");
    }

    const r = Number.parseInt(expanded.slice(0, 2), 16);
    const g = Number.parseInt(expanded.slice(2, 4), 16);
    const b = Number.parseInt(expanded.slice(4, 6), 16);
    const a =
        expanded.length === 8
            ? Number.parseInt(expanded.slice(6, 8), 16) / 255
            : 1;

    return {
        r,
        g,
        b,
        a,
    };
}

function parseRgbColour(input: string): RgbColour {
    const match = input.match(/^rgba?\((.+)\)$/i);

    if (!match) {
        throw new Error("Invalid RGB colour.");
    }

    const parts = match[1]
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length < 3 || parts.length > 4) {
        throw new Error("RGB colours need 3 channels and optional alpha.");
    }

    return {
        r: parseRgbChannel(parts[0]),
        g: parseRgbChannel(parts[1]),
        b: parseRgbChannel(parts[2]),
        a: parseAlpha(parts[3]),
    };
}

function parseHslColour(input: string): RgbColour {
    const match = input.match(/^hsla?\((.+)\)$/i);

    if (!match) {
        throw new Error("Invalid HSL colour.");
    }

    const parts = match[1]
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length < 3 || parts.length > 4) {
        throw new Error("HSL colours need hue, saturation, lightness, and optional alpha.");
    }

    const hsl: HslColour = {
        h: normaliseHue(Number.parseFloat(parts[0])),
        s: parsePercentage(parts[1]),
        l: parsePercentage(parts[2]),
        a: parseAlpha(parts[3]),
    };

    return hslToRgb(hsl);
}

export function parseColourInput(input: string): RgbColour {
    const trimmed = input.trim();

    if (!trimmed) {
        throw new Error("Enter a colour.");
    }

    if (trimmed.startsWith("#")) {
        return parseHexColour(trimmed);
    }

    if (/^rgba?\(/i.test(trimmed)) {
        return parseRgbColour(trimmed);
    }

    if (/^hsla?\(/i.test(trimmed)) {
        return parseHslColour(trimmed);
    }

    throw new Error("Supported formats: HEX, RGB, RGBA, HSL, and HSLA.");
}

export function formatHex(colour: RgbColour): string {
    return `#${toHexByte(colour.r)}${toHexByte(colour.g)}${toHexByte(colour.b)}`;
}

export function formatHexWithAlpha(colour: RgbColour): string {
    return `${formatHex(colour)}${toHexByte(colour.a * 255)}`;
}

export function formatRgb(colour: RgbColour): string {
    return `rgb(${Math.round(colour.r)}, ${Math.round(colour.g)}, ${Math.round(colour.b)})`;
}

export function formatRgba(colour: RgbColour): string {
    return `rgba(${Math.round(colour.r)}, ${Math.round(colour.g)}, ${Math.round(colour.b)}, ${round(colour.a, 3)})`;
}

export function formatHsl(colour: HslColour): string {
    return `hsl(${round(colour.h)}, ${round(colour.s)}%, ${round(colour.l)}%)`;
}

export function formatHsla(colour: HslColour): string {
    return `hsla(${round(colour.h)}, ${round(colour.s)}%, ${round(colour.l)}%, ${round(colour.a, 3)})`;
}

export function formatHsv(colour: HsvColour): string {
    return `hsv(${round(colour.h)}, ${round(colour.s)}%, ${round(colour.v)}%)`;
}

export function rgbToHsl(colour: RgbColour): HslColour {
    const r = colour.r / 255;
    const g = colour.g / 255;
    const b = colour.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;

    if (delta !== 0) {
        if (max === r) {
            h = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / delta + 2);
        } else {
            h = 60 * ((r - g) / delta + 4);
        }
    }

    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    return {
        h: normaliseHue(h),
        s: s * 100,
        l: l * 100,
        a: colour.a,
    };
}

export function hslToRgb(colour: HslColour): RgbColour {
    const h = normaliseHue(colour.h);
    const s = clamp(colour.s, 0, 100) / 100;
    const l = clamp(colour.l, 0, 100) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let rPrime = 0;
    let gPrime = 0;
    let bPrime = 0;

    if (h < 60) {
        rPrime = c;
        gPrime = x;
    } else if (h < 120) {
        rPrime = x;
        gPrime = c;
    } else if (h < 180) {
        gPrime = c;
        bPrime = x;
    } else if (h < 240) {
        gPrime = x;
        bPrime = c;
    } else if (h < 300) {
        rPrime = x;
        bPrime = c;
    } else {
        rPrime = c;
        bPrime = x;
    }

    return {
        r: (rPrime + m) * 255,
        g: (gPrime + m) * 255,
        b: (bPrime + m) * 255,
        a: colour.a,
    };
}

export function rgbToHsv(colour: RgbColour): HsvColour {
    const r = colour.r / 255;
    const g = colour.g / 255;
    const b = colour.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;

    if (delta !== 0) {
        if (max === r) {
            h = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / delta + 2);
        } else {
            h = 60 * ((r - g) / delta + 4);
        }
    }

    const s = max === 0 ? 0 : delta / max;

    return {
        h: normaliseHue(h),
        s: s * 100,
        v: max * 100,
        a: colour.a,
    };
}

function getRelativeLuminance(colour: RgbColour): number {
    const channels = [colour.r, colour.g, colour.b].map((channel) => {
        const value = channel / 255;

        return value <= 0.03928
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function getContrastData(colour: RgbColour): {
    textHex: string;
    label: string;
    ratio: string;
} {
    const luminance = getRelativeLuminance(colour);

    const blackContrast = (luminance + 0.05) / 0.05;
    const whiteContrast = 1.05 / (luminance + 0.05);

    if (blackContrast >= whiteContrast) {
        return {
            textHex: "#000000",
            label: "Black text",
            ratio: `${round(blackContrast, 2)}:1`,
        };
    }

    return {
        textHex: "#FFFFFF",
        label: "White text",
        ratio: `${round(whiteContrast, 2)}:1`,
    };
}

function mixColours(first: RgbColour, second: RgbColour, amount: number): RgbColour {
    return {
        r: first.r + (second.r - first.r) * amount,
        g: first.g + (second.g - first.g) * amount,
        b: first.b + (second.b - first.b) * amount,
        a: 1,
    };
}

function generatePalette(colour: RgbColour): PaletteColour[] {
    const white: RgbColour = {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
    };

    const black: RgbColour = {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    };

    return [
        {
            name: "Light 80%",
            hex: formatHex(mixColours(colour, white, 0.8)),
        },
        {
            name: "Light 50%",
            hex: formatHex(mixColours(colour, white, 0.5)),
        },
        {
            name: "Base",
            hex: formatHex(colour),
        },
        {
            name: "Dark 25%",
            hex: formatHex(mixColours(colour, black, 0.25)),
        },
        {
            name: "Dark 50%",
            hex: formatHex(mixColours(colour, black, 0.5)),
        },
    ];
}

export function createColourOutput(input: string): ColourOutput {
    const rgb = parseColourInput(input);
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    const contrast = getContrastData(rgb);
    const hex = formatHex(rgb);

    return {
        rgb,
        hsl,
        hsv,
        hex,
        hexWithAlpha: formatHexWithAlpha(rgb),
        rgbText: formatRgb(rgb),
        rgbaText: formatRgba(rgb),
        hslText: formatHsl(hsl),
        hslaText: formatHsla(hsl),
        hsvText: formatHsv(hsv),
        cssVariable: `--accent-colour: ${hex};`,
        contrastTextHex: contrast.textHex,
        contrastTextLabel: contrast.label,
        contrastRatio: contrast.ratio,
        palette: generatePalette(rgb),
    };
}