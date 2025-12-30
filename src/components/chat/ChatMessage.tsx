// import React from 'react';
import type { Message } from '@/types/tree';
import { formatTime } from '@/utils/date';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--ai'}`}>
      <div className="message-content">
        {/* Message text */}
        <p className="message-text">{message.text}</p>

        {/* Refs (references) */}
        {message.refs && message.refs.length > 0 && (
          <div className="message-refs">
            <p className="message-refs-label">Ссылки:</p>
            <div className="message-refs-list">
              {message.refs.map((ref, idx) => (
                <span key={idx} className="message-ref">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
