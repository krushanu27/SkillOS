import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getSkillRunHistory,
    deleteHistoryItem,
    clearHistory,
} from "../services/skills.api";

import type { SkillRunHistory } from "../types/skill";

type ThemeName = "workspace" | "command";

const QUICK_VIEW_STORAGE_KEY = "skillos-dashboard-quick-view";

function applyTheme(theme: ThemeName) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("skillos-theme", theme);
}

function getSavedTheme(): ThemeName {
    return (
        (localStorage.getItem("skillos-theme") as ThemeName | null) ||
        "workspace"
    );
}

export default function HistoryPage() {
    const [history, setHistory] = useState<SkillRunHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<ThemeName>("workspace");
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const loadHistory = async () => {
        try {
            const data = await getSkillRunHistory();

            const sortedHistory = [...data].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );

            setHistory(sortedHistory);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedTheme = getSavedTheme();

        setTheme(savedTheme);
        applyTheme(savedTheme);
        loadHistory();
    }, []);

    const closeMobileNav = () => {
        setIsMobileNavOpen(false);
    };

    const changeTheme = (nextTheme: ThemeName) => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
    };

    const goToDashboardView = (quickView: "all" | "favorites" | "legal") => {
        localStorage.setItem(QUICK_VIEW_STORAGE_KEY, quickView);
        closeMobileNav();
    };

    const handleDelete = async (runId: string) => {
        const confirmed = window.confirm(
            "Delete this history entry?"
        );

        if (!confirmed) return;

        await deleteHistoryItem(runId);

        setHistory((current) =>
            current.filter((item) => item.id !== runId)
        );
    };

    const handleClearAll = async () => {
        const confirmed = window.confirm(
            "Delete ALL execution history?"
        );

        if (!confirmed) return;

        await clearHistory();

        setHistory([]);
    };

    return (
        <div className="app-shell">
            <button
                className="mobile-menu-button"
                type="button"
                onClick={() =>
                    setIsMobileNavOpen((currentState) => !currentState)
                }
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileNavOpen}
            >
                ☰ Menu
            </button>

            {isMobileNavOpen && (
                <button
                    className="nav-overlay"
                    type="button"
                    onClick={closeMobileNav}
                    aria-label="Close navigation menu"
                />
            )}

            <aside
                className={`sidebar ${isMobileNavOpen ? "sidebar-open" : ""
                    }`}
            >
                <div className="brand">
                    <div className="brand-badge">SO</div>
                    <h1>SkillOS</h1>
                    <p>Execution Memory</p>
                </div>

                <nav className="nav-links">
                    <Link
                        className="nav-link"
                        to="/"
                        onClick={() => goToDashboardView("all")}
                    >
                        Dashboard
                    </Link>

                    <Link
                        className="nav-link active-nav"
                        to="/history"
                        onClick={closeMobileNav}
                    >
                        Execution History
                    </Link>

                    <Link
                        className="nav-link"
                        to="/"
                        onClick={() => goToDashboardView("favorites")}
                    >
                        ★ Favorites
                    </Link>

                    <Link
                        className="nav-link"
                        to="/"
                        onClick={() => goToDashboardView("legal")}
                    >
                        ⚖ Legal
                    </Link>
                </nav>

                <div className="theme-panel">
                    <p>Interface Mode</p>

                    <div className="theme-actions">
                        <button
                            className={`theme-button ${theme === "workspace" ? "active" : ""
                                }`}
                            onClick={() => changeTheme("workspace")}
                            type="button"
                        >
                            Professional Workspace
                        </button>

                        <button
                            className={`theme-button ${theme === "command" ? "active" : ""
                                }`}
                            onClick={() => changeTheme("command")}
                            type="button"
                        >
                            Command Center
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-workspace">
                <header className="page-header">
                    <div>
                        <div className="eyebrow">System Memory</div>

                        <h2 className="page-title">
                            Execution History
                        </h2>

                        <p className="page-subtitle">
                            Review previously executed skills,
                            prompts, and generated outputs.
                        </p>
                    </div>

                    {history.length > 0 && (
                        <button
                            className="secondary-button"
                            onClick={handleClearAll}
                            type="button"
                        >
                            Clear History
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="output-panel">
                        <div className="loading-console">
                            <strong>⚡ Accessing System Memory</strong>

                            <span>Loading execution history...</span>
                            <span>Reading stored records...</span>
                            <span>Preparing timeline...</span>
                        </div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="output-panel">
                        <div className="empty-state-panel">
                            <h3>📜 No Execution History</h3>

                            <p>
                                This workspace has not recorded any skill executions yet.
                            </p>

                            <ul>
                                <li>Run a skill from the dashboard</li>
                                <li>Generated outputs are stored automatically</li>
                                <li>History survives server restarts</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((run) => (
                            <article
                                key={run.id}
                                className="history-card"
                            >
                                <div className="history-header">
                                    <div>
                                        <h3>
                                            {run.skill_id}
                                        </h3>

                                        <div className="history-meta">
                                            {new Date(
                                                run.created_at
                                            ).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="history-actions">
                                        <div className="history-badge">
                                            EXECUTED
                                        </div>

                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                handleDelete(run.id)
                                            }
                                            type="button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="history-section">
                                    <strong>Prompt</strong>

                                    <p>
                                        {run.prompt.length > 500
                                            ? `${run.prompt.substring(
                                                0,
                                                500
                                            )}...`
                                            : run.prompt}
                                    </p>
                                </div>

                                <div className="history-section">
                                    <strong>Response</strong>

                                    <p>
                                        {run.response.length > 1000
                                            ? `${run.response.substring(
                                                0,
                                                1000
                                            )}...`
                                            : run.response}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}