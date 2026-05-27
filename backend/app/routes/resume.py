from fastapi import APIRouter, UploadFile, File
from app.services.parser_service import extract_text_from_file

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.get("/")
def resume_test():
    return {"message": "Resume Route Working"}


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    extracted_text = await extract_text_from_file(file)

    return {
        "filename": file.filename,
        "text": extracted_text
    }