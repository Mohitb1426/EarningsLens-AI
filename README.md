# EarningsLens AI

Professional AI assistant for analyzing IT company earnings reports.

## Tech Stack

**Backend**: Python + FastAPI + Claude 4.5 Sonnet + LanceDB  
**Frontend**: React + Vite + Tailwind CSS  
**Pipeline**: Python scripts for PDF parsing and indexing

## Features

- Chat with AI about earnings data (TCS, Infosys, Wipro)
- Real-time streaming responses
- Source citations from actual reports  
- Professional Claude-style UI
- Conversation history with sidebar
- Vector similarity search with LanceDB

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure .env
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
# VOYAGE_API_KEY

python main.py
```

Backend runs on: **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5174**

### 3. Access Application

Open: **http://localhost:5174**

## Project Structure

```
earningslens-ai/
├── backend/              # Python FastAPI
│   ├── main.py          # API server
│   ├── rag_service.py   # RAG pipeline
│   ├── .env             # Environment variables
│   └── requirements.txt
│
├── frontend/            # React UI
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.jsx      # Main chat interface
│   │   │   └── Login.jsx     # Authentication
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── pipeline/            # Data processing (Python)
│   ├── data/
│   │   ├── raw/         # Input PDFs
│   │   ├── parsed/      # Extracted JSON
│   │   └── lance-db/    # Vector database
│   ├── parse_pdfs.py    # PDF to JSON
│   ├── index_lancedb.py # Create vector DB
│   └── requirements.txt
│
├── config.json          # Configuration
└── README.md
```

## Data Pipeline (Optional - Already Indexed)

If you need to re-index or add new PDFs:

```bash
cd pipeline
pip install -r requirements.txt

# 1. Add PDFs to data/raw/
#    Format: COMPANY_QUARTER_YEAR.pdf
#    Example: TCS_Q4_FY2024.pdf

# 2. Parse PDFs
python parse_pdfs.py

# 3. Create vector database
python index_lancedb.py
```

## Configuration

Edit `config.json` to adjust:

- **chunkSize**: Text chunk size (default: 500)
- **chunkOverlap**: Chunk overlap (default: 100)
- **defaultTopK**: Chunks retrieved per query (default: 10)
- **maxTokens**: Max response length (default: 2048)
- **temperature**: AI creativity 0-1 (default: 0)

## Environment Variables

### Backend `.env`

```env
# AWS Bedrock (for Claude)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_SESSION_TOKEN=your_token
ANTHROPIC_MODEL=us.anthropic.claude-sonnet-4-5-20250929-v1:0

# Voyage AI (for embeddings)
VOYAGE_API_KEY=your_voyage_key

# Server
PORT=8000

# Database
LANCE_DB_PATH=../pipeline/data/lance-db
```

### Pipeline `.env`

```env
VOYAGE_API_KEY=your_voyage_key
```

## Data Coverage

**Companies**: TCS, Infosys, Wipro  
**Period**: Q1 FY2023 to Q4 FY2024  
**Documents**: 12 quarterly earnings reports  
**Indexed Chunks**: 48 text segments

## API Endpoints

- `GET /` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/chat` - Chat with AI (SSE streaming)
- `GET /api/conversations` - Get chat history
- `GET /api/conversations/{id}` - Get specific chat

## Development

**Backend hot reload**:
```bash
cd backend
python main.py  # Auto-reloads on code changes
```

**Frontend hot reload**:
```bash
cd frontend
npm run dev  # Auto-reloads on code changes
```

## Production Build

**Frontend**:
```bash
cd frontend
npm run build  # Creates dist/ folder
```

Deploy `dist/` folder to any static hosting (Vercel, Netlify, S3).

**Backend**:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Troubleshooting

**Port already in use**:
```bash
# Kill process on port 8000
taskkill /F /PID <process_id>
```

**Backend not connecting**:
- Check AWS credentials in `.env`
- Verify LanceDB path exists
- Check Voyage AI key is valid

**Wrong answers**:
- Re-index the database: `python pipeline/index_lancedb.py`
- Check embeddings are from same Voyage AI account

**Frontend errors**:
- Clear browser cache
- Check API URL in `frontend/src/services/api.js` (should be port 8000)

## Performance

- **Vector Search**: <50ms
- **Embedding Generation**: ~100ms
- **Claude Response**: 1-2s
- **Total Query Time**: ~2-3s

## License

MIT

## Support

Questions? Check:
1. This README
2. `backend/README.md`
3. `pipeline/README.md`

---

**Built with Python, FastAPI, Claude 4.5 Sonnet, LangChain & LanceDB**
# EarningsLens-AI
