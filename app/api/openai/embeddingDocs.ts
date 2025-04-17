/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-16 18:20:48
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-16 18:34:44
 * @FilePath: /private-component-codegen/app/api/openai/embeddingDocs.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { saveEmbeddings } from "@/lib/db/openai/actions";
import { generateEmbeddings } from "./embedding";
import fs from 'fs/promises';
const embedDocs = async () => {
  const docs = await fs.readFile('./ai-docs/basic-components.txt', 'utf-8');
  console.log('docs read done')
  const embedding = await generateEmbeddings(docs);
  console.log('embedding done')
  await saveEmbeddings(embedding.map(item => ({ embedding: item.embedding, content: item.text })))
  // terminate process with success code
  process.exit(0);
  return embedding;

};
// 需要代理！
embedDocs();
