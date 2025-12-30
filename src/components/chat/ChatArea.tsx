import { useEffect, useRef, useState } from 'react';
import type { Message, TreeNode } from '@/types/tree';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useTree } from '@/context/TreeContext';

interface ChatAreaProps {
  node: TreeNode;
}

export function ChatArea({ node }: ChatAreaProps) {
  const { saveMessages } = useTree();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const messages = node.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (text: string) => {
    if (isSending) return;

    setIsSending(true);

    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    // Add to messages
    const updatedMessages = [...messages, userMessage];

    try {
      await saveMessages(node.id, updatedMessages);

      // TODO: Send to AI and get response
      // For now, simulate AI response
      setTimeout(async () => {
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          type: 'ai',
          text: `Получено: "${text}". Это демо-ответ. Интеграция с AI будет добавлена позже.`,
          timestamp: new Date().toISOString(),
        };

        await saveMessages(node.id, [...updatedMessages, aiMessage]);
        setIsSending(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to save message:', error);
      setIsSending(false);
    }
  };

  const handleVoice = () => {
    // TODO: Implement voice input
    console.log('Voice input not yet implemented');
  };

  return (
    <div className="chat-area">
      {/* Messages area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">{node.icon}</span>
            <p className="chat-empty-title">{node.label}</p>
            <p className="chat-empty-text">Начните диалог, отправив сообщение</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isSending && (
              <div className="message message--ai">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onVoice={handleVoice}
        disabled={isSending}
        placeholder={`Сообщение в "${node.label}"...`}
      />
    </div>
  );
}
