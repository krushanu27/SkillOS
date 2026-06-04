import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getSkills } from "../services/skills.api";

export default function DashboardPage() {
    const [skills, setSkills] = useState<any[]>([]);

    useEffect(() => {
        getSkills().then((data) => {
            setSkills(data.skills);
        });
    }, []);

    return (
        <div style={{ padding: 24 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <h1 style={{ margin: 0 }}>SkillOS</h1>

                <Link
                    to="/history"
                    style={{
                        border: "1px solid #444",
                        padding: "10px 14px",
                        borderRadius: 8,
                        textDecoration: "none",
                    }}
                >
                    View Run History
                </Link>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill,minmax(300px,1fr))",
                    gap: 16,
                }}
            >
                {skills.map((skill) => (
                    <Link
                        key={skill.id}
                        to={`/skill/${skill.id}`}
                        style={{
                            border: "1px solid #444",
                            padding: 16,
                            borderRadius: 12,
                            textDecoration: "none",
                        }}
                    >
                        <h3>{skill.name}</h3>
                        <p>{skill.category}</p>
                        <p>{skill.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}