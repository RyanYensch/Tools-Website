export type ToolCategory =
    | "Data"
    | "Encoding"
    | "Security"
    | "Text"
    | "Time";

export type Tool = {
    name: string;
    slug: string;
    description: string;
    category: ToolCategory;
    tags: string[];
    status: "available" | "coming-soon";
};

export const tools: Tool[] = [
    {
        name: "JSON Formatter",
        slug: "json",
        description: "Format, minify, and validate JSON instantly.",
        category: "Data",
        tags: ["JSON", "Formatter", "Validator"],
        status: "coming-soon",
    },
    {
        name: "Base64 Encoder",
        slug: "base64",
        description: "Encode and decode Base64 strings locally in your browser.",
        category: "Encoding",
        tags: ["Base64", "Encoding", "Decoding"],
        status: "available",
    },
    {
        name: "JWT Decoder",
        slug: "jwt",
        description: "Decode JWT headers and payloads without uploading tokens.",
        category: "Security",
        tags: ["JWT", "Auth", "Security"],
        status: "coming-soon",
    },
    {
        name: "Regex Tester",
        slug: "regex",
        description: "Test regular expressions against sample text.",
        category: "Text",
        tags: ["Regex", "Pattern Matching"],
        status: "coming-soon",
    },
    {
        name: "Timestamp Converter",
        slug: "timestamp",
        description: "Convert Unix timestamps into readable dates.",
        category: "Time",
        tags: ["Unix", "Timestamp", "Date"],
        status: "coming-soon",
    },
];