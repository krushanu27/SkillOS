from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.skills.service import get_all_skills, run_skill
from app.skills.history_store import (
    get_skill_run_history,
    delete_history_item,
    clear_history,
)

router = APIRouter()


class SkillRunRequest(BaseModel):
    skill_id: str
    user_input: str


@router.get("/")
def list_skills():
    return get_all_skills()


@router.get("/history")
def get_history():
    return get_skill_run_history()


@router.delete("/history/{run_id}")
def delete_history_entry(run_id: str):
    deleted = delete_history_item(run_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="History entry not found",
        )

    return {
        "message": "History entry deleted"
    }


@router.delete("/history")
def delete_all_history():
    clear_history()

    return {
        "message": "History cleared"
    }


@router.post("/run")
async def execute_skill(payload: SkillRunRequest):
    return await run_skill(
        payload.skill_id,
        payload.user_input,
    )