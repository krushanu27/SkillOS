from pathlib import Path


def parse_txt_file(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8", errors="ignore")


def parse_pdf_file(file_path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(file_path))
    text_parts: list[str] = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    return "\n\n".join(text_parts)


def parse_docx_file(file_path: Path) -> str:
    from docx import Document

    document = Document(str(file_path))
    paragraphs = [paragraph.text for paragraph in document.paragraphs]

    return "\n".join(paragraphs)


def extract_text_from_file(file_path: str, original_name: str) -> str:
    path = Path(file_path)
    extension = Path(original_name).suffix.lower()

    if extension == ".txt":
        return parse_txt_file(path)

    if extension == ".pdf":
        return parse_pdf_file(path)

    if extension == ".docx":
        return parse_docx_file(path)

    return ""