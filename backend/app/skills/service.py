import os
from pathlib import Path

import httpx

from app.skills.history_store import save_skill_run

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

MAX_USER_INPUT_CHARS = 12000

LEGAL_SKILL_IDS = {
    "judiciary_exam_coach",
    "judgment_analysis_assistant",
    "legal_reasoning_coach",
    "case_brief_generator",
    "bare_act_explainer",
    "legal_drafting_assistant",
    "current_legal_affairs_assistant",
    "argument_builder",
    "precedent_finder",
    "judicial_writing_coach",
}

SKILLS = [
    {
        "id": "resume_copilot",
        "name": "Resume Tailoring Agent",
        "category": "Career",
        "description": "Tailor resumes for AI/ML, data, software, and fresher-friendly job applications.",
    },
    {
        "id": "startup_architect",
        "name": "Startup MVP Architect",
        "category": "Development",
        "description": "Create practical MVP plans with architecture, features, APIs, tech stack, and roadmap.",
    },
    {
        "id": "fastapi_debugger",
        "name": "FastAPI + React Debugger",
        "category": "Development",
        "description": "Analyze FastAPI, React, TypeScript, API, routing, and integration issues with exact fixes.",
    },
    {
        "id": "viva_coach",
        "name": "Project Viva Coach",
        "category": "Academic",
        "description": "Generate viva questions, model answers, and technical explanations for academic projects.",
    },
    {
        "id": "presentation_generator",
        "name": "Presentation Generator",
        "category": "Academic",
        "description": "Create presentation outlines, slide structures, speaker notes, and AI slide-generation prompts.",
    },
    {
        "id": "research_assistant",
        "name": "Academic Research Assistant",
        "category": "Academic",
        "description": "Build report structures, literature review outlines, summaries, references, and research notes.",
    },
    {
        "id": "career_strategy",
        "name": "Career Strategy Coach",
        "category": "Career",
        "description": "Create job roadmaps, skill-gap analysis, preparation plans, and application strategies.",
    },
    {
        "id": "romantic_website",
        "name": "Romantic Website Creator",
        "category": "Creative",
        "description": "Generate emotional website ideas, section plans, messages, animations, and surprise concepts.",
    },
    {
        "id": "reel_creator",
        "name": "Faceless Singer Reel Creator",
        "category": "Creative",
        "description": "Plan faceless singing reels with visuals, lyrics placement, captions, editing flow, and posting ideas.",
    },
    {
        "id": "document_summarizer",
        "name": "Document Summarizer",
        "category": "AI",
        "description": "Summarize uploaded TXT, PDF, and DOCX files using the local AI document workflow.",
        "input_type": "file",
    },
    {
        "id": "ai_agent_workspace",
        "name": "AI Agent Workspace",
        "category": "AI",
        "description": "Plan, reason, and execute multi-step AI tasks using SkillOS agent behavior.",
    },
    {
        "id": "judiciary_exam_coach",
        "name": "Judiciary Exam Coach",
        "category": "Legal",
        "description": "Prepare for judiciary exams with revision notes, mock questions, answer writing, and issue spotting.",
    },
    {
        "id": "judgment_analysis_assistant",
        "name": "Judgment Analysis Assistant",
        "category": "Legal",
        "description": "Analyze judgments through facts, issues, arguments, reasoning, ratio, holding, and exam relevance.",
    },
    {
        "id": "legal_reasoning_coach",
        "name": "Legal Reasoning Coach",
        "category": "Legal",
        "description": "Develop legal reasoning, issue spotting, fact analysis, and judge-like structured conclusions.",
    },
    {
        "id": "case_brief_generator",
        "name": "Case Brief Generator",
        "category": "Legal",
        "description": "Convert judgments, cases, or legal notes into structured case briefs for study and revision.",
    },
    {
        "id": "bare_act_explainer",
        "name": "Bare Act Explainer",
        "category": "Legal",
        "description": "Explain legal provisions in plain language with ingredients, examples, exceptions, and exam angles.",
    },
    {
        "id": "legal_drafting_assistant",
        "name": "Legal Drafting Assistant",
        "category": "Legal",
        "description": "Assist with legal notices, applications, affidavits, written submissions, and draft improvement.",
    },
    {
        "id": "current_legal_affairs_assistant",
        "name": "Current Legal Affairs Assistant",
        "category": "Legal",
        "description": "Summarize provided legal updates, amendments, judgments, or notes into exam-ready points.",
    },
    {
        "id": "argument_builder",
        "name": "Argument Builder",
        "category": "Legal",
        "description": "Build petitioner and respondent arguments, counterarguments, issue framing, and oral submissions.",
    },
    {
        "id": "precedent_finder",
        "name": "Precedent Finder",
        "category": "Legal",
        "description": "Suggest possible legal principles and precedent areas from provided facts, with verification reminders.",
    },
    {
        "id": "judicial_writing_coach",
        "name": "Judicial Writing Coach",
        "category": "Legal",
        "description": "Practice judgment writing with issues, findings, reasoning, operative orders, and judicial style.",
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


def trim_user_input(user_input: str) -> str:
    if len(user_input) <= MAX_USER_INPUT_CHARS:
        return user_input

    head_size = MAX_USER_INPUT_CHARS // 2
    tail_size = MAX_USER_INPUT_CHARS // 2

    head = user_input[:head_size]
    tail = user_input[-tail_size:]

    return f"""
{head}

[CONTENT TRIMMED BY SKILLOS]
The uploaded document was too long to send fully to the AI model in one request.
The beginning and ending sections are included for analysis.

{tail}
""".strip()


def build_final_prompt(system_prompt: str, user_input: str) -> str:
    safe_user_input = trim_user_input(user_input)

    return f"""
System Instructions:
{system_prompt}

User Request:
{safe_user_input}

Answer clearly, practically, and in a structured way.
Do not reply with only "Okay".
If the input contains extracted document content, summarize and analyze it using the available text.
""".strip()


async def call_ollama(system_prompt: str, user_input: str) -> str:
    final_prompt = build_final_prompt(system_prompt, user_input)

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": final_prompt,
        "stream": False,
    }

    async def call_gemini(system_prompt: str, user_input: str) -> str:
        if not GEMINI_API_KEY:
            return (
            "Gemini integration failed.\n\n"
            "Error:\n"
            "GEMINI_API_KEY is missing.\n\n"
            "Fix:\n"
            "Add GEMINI_API_KEY to your backend .env file and restart the server."
        )

    final_prompt = build_final_prompt(system_prompt, user_input)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": final_prompt,
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "maxOutputTokens": 4096,
        },
    }

    request_headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
            f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent",
            headers=request_headers,
            json=payload,
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

    data = response.json()

    try:
        parts = data["candidates"][0]["content"]["parts"]
        result = "".join(part.get("text", "") for part in parts).strip()
    except (KeyError, IndexError, TypeError):
        result = ""

    if not result:
        return (
            "Gemini returned an empty response. "
            "Check the model name, API key, quota, and response payload."
        )

    return result
        

    data = response.json()
    result = data.get("response", "").strip()

    if not result or result.lower() == "okay":
        return (
            "The AI returned an incomplete response. "
            "This usually happens when the uploaded document is too long for the current model context. "
            "Try a shorter document or use the Document Summarizer skill after chunking support is added."
        )

    return result


