import { useState } from "react";
import { useParams } from "react-router-dom";

import { runSkill } from "../services/skills.api";

export default function SkillPage() {
    const { id } = useParams();

    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");

    const handleRun = async () => {
        const result = await runSkill(
            id || "",
            input
        );

        setResponse(result.response);
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>{id}</h1>

            <textarea
                rows={10}
                style={{ width: "100%" }}
                value={input}
                onChange={(e) =>
                    setInput(e.target.value)
                }
            />

            <br />
            <br />

            <button onClick={handleRun}>
                Run Skill
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