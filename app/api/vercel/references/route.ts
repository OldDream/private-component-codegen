import { retrieveEmbedding } from '../embedding';

export async function POST(request: Request) {
  try {
    const { text } = await request.json() as { text: string };

    // Search for relevant content using embeddings
    const relevantContent = await retrieveEmbedding(text, 0.5, 3);

    // Return the references as a JSON response
    return new Response(JSON.stringify({ references: relevantContent }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error retrieving references:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 