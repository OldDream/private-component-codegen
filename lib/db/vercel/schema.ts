/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-19 15:58:20
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-19 15:58:45
 * @FilePath: /private-component-codegen/lib/db/vercel/schema.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { index, pgTable, text, varchar, vector } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

// Define the OpenAI embeddings table
export const vercelEmbeddings = pgTable(
  'vercel_embeddings',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull()
  },
  (t) => ({
    vercelEmbeddingIndex: index('vercel_embedding_index').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops')
    )
  })
);
