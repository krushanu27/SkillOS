from fastapi import APIRouter
from pydantic import BaseModel

from app.skills.service import get_all_skills, run_skill

router = APIRouter()


class SkillRunRequest(BaseModel):
    skill_id: str
    user_input: str


@router.get("/")
def list_skills():
    return get_all_skills()


@router.post("/run")
def execute_skill(payload: SkillRunRequest):
    return run_skill(payload.skill_id, payload.user_input)
