from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4
import json


HISTORY_FILE = Path("uploads/skill_run_history.json")


def _ensure_history_file() -> None:
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)

    if not HISTORY_FILE.exists():
        HISTORY_FILE.write_text("[]", encoding="utf-8")


def get_skill_run_history() -> list[dict[str, Any]]:
    _ensure_history_file()

    try:
        data = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))

        if isinstance(data, list):
            return data

        return []

    except json.JSONDecodeError:
        return []


def save_skill_run(
    skill_id: str,
    prompt: str,
    response: str,
) -> dict[str, Any]:
    _ensure_history_file()

    history = get_skill_run_history()

    run = {
        "id": str(uuid4()),
        "skill_id": skill_id,
        "prompt": prompt,
        "response": response,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    history.insert(0, run)

    HISTORY_FILE.write_text(
        json.dumps(history, indent=2),
        encoding="utf-8",
    )

    return run


def delete_history_item(run_id: str) -> bool:
    history = get_skill_run_history()

    updated_history = [
        item
        for item in history
        if item["id"] != run_id
    ]

    if len(updated_history) == len(history):
        return False

    HISTORY_FILE.write_text(
        json.dumps(updated_history, indent=2),
        encoding="utf-8",
    )

    return True


def clear_history() -> None:
    HISTORY_FILE.write_text(
        "[]",
        encoding="utf-8",
    )