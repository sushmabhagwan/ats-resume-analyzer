import requests
import os

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/generate"
)


def generate_resume_suggestions(
    resume_text,
    job_description,
    missing_keywords
):

    prompt = f"""
You are an expert ATS resume reviewer.

Analyze the resume against the job description.

Job Description:
{job_description}

Missing Skills:
{", ".join(missing_keywords)}

Give professional ATS improvement suggestions.

Focus on:
- missing skills
- ATS optimization
- backend engineering improvements
- resume wording improvements
- project improvements

Return:
- short bullet points
- professional suggestions
- concise output
"""

    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )

        print("OLLAMA STATUS:", response.status_code)

        response.raise_for_status()

        data = response.json()

        print("OLLAMA RESPONSE:", data)

        return data.get(
            "response",
            "No AI suggestions generated."
        )

    except requests.exceptions.ConnectionError:

        return """
AI Error:
AI Suggestions are currently unavailable in the cloud version.

ATS analysis, scoring, and keyword matching are working correctly.

To use AI suggestions, run the application locally with Ollama installed.
"""

    except requests.exceptions.Timeout:

        return """
AI Error:
Ollama response timed out.

Try:
- smaller model
- shorter resume
- restart Ollama
"""

    except Exception as e:

        print("OLLAMA ERROR:", str(e))

        return f"AI Error: {str(e)}"