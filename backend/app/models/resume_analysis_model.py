from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey
)

from datetime import datetime

from app.database import Base


class ResumeAnalysis(Base):

    __tablename__ = "resume_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    filename = Column(String)

    ats_score = Column(Float)

    similarity_score = Column(Float)

    skill_match_ratio = Column(Float)

    matched_keywords = Column(Text)

    missing_keywords = Column(Text)

    ai_suggestions = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )