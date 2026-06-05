import os
from pathlib import Path

import httpx

from app.skills.history_store import save_skill_run

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

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
    {
        "id": "document_summarizer",
        "name": "Document Summarizer",
        "category": "AI",
        "description": "Summarizes uploaded text documents using local Ollama AI.",
        "input_type": "file",
    },
]


def get_all_skills():
    return {"skills": SKILLS}


def load_prompt(skill_id: str) -> str:
    prompt_path = Path(__file__).parent / "prompts" / f"{skill_id}.txt"

    if not prompt_path.exists():
        return "You are a helpful AI assistant. Answer clearly and practically."

    return prompt_path.read_text(encoding="utf-8")


def extract_saved_path(user_input: str) -> str | None:
    marker = "Saved Path:"

    if marker not in user_input:
        return None

    after_marker = user_input.split(marker, 1)[1].strip()
    return after_marker.splitlines()[0].strip()


async def call_ollama(system_prompt: str, user_input: str) -> str:
    final_prompt = f"""
System Instructions:
{system_prompt}

User Request:
{user_input}

Answer clearly, practically, and in a structured way.
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": final_prompt,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    return data.get("response", "").strip()


async def run_skill(skill_id: str, user_input: str):
    if skill_id == "document_summarizer":
        from app.skills.document_summarizer import run_document_summarizer

        file_path = extract_saved_path(user_input)

        if not file_path:
            response_text = "Error: No uploaded file path found. Use format: Saved Path: uploads/filename.txt"
        else:
            result = await run_document_summarizer(file_path)

            if result.get("success"):
                response_text = result["summary"]
            else:
                response_text = f"Error summarizing document: {result.get('error')}"

        save_skill_run(
            skill_id=skill_id,
            prompt=user_input,
            response=response_text,
        )

        return {
            "skill_id": skill_id,
            "response": response_text,
        }

    system_prompt = load_prompt(skill_id)

    try:
        response_text = await call_ollama(
            system_prompt=system_prompt,
            user_input=user_input,
        )
    except Exception as error:
        response_text = f"""
Ollama integration failed.

Error:
{str(error)}

Check:
1. Ollama is running
2. Model is installed: {OLLAMA_MODEL}
3. Ollama URL is reachable: {OLLAMA_BASE_URL}
""".strip()

    save_skill_run(
        skill_id=skill_id,
        prompt=user_input,
        response=response_text,
    )

    return {
        "skill_id": skill_id,
        "response": response_text,
    }