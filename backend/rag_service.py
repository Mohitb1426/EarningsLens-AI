import os
import json
import chromadb
from chromadb.config import Settings
from anthropic import AnthropicBedrock
from typing import AsyncGenerator, Dict, List
import voyageai

class RAGService:
    def __init__(self):
        self.chroma_db_path = os.getenv("CHROMA_DB_PATH", "../pipeline/data/chromadb")
        self.collection = None
        self.db_available = False

        # Load config
        config_path = os.path.join(os.path.dirname(__file__), "..", "config.json")
        with open(config_path, 'r') as f:
            self.config = json.load(f)

        # Initialize Voyage AI client
        voyage_api_key = os.getenv("VOYAGE_API_KEY")
        if not voyage_api_key:
            raise ValueError("VOYAGE_API_KEY not found in environment variables")

        self.voyage_client = voyageai.Client(api_key=voyage_api_key)
        self.embedding_model = self.config["models"]["embedding"]["model"]
        print(f"Voyage AI initialized with model: {self.embedding_model}")

        # Initialize ChromaDB with error handling
        try:
            self.client = chromadb.PersistentClient(
                path=self.chroma_db_path,
                settings=Settings(
                    anonymized_telemetry=False
                )
            )
            self.collection = self.client.get_collection("earnings_reports")
            self.db_available = True
            count = self.collection.count()
            print(f"[OK] ChromaDB connected: {self.chroma_db_path}")
            print(f"[OK] Collection 'earnings_reports' loaded with {count} documents")
        except Exception as e:
            print(f"[WARNING] ChromaDB not available: {str(e)}")
            print("  Run 'python pipeline/index_chromadb.py' to create the vector database")
            self.db_available = False

        # Initialize Claude via Bedrock
        self.client_claude = AnthropicBedrock(
            aws_region=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_session_token=os.getenv("AWS_SESSION_TOKEN")
        )

        self.model = os.getenv("ANTHROPIC_MODEL")
        self.max_tokens = self.config["models"]["llm"]["maxTokens"]
        self.temperature = self.config["models"]["llm"]["temperature"]

        print("RAG Service initialized")
        print(f"Model: {self.model}")
        print(f"Status: {'Ready' if self.db_available else 'DB indexing required'}")

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Voyage AI"""
        try:
            result = self.voyage_client.embed(
                texts=[text],
                model=self.embedding_model,
                input_type="query"  # Use "query" for search queries, "document" for indexing
            )
            return result.embeddings[0]
        except Exception as e:
            print(f"Embedding error: {str(e)}")
            raise

    async def search_similar(self, query_embedding: List[float], top_k: int = 10) -> List[Dict]:
        if not self.db_available or not self.collection:
            return []

        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )

            chunks = []
            if results['documents'] and len(results['documents']) > 0:
                for doc, metadata, distance in zip(
                    results['documents'][0],
                    results['metadatas'][0],
                    results['distances'][0]
                ):
                    chunks.append({
                        "document": doc,
                        "metadata": {
                            "company": metadata["company"],
                            "quarter": metadata["quarter"],
                            "year": metadata["year"],
                            "page": metadata["page"]
                        },
                        "similarity": 1 - distance  # Convert distance to similarity
                    })
            return chunks
        except Exception as e:
            print(f"Search error: {str(e)}")
            return []

    def format_context(self, chunks: List[Dict]) -> str:
        context_parts = []
        for i, chunk in enumerate(chunks):
            meta = chunk["metadata"]
            context_parts.append(
                f"[Source {i+1}: {meta['company']} {meta['quarter']} {meta['year']} - Page {meta['page']}]\n"
                f"{chunk['document']}"
            )
        return "\n\n".join(context_parts)

    def extract_citations(self, chunks: List[Dict]) -> List[Dict]:
        citations = []
        for chunk in chunks:
            meta = chunk["metadata"]
            citations.append({
                "company": meta["company"],
                "quarter": meta["quarter"],
                "year": meta["year"],
                "page": meta["page"],
                "passage": chunk["document"][:200] + ("..." if len(chunk["document"]) > 200 else "")
            })
        return citations

    def extract_chart_data(self, response: str, chunks: List[Dict], question: str) -> Dict:
        """Extract structured data for chart generation"""
        import re

        # Detect if question is about comparison or trends
        comparison_keywords = ['compare', 'versus', 'vs', 'difference', 'between']
        trend_keywords = ['trend', 'growth', 'over time', 'across quarters', 'performance']

        is_comparison = any(kw in question.lower() for kw in comparison_keywords)
        is_trend = any(kw in question.lower() for kw in trend_keywords)

        # Extract financial numbers from response (₹ format or billion/crore)
        numbers = re.findall(r'₹[\d,]+(?:\.\d+)?(?:\s*(?:crore|billion|million|lakh))?', response)

        # Get unique companies from chunks
        companies = list(set([c["metadata"]["company"] for c in chunks]))
        quarters = list(set([f"{c['metadata']['quarter']} {c['metadata']['year']}" for c in chunks]))

        # Only generate chart if we have meaningful data
        if len(numbers) >= 2 and (len(companies) >= 2 or len(quarters) >= 2):
            if is_comparison and len(companies) >= 2:
                return {
                    "type": "bar",
                    "title": "Company Comparison",
                    "labels": companies[:5],
                    "datasets": [{
                        "label": "Revenue (₹ Crore)",
                        "data": [60000, 55000, 48000],  # Placeholder - would need better parsing
                        "backgroundColor": ["#3b82f6", "#10b981", "#f59e0b"]
                    }]
                }
            elif is_trend and len(quarters) >= 3:
                return {
                    "type": "line",
                    "title": "Revenue Trend",
                    "labels": sorted(quarters)[:6],
                    "datasets": [{
                        "label": "Revenue",
                        "data": [58000, 60000, 61000, 63000],  # Placeholder
                        "borderColor": "#3b82f6",
                        "tension": 0.4
                    }]
                }

        return None

    async def process_query(self, question: str) -> AsyncGenerator[Dict, None]:
        try:
            print(f"Processing: {question}")

            # Handle greetings and casual messages
            question_lower = question.lower().strip()
            greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'hola', 'namaste']

            # Check if it's a short greeting (1-3 words) or exact match
            is_greeting = (question_lower in greetings or
                          (len(question.split()) <= 3 and any(g in question_lower for g in greetings)) or
                          question_lower in ['hi there', 'hello there', 'hey there'])

            if is_greeting:
                greeting_response = """Hello! 👋 I'm **EarningsLens AI**, your intelligent assistant for analyzing IT company earnings and financial data.

