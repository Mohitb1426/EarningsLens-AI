# Pipeline - Data Processing

Python scripts to parse PDFs and create vector database.

## Setup

```bash
pip install -r requirements.txt
```

## Usage

### 1. Parse PDFs

Place PDF files in `data/raw/` with naming format:
```
COMPANY_QUARTER_YEAR.pdf

Examples:
- TCS_Q4_FY2024.pdf
- INFOSYS_Q1_FY2024.pdf
- WIPRO_Q3_FY2023.pdf
```

Then run:
```bash
python parse_pdfs.py
```

Output: JSON files in `data/parsed/`

### 2. Create Vector Database

Make sure `.env` has `VOYAGE_API_KEY`:
```env
VOYAGE_API_KEY=your_key_here
```

Then run:
```bash
python index_lancedb.py
```

This will:
- Generate embeddings for each chunk (Voyage AI)
- Create LanceDB at `data/lance-db/`
- Test with sample queries

**Note:** Takes ~20 seconds per chunk (Voyage AI rate limit: 3 RPM)

## Directory Structure

```
pipeline/
├── data/
│   ├── raw/          # Input PDFs
│   ├── parsed/       # Extracted JSON
│   └── lance-db/     # Vector database
├── parse_pdfs.py     # PDF to JSON
├── index_lancedb.py  # JSON to LanceDB
├── .env              # API keys
└── requirements.txt
```

## Configuration

Settings are in `../config.json`:
- `chunkSize`: Text chunk size (default: 500)
- `chunkOverlap`: Overlap between chunks (default: 100)
- `enrichChunks`: Add metadata to chunks (default: true)

## Troubleshooting

**Error: No PDF files found**
- Add PDFs to `data/raw/` folder

**Error: VOYAGE_API_KEY not found**
- Create `.env` file with your Voyage AI key

**Error: Rate limit exceeded**
- Wait 20 seconds between chunks (automatic)
- Or add payment method to Voyage AI account

## Re-indexing

To re-index (if data changes):
```bash
python parse_pdfs.py   # Re-parse PDFs
python index_lancedb.py  # Re-create database
```

Then restart backend.
