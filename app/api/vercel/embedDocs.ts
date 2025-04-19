/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-19 17:25:23
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-19 17:25:51
 * @FilePath: /private-component-codegen/app/api/vercel/embedDocs.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { generateEmbeddings } from './embedding';
import { saveEmbeddings } from '@/lib/db/vercel/actions';
import fs from 'fs';

export async function embedDocs() {
  const docs = fs.readFileSync('./ai-docs/basic-components.txt', 'utf8');
  const embeddings = await generateEmbeddings(docs);
  console.log('embeddings done');
  await saveEmbeddings(
    embeddings.map((embedding) => ({
      embedding: embedding.embedding,
      content: embedding.text
    }))
  );
  console.log('save embeddings done');

  return embeddings;
}

embedDocs();
