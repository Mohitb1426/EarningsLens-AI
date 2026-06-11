"""
PDF Parser - Extract text from earnings PDFs
"""
import os
import json
from pathlib import Path
from PyPDF2 import PdfReader

def parse_pdf(pdf_path):
    """Parse a single PDF file"""
    reader = PdfReader(pdf_path)

    pages = []
    for page_num, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        if text.strip():
            pages.append({
                "pageNumber": page_num,
                "text": text.strip()
            })

    return pages

def parse_all_pdfs():
    """Parse all PDFs in raw directory"""
    raw_dir = Path("data/raw")
    parsed_dir = Path("data/parsed")
    parsed_dir.mkdir(parents=True, exist_ok=True)

    if not raw_dir.exists():
        print("Error: data/raw directory not found")
        print("Please add PDF files to data/raw/")
        return

    pdf_files = list(raw_dir.glob("*.pdf"))

    if not pdf_files:
        print("No PDF files found in data/raw/")
        return

    print(f"\nFound {len(pdf_files)} PDF files")
    print("="*50)

    for pdf_path in pdf_files:
        print(f"\nParsing: {pdf_path.name}")

        try:
            pages = parse_pdf(pdf_path)

            # Extract metadata from filename
            # Expected format: COMPANY_Q#_FY####.pdf
            # Example: TCS_Q4_FY2024.pdf
            filename = pdf_path.stem
            parts = filename.split('_')

            if len(parts) >= 3:
                company = parts[0]
                quarter = parts[1]
                year = parts[2]
            else:
                company = filename
                quarter = "Q1"
                year = "FY2024"

            # Create output JSON
            output_data = {
                "filename": pdf_path.name,
                "company": company,
                "quarter": quarter,
                "year": year,
                "pages": pages
            }

            # Save to parsed directory
            output_path = parsed_dir / f"{filename}.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)

            print(f"  Pages extracted: {len(pages)}")
            print(f"  Saved to: {output_path}")

        except Exception as e:
            print(f"  Error: {str(e)}")

    print("\n" + "="*50)
    print("Parsing complete!")

if __name__ == "__main__":
    print("\nPDF Parser for EarningsLens AI")
    print("="*50)
    parse_all_pdfs()
