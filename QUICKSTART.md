# ⚡ Quick Start Guide

Get EarningsLens AI running in 5 minutes!

## 🚀 Steps

### 1. Install Dependencies (2 min)
```bash
cd earningslens-ai

# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install
```

### 2. Get API Keys (2 min)

**Claude API (Required)**
- Go to: https://console.anthropic.com/
- Create account → Get API Key
- Copy key (starts with `sk-ant-`)

**Voyage AI (Required)**
- Go to: https://www.voyageai.com/
- Sign up → Get API Key
- Copy key (starts with `pa-`)

### 3. Configure (30 sec)

Edit `backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
VOYAGE_API_KEY=pa-YOUR-KEY-HERE
```

### 4. Index Data (30 sec)
```bash
cd pipeline
node generateTestPDFs.js  # Generate sample PDFs
node indexWithLanceDB.js   # Index into LanceDB
```

### 5. Start App (10 sec)

**Terminal 1:**
```bash
cd backend && npm start
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

### 6. Use It! (Now!)

Open http://localhost:5173
- Register an account
- Ask: "What was TCS revenue in Q4 FY2024?"
- Get instant AI-powered answer with citations!

---

## 🎯 That's It!

You now have a working RAG system powered by:
- ✅ Claude AI (via LangChain)
- ✅ LanceDB (vector database)
- ✅ Voyage AI (embeddings)

## 📖 Learn More

- Full guide: [README.md](./README.md)
- Cleanup details: [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)

## 🐛 Troubleshooting

**"Vector store not found"**
```bash
cd pipeline && node indexWithLanceDB.js
```

**"API key error"**
- Check `backend/.env` has your real API keys

**"Port in use"**
- Change `PORT=3002` in `backend/.env`

---

**Need help?** Check [README.md](./README.md) for detailed instructions.
