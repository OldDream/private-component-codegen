/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-16 16:09:24
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-17 17:10:21
 * @FilePath: /private-component-codegen/app/api/openai/embedding.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { searchSimilarEmbeddings } from '@/lib/db/openai/selectors';
import { env } from '@/lib/env.mjs';
import OpenAI from 'openai';

// 定义返回结果的接口
interface TextEmbedding {
  text: string;
  embedding: number[];
}

const openai = new OpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL,
});

/**
 * 将文本转换为向量嵌入
 * @param text 输入文本
 * @param delimiter 分隔符，用于将文本分块
 * @param model 使用的嵌入模型，默认为 'text-embedding-3-small'
 * @returns 包含文本块和对应向量的数组
 */
export async function generateEmbeddings(
  text: string,
  delimiter: string = '-------split line-------',
): Promise<TextEmbedding[]> {
  // 初始化 OpenAI 客户端


  // 将文本分块
  const chunks = text.split(delimiter).filter(chunk => chunk.trim().length > 0);

  try {
    console.log('before create embeddings')
    // 批量生成嵌入向量
    const response = await openai.embeddings.create({
      model: env.EMBEDDING,
      input: chunks,
      encoding_format: 'float',
    });
    console.log('embeddings created')
    // 将文本块和对应的向量组合
    return chunks.map((chunk, index) => ({
      text: chunk.trim(),
      embedding: response.data[index].embedding,
    }));
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

// 生成单个embedding
export async function generateSingleEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: env.EMBEDDING,
    input: text,
    encoding_format: 'float',
  });
  return response.data[0].embedding;
}

// 利用用户输入，retrieval 相似的embedding
export async function retrieveSimilarEmbeddings(text: string, threshold: number = 0.7, limit: number = 5) {
  const embedding = await generateSingleEmbedding(text);
  const results = await searchSimilarEmbeddings(embedding, threshold, limit);
  // console.log('retrieveSimilarEmbeddings', results)
  return results;
}

