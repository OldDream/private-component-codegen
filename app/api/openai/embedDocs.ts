import { generateEmbeddings } from './embedding';
import { saveEmbeddings } from '@/lib/db/openai/actions';
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
