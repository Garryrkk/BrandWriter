-- Run this after documents are ingested and extension exists.
-- Requires pgvector v0.5+ and enough rows for ivfflat (lists value tuneable).
CREATE INDEX IF NOT EXISTS documents_embedding_ivfflat ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
ANALYZE documents;
