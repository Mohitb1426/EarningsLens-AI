# Python Backend for EarningsLens AI

FastAPI-based backend with Claude 4.5, LangChain, and LanceDB.

## Setup

### 1. Create Virtual Environment

```bash
cd backend-python
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Edit `.env` file with your credentials (already set up).

### 4. Run Server

```bash
python main.py
```

Server will start on: **http://localhost:8000**

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/chat` - Chat with AI (SSE streaming)
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/{id}` - Get specific conversation

## Frontend Configuration

Update frontend to use port 8000:

In `frontend/src/services/api.js`:
```javascript
const API_URL = 'http://localhost:8000/api';
```

## Testing

```bash
curl http://localhost:8000/
```

Should return:
```json
{
  "message": "EarningsLens AI API",
  "version": "1.0.0",
  "status": "running"
}
```
