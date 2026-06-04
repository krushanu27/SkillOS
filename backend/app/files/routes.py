from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    original_name = file.filename or "uploaded_file"
    file_id = str(uuid4())
    safe_name = original_name.replace(" ", "_")
    saved_name = f"{file_id}_{safe_name}"
    file_path = UPLOAD_DIR / saved_name

    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "file_id": file_id,
        "original_name": original_name,
        "saved_name": saved_name,
        "path": str(file_path),
        "content_type": file.content_type,
        "size_bytes": len(contents),
    }