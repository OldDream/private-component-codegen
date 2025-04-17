/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-17 11:05:19
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-17 17:00:28
 * @FilePath: /private-component-codegen/lib/db/openai/selectors.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { sql } from 'drizzle-orm';
import { db } from '../index';
import { openAiEmbeddings } from './schema';

export interface SearchResult {
  content: string;
  similarity: number;
}

export async function searchSimilarEmbeddings(
  queryEmbedding: number[],
  similarityThreshold: number = 0.7,
  limit: number = 5
): Promise<SearchResult[]> {
  // Convert the embedding array to a properly formatted PostgreSQL array literal
  const embeddingArray = `'[${queryEmbedding.join(',')}]'::vector`;

  const results = await db
    .select({
      content: openAiEmbeddings.content,
      similarity: sql<number>`1 - (${openAiEmbeddings.embedding} <=> ${sql.raw(embeddingArray)})`.as('similarity'),
    })
    .from(openAiEmbeddings)
    .where(
      sql`1 - (${openAiEmbeddings.embedding} <=> ${sql.raw(embeddingArray)}) >= ${similarityThreshold}`
    )
    .orderBy(sql`similarity DESC`)
    .limit(limit);

  return results;
}
