/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-19 15:58:20
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-19 15:59:05
 * @FilePath: /private-component-codegen/lib/db/vercel/actions.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use server';

import { db } from '@/lib/db';
import { vercelEmbeddings } from './schema';

export async function saveEmbeddings(embeddings: Array<{ embedding: number[]; content: string }>) {
  try {
    const result = await db.insert(vercelEmbeddings).values(
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
