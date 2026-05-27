from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.routes import auth, resume, analysis
from app.database import engine
from app.models.user_model import User
from app.database import Base
from app.models.resume_analysis_model import ResumeAnalysis
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ATS Resume Analyzer API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"message": "ATS Resume Analyzer API Running"}