export type ToolCategory =
    | "Data"
    | "Encoding"
    | "Security"
    | "Text"
    | "Time"
    | "Web"
    | "Design";

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
        name: "Text Compare",
        slug: "text-compare",
        description: "Compare two pieces of text and highlight the differences.",
        category: "Text",
        tags: ["Text", "Diff", "Compare"],
        status: "available",
    },
    {
        name: "Regex Tester",
        slug: "regex",
        description: "Test regular expressions against sample text.",
        category: "Text",
        tags: ["Regex", "Pattern Matching"],
        status: "available",
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
        name: "JWT Encoder / Decoder",
        slug: "jwt",
        description: "Decode and encode JWT headers and payloads.",
        category: "Security",
        tags: ["JWT", "Auth", "Security"],
        status: "available",
    },
    {
        name: "SQL Injection Tester",
        slug: "sqli-tester",
        description: "Visualise how unsafe SQL queries change when user input is injected.",
        category: "Security",
        tags: ["SQLi", "MySQL", "Cybersecurity"],
        status: "available",
    },
    {
        name: "JSON Formatter",
        slug: "json",
        description: "Format, minify, and validate JSON instantly.",
        category: "Data",
        tags: ["JSON", "Formatter", "Validator"],
        status: "available",
    },
    {
        name: "Timestamp Converter",
        slug: "timestamp",
        description: "Convert Unix timestamps into readable dates.",
        category: "Time",
        tags: ["Unix", "Timestamp", "Date"],
        status: "available",
    },
    {
        name: "URL Encoder / Decoder",
        slug: "url",
        description: "Encode, decode, and inspect URLs and query parameters.",
        category: "Web",
        tags: ["URL", "Encoding", "Query Params"],
        status: "available",
    },
    {
        name: "Markdown Previewer",
        slug: "markdown",
        description: "Write Markdown and preview the rendered output live.",
        category: "Text",
        tags: ["Markdown", "Preview", "HTML"],
        status: "coming-soon",
    },
    {
        name: "CSP Tester",
        slug: "csp",
        description: "Parse Content Security Policy headers and highlight risky directives.",
        category: "Security",
        tags: ["CSP", "Web Security", "Headers"],
        status: "coming-soon",
    },
    {
        name: "Colour Converter",
        slug: "colour",
        description: "Convert colours between HEX, RGB, HSL, and other formats.",
        category: "Design",
        tags: ["Colour", "HEX", "RGB", "HSL"],
        status: "coming-soon",
    },
];