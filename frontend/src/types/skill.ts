export interface Skill {
    id: string;
    name: string;
    category: string;
    description: string;
}

export type SkillRunHistory = {
    id: string;
    skill_id: string;
    prompt: string;
    response: string;
    created_at: string;
};