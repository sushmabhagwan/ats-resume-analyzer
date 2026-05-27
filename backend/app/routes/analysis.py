from fastapi import APIRouter, UploadFile, File, Form, Depends
from pydantic import BaseModel

from app.services.ats_service import calculate_ats_score
from app.services.parser_service import extract_text_from_file
from app.services.ai_service import generate_resume_suggestions
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database import get_db

from app.models.resume_analysis_model import ResumeAnalysis

from app.dependencies.auth_dependency import get_current_user


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)


class ATSRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/score")
def analyze_resume(data: ATSRequest):

    result = calculate_ats_score(
        data.resume_text,
        data.job_description
    )

    return result


@router.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):

    resume_text = await extract_text_from_file(file)

    result = calculate_ats_score(
        resume_text,
        job_description
    )

    return {
        "filename": file.filename,
        "analysis": result
    }

@router.post("/ai-suggestions")
async def ai_suggestions(

    file: UploadFile = File(...),

    job_description: str = Form(...),

    current_user: dict = Depends(get_current_user),

    db: Session = Depends(get_db)
):

    resume_text = await extract_text_from_file(file)

    ats_result = calculate_ats_score(
        resume_text,
        job_description
    )

    suggestions = generate_resume_suggestions(
        resume_text,
        job_description,
        ats_result["missing_keywords"]
    )
    analysis_record = ResumeAnalysis(

    user_id=current_user["user_id"],

    filename=file.filename,

    ats_score=ats_result["ats_score"],

    similarity_score=ats_result["similarity_score"],

    skill_match_ratio=ats_result["skill_match_ratio"],

    matched_keywords=", ".join(
        ats_result["matched_keywords"]
    ),

    missing_keywords=", ".join(
        ats_result["missing_keywords"]
    ),

    ai_suggestions=suggestions
)
   

    db.add(analysis_record)

    db.commit()

    return {
        "ats_analysis": ats_result,
        "ai_suggestions": suggestions
    }