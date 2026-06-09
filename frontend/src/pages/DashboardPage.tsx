import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getSkills } from "../services/skills.api";

type ThemeName = "workspace" | "command";

function applyTheme(theme: ThemeName) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("skillos-theme", theme);
}

function getCategoryIcon(category: string) {
    const key = category.toLowerCase();

    if (key.includes("legal")) return "LG";
    if (key.includes("development")) return "DV";
    if (key.includes("academic")) return "AC";
    if (key.includes("career")) return "CR";
    if (key.includes("creative")) return "CV";
    if (key.includes("ai")) return "AI";

    return "SK";
}

export default function DashboardPage() {
    const [skills, setSkills] = useState<any[]>([]);
    const [theme, setTheme] = useState<ThemeName>("workspace");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const savedTheme =
            (localStorage.getItem("skillos-theme") as ThemeName | null) ||
            "workspace";

        setTheme(savedTheme);
        applyTheme(savedTheme);

        getSkills().then((data) => {
            setSkills(data.skills);
        });
    }, []);

    const categories = useMemo(() => {
        return new Set(skills.map((skill) => skill.category)).size;
    }, [skills]);

    const legalSkills = useMemo(() => {
        return skills.filter((skill) =>
            skill.category.toLowerCase().includes("legal")
        ).length;
    }, [skills]);

    const skillCategories = useMemo(() => {
        return [
            "All",
            ...Array.from(
                new Set(skills.map((skill) => skill.category))
            ),
        ];
    }, [skills]);

    const filteredSkills = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return skills.filter((skill) => {
            const matchesSearch =
                !query ||
                skill.name.toLowerCase().includes(query) ||
                skill.category.toLowerCase().includes(query) ||
                skill.description.toLowerCase().includes(query);

            const matchesCategory =
                selectedCategory === "All" ||
                skill.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [skills, searchQuery, selectedCategory]);

    const changeTheme = (nextTheme: ThemeName) => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-badge">SO</div>
                    <h1>SkillOS</h1>
                    <p>AI Operating System</p>
                </div>

                <nav className="nav-links">
                    <Link className="nav-link" to="/">
                        Dashboard
                    </Link>

                    <Link className="nav-link" to="/history">
                        Execution History
                    </Link>
                </nav>

                <div className="sidebar-stats">
                    <div>
                        <span>Total Skills</span>
                        <strong>{skills.length}</strong>
                    </div>

                    <div>
                        <span>Categories</span>
                        <strong>{categories}</strong>
                    </div>
                </div>

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
                        <div className="eyebrow">SkillOS Core</div>

                        <h2 className="page-title">
                            Deploy reusable expert intelligence
                        </h2>

                        <p className="page-subtitle">
                            SkillOS turns specialized prompts into reusable AI
                            workspaces for career, development, academic,
                            creative, and legal workflows.
                        </p>
                    </div>
                </header>

                <section className="stat-grid">
                    <div className="stat-card">
                        <span>Total Skills</span>
                        <strong>{skills.length}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Categories</span>
                        <strong>{categories}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Legal Tools</span>
                        <strong>{legalSkills}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Mode</span>
                        <strong>{theme === "workspace" ? "Pro" : "CMD"}</strong>
                    </div>
                </section>

                <section className="workspace-toolbar">
                    <div>
                        <div className="eyebrow">Skill Search</div>
                        <h3>Find a workspace</h3>
                    </div>

                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search by skill, category, or description..."
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(event.target.value)
                        }
                    />
                </section>

                <div className="filter-bar">
                    {skillCategories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`filter-chip ${selectedCategory === category ? "active" : ""
                                }`}
                            onClick={() =>
                                setSelectedCategory(category)
                            }
                            style={{
                                opacity:
                                    selectedCategory === category
                                        ? 1
                                        : 0.7,
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <section className="card-grid">
                    {filteredSkills.map((skill) => (
                        <Link
                            key={skill.id}
                            to={`/skill/${skill.id}`}
                            className="card skill-card"
                        >
                            <div className="skill-card-top">
                                <span className="skill-icon">
                                    {getCategoryIcon(skill.category)}
                                </span>

                                <span className="category">
                                    {skill.category}
                                </span>
                            </div>

                            <h3>{skill.name}</h3>

                            <p>{skill.description}</p>

                            <div className="launch-hint">
                                Launch Workspace →
                            </div>
                        </Link>
                    ))}
                </section>

                {filteredSkills.length === 0 && (
                    <div className="empty-state">
                        No skills found. Apparently even the AI OS
                        cannot find what does not exist. 🫠
                    </div>
                )}
            </main>
        </div>
    );
}