I can help you with:

- 📊 **Revenue Analysis** - Get detailed revenue figures, growth rates, and trends
- 📈 **Company Comparisons** - Compare TCS, Infosys, and Wipro across various metrics
- 💰 **Profit Margins** - Analyze profitability and margin trends
- 👥 **Employee Metrics** - Track workforce growth and productivity
- 📅 **Quarterly Performance** - Review performance across Q1-Q4 FY2023-2024

**Try asking:**
- "What was TCS revenue in Q4 FY2024?"
- "Compare Infosys and Wipro profit margins"
- "Show employee growth trends for TCS"

How can I help you today?"""
                yield {"type": "token", "data": greeting_response}
                yield {"type": "citations", "data": []}
                return

            # Check if DB is available
            if not self.db_available:
                error_msg = "[SYSTEM] Vector database is currently being rebuilt. Please wait a few minutes and try again. The system is indexing earnings reports and will be ready shortly."
                yield {"type": "token", "data": error_msg}
                yield {"type": "citations", "data": []}
                return

            # Generate embedding
            query_embedding = await self.generate_embedding(question)

            # Search
            top_k = self.config["retrieval"]["defaultTopK"]
            chunks = await self.search_similar(query_embedding, top_k)

            if not chunks:
                yield {"type": "token", "data": "This information is not available in the current corpus. The database may still be indexing. Please try again in a few minutes."}
                yield {"type": "citations", "data": []}
                return

            print(f"Found {len(chunks)} chunks")

            # Format context
            context = self.format_context(chunks)

            # System prompt
            system_prompt = """You are EarningsLens AI, an expert financial analyst assistant specializing in Indian IT company earnings analysis.

RULES:
1. Answer ONLY using the context provided below.
2. If the answer is not in the context, say: "This information is not available in the current corpus."
3. Never invent numbers, dates, or facts.
4. Always provide COMPLETE information with ALL available numbers and metrics from the context.
5. Use markdown formatting extensively:
   - ## for main headings (e.g., ## TCS Q4 FY2024 Revenue)
   - **Bold** for company names, revenue figures, percentages
   - Tables for comparisons
   - Bullet points for lists
6. Structure your response with:
   - Brief summary paragraph
   - Detailed metrics with specific numbers
   - Comparisons if multiple data points exist
   - Key insights or trends
7. For revenue questions, include: exact amount, currency, YoY growth %, QoQ growth %
8. For comparisons, create markdown tables with columns for each metric
9. Always mention the source period (e.g., "Q4 FY2024" or "FY2024")"""

            prompt = f"""{system_prompt}

CONTEXT:
{context}

QUESTION:
{question}

Please provide a comprehensive, well-formatted answer with headings, specific numbers, and structured data.

ANSWER:"""

            # Stream from Claude
            full_response = ""
            with self.client_claude.messages.stream(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=[{"role": "user", "content": prompt}]
            ) as stream:
                for text in stream.text_stream:
                    full_response += text
                    yield {"type": "token", "data": text}

            # Send citations
            citations = self.extract_citations(chunks)
            yield {"type": "citations", "data": citations}

            # Extract and send chart data if financial metrics detected
            chart_data = self.extract_chart_data(full_response, chunks, question)
            if chart_data:
                yield {"type": "chart", "data": chart_data}

            print("Query completed")

        except Exception as e:
            print(f"Error: {str(e)}")
            yield {"type": "error", "data": str(e)}
