from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.ollama_client import ask_ollama


router = APIRouter(prefix="/ai", tags=["AI"])


class AiTestRequest(BaseModel):
    prompt: str


@router.post("/test")
async def test_ai(request: AiTestRequest):
    response = await ask_ollama(request.prompt)

    return {
        "prompt": request.prompt,
        "response": response,
    }