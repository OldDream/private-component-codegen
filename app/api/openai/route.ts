import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env.mjs';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { retrieveSimilarEmbeddings } from './embedding';
import { getSystemPrompt } from '@/lib/prompt';
import { openAIRequest } from './types';
import { SearchResult } from '@/lib/db/openai/selectors';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL,
});

// Encoder for SSE events
const encoder = new TextEncoder();

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { message } = await req.json() as openAIRequest;

    if (!message || message.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Get the last user message for embedding-based retrieval
    const lastUserMessage = message.filter(m => m.role === 'user').pop();

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        // Set up event helpers
        const sendEvent = (event: string, data: string) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
        };

        let similarDocs: SearchResult[] = [];

        // Get similar content using embeddings if there's a user message
        if (lastUserMessage && typeof lastUserMessage.content === 'string') {
          try {
            similarDocs = await retrieveSimilarEmbeddings(lastUserMessage.content);
            // Send the related content to the client
            if (similarDocs.length > 0) {
              console.log('similarDocs--- > sse');
              sendEvent('similar', JSON.stringify(similarDocs));
            }
          } catch (error) {
            console.error('Error retrieving similar embeddings:', error);
          }
        }

        // Prepare system prompt with relevant context from vector search
        let reference = '';
        if (similarDocs.length > 0) {
          reference = similarDocs.map(doc => doc.content).join('\n\n');
        }

        // Create the enhanced message array with the system prompt
        const systemMessage: ChatCompletionMessageParam = {
          role: 'system',
          content: getSystemPrompt(reference)
        };

        const enhancedMessages: ChatCompletionMessageParam[] = [
          systemMessage,
          ...message
        ];

        try {
          // Create streaming completion
          const completion = await openai.chat.completions.create({
            model: env.MODEL,
            messages: enhancedMessages,
            stream: true,
          });

          // Stream the completion response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              sendEvent('message', content);
            }
          }

          // Signal completion
          sendEvent('done', '');
        } catch (error) {
          console.error('Error streaming completion:', error);
          sendEvent('error', JSON.stringify({ message: 'Error generating response' }));
        } finally {
          controller.close();
        }
      }
    });

    // Return the stream with appropriate headers for SSE
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
