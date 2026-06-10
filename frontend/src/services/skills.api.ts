import axios from "axios";
import type { SkillRunHistory } from "../types/skill";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

export const getSkills = async () => {
    const response = await api.get("/skills/");
    return response.data;
};

export const runSkill = async (
    skill_id: string,
    user_input: string
) => {
    const response = await api.post("/skills/run", {
        skill_id,
        user_input,
    });

    return response.data;
};

export async function getSkillRunHistory(): Promise<SkillRunHistory[]> {
    const response = await api.get("/skills/history");
    return response.data;
}

export async function deleteHistoryItem(
    runId: string
): Promise<void> {
    await api.delete(`/skills/history/${runId}`);
}

export async function clearHistory(): Promise<void> {
    await api.delete("/skills/history");
}