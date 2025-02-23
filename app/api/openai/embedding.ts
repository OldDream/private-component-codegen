import OpenAI from 'openai';
import { env } from '@/lib/env.mjs';

interface EmbeddingResult {
  text: string;
  embedding: number[];
}

const embeddingAI = new OpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL
});

export async function generateEmbeddings(
  text: string,
  delimiter: string = '-------split line-------', // 默认使用两个换行符作为分隔符
  openaiApiKey: string = env.AI_KEY
): Promise<EmbeddingResult[]> {
  if (!text) {
    throw new Error('Input text cannot be empty');
  }

  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  // 将文本按分隔符分块
  const textChunks = text.split(delimiter).filter((chunk) => chunk.trim());

  try {
    // 批量生成 embeddings
    const response = await embeddingAI.embeddings.create({
      model: env.EMBEDDING,
      input: textChunks,
      encoding_format: 'float'
    });

    // 将文本块和对应的 embedding 向量组合
    return textChunks.map((chunk, index) => ({
      text: chunk.trim(),
      embedding: response.data[index].embedding
    }));
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}
