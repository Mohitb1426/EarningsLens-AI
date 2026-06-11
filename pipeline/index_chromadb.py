"""
ChromaDB Indexer - Create vector database from parsed PDFs
Uses Voyage AI for production-grade embeddings
"""
import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings
import voyageai

load_dotenv()

def load_config():
    """Load configuration"""
    config_path = Path("../config.json")
    with open(config_path, 'r') as f:
        return json.load(f)

def generate_embeddings_batch(texts, voyage_client, model, max_retries=5):
    """Generate embeddings in batch using Voyage AI with rate limiting"""
    for attempt in range(max_retries):
        try:
            result = voyage_client.embed(
                texts=texts,
                model=model,
                input_type="document"
            )
            return result.embeddings
        except Exception as e:
            error_msg = str(e)
            if "rate limit" in error_msg.lower():
                wait_time = 21 if attempt == 0 else min(60, 21 * (2 ** attempt))
                print(f"  Rate limit hit, waiting {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"  Batch error: {error_msg[:150]}")
                raise
    raise Exception(f"Failed after {max_retries} retries")

def chunk_text(text, chunk_size=500, chunk_overlap=100):
    """Simple text chunking"""
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - chunk_overlap

    return chunks

def index_documents():
    """Main indexing function"""
    print("\nChromaDB Indexing Pipeline (Voyage AI Embeddings)")
    print("="*60)

    # Initialize Voyage AI client
    voyage_api_key = os.getenv("VOYAGE_API_KEY")
    if not voyage_api_key:
        print("ERROR: VOYAGE_API_KEY not found in .env file")
        exit(1)

    voyage_client = voyageai.Client(api_key=voyage_api_key)
    print("Voyage AI client initialized")

    # Load config
    config = load_config()
    chunk_size = config["indexing"]["chunkSize"]
    chunk_overlap = config["indexing"]["chunkOverlap"]
    embedding_model = config["models"]["embedding"]["model"]
    test_queries = config["indexing"]["testQueries"]

    print(f"Embedding model: {embedding_model}")
    print(f"Chunk size: {chunk_size}, Overlap: {chunk_overlap}")

    # Setup ChromaDB
    chroma_path = Path("data/chromadb")
    client = chromadb.PersistentClient(
        path=str(chroma_path),
        settings=Settings(anonymized_telemetry=False)
    )

    # Get or create collection
    collection_name = "earnings_reports"
    try:
        client.delete_collection(collection_name)
        print("Deleted existing collection")
    except:
        pass

    collection = client.create_collection(
        name=collection_name,
        metadata={"description": "IT company earnings reports"}
    )
    print(f"Created ChromaDB collection: {collection_name}\n")

    # Load parsed documents
    parsed_dir = Path("data/parsed")
    json_files = sorted(parsed_dir.glob("*.json"))
    print(f"Found {len(json_files)} parsed documents")

    all_chunks = []
    all_texts_enriched = []
    all_metadatas = []
    all_ids = []
    chunk_count = 0

    # First pass: collect all chunks
    print("\n=== Phase 1: Collecting chunks ===")
    for json_file in json_files:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        company = data["company"]
        quarter = data["quarter"]
        year = data["year"]
        print(f"  {company} {quarter} {year}")

        for page in data["pages"]:
            text = page["text"].strip()
            if not text:
                continue

            chunks = chunk_text(text, chunk_size, chunk_overlap)

            for i, chunk in enumerate(chunks):
                chunk_count += 1

                # Enrich with metadata
                if config["metadata"]["enrichChunks"]:
                    enriched_text = config["metadata"]["metadataTemplate"].format(
                        company=company,
                        quarter=quarter,
                        year=year
                    ) + "\n" + chunk
                else:
                    enriched_text = chunk

                chunk_id = f"{company.lower()}_{quarter.lower()}_{year.lower()}_p{page['pageNumber']}_c{i+1}"

                all_chunks.append(chunk)
                all_texts_enriched.append(enriched_text)
                all_metadatas.append({
                    "company": company,
                    "quarter": quarter,
                    "year": year,
                    "page": page["pageNumber"],
                    "filename": data["filename"]
                })
                all_ids.append(chunk_id)

    print(f"\nTotal chunks collected: {len(all_chunks)}")

    if not all_chunks:
        print("Error: No records to index")
        return

    # Second pass: generate embeddings in batches
    print("\n=== Phase 2: Generating embeddings (batch mode) ===")
    print(f"Rate limit: 3 RPM = ~21s between batches")

    embeddings = []
    batch_size = 10  # Process 10 chunks per API call

    for i in range(0, len(all_texts_enriched), batch_size):
        batch = all_texts_enriched[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(all_texts_enriched) + batch_size - 1) // batch_size

        print(f"Batch {batch_num}/{total_batches}: Processing chunks {i+1}-{min(i+batch_size, len(all_texts_enriched))}")

        try:
            batch_embeddings = generate_embeddings_batch(batch, voyage_client, embedding_model)
            embeddings.extend(batch_embeddings)
            print(f"  Success ({len(batch_embeddings)} embeddings)")
        except Exception as e:
            print(f"  Failed: {str(e)[:100]}")
            return

        # Rate limiting: wait between batches
        if i + batch_size < len(all_texts_enriched):
            time.sleep(21)

    print(f"\nTotal embeddings generated: {len(embeddings)}")

    # Add to ChromaDB
    print("\n=== Phase 3: Adding to ChromaDB ===")
    collection.add(
        documents=all_chunks,
        embeddings=embeddings,
        metadatas=all_metadatas,
        ids=all_ids
    )

    # Verify
    final_count = collection.count()
    print(f"Success! Indexed {final_count} chunks")
    print(f"ChromaDB collection count: {final_count}")

    # Test queries
    print("\n" + "="*60)
    print("Testing with sample queries...")
    print("="*60)

    for query in test_queries[:2]:  # Test first 2
        print(f"\nQuery: {query}")
        try:
            query_embeddings = generate_embeddings_batch([query], voyage_client, embedding_model)
            query_embedding = query_embeddings[0]
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=3
            )

            print(f"Found {len(results['documents'][0])} results:\n")
            for i, (doc, meta, dist) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                print(f"  {i+1}. {meta['company']} {meta['quarter']} {meta['year']} - Page {meta['page']}")
                print(f"     Distance: {dist:.4f}")
                print(f"     Preview: {doc[:80]}...\n")

        except Exception as e:
            print(f"  Query error: {str(e)}")

    print("="*60)
    print("\nIndexing complete!")
    print(f"Database location: {chroma_path}")
    print("\nYou can now start the backend to query the data.")
    print(f"\nTo view data in ChromaDB, the collection is persisted at:")
    print(f"  {chroma_path.absolute()}")

if __name__ == "__main__":
    index_documents()
