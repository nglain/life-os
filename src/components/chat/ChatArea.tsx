import { useEffect, useRef, useState } from 'react';
import type { Message, TreeNode } from '@/types/tree';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useTree } from '@/context/TreeContext';
import { useVoice } from '@/context/VoiceContext';
import { supabase } from '@/utils/supabase';
import type { PickedFile } from '@/utils/filePicker';

const API_URL = import.meta.env.VITE_LAPP_API_URL || 'http://localhost:3010';

interface ChatAreaProps {
  node: TreeNode;
}

export function ChatArea({ node }: ChatAreaProps) {
  const { saveMessages } = useTree();
  const { isConnected, isConnecting, startVoice, stopVoice } = useVoice();
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

  const handleVoice = async () => {
    try {
      if (isConnected) {
        await stopVoice();
      } else {
        // Create context from recent messages
        const context = messages.slice(-5).map(m =>
          `${m.type === 'user' ? 'User' : 'AI'}: ${m.text}`
        ).join('\n');

        await startVoice(context || `Тема: ${node.label}`);
      }
    } catch (error) {
      console.error('Voice error:', error);
    }
  };

  const handleFileSelect = async (file: PickedFile) => {
    try {
      setIsSending(true);
      console.log('[File] Uploading:', file.name, file.size, 'bytes');

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Upload to S3 via backend (file.data is already base64)
      const response = await fetch(`${API_URL}/api/upload-to-s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: file.data,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();

      // Create message with file
      const fileMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'user',
        text: `[Файл: ${file.name}](${data.url})`,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, fileMessage];
      await saveMessages(node.id, updatedMessages);

      console.log('[File] Uploaded:', data.url);
    } catch (error) {
      console.error('[File] Upload error:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setIsSending(false);
    }
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
        onFileSelect={handleFileSelect}
        disabled={isSending}
        placeholder="Сообщение..."
        isVoiceActive={isConnected}
        isVoiceConnecting={isConnecting}
      />
    </div>
  );
}
