import { useEffect, useState } from "react";
import { getSkillRunHistory } from "../services/skills.api";
import type { SkillRunHistory } from "../types/skill";

export default function HistoryPage() {
    const [history, setHistory] = useState<SkillRunHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getSkillRunHistory();
                setHistory(data);
            } catch (error) {
                console.error("Failed to load skill run history:", error);
            } finally {
                setLoading(false);
            }
        }

        loadHistory();
    }, []);

    if (loading) {
        return <p>Loading history...</p>;
    }

    return (
        <main>
            <h1>Skill Run History</h1>

            {history.length === 0 ? (
                <p>No skill runs yet.</p>
            ) : (
                <div>
                    {history.map((run) => (
                        <div key={run.id} style={{ border: "1px solid #ddd", padding: "16px", marginBottom: "16px", borderRadius: "8px" }}>
                            <h3>{run.skill_id}</h3>

                            <p>
                                <strong>Created:</strong>{" "}
                                {new Date(run.created_at).toLocaleString()}
                            </p>

                            <p>
                                <strong>Prompt:</strong>
                            </p>
                            <p>{run.prompt}</p>

                            <p>
                                <strong>Response:</strong>
                            </p>
                            <p>{run.response}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}