import { streamText } from 'ai';
import { env } from '@/lib/env.mjs';
import { getSystemPrompt } from '@/lib/prompt';
import { retrieveEmbedding } from './embedding';
import { OpenAIRequest } from './types';
import { openai } from './embedding';
// Create OpenAI client using Vercel AI SDK


export async function POST(request: Request) {
  try {
    const { message } = await request.json() as OpenAIRequest;

    // Get the last message content for similarity search
    const lastMessage = message[message.length - 1];
    const lastMessageContent = lastMessage.content as string;

    // Search for relevant content using embeddings
    const relevantContent = await retrieveEmbedding(lastMessageContent, 0.5, 3);
    const reference = relevantContent.map((result) => result.content).join('\n\n');

    // Create system prompt with reference content
    const systemPrompt = getSystemPrompt(reference);

    // Using Vercel AI SDK's streamText for streaming response
    const result = streamText({
      model: openai(env.MODEL),
      system: systemPrompt,
      messages: message,
      temperature: 0.7
    });

    // Return a standard text stream response
    // The client will need to handle the references separately
    // This is because StreamData type constraints make it difficult
    // to add custom properties
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
