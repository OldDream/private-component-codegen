CREATE TABLE IF NOT EXISTS "vercel_embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vercel_embedding_index" ON "vercel_embeddings" USING hnsw ("embedding" vector_cosine_ops);