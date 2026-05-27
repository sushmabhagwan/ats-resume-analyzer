from PyPDF2 import PdfReader
from docx import Document
import os
import tempfile


async def extract_text_from_file(file):

    filename = file.filename.lower()

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:

        content = await file.read()

        temp_file.write(content)

        temp_path = temp_file.name

    extracted_text = ""

    if filename.endswith(".pdf"):

        reader = PdfReader(temp_path)

        for page in reader.pages:
            extracted_text += page.extract_text() + "\n"

    elif filename.endswith(".docx"):

        doc = Document(temp_path)

        for para in doc.paragraphs:
            extracted_text += para.text + "\n"

    else:
        extracted_text = "Unsupported file type"

    os.remove(temp_path)

    return extracted_text