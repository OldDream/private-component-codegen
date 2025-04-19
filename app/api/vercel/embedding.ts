/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-19 16:30:18
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-19 18:25:33
 * @FilePath: /private-component-codegen/app/api/vercel/embedding.ts
 * @Description: Vercel AI SDK based embedding implementation
 */
import { embed, embedMany } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { SearchResult, searchSimilarContent } from '@/lib/db/openai/selectors';
import { env } from '@/lib/env.mjs';

interface EmbeddingResult {
  text: string;
  embedding: number[];
}
export const openai = createOpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL,
});
// Generate embeddings for multiple text chunks
export async function generateEmbeddings(
  text: string,
  delimiter: string = '-------split line-------',
): Promise<EmbeddingResult[]> {
  if (!text) {
    throw new Error('Input text cannot be empty');
  }

  // Split text into chunks
  const textChunks = text.split(delimiter).filter((chunk) => chunk.trim());

  try {
    // Generate embeddings using Vercel AI SDK
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: textChunks,
    });

    // Combine text chunks with their embeddings
    return textChunks.map((chunk, index) => ({
      text: chunk.trim(),
      embedding: embeddings[index],
    }));
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

// Generate a single embedding
export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}

// Retrieve similar content based on embedding similarity
export async function retrieveEmbedding(
  text: string,
  threshold: number = 0.7,
  limit: number = 5
): Promise<SearchResult[]> {
  const embedding = await generateSingleEmbedding(text);
  const results = await searchSimilarContent(embedding, threshold, limit);
  return results;
}
