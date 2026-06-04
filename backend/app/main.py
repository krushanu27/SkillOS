from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.skills.routes import router as skills_router

app = FastAPI(title="SkillOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(skills_router, prefix="/skills", tags=["Skills"])


@app.get("/")
def root():
    return {"message": "KrushAI API is running"}