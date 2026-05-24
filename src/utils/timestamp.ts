export type TimestampMode = "timestamp-to-date" | "date-to-timestamp";
export type TimestampUnit = "auto" | "seconds" | "milliseconds";

export type TimestampOutput = {
    iso: string;
    utc: string;
    local: string;
    unixSeconds: string;
    unixMilliseconds: string;
    timezoneOffset: string;
    relative: string;
};

function isValidDate(date: Date): boolean {
    return !Number.isNaN(date.getTime());
}

function getTimezoneOffsetLabel(date: Date): string {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteMinutes = Math.abs(offsetMinutes);

    const hours = Math.floor(absoluteMinutes / 60)
        .toString()
        .padStart(2, "0");

    const minutes = (absoluteMinutes % 60)
        .toString()
        .padStart(2, "0");

    return `UTC${sign}${hours}:${minutes}`;
}

function formatRelativeTime(date: Date): string {
    const differenceMs = date.getTime() - Date.now();
    const absoluteMs = Math.abs(differenceMs);

    const units = [
        { label: "year", ms: 1000 * 60 * 60 * 24 * 365 },
        { label: "month", ms: 1000 * 60 * 60 * 24 * 30 },
        { label: "day", ms: 1000 * 60 * 60 * 24 },
        { label: "hour", ms: 1000 * 60 * 60 },
        { label: "minute", ms: 1000 * 60 },
        { label: "second", ms: 1000 },
    ];

    for (const unit of units) {
        if (absoluteMs >= unit.ms) {
            const amount = Math.round(absoluteMs / unit.ms);
            const plural = amount === 1 ? unit.label : `${unit.label}s`;

            return differenceMs >= 0
                ? `in ${amount} ${plural}`
                : `${amount} ${plural} ago`;
        }
    }

    return "now";
}

function formatLocalDate(date: Date): string {
    return date.toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
}

export function formatDateTimeLocalInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    const seconds = `${date.getSeconds()}`.padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function createTimestampOutput(date: Date): TimestampOutput {
    if (!isValidDate(date)) {
        throw new Error("Invalid date.");
    }

    return {
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: formatLocalDate(date),
        unixSeconds: Math.floor(date.getTime() / 1000).toString(),
        unixMilliseconds: date.getTime().toString(),
        timezoneOffset: getTimezoneOffsetLabel(date),
        relative: formatRelativeTime(date),
    };
}

export function parseTimestampInput(
    input: string,
    unit: TimestampUnit,
): Date {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        throw new Error("Enter a Unix timestamp.");
    }

    const value = Number(trimmedInput);

    if (!Number.isFinite(value)) {
        throw new Error("Timestamp must be a valid number.");
    }

    let milliseconds: number;

    if (unit === "seconds") {
        milliseconds = value * 1000;
    } else if (unit === "milliseconds") {
        milliseconds = value;
    } else {
        // Current Unix seconds are 10 digits.
        // Current Unix milliseconds are 13 digits.
        milliseconds = Math.abs(value) < 1_000_000_000_000
            ? value * 1000
            : value;
    }

    const date = new Date(milliseconds);

    if (!isValidDate(date)) {
        throw new Error("Timestamp is outside the valid JavaScript date range.");
    }

    return date;
}

export function parseDateInput(input: string): Date {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        throw new Error("Enter a date.");
    }

    const date = new Date(trimmedInput);

    if (!isValidDate(date)) {
        throw new Error("Could not parse that date.");
    }

    return date;
}