/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-17 17:28:39
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-19 16:43:23
 * @FilePath: /private-component-codegen/app/api/openai/embedding.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import OpenAI from 'openai';
import { env } from '@/lib/env.mjs';
import { SearchResult, searchSimilarContent } from '@/lib/db/openai/selectors';

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

// 生成单个embedding
export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const embedding = await embeddingAI.embeddings.create({
    model: env.EMBEDDING,
    input: text,
    encoding_format: 'float'
  });
  return embedding.data[0].embedding;
}

// 检索召回
export async function retrieveEmbedding(
  text: string,
  threshold: number = 0.7,
  limit: number = 5
): Promise<SearchResult[]> {
  const embedding = await generateSingleEmbedding(text);
  const results = await searchSimilarContent(embedding, threshold, limit);
  return results;
}
