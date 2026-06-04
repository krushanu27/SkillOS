import { useState } from "react";
import { useParams } from "react-router-dom";

import { runSkill } from "../services/skills.api";
import { uploadFile } from "../services/files.api";

export default function SkillPage() {
    const { id } = useParams();

    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);

        try {
            const result = await uploadFile(selectedFile);
            setUploadedFile(result);
        } finally {
            setLoading(false);
        }
    };

    const handleRun = async () => {
        setLoading(true);

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
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>{id}</h1>

            <textarea
                rows={10}
                style={{ width: "100%", marginBottom: 16 }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your prompt here..."
            />

            <div style={{ marginBottom: 16 }}>
                <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(e) => {
                        setSelectedFile(e.target.files?.[0] || null);
                        setUploadedFile(null);
                    }}
                />

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                    style={{ marginLeft: 8 }}
                >
                    Upload File
                </button>
            </div>

            {uploadedFile && (
                <div style={{ marginBottom: 16 }}>
                    <strong>Uploaded:</strong> {uploadedFile.original_name}
                    <br />
                    <small>{uploadedFile.size_bytes} bytes</small>
                    <br />
                    <small>
                        Extracted text:{" "}
                        {uploadedFile.extracted_text
                            ? `${uploadedFile.extracted_text.length} characters`
                            : "No readable text found"}
                    </small>
                </div>
            )}

            <button onClick={handleRun} disabled={loading}>
                {loading ? "Processing..." : "Run Skill"}
            </button>

            <pre
                style={{
                    marginTop: 24,
                    whiteSpace: "pre-wrap",
                }}
            >
                {response}
            </pre>
        </div>
    );
}