# ⚙️ Configuration Guide

Your EarningsLens AI is now **fully config-driven**! All settings are in `config.json`.

## 📄 Config File: `config.json`

```json
{
  "indexing": {
    "chunkSize": 500,              // Size of text chunks
    "chunkOverlap": 100,            // Overlap between chunks
    "topK": 10,                     // How many chunks to retrieve
    "testQueries": [                // Queries to test after indexing
      "What was TCS revenue in Q4 FY2024?",
      "What was Infosys profit in Q1 FY2024?"
    ]
  },
  "retrieval": {
    "defaultTopK": 10,              // Default chunks retrieved per query
    "minSimilarityScore": 0.3,      // Minimum similarity threshold
    "rerank": false                 // Enable re-ranking (future)
  },
  "models": {
    "embedding": {
      "provider": "voyage",         // Embedding provider
      "model": "voyage-2",           // Embedding model
      "dimensions": 1024             // Vector dimensions
    },
    "llm": {
      "provider": "bedrock",        // LLM provider (bedrock/direct)
      "model": "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      "maxTokens": 2048,             // Max response length
      "temperature": 0               // 0 = factual, 1 = creative
    }
  },
  "metadata": {
    "enrichChunks": true,           // Add metadata to chunks
    "metadataTemplate": "Company: {company}, Quarter: {quarter}, Year: {year}"
  }
}
```

---

## 🎯 What Each Setting Does

### Indexing Settings

**`chunkSize`** (default: 500)
- Size of each text chunk in characters
- Larger = more context per chunk, fewer chunks
- Smaller = more granular, more chunks
- **When to change:** If responses are too vague (increase) or too narrow (decrease)

**`chunkOverlap`** (default: 100)
- Characters overlapping between consecutive chunks
- Prevents information loss at chunk boundaries
- **When to change:** If related info seems split across responses

**`topK`** (default: 10)
- How many similar chunks to retrieve during search
- More = more context but slower, noisier
- Less = faster but might miss relevant info
- **When to change:** Not working well (increase to 15-20)

**`testQueries`** (array)
- Queries used to validate indexing works
- Run automatically after indexing completes
- **When to change:** Add queries relevant to your data

---

### Retrieval Settings

**`defaultTopK`** (default: 10)
- Default number of chunks retrieved per user query
- Same as indexing.topK but for runtime
- **When to change:** Tune based on response quality

**`minSimilarityScore`** (default: 0.3)
- Minimum similarity score (0-1) for a chunk to be relevant
- Lower = more permissive, higher = stricter
- **When to change:** Getting irrelevant results (increase)

**`rerank`** (default: false)
- Re-rank chunks after retrieval for better relevance
- Currently not implemented (future feature)

---

### Model Settings

#### Embedding Model

**`provider`**: `"voyage"` or `"bedrock"`
- Which service provides embeddings
- Voyage AI = dedicated embedding service (recommended)
- Bedrock = AWS Titan embeddings

**`model`**: `"voyage-2"`
- Which embedding model to use
- voyage-2 = 1024 dimensions, good quality
- **When to change:** Use voyage-3 for better quality (if available)

**`dimensions`**: `1024`
- Size of embedding vectors
- Must match the model's output
- **Don't change** unless using a different model

#### LLM Model

**`provider`**: `"bedrock"` or `"direct"`
- bedrock = AWS Bedrock Claude access
- direct = Direct Anthropic API

**`model`**: Model ID
- Current: `us.anthropic.claude-sonnet-4-5-20250929-v1:0`
- **When to change:**
  - Use Haiku for faster/cheaper: `us.anthropic.claude-haiku-...`
  - Use Opus for best quality: `us.anthropic.claude-opus-...`

**`maxTokens`**: `2048`
- Maximum length of AI responses
- 1024 = short answers
- 2048 = medium answers (default)
- 4096 = long, detailed answers
- **When to change:** Responses too short/long

**`temperature`**: `0`
- Controls randomness (0-1)
- 0 = Factual, deterministic (recommended for earnings)
- 0.5 = Balanced
- 1 = Creative, varied
- **When to change:** Need more varied phrasings (increase to 0.3)

---

### Metadata Settings

**`enrichChunks`**: `true`
- Whether to add company/quarter/year to each chunk before embedding
- **Why:** Dramatically improves matching accuracy
- **When to change:** Never turn this off!

**`metadataTemplate`**: Template string
- Format: `"Company: {company}, Quarter: {quarter}, Year: {year}"`
- Placeholders: `{company}`, `{quarter}`, `{year}`
- **When to change:** Customize the format if needed

---

## 🔧 How to Modify Config

### Example 1: Longer Responses

```json
{
  "models": {
    "llm": {
      "maxTokens": 4096  // Changed from 2048
    }
  }
}
```

### Example 2: More Context

```json
{
  "retrieval": {
    "defaultTopK": 15  // Changed from 10
  }
}
```

### Example 3: Switch to Haiku (Faster)

```json
{
  "models": {
    "llm": {
      "model": "us.anthropic.claude-haiku-20240307",
      "maxTokens": 1024  // Haiku is optimized for shorter
    }
  }
}
```

### Example 4: Smaller Chunks

```json
{
  "indexing": {
    "chunkSize": 300,    // Smaller chunks
    "chunkOverlap": 50   // Less overlap
  }
}
```

---

## 🔄 When to Re-index

You must re-run indexing after changing:
- ✅ `chunkSize`
- ✅ `chunkOverlap`
- ✅ `enrichChunks`
- ✅ `metadataTemplate`

You DON'T need to re-index after changing:
- ❌ `defaultTopK`
- ❌ `maxTokens`
- ❌ `temperature`
- ❌ `model`

### How to Re-index:

```bash
cd pipeline
node indexWithLanceDB.js
```

Then restart backend:
```bash
cd backend
npm start
```

---

## 📊 Performance Tuning

### Problem: Responses are irrelevant

**Solution:**
```json
{
  "retrieval": {
    "defaultTopK": 15,           // Get more chunks
    "minSimilarityScore": 0.4    // Stricter threshold
  }
}
```

### Problem: Responses are too short

**Solution:**
```json
{
  "models": {
    "llm": {
      "maxTokens": 4096  // Allow longer responses
    }
  }
}
```

### Problem: Too slow

**Solution:**
```json
{
  "retrieval": {
    "defaultTopK": 5     // Fewer chunks = faster
  },
  "models": {
    "llm": {
      "model": "us.anthropic.claude-haiku-...",  // Faster model
      "maxTokens": 1024
    }
  }
}
```

---

## 🎯 Best Practices

1. **Start with defaults** - They're tuned for earnings data
2. **Change one thing at a time** - Easier to see what helps
3. **Test after changes** - Use your app to verify improvements
4. **Document why** - Add comments in JSON (in a separate notes file)

---

## ✅ Summary

**Your queries are already dynamic!** The config just makes the system more flexible:

- ✅ **Test queries** in indexing are for validation only
- ✅ **Real user queries** are handled dynamically at runtime
- ✅ **All parameters** can be tuned without code changes
- ✅ **Easy experimentation** - just edit config.json

**The hardcoded test query is GONE** - replaced with configurable test queries that validate the index works! 🎉
