import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getSkillRunHistory } from "../services/skills.api";
import type { SkillRunHistory } from "../types/skill";

type ThemeName = "workspace" | "command";

function applySavedTheme() {
    const savedTheme =
        (localStorage.getItem("skillos-theme") as ThemeName | null) ||
        "workspace";

    document.documentElement.setAttribute("data-theme", savedTheme);
}

export default function HistoryPage() {
    const [history, setHistory] = useState<SkillRunHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        applySavedTheme();

        async function loadHistory() {
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
        }

        loadHistory();
    }, []);

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-badge">SO</div>
                    <h1>SkillOS</h1>
                    <p>Execution Memory</p>
                </div>

                <nav className="nav-links">
                    <Link className="nav-link" to="/">
                        Dashboard
                    </Link>

                    <Link className="nav-link active-nav" to="/history">
                        Execution History
                    </Link>
                </nav>
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

                                    <div className="history-badge">
                                        EXECUTED
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