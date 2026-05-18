import { Link, Navigate } from "react-router-dom";
import { tools } from "../../data/tools";
import "./ToolPage.css";

type ToolPageProps = {
    toolSlug: string;
};

export default function ToolPage({ toolSlug }: ToolPageProps) {
    const tool = tools.find((item) => item.slug === toolSlug);

    if (!tool) {
        return <Navigate to="/" replace />;
    }

    return (
        <section className="tool-page">
            <Link to="/" className="tool-back-link glow-item">
                Back to tools
            </Link>

            <div className="tool-page-header glass">
                <p className="tool-page-category">{tool.category}</p>

                <h1>{tool.name}</h1>

                <p>{tool.description}</p>

                <div className="tool-page-tags">
                    {tool.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            </div>

            <div className="tool-workspace">
                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Input</h2>
                    </div>

                    <textarea
                        className="tool-textarea"
                        placeholder={`Paste input for ${tool.name} here...`}
                    />
                </div>

                <div className="tool-panel glass">
                    <div className="tool-panel-header">
                        <h2>Output</h2>

                        <button className="tool-button glow-item" type="button">
                            Copy
                        </button>
                    </div>

                    <pre className="tool-output">
                        Tool output will appear here.
                    </pre>
                </div>
            </div>

            <div className="tool-actions">
                <button className="tool-button primary glow-item" type="button">
                    Run Tool
                </button>

                <button className="tool-button glow-item" type="button">
                    Clear
                </button>
            </div>
        </section>
    );
}