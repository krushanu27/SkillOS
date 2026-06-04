from pathlib import Path

from app.skills.history_store import save_skill_run

SKILLS = [
    {
        "id": "resume_copilot",
        "name": "Resume Tailoring Agent",
        "category": "Career",
        "description": "Tailor resumes for AI/ML, data, and software roles.",
    },
    {
        "id": "startup_architect",
        "name": "Startup MVP Architect",
        "category": "Development",
        "description": "Generate practical MVP architecture, tech stack, APIs, and roadmap.",
    },
    {
        "id": "fastapi_debugger",
        "name": "FastAPI + React Debugger",
        "category": "Development",
        "description": "Analyze bugs, logs, frontend/backend issues, and suggest exact fixes.",
    },
    {
        "id": "viva_coach",
        "name": "Project Viva Coach",
        "category": "Academic",
        "description": "Generate viva questions, answers, and technical explanations.",
    },
    {
        "id": "presentation_generator",
        "name": "Presentation Generator",
        "category": "Academic",
        "description": "Create slide structures, speaker notes, and Gamma prompts.",
    },
    {
        "id": "research_assistant",
        "name": "Academic Research Assistant",
        "category": "Academic",
        "description": "Create report structures, literature reviews, and references.",
    },
    {
        "id": "career_strategy",
        "name": "Career Strategy Coach",
        "category": "Career",
        "description": "Generate job roadmaps, skill gaps, and preparation plans.",
    },
    {
        "id": "romantic_website",
        "name": "Romantic Website Creator",
        "category": "Creative",
        "description": "Generate ideas and prompts for emotional surprise websites.",
    },
    {
        "id": "reel_creator",
        "name": "Faceless Singer Reel Creator",
        "category": "Creative",
        "description": "Plan Instagram reels, lyrics placement, captions, and editing flow.",
    },
]


def get_all_skills():
    return {"skills": SKILLS}


def load_prompt(skill_id: str) -> str:
    prompt_path = Path(__file__).parent / "prompts" / f"{skill_id}.txt"

    if not prompt_path.exists():
        return "You are a helpful AI assistant. Answer clearly and practically."

    return prompt_path.read_text(encoding="utf-8")


def run_skill(skill_id: str, user_input: str):
    system_prompt = load_prompt(skill_id)

    response = f"""
Skill Used: {skill_id}

System Prompt:
{system_prompt}

User Input:
{user_input}

AI Response:
This is a placeholder response. OpenAI integration comes next, because apparently apps need brains too.
"""

    clean_response = response.strip()

    save_skill_run(
        skill_id=skill_id,
        prompt=user_input,
        response=clean_response,
    )

    return {
        "skill_id": skill_id,
        "response": clean_response,
    }