import { OpenAI } from 'openai';
import { env } from '@/lib/env.mjs';
import { getSystemPrompt } from '@/lib/prompt';
import { retrieveEmbedding } from './embedding';
import { OpenAIRequest } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL
});

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as OpenAIRequest;

    // Get the last message content for similarity search
    const lastMessage = message[message.length - 1];
    const lastMessageContent = lastMessage.content as string;

    // Search for relevant content using embeddings
    const relevantContent = await retrieveEmbedding(lastMessageContent, 0.7, 3);
    const reference = relevantContent.map((result) => result.content).join('\n\n');

    // Create system prompt with reference content
    const systemPrompt = getSystemPrompt(reference);

    // Prepare messages array with system prompt
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...message
    ];

    // Create streaming chat completion
    const response = await openai.chat.completions.create({
      model: env.MODEL,
      messages,
      temperature: 0.7,
      stream: true
    });

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send both the content and relevant references
              const data = JSON.stringify({
                content,
                references: relevantContent
              });
              controller.enqueue(`data: ${data}\n\n`);
            }
          }
          controller.enqueue('data: [DONE]\n\n');
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    });
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
