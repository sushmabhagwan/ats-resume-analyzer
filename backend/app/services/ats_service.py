from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

STOPWORDS = {
    "the", "a", "an", "for", "with",
    "and", "or", "to", "of", "in",
    "on", "at", "by", "is", "are",
    "looking"
}
SKILLS = {
    "python",
    "fastapi",
    "django",
    "flask",
    "react",
    "angular",
    "docker",
    "kubernetes",
    "aws",
    "postgresql",
    "mysql",
    "mongodb",
    "javascript",
    "typescript",
    "rest",
    "api",
    "apis",
    "terraform",
    "linux",
    "git",
    "nodejs",
    "express",
    "redis"
}
def extract_keywords(text):

    text = text.lower()

    # Normalize common tech terms
    text = text.replace("node.js", "nodejs")
    text = text.replace("react.js", "react")
    text = text.replace("next.js", "nextjs")
    text = text.replace("postgresql", "postgresql")
    text = text.replace("postgre sql", "postgresql")
    text = text.replace("restful", "rest")
    text = text.replace("rest api", "rest")
    text = text.replace("rest apis", "rest")
    text = text.replace("apis", "api")

    words = re.findall(r'\b[a-zA-Z]+\b', text)

    keywords = {
        word for word in words
        if word in SKILLS
    }

    return keywords


def calculate_ats_score(resume_text, job_description):

    documents = [resume_text, job_description]

    vectorizer = TfidfVectorizer()

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:2]
    )[0][0]

    similarity_score = round(similarity * 100, 2)

    resume_keywords = extract_keywords(resume_text)

    jd_keywords = extract_keywords(job_description)

    matched_keywords = sorted(
    list(resume_keywords.intersection(jd_keywords))
)

    missing_keywords = sorted(
    list(jd_keywords.difference(resume_keywords))
)

    # Skill-based scoring
    skill_match_ratio = 0

    if len(jd_keywords) > 0:

        skill_match_ratio = (
            len(matched_keywords) / len(jd_keywords)
        ) * 100

    # Final ATS Score
    ats_score = int(
        (similarity_score * 0.6) +
        (skill_match_ratio * 0.4)
    )

    ats_score = min(ats_score, 100)

    return {
        "ats_score": ats_score,
        "similarity_score": similarity_score,
        "skill_match_ratio": round(skill_match_ratio, 2),
        "matched_keywords": matched_keywords[:20],
        "missing_keywords": missing_keywords[:20]
    }