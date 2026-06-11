import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getSkills } from "../services/skills.api";

type ThemeName = "workspace" | "command";
type QuickView = "all" | "favorites" | "legal";

const FAVORITES_STORAGE_KEY = "skillos-favorite-skills";
const RECENT_SKILLS_STORAGE_KEY = "skillos-recent-skills";
const SKILL_USAGE_STORAGE_KEY = "skillos-skill-usage-counts";
const QUICK_VIEW_STORAGE_KEY = "skillos-dashboard-quick-view";

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

function getSavedQuickView(): QuickView {
    const savedQuickView = localStorage.getItem(
        QUICK_VIEW_STORAGE_KEY
    ) as QuickView | null;

    if (
        savedQuickView === "favorites" ||
        savedQuickView === "legal" ||
        savedQuickView === "all"
    ) {
        return savedQuickView;
    }

    return "all";
}

export default function DashboardPage() {
    const [skills, setSkills] = useState<any[]>([]);
    const [theme, setTheme] = useState<ThemeName>("workspace");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [favoriteSkillIds, setFavoriteSkillIds] = useState<string[]>([]);
    const [recentSkillIds, setRecentSkillIds] = useState<string[]>([]);
    const [skillUsageCounts, setSkillUsageCounts] =
        useState<Record<string, number>>({});
    const [quickView, setQuickView] = useState<QuickView>("all");
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    useEffect(() => {
        const savedTheme =
            (localStorage.getItem("skillos-theme") as ThemeName | null) ||
            "workspace";

        const savedFavorites = JSON.parse(
            localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]"
        );

        const savedRecentSkills = JSON.parse(
            localStorage.getItem(RECENT_SKILLS_STORAGE_KEY) || "[]"
        );

        const savedUsageCounts = JSON.parse(
            localStorage.getItem(SKILL_USAGE_STORAGE_KEY) || "{}"
        );

        setTheme(savedTheme);
        setFavoriteSkillIds(savedFavorites);
        setRecentSkillIds(savedRecentSkills);
        setSkillUsageCounts(savedUsageCounts);
        setQuickView(getSavedQuickView());
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
            ...Array.from(new Set(skills.map((skill) => skill.category))),
        ];
    }, [skills]);

    const favoriteSkills = useMemo(() => {
        return skills.filter((skill) =>
            favoriteSkillIds.includes(skill.id)
        );
    }, [skills, favoriteSkillIds]);

    const recentSkills = useMemo(() => {
        return recentSkillIds
            .map((skillId) =>
                skills.find((skill) => skill.id === skillId)
            )
            .filter(Boolean);
    }, [skills, recentSkillIds]);

    const mostUsedSkills = useMemo(() => {
        return [...skills]
            .filter((skill) => (skillUsageCounts[skill.id] || 0) > 0)
            .sort(
                (a, b) =>
                    (skillUsageCounts[b.id] || 0) -
                    (skillUsageCounts[a.id] || 0)
            )
            .slice(0, 3);
    }, [skills, skillUsageCounts]);

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

            const matchesQuickView =
                quickView === "all" ||
                (quickView === "favorites" &&
                    favoriteSkillIds.includes(skill.id)) ||
                (quickView === "legal" &&
                    skill.category.toLowerCase().includes("legal"));

            return matchesSearch && matchesCategory && matchesQuickView;
        });
    }, [
        skills,
        searchQuery,
        selectedCategory,
        quickView,
        favoriteSkillIds,
    ]);

    const dashboardTitle = useMemo(() => {
        if (quickView === "favorites") return "Favorite Skills";
        if (quickView === "legal") return "Legal Skills";
        return "All Workspaces";
    }, [quickView]);

    const closeMobileNav = () => {
        setIsMobileNavOpen(false);
    };

    const changeTheme = (nextTheme: ThemeName) => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
    };

    const resetDashboardView = () => {
        setQuickView("all");
        setSelectedCategory("All");
        setSearchQuery("");
        localStorage.setItem(QUICK_VIEW_STORAGE_KEY, "all");
        closeMobileNav();
    };

    const showFavoriteSkills = () => {
        setQuickView("favorites");
        setSelectedCategory("All");
        setSearchQuery("");
        localStorage.setItem(QUICK_VIEW_STORAGE_KEY, "favorites");
        closeMobileNav();
    };

    const showLegalSkills = () => {
        setQuickView("legal");
        setSelectedCategory("All");
        setSearchQuery("");
        localStorage.setItem(QUICK_VIEW_STORAGE_KEY, "legal");
        closeMobileNav();
    };

    const toggleFavorite = (skillId: string) => {
        setFavoriteSkillIds((currentFavorites) => {
            const updatedFavorites = currentFavorites.includes(skillId)
                ? currentFavorites.filter((id) => id !== skillId)
                : [...currentFavorites, skillId];

            localStorage.setItem(
                FAVORITES_STORAGE_KEY,
                JSON.stringify(updatedFavorites)
            );

            return updatedFavorites;
        });
    };

    const saveRecentSkill = (skillId: string) => {
        setRecentSkillIds((currentRecentSkills) => {
            const updatedRecentSkills = [
                skillId,
                ...currentRecentSkills.filter((id) => id !== skillId),
            ].slice(0, 5);

            localStorage.setItem(
                RECENT_SKILLS_STORAGE_KEY,
                JSON.stringify(updatedRecentSkills)
            );

            return updatedRecentSkills;
        });
    };

    const renderSkillCard = (skill: any) => {
        const isFavorite = favoriteSkillIds.includes(skill.id);

        return (
            <article key={skill.id} className="card skill-card">
                <div className="skill-card-top">
                    <span className="skill-icon">
                        {getCategoryIcon(skill.category)}
                    </span>

                    <span className="category">
                        {skill.category}
                    </span>

                    <button
                        className={`favorite-button ${isFavorite ? "active" : ""
                            }`}
                        onClick={() => toggleFavorite(skill.id)}
                        type="button"
                        aria-label={
                            isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }
                    >
                        {isFavorite ? "★" : "☆"}
                    </button>
                </div>

                <Link
                    to={`/skill/${skill.id}`}
                    className="skill-card-link"
                    onClick={() => saveRecentSkill(skill.id)}
                >
                    <h3>{skill.name}</h3>

                    <p>{skill.description}</p>

                    <div className="launch-hint">
                        Used {skillUsageCounts[skill.id] || 0} times
                    </div>

                    <div className="launch-hint">
                        Launch Workspace →
                    </div>
                </Link>
            </article>
        );
    };

    const renderCompactSkillRow = (
        skill: any,
        rank?: number,
        showUsage = false
    ) => {
        const usageCount = skillUsageCounts[skill.id] || 0;

        return (
            <Link
                key={skill.id}
                to={`/skill/${skill.id}`}
                className="compact-skill-row"
                onClick={() => saveRecentSkill(skill.id)}
            >
                {rank ? (
                    <span className="leaderboard-rank">
                        {rank}
                    </span>
                ) : (
                    <span className="skill-icon">
                        {getCategoryIcon(skill.category)}
                    </span>
                )}

                <span className="compact-skill-main">
                    <span className="compact-skill-title">
                        {skill.name}
                    </span>

                    <span className="compact-skill-meta">
                        {skill.category}
                    </span>
                </span>

                <span className="compact-skill-count">
                    {showUsage
                        ? `${usageCount} ${usageCount === 1 ? "use" : "uses"
                        }`
                        : "Open"}{" "}
                    →
                </span>
            </Link>
        );
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
                    <p>AI Operating System</p>
                </div>

                <nav className="nav-links">
                    <Link
                        className={`nav-link ${quickView === "all" ? "active-nav" : ""
                            }`}
                        to="/"
                        onClick={resetDashboardView}
                    >
                        Dashboard
                    </Link>

                    <Link
                        className="nav-link"
                        to="/history"
                        onClick={closeMobileNav}
                    >
                        Execution History
                    </Link>

                    <button
                        type="button"
                        className={`nav-link nav-button ${quickView === "favorites" ? "active-nav" : ""
                            }`}
                        onClick={showFavoriteSkills}
                    >
                        <span>★ Favorites</span>
                        <strong className="nav-count">
                            {favoriteSkills.length}
                        </strong>
                    </button>

                    <button
                        type="button"
                        className={`nav-link nav-button ${quickView === "legal" ? "active-nav" : ""
                            }`}
                        onClick={showLegalSkills}
                    >
                        <span>⚖ Legal</span>
                        <strong className="nav-count">
                            {legalSkills}
                        </strong>
                    </button>
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
                        <span>Favorites</span>
                        <strong>{favoriteSkills.length}</strong>
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
                            className={`filter-chip ${quickView === "all" &&
                                    selectedCategory === category
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() => {
                                setQuickView("all");
                                setSelectedCategory(category);
                                localStorage.setItem(
                                    QUICK_VIEW_STORAGE_KEY,
                                    "all"
                                );
                            }}
                            style={{
                                opacity:
                                    quickView === "all" &&
                                        selectedCategory === category
                                        ? 1
                                        : 0.7,
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {mostUsedSkills.length > 0 && (
                    <section className="dashboard-section compact-dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="eyebrow">
                                    Usage Intelligence
                                </div>
                                <h3>Most Used Skills</h3>
                            </div>
                        </div>

                        <div className="compact-skill-list">
                            {mostUsedSkills.map((skill, index) =>
                                renderCompactSkillRow(
                                    skill,
                                    index + 1,
                                    true
                                )
                            )}
                        </div>
                    </section>
                )}

                {recentSkills.length > 0 && (
                    <section className="dashboard-section compact-dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="eyebrow">Quick Return</div>
                                <h3>Recently Used Skills</h3>
                            </div>
                        </div>

                        <div className="compact-skill-list">
                            {recentSkills.map((skill) =>
                                renderCompactSkillRow(skill)
                            )}
                        </div>
                    </section>
                )}

                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <div className="eyebrow">Skill Library</div>
                            <h3>{dashboardTitle}</h3>
                        </div>
                    </div>

                    <div className="card-grid">
                        {filteredSkills.map((skill) =>
                            renderSkillCard(skill)
                        )}
                    </div>
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