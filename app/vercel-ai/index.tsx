'use client';

import { useState } from 'react';
import { useChat, Message as AIMessage } from 'ai/react';
import { ChatMessages } from '../components/ChatMessages';
import { Message } from '../components/ChatMessages/interface';
import { RAGDocument } from '../components/RAGDocsShow/interface';

// Convert AI SDK Message to our custom Message type
const convertMessages = (aiMessages: AIMessage[]): Message[] => {
  return aiMessages.map((msg) => {
    const customMessage: Message = {
      id: msg.id,
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    };

    // Safely add ragDocs if they exist
    if (msg.role === 'assistant' && msg.annotations && msg.annotations.length > 0) {
      const annotation = msg.annotations[0];
      if (annotation && typeof annotation === 'object' && 'ragDocs' in annotation) {
        // Type assertion for ragDocs
        customMessage.ragDocs = annotation.ragDocs as unknown as RAGDocument[];
      }
    }

    return customMessage;
  });
};

const Home = () => {
  const [messageImgUrl, setMessageImgUrl] = useState('');

  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload
  } = useChat({
    api: '/api/vercel'
  });

  // Convert AI SDK messages to our custom Message type
  const messages = convertMessages(aiMessages);

  const handleRetry = () => {
    reload();
  };

  return (
    <ChatMessages
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onRetry={handleRetry}
      isLoading={isLoading}
      messageImgUrl={messageImgUrl}
      setMessagesImgUrl={setMessageImgUrl}
    />
  );
};

export default Home;
