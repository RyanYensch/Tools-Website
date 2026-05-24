import { Link } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 660;

export default function Navbar() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                setOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className="navbar glass">
            <div className="navbar-container">
                <div className="navbar-name">
                    <Link
                        className="navbar-name-link glow-item"
                        to="/"
                        onClick={() => setOpen(false)}
                    >
                        Ryan's Tools
                    </Link>
                </div>

                <ul className="navbar-links">
                    <li>
                        <Link className="navbar-item-link glow-item" to="/text-compare">
                            Text Compare
                        </Link>
                    </li>
                    <li>
                        <Link className="navbar-item-link glow-item" to="/regex">
                            Regex
                        </Link>
                    </li>
                    <li>
                    </li>
                    <li>
                        <Link className="navbar-item-link glow-item" to="/base64">
                            Base64
                        </Link>
                    </li>
                    <li>
                        <Link className="navbar-item-link glow-item" to="/sqli-tester">
                            SQLi
                        </Link>
                    </li>
                    <li>
                        <Link className="navbar-item-link glow-item" to="/jwt">
                            JWT
                        </Link>
                    </li>
                    <li>
                        <a
                            className="navbar-item-link glow-item"
                            href="https://ryan.yensch.com"
                        >
                            Portfolio
                        </a>
                    </li>
                </ul>

                <button
                    className={`navbar-toggle glow-item ${open ? "open" : ""}`}
                    type="button"
                    aria-label="Toggle navigation"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="navbar-toggle-bar" />
                    <span className="navbar-toggle-bar" />
                    <span className="navbar-toggle-bar" />
                </button>
            </div>

            <div className={`navbar-dropdown glass ${open ? "open" : ""}`}>
                <ul className="navbar-dropdown-links">
                    <li>
                        <Link
                            className="navbar-dropdown-item-link glow-item"
                            to="/"
                            onClick={() => setOpen(false)}
                        >
                            Tools
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="navbar-dropdown-item-link glow-item"
                            to="/json"
                            onClick={() => setOpen(false)}
                        >
                            JSON
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="navbar-dropdown-item-link glow-item"
                            to="/jwt"
                            onClick={() => setOpen(false)}
                        >
                            JWT
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="navbar-dropdown-item-link glow-item"
                            to="/base64"
                            onClick={() => setOpen(false)}
                        >
                            Base64
                        </Link>
                    </li>
                    <li>
                        <a
                            className="navbar-dropdown-item-link glow-item"
                            href="https://ryan.yensch.com"
                            onClick={() => setOpen(false)}
                        >
                            Portfolio
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
}