async def call_gemini(system_prompt: str, user_input: str) -> str:
    if not GEMINI_API_KEY:
        return (
            "Gemini integration failed.\n\n"
            "Error:\n"
            "GEMINI_API_KEY is missing.\n\n"
            "Fix:\n"
            "Add GEMINI_API_KEY to your backend .env file and restart the server."
        )

    final_prompt = build_final_prompt(system_prompt, user_input)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": final_prompt,
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "maxOutputTokens": 4096,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
            f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()

    data = response.json()

    try:
        parts = data["candidates"][0]["content"]["parts"]
        result = "".join(part.get("text", "") for part in parts).strip()
    except (KeyError, IndexError, TypeError):
        result = ""

    if not result:
        return (
            "Gemini returned an empty response. "
            "Check the model name, API key, quota, and response payload."
        )

    return result


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
        if skill_id in LEGAL_SKILL_IDS:
            try:
                response_text = await call_gemini(
                    system_prompt=system_prompt,
                    user_input=user_input,
                )
            except Exception as gemini_error:
                print("Gemini failed. Falling back to Ollama:", str(gemini_error))
                response_text = await call_ollama(
                    system_prompt=system_prompt,
                    user_input=user_input,
                )
        else:
            response_text = await call_ollama(
                system_prompt=system_prompt,
                user_input=user_input,
            )
    except Exception as error:
        provider = "Gemini" if skill_id in LEGAL_SKILL_IDS else "Ollama"

        response_text = f"""
{provider} integration failed.

Error:
{str(error)}

Check:
1. Backend environment variables are configured
2. API key is valid if using Gemini
3. Ollama is running if using Ollama
4. Model is available
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