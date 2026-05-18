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
                {tools.map((tool) => (
                    <Link
                        key={tool.slug}
                        to={`/${tool.slug}`}
                        className="tool-card glass glow-item"
                    >
                        <div className="tool-card-header">
                            <h2>{tool.name}</h2>
                            <span className="tool-category">
                                {tool.category}
                            </span>
                        </div>

                        <p>{tool.description}</p>

                        <div className="tool-tags">
                            {tool.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}