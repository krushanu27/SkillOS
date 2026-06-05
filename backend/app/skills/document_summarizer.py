from pathlib import Path

from app.ai.ollama_client import ask_ollama


def read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


async def run_document_summarizer(file_path: str) -> dict:
    path = Path(file_path)

    if not path.exists():
        return {
            "success": False,
            "error": f"File not found: {file_path}",
        }

    if path.suffix.lower() != ".txt":
        return {
            "success": False,
            "error": "Only .txt files are supported right now. PDF support comes next.",
        }

    text = read_text_file(path)

    if not text.strip():
        return {
            "success": False,
            "error": "File is empty or text could not be read.",
        }

    prompt = f"""
You are an AI document summarizer.

Summarize the following document clearly and practically.

Return the answer in this format:

Short Summary:
...

Key Points:
- ...
- ...
- ...

Action Items:
- ...
- ...

Document:
{text[:8000]}
"""

    summary = await ask_ollama(prompt)

    return {
        "success": True,
        "skill": "document_summarizer",
        "file_name": path.name,
        "summary": summary,
    }