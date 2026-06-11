# 🔑 API Keys Setup Guide

## Required API Keys

Your EarningsLens AI needs **2 API keys** to work:

---

## 1. Claude API Key (Anthropic)

**What it does:** Powers the AI responses

**Get it here:** https://console.anthropic.com/

**Steps:**
1. Go to https://console.anthropic.com/
2. Sign up or login
3. Click **"API Keys"** in left menu
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)
6. Paste it in `backend/.env` file:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

**Cost:**
- $5 free credit for new accounts
- Claude Haiku: ~$0.25 per 1M input tokens
- Very cheap for typical usage!

---

## 2. Voyage AI API Key

**What it does:** Converts text to embeddings for search

**Get it here:** https://www.voyageai.com/

**Steps:**
1. Go to https://dashboard.voyageai.com/
2. Sign up (use Google/GitHub for fastest)
3. Copy your API key (starts with `pa-...`)
4. Paste it in `backend/.env` file:
   ```env
   VOYAGE_API_KEY=pa-your-key-here
   ```

**Cost:**
- **100% FREE** - 100M tokens/month
- More than enough for most projects!

---

## Quick Setup

1. **Get both API keys** (10 minutes total)
2. **Edit** `backend/.env` file:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-actual-key
   VOYAGE_API_KEY=pa-your-actual-key
   ```
3. **Save** the file
4. **Restart backend** (I'll help you with this)
5. **Done!** Your app will work with real AI

---

## Troubleshooting

### "API key is invalid"
- Double-check you copied the full key
- Make sure no extra spaces
- Verify the key works on the provider's website

### "Rate limit exceeded"
- Free tier has limits
- Voyage AI: 100M tokens/month (plenty!)
- Claude: Based on your plan

### "Insufficient credits"
- Claude requires payment method
- Add one at https://console.anthropic.com/

---

## Cost Estimate

**For 1000 questions:**
- Voyage AI: **FREE** (within 100M token limit)
- Claude Haiku: ~$0.50 - $2.00
- **Total: ~$0.50 - $2.00**

**Very affordable!** 🎉

---

## Next Steps

1. ✅ Get your API keys
2. ✅ Add them to `backend/.env`
3. ✅ Save the file
4. ✅ Tell me when ready, I'll restart the backend
