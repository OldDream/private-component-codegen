/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-19 15:58:20
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-19 15:59:19
 * @FilePath: /private-component-codegen/lib/db/vercel/selectors.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { sql } from 'drizzle-orm';
import { db } from '../index';
import { vercelEmbeddings } from './schema';

export interface SearchResult {
  content: string;
  similarity: number;
}

/**
 * 搜索语义相似的内容
 * @param embedding 查询向量
 * @param threshold 相似度阈值 (0-1 之间)
 * @param limit 返回结果的最大数量
 * @returns 按相似度降序排列的结果
 */
export async function searchSimilarContent(
  embedding: number[],
  threshold: number = 0.7,
  limit: number = 5
): Promise<SearchResult[]> {
  // 验证参数
  if (threshold < 0 || threshold > 1) {
    throw new Error('Threshold must be between 0 and 1');
  }
  if (limit < 1) {
    throw new Error('Limit must be greater than 0');
  }

  // 执行向量相似度查询
  const results = await db
    .select({
      content: vercelEmbeddings.content,
      similarity: sql<number>`1 - (${sql.raw(vercelEmbeddings.embedding.name)} <=> ${sql.raw(
        `'[${embedding.join(',')}]'::vector(1536)`
      )})::float`.as('similarity')
    })
    .from(vercelEmbeddings)
    .where(
      sql`1 - (${sql.raw(vercelEmbeddings.embedding.name)} <=> ${sql.raw(
        `'[${embedding.join(',')}]'::vector(1536)`
      )})::float >= ${threshold}`
    )
    .orderBy(sql`similarity DESC`)
    .limit(limit);

  return results;
}
