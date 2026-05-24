import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
    type InlineToken,
    type MarkdownBlock,
    getMarkdownStats,
    getSampleMarkdown,
    parseMarkdown,
} from "../../utils/markdown";
import "../ToolPage/ToolPage.css";
import "./MarkdownTool.css";

function renderInlineTokens(tokens: InlineToken[]): ReactNode[] {
    return tokens.map((token, index) => {
        const key = `${token.type}-${index}`;

        if (token.type === "text") {
            return token.value;
        }

        if (token.type === "inline-code") {
            return (
                <code key={key} className="markdown-inline-code">
                    {token.value}
                </code>
            );
        }

        if (token.type === "bold") {
            return (
                <strong key={key}>
                    {renderInlineTokens(token.children)}
                </strong>
            );
        }

        if (token.type === "italic") {
            return (
                <em key={key}>
                    {renderInlineTokens(token.children)}
                </em>
            );
        }

        if (token.type === "link") {
            if (!token.safeHref) {
                return (
                    <span
                        key={key}
                        className="markdown-blocked-link"
                        title={`Blocked unsafe link: ${token.href}`}
                    >
                        {renderInlineTokens(token.children)}
                    </span>
                );
            }

            return (
                <a
                    key={key}
                    href={token.safeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {renderInlineTokens(token.children)}
                </a>
            );
        }

        return null;
    });
}

function renderMarkdownBlock(block: MarkdownBlock, index: number): ReactNode {
    const key = `${block.type}-${index}`;

    if (block.type === "heading") {
        const children = renderInlineTokens(block.children);

        if (block.level === 1) {
            return <h1 key={key}>{children}</h1>;
        }

        if (block.level === 2) {
            return <h2 key={key}>{children}</h2>;
        }

        if (block.level === 3) {
            return <h3 key={key}>{children}</h3>;
        }

        if (block.level === 4) {
            return <h4 key={key}>{children}</h4>;
        }

        if (block.level === 5) {
            return <h5 key={key}>{children}</h5>;
        }

        return <h6 key={key}>{children}</h6>;
    }

    if (block.type === "paragraph") {
        return (
            <p key={key}>
                {renderInlineTokens(block.children)}
            </p>
        );
    }

    if (block.type === "unordered-list") {
        return (
            <ul key={key}>
                {block.items.map((item, itemIndex) => (
                    <li key={`item-${itemIndex}`}>
                        {renderInlineTokens(item)}
                    </li>
                ))}
            </ul>
        );
    }

    if (block.type === "ordered-list") {
        return (
            <ol key={key}>
                {block.items.map((item, itemIndex) => (
                    <li key={`item-${itemIndex}`}>
                        {renderInlineTokens(item)}
                    </li>
                ))}
            </ol>
        );
    }

    if (block.type === "blockquote") {
        return (
            <blockquote key={key}>
                {block.lines.map((line, lineIndex) => (
                    <p key={`quote-${lineIndex}`}>
                        {renderInlineTokens(line)}
                    </p>
                ))}
            </blockquote>
        );
    }

    if (block.type === "code-block") {
        return (
            <pre key={key} className="markdown-code-block">
                {block.language && (
                    <span className="markdown-code-language">
                        {block.language}
                    </span>
                )}
                <code>{block.code}</code>
            </pre>
        );
    }

    if (block.type === "horizontal-rule") {
        return <hr key={key} />;
    }

    return null;
}

export default function MarkdownTool() {
    const [markdown, setMarkdown] = useState("");

    const blocks = useMemo(() => {
        return parseMarkdown(markdown);
    }, [markdown]);

    const stats = useMemo(() => {
        return getMarkdownStats(markdown, blocks);
    }, [markdown, blocks]);

    const handleCopyMarkdown = async () => {
        if (!markdown) {
            return;
        }

        await navigator.clipboard.writeText(markdown);
    };

    const handleLoadSample = () => {
        setMarkdown(getSampleMarkdown());
    };

    const handleClear = () => {
        setMarkdown("");
    };

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <div className="tool-page-title-row">
                    <p className="tool-page-category">Text</p>
                </div>

                <h1>Markdown Previewer</h1>

                <p>
                    Write Markdown and preview the rendered output safely in
                    your browser.
                </p>

                <div className="tool-page-tags">
                    <span>Markdown</span>
                    <span>Preview</span>
                    <span>Safe Rendering</span>
                </div>
            </div>

            <div className="markdown-controls-card glass">
                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleLoadSample}
                >
                    Sample
                </button>

                <button
                    className="tool-button glow-item"
                    type="button"
                    onClick={handleCopyMarkdown}
                    disabled={!markdown}
                >
                    Copy Markdown
                </button>
            </div>

            <div className="tool-workspace">
                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Markdown Input</h2>
                    </div>

                    <textarea
                        className="tool-textarea markdown-textarea"
                        value={markdown}
                        onChange={(event) => setMarkdown(event.target.value)}
                        placeholder="Write Markdown here..."
                        spellCheck={false}
                    />
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Preview</h2>
                    </div>

                    <div className="markdown-preview">
                        {blocks.length > 0 ? (
                            blocks.map(renderMarkdownBlock)
                        ) : (
                            <p className="markdown-muted">
                                Preview will appear here.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="markdown-stats-grid">
                <div className="markdown-stat-card glass">
                    <span>Characters</span>
                    <strong>{stats.characters}</strong>
                </div>

                <div className="markdown-stat-card glass">
                    <span>Words</span>
                    <strong>{stats.words}</strong>
                </div>

                <div className="markdown-stat-card glass">
                    <span>Lines</span>
                    <strong>{stats.lines}</strong>
                </div>

                <div className="markdown-stat-card glass">
                    <span>Headings</span>
                    <strong>{stats.headings}</strong>
                </div>

                <div className="markdown-stat-card glass">
                    <span>Links</span>
                    <strong>{stats.links}</strong>
                </div>

                <div className="markdown-stat-card glass">
                    <span>Code Blocks</span>
                    <strong>{stats.codeBlocks}</strong>
                </div>
            </div>

            <div className="markdown-note-card glass">
                <strong>Security note</strong>
                <p>
                    Raw HTML is rendered as text, not executed. Links using
                    unsafe schemes like <code>javascript:</code> are blocked.
                </p>
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