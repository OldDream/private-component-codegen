'use server';

import { db } from '@/lib/db';
import { openAiEmbeddings } from './schema';

export async function saveEmbeddings(embeddings: Array<{ embedding: number[]; content: string }>) {
  try {
    const result = await db.insert(openAiEmbeddings).values(
      embeddings.map(({ embedding, content }) => ({
        content,
        embedding
      }))
    );
    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving embeddings:', error);
    return { success: false, error: 'Failed to save embeddings' };
  }
}
