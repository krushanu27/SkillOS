from fastapi import APIRouter
from pydantic import BaseModel

from app.skills.service import get_all_skills, run_skill
from app.skills.history_store import get_skill_run_history

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


@router.post("/run")
async def execute_skill(payload: SkillRunRequest):
    return await run_skill(payload.skill_id, payload.user_input)