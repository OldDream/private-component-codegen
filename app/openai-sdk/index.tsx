/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-15 22:25:30
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-17 17:14:31
 * @FilePath: /private-component-codegen/app/openai-sdk/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import { ChatMessages } from '../components/ChatMessages';
import { useState, useCallback, useRef } from 'react';

// Type definition for message content
type MessageContent = {
  type: 'image_url' | 'text';
  image_url?: { url: string };
  text?: string;
};

// Type definition for RAG documents
type RAGDocument = {
  id: string;
  title: string;
  content: string;
  similarity: number;
};

// Type definition for messages
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  ragDocs?: RAGDocument[];
};

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageImgUrl, setMessageImgUrl] = useState('');

  // For handling SSE events
  const eventSourceRef = useRef<EventSource | null>(null);

  // Generate a unique ID for messages
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Handle user message submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!input.trim() && !messageImgUrl) return;

      setIsLoading(true);

      // Create a new user message
      const userMessageId = generateId();
      let userContent: string | MessageContent[] = input;

      // If there's an image, include it in the message
      if (messageImgUrl) {
        userContent = [
          { type: 'text', text: input },
          { type: 'image_url', image_url: { url: messageImgUrl } }
        ];
      }

      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: userContent
      };

      // Add user message to the chat
      setMessages((prev) => [...prev, userMessage]);

      // Clear input and image URL
      setInput('');
      setMessageImgUrl('');

      // Create a placeholder for the assistant's response
      const assistantMessageId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: ''
        }
      ]);

      try {
        // Close any existing EventSource
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Prepare messages for OpenAI API
        const apiMessages = messages.concat(userMessage).map((msg) => ({
          role: msg.role,
          content: msg.content
        }));

        // Create a new EventSource for SSE
        const eventSource = new EventSource('/api/openai', {
          withCredentials: true
        });

        eventSourceRef.current = eventSource;

        let assistantResponse = '';
        let ragDocs: RAGDocument[] = [];

        // Handle different event types
        eventSource.addEventListener('message', (event) => {
          console.log('监听到message事件');
          assistantResponse += event.data;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
            )
          );
        });

        eventSource.addEventListener('similar', (event) => {
          console.log('监听到similar事件');
          try {
            ragDocs = JSON.parse(event.data) as RAGDocument[];
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, ragDocs } : msg))
            );
          } catch (error) {
            console.error('Error parsing similar docs:', error);
          }
        });

        eventSource.addEventListener('error', (event) => {
          console.error('SSE Error:', event);
          eventSource.close();
          setIsLoading(false);
          eventSourceRef.current = null;
        });

        eventSource.addEventListener('done', () => {
          eventSource.close();
          setIsLoading(false);
          eventSourceRef.current = null;
        });

        // Initialize the connection and send the request
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: apiMessages
          })
        });

        if (!res.ok) {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);

        // Update assistant message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: 'Sorry, there was an error processing your request.' }
              : msg
          )
        );
      }
    },
    [input, messageImgUrl, messages]
  );

  // Handle user input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  // Handle retry for failed messages
  const handleRetry = useCallback(
    (id: string) => {
      // Find the message to retry and its preceding user message
      const messageIndex = messages.findIndex((msg) => msg.id === id);
      if (messageIndex <= 0) return;

      // Get the user message before this assistant message
      const userMessage = messages[messageIndex - 1];
      if (userMessage.role !== 'user') return;

      // Remove the failed assistant message
      setMessages((prev) => prev.filter((msg) => msg.id !== id));

      // Set the user message content as input
      if (typeof userMessage.content === 'string') {
        setInput(userMessage.content);
      } else if (Array.isArray(userMessage.content)) {
        // Handle complex message with images
        const textContent = userMessage.content.find((c) => c.type === 'text');
        const imageContent = userMessage.content.find((c) => c.type === 'image_url');

        if (textContent?.text) {
          setInput(textContent.text);
        }

        if (imageContent?.image_url?.url) {
          setMessageImgUrl(imageContent.image_url.url);
        }
      }
    },
    [messages]
  );

  return (
    <ChatMessages
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      messageImgUrl={messageImgUrl}
      setMessagesImgUrl={setMessageImgUrl}
      onRetry={handleRetry}
    />
  );
};

export default Home;
