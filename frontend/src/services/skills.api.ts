import axios from "axios";

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