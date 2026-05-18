import { Link } from "react-router-dom";
import { tools } from "../../data/tools";
import "./ToolsHome.css";

export default function ToolsHome() {
    return (
        <section className="tools-home">
            <div className="tools-hero glass">
                <h1 className="tools-title">
                    Developer Tools
                </h1>

                <p className="tools-description">
                    A collection of small utilities for formatting, decoding,
                    testing, and debugging common developer data.
                </p>
            </div>

            <div className="tools-grid">
                {tools.map((tool) => {
                    const isComingSoon = tool.status === "coming-soon";

                    return (
                        <Link
                            key={tool.slug}
                            to={`/${tool.slug}`}
                            className={`tool-card glass glow-item ${isComingSoon ? "coming-soon" : ""}`}
                        >
                            <div className="tool-card-header">
                                <h2>{tool.name}</h2>

                                <div className="tool-card-badges">
                                    <span className="tool-category">
                                        {tool.category}
                                    </span>

                                    {isComingSoon && (
                                        <span className="tool-status">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p>{tool.description}</p>

                            <div className="tool-tags">
                                {tool.tags.map((tag) => (
                                    <span key={tag}>{tag}</span>
                                ))}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}