from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends
)

from pydantic import BaseModel

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.services.ats_service import calculate_ats_score
from app.services.parser_service import extract_text_from_file
from app.services.ai_service import generate_resume_suggestions

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


# ATS Score API
@router.post("/score")
def analyze_resume(data: ATSRequest):

    result = calculate_ats_score(
        data.resume_text,
        data.job_description
    )

    return result


# Full Analysis API
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


# AI Suggestions API
@router.post("/ai-suggestions")
async def ai_suggestions(

    file: UploadFile = File(...),

    job_description: str = Form(...),

    current_user: dict = Depends(get_current_user),

    db: Session = Depends(get_db)
):

    # Extract resume text
    resume_text = await extract_text_from_file(file)

    # Calculate ATS score
    ats_result = calculate_ats_score(
        resume_text,
        job_description
    )

    # Generate AI suggestions
    suggestions = generate_resume_suggestions(
        resume_text,
        job_description,
        ats_result["missing_keywords"]
    )

    # Save analysis to database
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

    # Add to database
    db.add(analysis_record)

    db.commit()

    db.refresh(analysis_record)

    return {

        "ats_analysis": ats_result,

        "ai_suggestions": suggestions
    }


# Analysis History API
@router.get("/history")
def get_analysis_history(

    current_user: dict = Depends(get_current_user),

    db: Session = Depends(get_db)
):

    analyses = db.query(
        ResumeAnalysis
    ).filter(

        ResumeAnalysis.user_id == current_user["user_id"]

    ).order_by(

        desc(ResumeAnalysis.created_at)

    ).all()

    history = []

    for analysis in analyses:

        history.append({

            "id": analysis.id,

            "filename": analysis.filename,

            "ats_score": analysis.ats_score,

            "similarity_score": analysis.similarity_score,

            "skill_match_ratio": analysis.skill_match_ratio,

            "matched_keywords": analysis.matched_keywords,

            "missing_keywords": analysis.missing_keywords,

            "ai_suggestions": analysis.ai_suggestions,

            "created_at": analysis.created_at
        })

    return {
        "history": history
    }