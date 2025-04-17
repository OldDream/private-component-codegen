/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-15 22:30:59
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-15 22:42:02
 * @FilePath: /private-component-codegen/lib/db/openai/actions.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use server';

import { db } from '@/lib/db';
import { openAiEmbeddings } from './schema';

export async function saveEmbeddings(embeddings: Array<{ embedding: number[]; content: string }>) {
  try {
    const values = embeddings.map(({ embedding, content }) => ({
      embedding,
      content,
    }));

    const result = await db.insert(openAiEmbeddings).values(values);
    return { success: true, count: values.length, result };
  } catch (error) {
    console.error('Error saving embeddings:', error);
    return { success: false, count: 0, result: null };
  }
}
