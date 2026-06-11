import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { runSkill } from "../services/skills.api";
import { uploadFile } from "../services/files.api";
import { getSkills } from "../services/skills.api";

type ThemeName = "workspace" | "command";

const SKILL_USAGE_STORAGE_KEY =
    "skillos-skill-usage-counts";

function applySavedTheme() {
    const savedTheme =
        (localStorage.getItem("skillos-theme") as ThemeName | null) ||
        "workspace";

    document.documentElement.setAttribute("data-theme", savedTheme);
}

export default function SkillPage() {
    const { id } = useParams();

    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [running, setRunning] = useState(false);
    const [skillName, setSkillName] = useState("");
    const [skillCategory, setSkillCategory] = useState("");
    const [notice, setNotice] = useState("");
    const [copied, setCopied] = useState(false);

    const isBusy = uploading || running;

    useEffect(() => {
        applySavedTheme();

        async function loadSkillName() {
            try {
                const data = await getSkills();

                const skill = data.skills.find(
                    (s: any) => s.id === id
                );

                if (skill) {
                    setSkillName(skill.name);
                    setSkillCategory(skill.category);
                }
            } catch (error) {
                console.error(error);
            }
        }

        loadSkillName();
    }, [id]);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setNotice("");

        try {
            const result = await uploadFile(selectedFile);
            setUploadedFile(result);
            setNotice("✓ File uploaded successfully.");
        } finally {
            setUploading(false);
        }
    };

    const handleRun = async () => {
        if (!input.trim() && !uploadedFile) return;

        setRunning(true);
        setResponse("");
        setNotice("");

        try {
            const fileContext = uploadedFile
                ? `

Uploaded File:
Name: ${uploadedFile.original_name}
Saved Path: ${uploadedFile.path}
Size: ${uploadedFile.size_bytes} bytes

Extracted File Content:
${uploadedFile.extracted_text || "No readable text extracted from this file."}
`
                : "";

            const finalInput = `${input}${fileContext}`;

            const result = await runSkill(id || "", finalInput);

            setResponse(result.response);
            setNotice("✓ Skill executed successfully.");

            const currentUsageCounts = JSON.parse(
                localStorage.getItem(SKILL_USAGE_STORAGE_KEY) || "{}"
            );

            currentUsageCounts[id || "unknown"] =
                (currentUsageCounts[id || "unknown"] || 0) + 1;

            localStorage.setItem(
                SKILL_USAGE_STORAGE_KEY,
                JSON.stringify(currentUsageCounts)
            );
        } finally {
            setRunning(false);
        }
    };

    const handleCopyOutput = async () => {
        if (!response) return;

        await navigator.clipboard.writeText(response);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleResetWorkspace = () => {
        setInput("");
        setResponse("");
        setSelectedFile(null);
        setUploadedFile(null);
        setNotice("");
        setCopied(false);
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-badge">SO</div>
                    <h1>SkillOS</h1>
                    <p>Active Skill Workspace</p>
                </div>

                <nav className="nav-links">
                    <Link className="nav-link active-nav" to="/">
                        Dashboard
                    </Link>

                    <Link className="nav-link" to="/history">
                        Execution History
                    </Link>
                </nav>
            </aside>

            <main className="main-workspace">
                <div className="workspace-nav-actions">
                    <Link
                        to="/"
                        className="workspace-nav-link"
                    >
                        ← Dashboard
                    </Link>

                    <Link
                        to="/history"
                        className="workspace-nav-link"
                    >
                        Execution History
                    </Link>
                </div>

                <header className="page-header">
                    <div>
                        <div className="eyebrow">Active Workspace</div>

                        <h2 className="page-title">
                            {skillName || id}
                        </h2>

                        <p className="page-subtitle">
                            Provide instructions, attach optional context, and run this reusable expert skill.
                        </p>

                        <div className="workspace-info-grid">
                            <div className="workspace-info-card">
                                <span>Category</span>
                                <strong>{skillCategory || "General"}</strong>
                            </div>

                            <div className="workspace-info-card">
                                <span>Status</span>
                                <strong>{isBusy ? "Processing" : "Ready"}</strong>
                            </div>

                            <div className="workspace-info-card">
                                <span>File Upload</span>
                                <strong>Enabled</strong>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="workspace-grid">
                    <div className="input-panel">
                        <div className="eyebrow">Input Console</div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe what you want this skill to do..."
                            disabled={isBusy}
                        />

                        <div className="workspace-action-panel">
                            <div className="workspace-action-row">
                                <label className="file-picker">
                                    Select File

                                    <input
                                        type="file"
                                        accept=".txt,.pdf,.docx"
                                        style={{ display: "none" }}
                                        disabled={isBusy}
                                        onChange={(e) => {
                                            setSelectedFile(
                                                e.target.files?.[0] || null
                                            );
                                            setUploadedFile(null);
                                            setNotice("");
                                        }}
                                    />
                                </label>

                                <button
                                    className="secondary-button"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || isBusy}
                                    type="button"
                                >
                                    {uploading ? "Uploading..." : "Upload File"}
                                </button>
                            </div>

                            <div className="workspace-action-row">
                                <button
                                    className="secondary-button"
                                    onClick={handleResetWorkspace}
                                    disabled={isBusy}
                                    type="button"
                                >
                                    Reset Workspace
                                </button>

                                <button
                                    className="secondary-button"
                                    onClick={() => setResponse("")}
                                    disabled={!response || running}
                                    type="button"
                                >
                                    Clear Output
                                </button>
                            </div>

                            <button
                                className="primary-button run-skill-button"
                                onClick={handleRun}
                                disabled={isBusy || (!input.trim() && !uploadedFile)}
                                type="button"
                            >
                                {running ? "Running Skill..." : "Run Skill"}
                            </button>
                        </div>

                        {selectedFile && (
                            <p className="upload-note">
                                Selected file: {selectedFile.name}
                            </p>
                        )}

                        {uploadedFile && (
                            <p className="upload-note">
                                Uploaded file: {uploadedFile.original_name}
                            </p>
                        )}

                        {notice && (
                            <p className="upload-note">
                                {notice}
                            </p>
                        )}
                    </div>

                    <div className="output-panel">
                        <div className="history-header">
                            <div>
                                <div className="eyebrow">Generated Output</div>
                            </div>

                            {response && (
                                <button
                                    className="secondary-button"
                                    onClick={handleCopyOutput}
                                    type="button"
                                >
                                    {copied ? "Copied" : "Copy Output"}
                                </button>
                            )}
                        </div>

                        {running ? (
                            <div className="loading-console">
                                <strong>⚡ Running Skill</strong>
                                <span>Sending prompt to local AI...</span>
                                <span>Generating structured output...</span>
                                <span>Saving execution history...</span>
                            </div>
                        ) : response ? (
                            <div className="output-content">
                                <pre>{response}</pre>
                            </div>
                        ) : (
                            <div className="empty-state-panel">
                                <h3>⚡ Workspace Ready</h3>

                                <p>
                                    Enter a prompt and run the skill.
                                </p>

                                <ul>
                                    <li>Text prompts supported</li>
                                    <li>File uploads supported</li>
                                    <li>AI-generated responses</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}