import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { runSkill } from "../services/skills.api";
import { uploadFile } from "../services/files.api";
import { getSkills } from "../services/skills.api";

type ThemeName = "workspace" | "command";

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

        try {
            const result = await uploadFile(selectedFile);
            setUploadedFile(result);
        } finally {
            setUploading(false);
        }
    };

    const handleRun = async () => {
        if (!input.trim() && !uploadedFile) return;

        setRunning(true);
        setResponse("");

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
        } finally {
            setRunning(false);
        }
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
                    <Link className="nav-link" to="/">
                        Dashboard
                    </Link>

                    <Link className="nav-link" to="/history">
                        Execution History
                    </Link>
                </nav>
            </aside>

            <main className="main-workspace">
                <header className="page-header">
                    <div>
                        <div className="eyebrow">Active Workspace</div>

                        <h2 className="page-title">
                            {skillName || id}
                        </h2>

                        <p className="page-subtitle">
                            Provide instructions, attach optional context, and run this reusable expert skill.
                        </p>
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

                        <div className="file-row">
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

                            <button
                                className="primary-button"
                                onClick={handleRun}
                                disabled={isBusy || (!input.trim() && !uploadedFile)}
                                type="button"
                            >
                                {running ? "Running Skill..." : "Run Skill"}
                            </button>
                        </div>

                        {selectedFile && !uploadedFile && (
                            <p className="upload-note">
                                Selected: {selectedFile.name}
                            </p>
                        )}

                        {uploadedFile && (
                            <div className="upload-note">
                                Uploaded: {uploadedFile.original_name}
                                <br />
                                Size: {uploadedFile.size_bytes} bytes
                                <br />
                                Extracted text:{" "}
                                {uploadedFile.extracted_text
                                    ? `${uploadedFile.extracted_text.length} characters`
                                    : "No readable text found"}
                            </div>
                        )}
                    </div>

                    <div className="output-panel">
                        <div className="eyebrow">Generated Output</div>

                        {running ? (
                            <div className="loading-console">
                                <strong>⚡ SkillOS Runtime Active</strong>

                                <span>Loading workspace...</span>
                                <span>Analyzing prompt...</span>
                                <span>Preparing AI context...</span>
                                <span>Generating response...</span>
                            </div>
                        ) : response ? (
                            <div className="output-content">
                                <pre>{response}</pre>
                            </div>
                        ) : (
                            <p className="empty-output">
                                Output will appear here after execution.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}